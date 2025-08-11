"""
Sistema de Roteamento Inteligente para Provedores KYC
Implementa epsilon-greedy multi-armed bandit para otimização automática de custo-benefício
"""

import random
import time
import logging
from typing import Dict, Optional, List, Tuple, TYPE_CHECKING
from datetime import date, datetime
from django.db import transaction
from django.conf import settings
from django.core.cache import cache

if TYPE_CHECKING:
    from ..models import KYCProviderStats, User

logger = logging.getLogger(__name__)


class KYCRouter:
    """
    Roteador inteligente que seleciona o melhor provedor KYC baseado em:
    - Custo-benefício em tempo real
    - Taxa de sucesso histórica
    - Orçamentos e limites free tier
    - Algoritmo epsilon-greedy para exploração vs exploração
    """
    
    def __init__(self):
        self.epsilon = getattr(settings, 'KYC_ROUTER_EPSILON', 0.1)  # 10% exploração
        self.cache_ttl = 300  # 5 minutos cache
        self._last_choice_cache = {}
        
    def choose_provider(
        self, 
        user: 'User', 
        needs_biometric: bool = False,
        needs_pep: bool = False,
        force_provider: Optional[str] = None
    ) -> str:
        """
        Seleciona o melhor provedor baseado em algoritmo epsilon-greedy
        
        Args:
            user: Usuário solicitando verificação
            needs_biometric: Se precisa de verificação biométrica
            needs_pep: Se precisa de verificação PEP/sanções
            force_provider: Força um provedor específico (para testes)
            
        Returns:
            Nome do provedor selecionado
        """
        if force_provider:
            return force_provider
        
        # Cache para evitar múltiplas seleções simultâneas
        cache_key = f"kyc_provider_choice_{user.id}_{int(time.time() // 60)}"  # Cache por minuto
        cached_choice = cache.get(cache_key)
        if cached_choice:
            logger.debug(f"Using cached provider choice: {cached_choice}")
            return cached_choice
        
        try:
            # Filtrar provedores elegíveis
            eligible_providers = self._get_eligible_providers(
                needs_biometric=needs_biometric,
                needs_pep=needs_pep,
                user=user
            )
            
            if not eligible_providers:
                logger.warning("No eligible KYC providers found, falling back to stripe")
                return 'stripe'
            
            # Verificar reset mensal
            self._check_monthly_reset(eligible_providers)
            
            # Algoritmo epsilon-greedy
            if random.random() < self.epsilon:
                # Exploração: escolha aleatória
                chosen = random.choice(list(eligible_providers.keys()))
                logger.info(f"KYC Router: Exploration mode selected {chosen}")
            else:
                # Exploração: melhor utility score
                chosen = max(eligible_providers.keys(), 
                           key=lambda p: eligible_providers[p].utility_score)
                logger.info(f"KYC Router: Exploitation mode selected {chosen} "
                           f"(utility: {eligible_providers[chosen].utility_score:.3f})")
            
            # Cache a escolha
            cache.set(cache_key, chosen, self.cache_ttl)
            
            return chosen
            
        except Exception as e:
            logger.error(f"Error in KYC provider selection: {str(e)}")
            return 'stripe'  # Fallback seguro
    
    def _get_eligible_providers(
        self, 
        needs_biometric: bool,
        needs_pep: bool,
        user: 'User'
    ) -> Dict[str, 'KYCProviderStats']:
        """
        Filtra provedores elegíveis baseado em requisitos e orçamentos
        """
        from ..models import KYCProviderStats, KYCProviderConfig
        
        eligible = {}
        
        # Buscar configurações ativas
        configs = {
            config.name: config 
            for config in KYCProviderConfig.objects.filter(enabled=True)
        }
        
        # Buscar estatísticas
        stats_queryset = KYCProviderStats.objects.filter(is_active=True)
        
        for stats in stats_queryset:
            config = configs.get(stats.name)
            if not config:
                continue
            
            # Verificar capacidades técnicas
            if needs_biometric and not config.supports_biometric:
                logger.debug(f"Provider {stats.name} skipped: no biometric support")
                continue
                
            if needs_pep and not config.supports_pep:
                logger.debug(f"Provider {stats.name} skipped: no PEP support")
                continue
            
            # Verificar se é beta-only e usuário não é beta
            if config.beta_only and not getattr(user, 'is_beta_user', False):
                logger.debug(f"Provider {stats.name} skipped: beta only")
                continue
            
            # Verificar orçamento mensal
            if stats.budget_remaining <= 0:
                logger.debug(f"Provider {stats.name} skipped: budget exhausted")
                continue
            
            # Verificar free tier
            estimated_cost = config.cost_per_document
            if needs_biometric:
                estimated_cost += config.cost_per_biometric
            
            if stats.free_tier_remaining > 0:
                # Tem free tier disponível
                eligible[stats.name] = stats
            elif stats.budget_remaining >= estimated_cost:
                # Tem orçamento para pagar
                eligible[stats.name] = stats
            else:
                logger.debug(f"Provider {stats.name} skipped: insufficient budget")
        
        logger.info(f"Eligible KYC providers: {list(eligible.keys())}")
        return eligible
    
    def _check_monthly_reset(self, providers: Dict[str, 'KYCProviderStats']):
        """
        Verifica e executa reset mensal das métricas se necessário
        """
        for stats in providers.values():
            if stats.should_reset_monthly():
                logger.info(f"Resetting monthly metrics for provider {stats.name}")
                stats.reset_monthly_metrics()
    
    def update_provider_performance(
        self,
        provider_name: str,
        success: bool,
        cost: float,
        latency_ms: int,
        pep_found: bool = False
    ):
        """
        Atualiza métricas de performance de um provedor de forma thread-safe
        
        Args:
            provider_name: Nome do provedor
            success: Se a verificação foi bem-sucedida
            cost: Custo da verificação em BRL
            latency_ms: Latência em milissegundos
            pep_found: Se foi encontrado hit PEP/sanções
        """
        from ..models import KYCProviderStats
        
        try:
            with transaction.atomic():
                stats = KYCProviderStats.objects.select_for_update().get(
                    name=provider_name
                )
                stats.update_metrics(
                    success=success,
                    cost=cost,
                    latency_ms=latency_ms,
                    pep_found=pep_found
                )
                
                logger.info(
                    f"Updated KYC metrics for {provider_name}: "
                    f"success={success}, cost=R${cost:.2f}, "
                    f"latency={latency_ms}ms, utility={stats.utility_score:.3f}"
                )
                
        except Exception as e:
            logger.error(f"Error updating provider metrics: {str(e)}")
    
    def get_provider_recommendations(self) -> List[Dict]:
        """
        Retorna recomendações de uso de provedores para dashboards
        """
        from ..models import KYCProviderStats
        
        stats = list(KYCProviderStats.objects.filter(is_active=True))
        
        recommendations = []
        for stat in sorted(stats, key=lambda s: s.utility_score, reverse=True):
            recommendations.append({
                'name': stat.name,
                'utility_score': stat.utility_score,
                'success_rate': stat.success_rate,
                'cost_per_ok': stat.cost_per_ok,
                'budget_remaining': stat.budget_remaining,
                'free_tier_remaining': stat.free_tier_remaining,
                'recommendation': self._get_usage_recommendation(stat)
            })
        
        return recommendations
    
    def _get_usage_recommendation(self, stats: 'KYCProviderStats') -> str:
        """Gera recomendação textual baseada nas métricas"""
        if stats.free_tier_remaining > 0:
            return f"✅ Use grátis - {stats.free_tier_remaining} verificações restantes"
        elif stats.budget_remaining > 100:
            return f"💰 Bom custo-benefício - R$ {stats.budget_remaining:.0f} de orçamento"
        elif stats.budget_remaining > 0:
            return f"⚠️ Orçamento baixo - R$ {stats.budget_remaining:.0f} restantes"
        else:
            return "🚫 Orçamento esgotado"
    
    def adjust_epsilon(self, market_volatility: float = 0.1):
        """
        Ajusta o parâmetro epsilon baseado na volatilidade do mercado
        
        Args:
            market_volatility: Volatilidade atual (0-1), 
                             alta volatilidade = mais exploração
        """
        from ..models import KYCProviderStats
        
        # Calcular diferença entre top performers
        stats = list(KYCProviderStats.objects.filter(is_active=True))
        if len(stats) < 2:
            return
        
        top_utilities = sorted([s.utility_score for s in stats], reverse=True)
        performance_gap = top_utilities[0] - top_utilities[1] if len(top_utilities) > 1 else 0
        
        # Ajustar epsilon
        base_epsilon = 0.05
        volatility_adjustment = market_volatility * 0.1
        performance_adjustment = max(0, 0.1 - performance_gap * 2)
        
        new_epsilon = base_epsilon + volatility_adjustment + performance_adjustment
        self.epsilon = min(0.25, max(0.02, new_epsilon))  # Limitado entre 2% e 25%
        
        logger.info(f"Adjusted KYC epsilon to {self.epsilon:.3f} "
                   f"(gap: {performance_gap:.3f}, volatility: {market_volatility:.3f})")


