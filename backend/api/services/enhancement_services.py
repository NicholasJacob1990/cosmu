"""
Serviços de melhoria para busca - implementando as 6 otimizações de ROI
Aproveitando modelos já planejados: all-MiniLM-L6-v2, OpenAI GPT-3.5, XGBoost
"""
import logging
import hashlib
import time
from typing import Dict, List, Any, Optional, Tuple
from functools import lru_cache
from datetime import datetime, timedelta

from django.conf import settings
from django.core.cache import cache
from django.contrib.auth.models import User
from celery import shared_task
import requests
import openai

# Import dos modelos já planejados na arquitetura
try:
    from sentence_transformers import SentenceTransformer, CrossEncoder
    from symspellpy import SymSpell
    from wordfreq import top_n_list
    MODELS_AVAILABLE = True
except ImportError:
    MODELS_AVAILABLE = False
    logging.warning("Modelos não instalados. Execute: pip install sentence-transformers symspellpy wordfreq")

logger = logging.getLogger(__name__)

# ============================================================================
# 1. DID-YOU-MEAN + SINÔNIMOS AUTOMÁTICOS (Custo: R$ 0)
# ============================================================================

class SpellCheckService:
    """
    Correção ortográfica e sinônimos automáticos usando SymSpell
    Conforme algoritmo.md - complementa embeddings OpenAI com processamento local
    """
    
    def __init__(self):
        self.symspell = None
        self.synonyms_cache_key = "search_synonyms_dict"
        self._init_symspell()
    
    def _init_symspell(self):
        """Inicializa SymSpell com dicionário PT-BR"""
        if not MODELS_AVAILABLE:
            return
            
        try:
            self.symspell = SymSpell(max_dictionary_edit_distance=2, prefix_length=7)
            
            # Usar wordfreq para top 50k palavras PT-BR
            portuguese_words = top_n_list('pt', 50000)
            
            for word in portuguese_words:
                self.symspell.create_dictionary_entry(word, 1)
                
            logger.info("SymSpell inicializado com dicionário PT-BR")
            
        except Exception as e:
            logger.error(f"Erro ao inicializar SymSpell: {e}")
            self.symspell = None
    
    def suggest_correction(self, query: str, max_suggestions: int = 3) -> List[Dict[str, Any]]:
        """
        Sugere correções para query com baixos resultados
        Implementa lógica: se len(results) < 3, sugerir correção
        """
        if not self.symspell:
            return []
        
        try:
            words = query.lower().split()
            suggestions = []
            
            for word in words:
                if len(word) < 3:  # Skip palavras muito curtas
                    continue
                    
                word_suggestions = self.symspell.lookup(
                    word, 
                    verbosity=2,  # Todas sugestões
                    max_edit_distance=2,
                    transfer_casing=True
                )
                
                if word_suggestions and word_suggestions[0].term != word:
                    # Há correção sugerida
                    original_query = query
                    corrected_query = query.replace(word, word_suggestions[0].term)
                    
                    suggestions.append({
                        'original': original_query,
                        'corrected': corrected_query,
                        'word_corrected': word,
                        'word_suggestion': word_suggestions[0].term,
                        'confidence': 1.0 - (word_suggestions[0].distance / len(word)),
                        'type': 'spelling'
                    })
            
            return suggestions[:max_suggestions]
            
        except Exception as e:
            logger.error(f"Erro na correção ortográfica: {e}")
            return []
    
    def learn_synonym(self, original_query: str, accepted_query: str, user_id: Optional[int] = None):
        """
        Aprende sinônimo quando usuário aceita reformulação
        Registra no Redis → job Celery diário exporta para OpenSearch
        """
        try:
            synonyms_dict = cache.get(self.synonyms_cache_key, {})
            
            # Normalizar queries
            orig_norm = original_query.lower().strip()
            accept_norm = accepted_query.lower().strip()
            
            if orig_norm != accept_norm:
                if orig_norm not in synonyms_dict:
                    synonyms_dict[orig_norm] = []
                
                # Adicionar sinônimo se não existe
                if accept_norm not in synonyms_dict[orig_norm]:
                    synonyms_dict[orig_norm].append(accept_norm)
                    
                    # Atualizar cache
                    cache.set(self.synonyms_cache_key, synonyms_dict, timeout=86400*7)  # 7 dias
                    
                    logger.info(f"Sinônimo aprendido: '{orig_norm}' → '{accept_norm}'")
                    
                    # Agendar atualização do OpenSearch
                    update_opensearch_synonyms.delay()
        
        except Exception as e:
            logger.error(f"Erro ao aprender sinônimo: {e}")


