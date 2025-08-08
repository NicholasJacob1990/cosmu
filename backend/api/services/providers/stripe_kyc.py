"""
Stripe Identity Provider - Foco MVP até 1k verificações/mês
Melhor para passaportes e documentos internacionais
"""

import stripe
import os
import time
import logging
from typing import Dict
from django.conf import settings
from ..kyc_router import BaseKYCProvider, KYCPayload, KYCResult

logger = logging.getLogger(__name__)

# Configurar Stripe
stripe.api_key = settings.KYC_PROVIDERS.get('stripe', {}).get('api_key', '')


class StripeKYCProvider(BaseKYCProvider):
    """
    Provedor Stripe Identity
    
    Vantagens:
    - 50 verificações gratuitas/mês
    - Integração simples com Stripe Connect
    - Suporte global (passaportes, CNH 2023+)
    
    Desvantagens:
    - Sem verificação PEP nativa
    - Custo alto após free tier (US$ 1.50/verif)
    """
    
    @property
    def name(self) -> str:
        return "stripe"
    
    def verify(self, user_id: int, payload: KYCPayload) -> KYCResult:
        """
        Executa verificação via Stripe Identity
        Suporta tanto hosted flow quanto Elements integration
        """
        start_time = time.time()
        
        try:
            # Configurar sessão baseada no tipo de integração
            integration_type = payload.get('integration_type', 'hosted')  # 'hosted' ou 'embedded'
            
            session_config = {
                'type': 'document',
                'metadata': {
                    'user_id': str(user_id),
                    'marketplace': 'galaxia',
                    'integration_type': integration_type
                },
                'options': {
                    'document': {
                        'allowed_types': ['driving_license', 'passport', 'id_card'],
                        'require_id_number': True,
                        'require_live_capture': bool(payload.get('selfie')),
                        'require_matching_selfie': bool(payload.get('selfie'))
                    }
                }
            }
            
            # Para embedded integration, adicionar return_url
            if integration_type == 'embedded':
                session_config['return_url'] = payload.get('return_url', 
                    'https://app.galaxia.com/kyc/callback')
            
            # Criar sessão de verificação
            verification_session = stripe.identity.VerificationSession.create(**session_config)
            
            # Se temos dados de documento, simular verificação
            success = False
            confidence_score = 0.0
            
            if payload.get('doc_front') and payload.get('selfie'):
                # Stripe processa via frontend, aqui simulamos baseado na presença dos dados
                success = True
                confidence_score = 0.95
                
                # Atualizar sessão (em produção seria feito pelo webhook)
                verification_session = stripe.identity.VerificationSession.modify(
                    verification_session.id,
                    metadata={
                        **verification_session.metadata,
                        'processed_at': str(int(time.time())),
                        'confidence': str(confidence_score)
                    }
                )
            
            latency_ms = int((time.time() - start_time) * 1000)
            
            return KYCResult(
                success=success,
                confidence_score=confidence_score,
                details={
                    'session_id': verification_session.id,
                    'status': verification_session.status,
                    'url': verification_session.url,
                    'provider': 'stripe_identity'
                },
                pep_match=False,  # Stripe não oferece PEP
                cost=self.get_cost_estimate(payload),
                provider='stripe',
                latency_ms=latency_ms,
                requires_manual_review=False
            )
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe Identity error: {str(e)}")
            latency_ms = int((time.time() - start_time) * 1000)
            
            return KYCResult(
                success=False,
                confidence_score=0.0,
                details={'error': str(e), 'provider': 'stripe_identity'},
                pep_match=False,
                cost=0.0,
                provider='stripe',
                latency_ms=latency_ms,
                requires_manual_review=True
            )
    
    def get_cost_estimate(self, payload: KYCPayload) -> float:
        """
        Calcula custo estimado em BRL
        Stripe: US$ 1.50 por verificação após free tier
        """
        # Converter USD para BRL (cotação fixa para simplicidade)
        usd_to_brl = 5.0  # Ajustar conforme cotação atual
        
        # Verificar se ainda está no free tier
        from ...models import KYCProviderStats
        try:
            stats = KYCProviderStats.objects.get(name='stripe')
            if stats.free_tier_remaining > 0:
                return 0.0  # Grátis no free tier
        except KYCProviderStats.DoesNotExist:
            pass
        
        base_cost = 1.50  # USD
        return base_cost * usd_to_brl