# Singleton global
kyc_router = KYCRouter()


# ============================================================================
# Strategy Pattern para Provedores KYC
# ============================================================================

from abc import ABC, abstractmethod
from typing import TypedDict


class KYCPayload(TypedDict, total=False):
    """Payload padronizado para verificação KYC"""
    doc_front: str      # base64 da frente do documento
    doc_back: str       # base64 do verso do documento
    selfie: str         # base64 da selfie
    document_type: str  # tipo do documento (rg, cnh, passport)
    user_data: Dict     # dados do usuário para validação


class KYCResult(TypedDict):
    """Resultado padronizado de verificação KYC"""
    success: bool
    confidence_score: float   # 0-1
    details: Dict
    pep_match: bool
    cost: float              # Custo real em BRL
    provider: str
    latency_ms: int
    requires_manual_review: bool


class BaseKYCProvider(ABC):
    """Interface base para todos os provedores KYC"""
    
    @abstractmethod
    def verify(self, user_id: int, payload: KYCPayload) -> KYCResult:
        """Executa verificação KYC"""
        pass
    
    @abstractmethod
    def get_cost_estimate(self, payload: KYCPayload) -> float:
        """Estima custo da verificação em BRL"""
        pass
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Nome do provedor"""
        pass


def get_kyc_provider(provider_name: str) -> BaseKYCProvider:
    """
    Factory para instanciar provedores KYC dinamicamente
    """
    provider_mapping = {
        'stripe': 'api.services.providers.stripe_kyc.StripeKYCProvider',
        'idwall': 'api.services.providers.idwall_kyc.IdwallKYCProvider', 
        'unico': 'api.services.providers.unico_kyc.UnicoKYCProvider',
        'datavalid': 'api.services.providers.datavalid_kyc.DatavalidKYCProvider',
    }
    
    if provider_name not in provider_mapping:
        raise ValueError(f"Unknown KYC provider: {provider_name}")
    
    from importlib import import_module
    module_path, class_name = provider_mapping[provider_name].rsplit('.', 1)
    module = import_module(module_path)
    provider_class = getattr(module, class_name)
    
    return provider_class()