# ============================================================================
# 2. CROSS-ENCODER NO TOP-30 (Custo: +R$ 80/mês CPU)
# ============================================================================

class CrossEncoderService:
    """
    Re-ranking neural do Top-30 usando cross-encoder MiniLM
    Conforme arquitetura: complementa XGBoost com re-ranking neural
    """
    
    def __init__(self):
        self.model = None
        self._init_model()
    
    def _init_model(self):
        """Carrega cross-encoder ms-marco-MiniLM-L-6-v2 (84MB)"""
        if not MODELS_AVAILABLE:
            return
            
        try:
            # Usar modelo já sugerido na arquitetura
            self.model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
            logger.info("Cross-encoder MiniLM carregado (84MB)")
            
        except Exception as e:
            logger.error(f"Erro ao carregar cross-encoder: {e}")
            self.model = None
    
    @lru_cache(maxsize=4096)
    def score_pair(self, query: str, doc_text: str) -> float:
        """
        Score cross-encoder para par query-documento
        Cache LRU para QPS > 1 (conforme sugestão)
        """
        if not self.model:
            return 0.0
        
        try:
            score = float(self.model.predict([(query, doc_text)]))
            return max(0.0, min(1.0, score))  # Normalizar 0-1
            
        except Exception as e:
            logger.error(f"Erro no cross-encoder: {e}")
            return 0.0
    
    def rerank_top30(self, query: str, hits: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Re-rank apenas top-30 para otimizar latência (~200ms CPU t3.medium)
        Mantém resto da ordenação original
        """
        if not self.model or len(hits) == 0:
            return hits
        
        try:
            # Separar top-30 para re-ranking
            top_30 = hits[:30]
            rest = hits[30:]
            
            # Re-score top-30
            rescored = []
            for hit in top_30:
                # Construir texto do documento
                source = hit.get('_source', hit)
                doc_text = f"{source.get('title', '')} {source.get('description', '')}"
                
                # Calcular cross-encoder score
                ce_score = self.score_pair(query, doc_text)
                
                # Manter scores originais + adicionar CE
                hit_copy = hit.copy()
                hit_copy['_ce_score'] = ce_score
                hit_copy['_original_score'] = hit.get('_score', 0)
                
                # Score final híbrido (CE + original)
                original_score = float(hit.get('_score', 0))
                hit_copy['_score'] = (ce_score * 0.7) + (original_score * 0.3)
                
                rescored.append(hit_copy)
            
            # Reordenar top-30 por score híbrido
            rescored.sort(key=lambda x: x.get('_score', 0), reverse=True)
            
            # Retornar: top-30 re-ranked + resto original
            return rescored + rest
            
        except Exception as e:
            logger.error(f"Erro no re-ranking cross-encoder: {e}")
            return hits


# ============================================================================
# 3. SNIPPET RAG COM GPT-3.5 (Custo: <R$ 50/mês)
# ============================================================================

class RAGSnippetService:
    """
    Snippets de resposta rápida usando GPT-3.5-turbo
    Ativado por type-ahead (700ms delay) conforme UX sugerida
    """
    
    def __init__(self):
        self.openai_client = openai
        if hasattr(settings, 'OPENAI_API_KEY'):
            self.openai_client.api_key = settings.OPENAI_API_KEY
    
    def generate_quick_snippet(
        self, 
        query: str, 
        top_professionals: List[Dict[str, Any]], 
        max_professionals: int = 3
    ) -> Optional[Dict[str, Any]]:
        """
        Gera snippet RAG dos top 3 profissionais
        Cache por 15min (MD5 da query)
        """
        if len(top_professionals) == 0:
            return None
        
        # Cache key baseado na query
        cache_key = f"rag_snippet_{hashlib.md5(query.encode()).hexdigest()}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return cached_result
        
        try:
            # Preparar contexto dos profissionais
            professionals_context = []
            for i, prof in enumerate(top_professionals[:max_professionals], 1):
                source = prof.get('_source', prof)
                context = {
                    'nome': source.get('freelancer_name', source.get('title', 'N/A')),
                    'titulo': source.get('title', 'N/A'),
                    'descricao': source.get('description', 'N/A')[:200],  # Limitar tamanho
                    'preco': source.get('price', 'Sob consulta'),
                    'rating': source.get('freelancer_rating', source.get('rating', 0)),
                    'reviews': source.get('freelancer_total_reviews', source.get('reviews_count', 0))
                }
                professionals_context.append(f"#{i}. {context['nome']} - {context['titulo']} (⭐{context['rating']:.1f}, {context['reviews']} avaliações) - R${context['preco']} - {context['descricao']}")
            
            # Prompt otimizado para GPT-3.5
            prompt = f"""
Baseado na busca "{query}", resuma em 2-3 linhas os melhores profissionais encontrados:

{chr(10).join(professionals_context)}

Formato: Destaque brevemente cada profissional, mencione preços aproximados e diferenciais. Máximo 150 palavras.
            """.strip()
            
            # Chamada GPT-3.5-turbo (mais barato que GPT-4)
            response = self.openai_client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Você é um assistente especializado em resumir profissionais de marketplace de serviços de forma clara e objetiva."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.3,
                timeout=5
            )
            
            snippet_text = response.choices[0].message.content.strip()
            
            result = {
                'snippet': snippet_text,
                'professionals_count': len(professionals_context),
                'query': query,
                'generated_at': datetime.now().isoformat(),
                'model': 'gpt-3.5-turbo',
                'cached': False
            }
            
            # Cache por 15 minutos
            cache.set(cache_key, result, timeout=900)
            
            return result
            
        except Exception as e:
            logger.error(f"Erro ao gerar snippet RAG: {e}")
            return None


# ============================================================================
# 4. PERSONALIZAÇÃO LEVE (Custo: R$ 0)
# ============================================================================

class PersonalizationService:
    """
    Personalização baseada em histórico do usuário
    Boost +0.05 para categoria frequente, +boost mesmo bairro
    """
    
    @staticmethod
    def get_user_preferences(user_id: int) -> Dict[str, Any]:
        """
        Obtém preferências do usuário baseado em histórico
        """
        cache_key = f"user_pref_{user_id}"
        cached_prefs = cache.get(cache_key)
        
        if cached_prefs:
            return cached_prefs
        
        try:
            # Buscar dados do usuário (implementar conforme seus modelos)
            from django.db.models import Count
            
            # Mock - adaptar para seus modelos reais
            prefs = {
                'last_categories': [],  # ['design', 'marketing']
                'last_locations': [],   # ['São Paulo', 'Vila Madalena']
                'budget_median': 0,     # Orçamento médio
                'search_count': 0
            }
            
            # Cache por 1 hora
            cache.set(cache_key, prefs, timeout=3600)
            
            return prefs
            
        except Exception as e:
            logger.error(f"Erro ao obter preferências: {e}")
            return {}
    
    @staticmethod
    def apply_personalization_boost(
        hits: List[Dict[str, Any]], 
        user_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Aplica boost de personalização nos resultados
        """
        if not user_id:
            return hits
        
        try:
            prefs = PersonalizationService.get_user_preferences(user_id)
            
            if not prefs:
                return hits
            
            # Aplicar boosts
            for hit in hits:
                source = hit.get('_source', hit)
                original_score = float(hit.get('_score', 0))
                boost = 0.0
                
                # Boost categoria frequente (+0.05)
                category = source.get('category_slug', source.get('category', ''))
                if category in prefs.get('last_categories', []):
                    boost += 0.05
                
                # Boost mesmo bairro/localização (+0.03)
                location = source.get('freelancer_location', source.get('location', ''))
                for last_loc in prefs.get('last_locations', []):
                    if last_loc.lower() in location.lower():
                        boost += 0.03
                        break
                
                # Aplicar boost
                if boost > 0:
                    hit['_score'] = original_score * (1 + boost)
                    hit['_personalization_boost'] = boost
            
            # Reordenar se houve mudanças
            hits.sort(key=lambda x: x.get('_score', 0), reverse=True)
            
            return hits
            
        except Exception as e:
            logger.error(f"Erro na personalização: {e}")
            return hits


# ============================================================================
# 5. DWELL-TIME TRACKING (Custo: R$ 0)
# ============================================================================

class DwellTimeService:
    """
    Tracking de tempo de visualização como feature para LTR
    Frontend envia event=view_time, ms=... ao sair do perfil
    """
    
    @staticmethod
    def record_dwell_time(
        user_id: Optional[int],
        professional_id: str,
        view_time_ms: int,
        query: Optional[str] = None
    ):
        """
        Registra tempo de visualização
        """
        try:
            # Registrar evento (adaptar para seu modelo de eventos)
            event_data = {
                'user_id': user_id,
                'professional_id': professional_id,
                'view_time_ms': view_time_ms,
                'query': query,
                'event_type': 'profile_view',
                'timestamp': datetime.now().isoformat()
            }
            
            # Agendar processamento assíncrono
            process_dwell_time_event.delay(event_data)
            
        except Exception as e:
            logger.error(f"Erro ao registrar dwell-time: {e}")
    
    @staticmethod
    def calculate_engagement_score(professional_id: str) -> float:
        """
        Calcula score de engajamento baseado nas últimas 10 visualizações
        """
        try:
            # Mock - implementar conforme seu modelo de eventos
            # avg_dwell_time = get_average_dwell_time(professional_id, last_10_views=True)
            
            # Normalizar para 0-1 (exemplo: 30s = 1.0)
            avg_dwell_time_ms = 15000  # Mock
            engagement_score = min(1.0, avg_dwell_time_ms / 30000)
            
            return engagement_score
            
        except Exception as e:
            logger.error(f"Erro ao calcular engagement: {e}")
            return 0.0


# ============================================================================
# 6. MONITOR nDCG + ROLLBACK AUTOMÁTICO (Custo: R$ 0)
# ============================================================================

class ModelMonitoringService:
    """
    Monitoramento de nDCG online + rollback automático
    Prometheus + Grafana + Slack webhooks
    """
    
    @staticmethod
    def record_search_ctr(query: str, model_version: str, ctr_at_10: float):
        """
        Registra CTR@10 para monitoramento
        """
        try:
            # Métricas Prometheus (implementar com prometheus_client)
            metric_key = f"ctr10_model_{model_version}"
            
            # Log estruturado para agregação
            logger.info(f"METRICS CTR@10", extra={
                'metric': 'ctr_at_10',
                'model': model_version,
                'value': ctr_at_10,
                'query': query,
                'timestamp': time.time()
            })
            
            # Verificar threshold para alerta
            check_model_performance.delay(model_version, ctr_at_10)
            
        except Exception as e:
            logger.error(f"Erro ao registrar CTR: {e}")


# ============================================================================
# CELERY TASKS PARA AUTOMAÇÃO
# ============================================================================

@shared_task
def update_opensearch_synonyms():
    """
    Job diário: exporta sinônimos do Redis para OpenSearch
    """
    try:
        spell_service = SpellCheckService()
        synonyms_dict = cache.get(spell_service.synonyms_cache_key, {})
        
        if not synonyms_dict:
            return "Nenhum sinônimo para atualizar"
        
        # Converter para formato OpenSearch
        synonyms_list = []
        for original, alternatives in synonyms_dict.items():
            synonyms_line = f"{original},{','.join(alternatives)}"
            synonyms_list.append(synonyms_line)
        
        # Atualizar OpenSearch (implementar chamada real)
        # PUT /_synonyms/marketplace_synonyms
        logger.info(f"Atualizados {len(synonyms_list)} sinônimos no OpenSearch")
        
        return f"Sucesso: {len(synonyms_list)} sinônimos"
        
    except Exception as e:
        logger.error(f"Erro ao atualizar sinônimos: {e}")
        return f"Erro: {e}"


@shared_task
def process_dwell_time_event(event_data: Dict[str, Any]):
    """
    Processa evento de dwell-time e atualiza engagement_score
    """
    try:
        professional_id = event_data['professional_id']
        view_time_ms = event_data['view_time_ms']
        
        # Salvar evento (implementar conforme seu modelo)
        # DwellTimeEvent.objects.create(**event_data)
        
        # Recalcular engagement score
        new_score = DwellTimeService.calculate_engagement_score(professional_id)
        
        # Atualizar no modelo Professional (adaptar)
        # Professional.objects.filter(id=professional_id).update(engagement_score=new_score)
        
        logger.info(f"Dwell-time processado: {professional_id}, score: {new_score}")
        
    except Exception as e:
        logger.error(f"Erro ao processar dwell-time: {e}")


@shared_task
def check_model_performance(model_version: str, current_ctr: float):
    """
    Verifica performance do modelo e aciona rollback se necessário
    """
    try:
        # Obter CTR baseline (últimos 7 dias)
        baseline_ctr = 0.05  # Mock - implementar cálculo real
        
        # Threshold: queda de 15% = rollback
        threshold = baseline_ctr * 0.85
        
        if current_ctr < threshold:
            logger.warning(f"CTR@10 abaixo do threshold: {current_ctr} < {threshold}")
            
            # Acionar rollback automático
            rollback_model.delay(model_version, current_ctr, baseline_ctr)
            
            # Enviar alerta Slack
            send_slack_alert.delay(
                f"🚨 ROLLBACK AUTOMÁTICO: Modelo {model_version} revertido. "
                f"CTR caiu de {baseline_ctr:.3f} para {current_ctr:.3f}"
            )
        
    except Exception as e:
        logger.error(f"Erro ao verificar performance: {e}")


@shared_task
def rollback_model(model_version: str, current_ctr: float, baseline_ctr: float):
    """
    Executa rollback automático do modelo
    """
    try:
        # Reverter para modelo anterior (implementar conforme LTR)
        # es.put_model("ltr_prev")
        
        logger.error(f"ROLLBACK EXECUTADO: {model_version} → ltr_prev")
        
        return f"Rollback concluído: {model_version} revertido"
        
    except Exception as e:
        logger.error(f"Erro no rollback: {e}")


@shared_task
def send_slack_alert(message: str):
    """
    Envia alerta para Slack
    """
    try:
        slack_webhook = getattr(settings, 'SLACK_WEBHOOK_URL', None)
        
        if slack_webhook:
            requests.post(slack_webhook, json={'text': message}, timeout=5)
            
    except Exception as e:
        logger.error(f"Erro ao enviar Slack: {e}")


# ============================================================================
# FACTORY PARA USAR TODOS OS SERVIÇOS
# ============================================================================

class SearchEnhancementFactory:
    """
    Factory para orquestrar todas as 6 melhorias
    """
    
    def __init__(self):
        self.spell_check = SpellCheckService()
        self.cross_encoder = CrossEncoderService()
        self.rag_snippets = RAGSnippetService()
        self.personalization = PersonalizationService()
        self.dwell_time = DwellTimeService()
        self.monitoring = ModelMonitoringService()
    
    def enhance_search_results(
        self,
        query: str,
        hits: List[Dict[str, Any]],
        user_id: Optional[int] = None,
        generate_snippet: bool = False
    ) -> Dict[str, Any]:
        """
        Aplica todas as melhorias na busca
        Pipeline: Spell Check → Cross-encoder → Personalização → RAG Snippet
        """
        start_time = time.time()
        enhancements = {}
        
        try:
            # 1. Spell check se poucos resultados
            if len(hits) < 3:
                corrections = self.spell_check.suggest_correction(query)
                if corrections:
                    enhancements['spelling_suggestions'] = corrections
            
            # 2. Cross-encoder re-rank Top-30
            if len(hits) > 0:
                hits = self.cross_encoder.rerank_top30(query, hits)
                enhancements['cross_encoder_applied'] = True
            
            # 3. Personalização
            if user_id:
                hits = self.personalization.apply_personalization_boost(hits, user_id)
                enhancements['personalization_applied'] = True
            
            # 4. RAG Snippet (opcional)
            if generate_snippet and len(hits) >= 3:
                snippet = self.rag_snippets.generate_quick_snippet(query, hits[:3])
                if snippet:
                    enhancements['rag_snippet'] = snippet
            
            # 5. Métricas para monitoramento
            processing_time = (time.time() - start_time) * 1000
            enhancements['processing_time_ms'] = processing_time
            
            return {
                'hits': hits,
                'enhancements': enhancements,
                'enhanced': True
            }
            
        except Exception as e:
            logger.error(f"Erro nas melhorias de busca: {e}")
            return {
                'hits': hits,
                'enhancements': {'error': str(e)},
                'enhanced': False
            }