"""
Serviço de busca Elasticsearch tradicional
Complementa o sistema de IA com busca local rápida
"""
from typing import Dict, List, Any, Optional, Union
from django.conf import settings
from elasticsearch_dsl import Search, Q
from elasticsearch_dsl.response import Response
import logging

from ..documents import (
    ServicePackageDocument, 
    FreelancerProfileDocument, 
    CategoryDocument,
    UnifiedSearchDocument
)

logger = logging.getLogger(__name__)


class ElasticsearchService:
    """
    Serviço para busca tradicional usando Elasticsearch local
    """
    
    @classmethod
    def search_services(
        cls,
        query: str = '',
        category: Optional[str] = None,
        price_min: Optional[float] = None,
        price_max: Optional[float] = None,
        delivery_max_days: Optional[int] = None,
        min_rating: Optional[float] = None,
        location: Optional[str] = None,
        tags: Optional[List[str]] = None,
        sort_by: str = 'relevance',
        search_mode: str = 'traditional',  # 'traditional', 'semantic', 'hybrid'
        limit: int = 30,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Busca avançada de serviços usando Elasticsearch
        
        Args:
            query: Termo de busca textual
            category: Slug da categoria
            price_min/max: Faixa de preço
            delivery_max_days: Prazo máximo de entrega
            min_rating: Rating mínimo do freelancer
            location: Localização do freelancer
            tags: Lista de tags para filtrar
            sort_by: Critério de ordenação
            limit: Número de resultados
            offset: Offset para paginação
            
        Returns:
            Dict com resultados formatados
        """
        try:
            # Escolher estratégia de busca baseada no modo
            if search_mode == 'traditional':
                return cls._traditional_bm25_search(
                    query, category, price_min, price_max, delivery_max_days,
                    min_rating, location, tags, sort_by, limit, offset
                )
            elif search_mode == 'semantic':
                # Delegar para o sistema de IA (marketplace_ai)
                from .ai_search_service import AISearchService
                return AISearchService.semantic_search(
                    query=query,
                    category=category,
                    price_max=price_max,
                    limit=limit,
                    offset=offset
                )
            elif search_mode == 'hybrid':
                return cls._hybrid_rrf_search(
                    query, category, price_min, price_max, delivery_max_days,
                    min_rating, location, tags, sort_by, limit, offset
                )
            else:
                # Fallback para tradicional
                return cls._traditional_bm25_search(
                    query, category, price_min, price_max, delivery_max_days,
                    min_rating, location, tags, sort_by, limit, offset
                )
            
        except Exception as e:
            logger.error(f"Erro na busca Elasticsearch de serviços: {str(e)}")
            return {
                'success': False,
                'source': 'elasticsearch_error',
                'results': [],
                'total': 0,
                'error': str(e)
            }
    
    @classmethod
    def search_freelancers(
        cls,
        query: str = '',
        skills: Optional[List[str]] = None,
        hourly_rate_min: Optional[float] = None,
        hourly_rate_max: Optional[float] = None,
        min_rating: Optional[float] = None,
        min_experience: Optional[int] = None,
        location: Optional[str] = None,
        is_available: Optional[bool] = None,
        is_verified: Optional[bool] = None,
        can_receive_payments: Optional[bool] = None,
        sort_by: str = 'relevance',
        limit: int = 30,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Busca avançada de freelancers usando Elasticsearch
        """
        try:
            search = FreelancerProfileDocument.search()
            
            # Query textual
            if query:
                text_query = Q('multi_match',
                    query=query,
                    fields=[
                        'full_name^3',
                        'bio^2', 
                        'skills^2',
                        'location'
                    ],
                    fuzziness='AUTO'
                )
                search = search.query(text_query)
            
            # Filtros
            if skills:
                for skill in skills:
                    search = search.filter('match', skills={'query': skill, 'fuzziness': 'AUTO'})
            
            if hourly_rate_min is not None:
                search = search.filter('range', hourly_rate={'gte': hourly_rate_min})
                
            if hourly_rate_max is not None:
                search = search.filter('range', hourly_rate={'lte': hourly_rate_max})
                
            if min_rating is not None:
                search = search.filter('range', average_rating={'gte': min_rating})
                
            if min_experience is not None:
                search = search.filter('range', experience_years={'gte': min_experience})
                
            if location:
                search = search.filter('match', location={'query': location, 'fuzziness': 'AUTO'})
                
            if is_available is not None:
                search = search.filter('term', is_available=is_available)
                
            if is_verified is not None:
                search = search.filter('term', is_verified=is_verified)
                
            if can_receive_payments is not None:
                search = search.filter('term', can_receive_payments=can_receive_payments)
            
            # Ordenação
            search = cls._apply_sorting(search, sort_by, 'freelancer')
            
            # Paginação
            search = search[offset:offset + limit]
            
            # Executar
            response = search.execute()
            
            # Formatar resultados
            results = []
            for hit in response:
                results.append({
                    'id': hit.meta.id,
                    'score': hit.meta.score,
                    'full_name': hit.full_name,
                    'bio': hit.bio,
                    'skills': hit.skills,
                    'location': hit.location,
                    'average_rating': float(hit.average_rating),
                    'total_reviews': hit.total_reviews,
                    'success_rate': float(hit.success_rate),
                    'experience_years': hit.experience_years,
                    'hourly_rate': float(hit.hourly_rate) if hit.hourly_rate else None,
                    'is_available': hit.is_available,
                    'is_verified': hit.is_verified,
                    'can_receive_payments': hit.can_receive_payments,
                    'portfolio': hit.portfolio,
                    'certifications': hit.certifications,
                    'updated_at': hit.updated_at.isoformat() if hit.updated_at else None,
                })
            
            return {
                'success': True,
                'source': 'elasticsearch',
                'results': results,
                'total': response.hits.total.value if hasattr(response.hits.total, 'value') else len(results),
                'query': query,
                'took': response.took,
                'filters': {
                    'skills': skills,
                    'hourly_rate_range': [hourly_rate_min, hourly_rate_max],
                    'min_rating': min_rating,
                    'min_experience': min_experience,
                    'location': location,
                    'is_available': is_available,
                    'is_verified': is_verified,
                },
                'sort_by': sort_by
            }
            
        except Exception as e:
            logger.error(f"Erro na busca Elasticsearch de freelancers: {str(e)}")
            return {
                'success': False,
                'source': 'elasticsearch_error',
                'results': [],
                'total': 0,
                'error': str(e)
            }
    
    @classmethod
    def unified_search(
        cls,
        query: str,
        content_types: Optional[List[str]] = None,  # ['service', 'freelancer']
        limit: int = 30,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Busca unificada que retorna tanto serviços quanto freelancers
        Útil para buscas globais
        """
        try:
            search = UnifiedSearchDocument.search()
            
            if query:
                text_query = Q('multi_match',
                    query=query,
                    fields=['title^3', 'description^2', 'tags^2'],
                    fuzziness='AUTO'
                )
                search = search.query(text_query)
            
            if content_types:
                search = search.filter('terms', content_type=content_types)
            
            # Filtros de ativo/disponível
            search = search.filter('term', is_active=True)
            
            # Ordenar por boost_score e relevância
            search = search.sort('-boost_score', {'_score': {'order': 'desc'}})
            
            search = search[offset:offset + limit]
            response = search.execute()
            
            results = []
            for hit in response:
                results.append({
                    'id': hit.original_id,
                    'type': hit.content_type,
                    'score': hit.meta.score,
                    'boost_score': hit.boost_score,
                    'title': hit.title,
                    'description': hit.description,
                    'location': hit.location,
                    'rating': float(hit.rating),
                    'reviews_count': hit.reviews_count,
                    'price': float(hit.price) if hit.price else None,
                    'price_type': hit.price_type,
                    'tags': hit.tags,
                })
            
            return {
                'success': True,
                'source': 'elasticsearch_unified',
                'results': results,
                'total': response.hits.total.value if hasattr(response.hits.total, 'value') else len(results),
                'query': query,
                'took': response.took,
            }
            
        except Exception as e:
            logger.error(f"Erro na busca unificada Elasticsearch: {str(e)}")
            return {
                'success': False,
                'source': 'elasticsearch_error',
                'results': [],
                'total': 0,
                'error': str(e)
            }
    
    @classmethod
    def get_suggestions(
        cls,
        query: str,
        suggestion_type: str = 'all',  # 'services', 'freelancers', 'all'
        limit: int = 10
    ) -> List[str]:
        """
        Busca sugestões de autocomplete
        """
        try:
            suggestions = []
            
            if suggestion_type in ['services', 'all']:
                # Sugestões de serviços
                service_search = ServicePackageDocument.search()
                service_search = service_search.suggest(
                    'service_suggest',
                    query,
                    completion={'field': 'title.suggest', 'size': limit//2}
                )
                service_response = service_search.execute()
                
                for option in service_response.suggest.service_suggest[0].options:
                    suggestions.append({
                        'text': option.text,
                        'type': 'service',
                        'score': option.score
                    })
            
            if suggestion_type in ['freelancers', 'all']:
                # Sugestões de freelancers
                freelancer_search = FreelancerProfileDocument.search()
                freelancer_search = freelancer_search.suggest(
                    'freelancer_suggest',
                    query,
                    completion={'field': 'full_name.suggest', 'size': limit//2}
                )
                freelancer_response = freelancer_search.execute()
                
                for option in freelancer_response.suggest.freelancer_suggest[0].options:
                    suggestions.append({
                        'text': option.text,
                        'type': 'freelancer',
                        'score': option.score
                    })
            
            # Ordenar por score e retornar top results
            suggestions.sort(key=lambda x: x['score'], reverse=True)
            return suggestions[:limit]
            
        except Exception as e:
            logger.error(f"Erro ao buscar sugestões: {str(e)}")
            return []
    
    @classmethod
    def _apply_sorting(
        cls, 
        search: Search, 
        sort_by: str, 
        document_type: str = 'service'
    ) -> Search:
        """
        Aplica ordenação na busca
        """
        if sort_by == 'price_asc':
            if document_type == 'service':
                return search.sort('price')
            else:
                return search.sort('hourly_rate')
        elif sort_by == 'price_desc':
            if document_type == 'service':
                return search.sort('-price')
            else:
                return search.sort('-hourly_rate')
        elif sort_by == 'rating':
            if document_type == 'service':
                return search.sort('-freelancer_rating')
            else:
                return search.sort('-average_rating')
        elif sort_by == 'newest':
            if document_type == 'service':
                return search.sort('-created_at')
            else:
                return search.sort('-updated_at')
        elif sort_by == 'delivery_time' and document_type == 'service':
            return search.sort('delivery_time_days')
        elif sort_by == 'experience' and document_type == 'freelancer':
            return search.sort('-experience_years')
        else:
            # Relevance (score) - padrão
            return search.sort({'_score': {'order': 'desc'}})
    
    @classmethod
    def get_aggregations(
        cls,
        query: str = '',
        document_type: str = 'service'
    ) -> Dict[str, Any]:
        """
        Retorna agregações para construir filtros dinâmicos
        """
        try:
            if document_type == 'service':
                search = ServicePackageDocument.search()
            else:
                search = FreelancerProfileDocument.search()
            
            if query:
                text_query = Q('multi_match', query=query, fields=['title', 'description'])
                search = search.query(text_query)
            
            # Aplicar agregações
            if document_type == 'service':
                search.aggs.bucket('categories', 'terms', field='category_slug', size=20)
                search.aggs.bucket('price_ranges', 'histogram', field='price', interval=100)
                search.aggs.bucket('delivery_times', 'terms', field='delivery_time_days')
                search.aggs.metric('avg_price', 'avg', field='price')
                search.aggs.metric('min_price', 'min', field='price')
                search.aggs.metric('max_price', 'max', field='price')
            else:
                search.aggs.bucket('locations', 'terms', field='location.raw', size=20)
                search.aggs.bucket('skills', 'terms', field='skills', size=30)
                search.aggs.bucket('hourly_ranges', 'histogram', field='hourly_rate', interval=50)
                search.aggs.metric('avg_rating', 'avg', field='average_rating')
            
            # Executar apenas agregações (sem documentos)
            search = search[:0]
            response = search.execute()
            
            return {
                'success': True,
                'aggregations': response.aggregations.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Erro ao buscar agregações: {str(e)}")
            return {
                'success': False,
                'aggregations': {},
                'error': str(e)
            }
    
    # ========== MÉTODOS DE BUSCA ESPECÍFICOS ==========
    
    @classmethod
    def _traditional_bm25_search(
        cls, query, category, price_min, price_max, delivery_max_days,
        min_rating, location, tags, sort_by, limit, offset
    ):
        """Busca tradicional BM25 com Elasticsearch"""
        try:
            search = ServicePackageDocument.search()
            
            # Query textual usando BM25
            if query:
                text_query = Q('multi_match',
                    query=query,
                    fields=[
                        'title^3',
                        'description^2', 
                        'tags^2',
                        'freelancer_name'
                    ],
                    fuzziness='AUTO',
                    type='best_fields'
                )
                search = search.query(text_query)
            
            # Aplicar filtros
            search = cls._apply_filters(
                search, category, price_min, price_max, 
                delivery_max_days, min_rating, location, tags
            )
            
            # Ordenação
            search = cls._apply_sorting(search, sort_by)
            
            # Paginação
            search = search[offset:offset + limit]
            
            # Executar busca
            response = search.execute()
            
            # Formatar resultados
            results = cls._format_service_results(response)
            
            return {
                'success': True,
                'source': 'elasticsearch_traditional',
                'results': results,
                'total': response.hits.total.value if hasattr(response.hits.total, 'value') else len(results),
                'query': query,
                'took': response.took,
                'filters': cls._build_filter_summary(
                    category, price_min, price_max, delivery_max_days,
                    min_rating, location, tags
                ),
                'sort_by': sort_by
            }
            
        except Exception as e:
            logger.error(f"Erro na busca tradicional BM25: {str(e)}")
            return {
                'success': False,
                'source': 'elasticsearch_error',
                'results': [],
                'total': 0,
                'error': str(e)
            }
    
    @classmethod
    def _hybrid_rrf_search(
        cls, query, category, price_min, price_max, delivery_max_days,
        min_rating, location, tags, sort_by, limit, offset
    ):
        """Busca híbrida usando Reciprocal Rank Fusion (RRF)"""
        try:
            # Implementação simplificada - combina busca tradicional + semântica
            traditional_results = cls._traditional_bm25_search(
                query, category, price_min, price_max, delivery_max_days,
                min_rating, location, tags, sort_by, limit*2, offset
            )
            
            # TODO: Implementar busca semântica e RRF quando disponível
            
            return {
                'success': True,
                'source': 'elasticsearch_hybrid',
                'results': traditional_results.get('results', [])[:limit],
                'total': traditional_results.get('total', 0),
                'query': query,
                'took': traditional_results.get('took', 0),
                'filters': traditional_results.get('filters', {}),
                'sort_by': sort_by
            }
            
        except Exception as e:
            logger.error(f"Erro na busca híbrida RRF: {str(e)}")
            return {
                'success': False,
                'source': 'elasticsearch_error',
                'results': [],
                'total': 0,
                'error': str(e)
            }

    # ========== MÉTODOS AUXILIARES ==========
    
    @classmethod
    def _apply_filters(cls, search, category, price_min, price_max, 
                      delivery_max_days, min_rating, location, tags):
        """Aplica filtros na busca Elasticsearch"""
        if category:
            search = search.filter('term', category_slug=category)
        if price_min is not None:
            search = search.filter('range', price={'gte': price_min})
        if price_max is not None:
            search = search.filter('range', price={'lte': price_max})
        if delivery_max_days is not None:
            search = search.filter('range', delivery_time_days={'lte': delivery_max_days})
        if min_rating is not None:
            search = search.filter('range', freelancer_rating={'gte': min_rating})
        if location:
            location_query = Q('match', freelancer_location={'query': location, 'fuzziness': 'AUTO'})
            search = search.query(location_query)
        if tags:
            for tag in tags:
                search = search.filter('match', tags={'query': tag, 'fuzziness': 'AUTO'})
        return search
    
    @classmethod
    def _build_filters_dict(cls, category, price_min, price_max, 
                           delivery_max_days, min_rating, location, tags):
        """Constrói filtros como dicionário para queries raw"""
        filters = [{"term": {"is_active": True}}]
        
        if category:
            filters.append({"term": {"category_slug": category}})
        if price_min is not None:
            filters.append({"range": {"price": {"gte": price_min}}})
        if price_max is not None:
            filters.append({"range": {"price": {"lte": price_max}}})
        if delivery_max_days is not None:
            filters.append({"range": {"delivery_time_days": {"lte": delivery_max_days}}})
        if min_rating is not None:
            filters.append({"range": {"freelancer_rating": {"gte": min_rating}}})
        if location:
            filters.append({
                "match": {
                    "freelancer_location": {
                        "query": location,
                        "fuzziness": "AUTO"
                    }
                }
            })
        if tags:
            for tag in tags:
                filters.append({
                    "match": {
                        "tags": {
                            "query": tag,
                            "fuzziness": "AUTO"
                        }
                    }
                })
        
        return filters
    
    @classmethod
    def _format_service_results(cls, response):
        """Formata resultados de serviços do Elasticsearch"""
        results = []
        for hit in response:
            results.append({
                'id': hit.meta.id,
                'score': hit.meta.score,
                'title': hit.title,
                'description': hit.description,
                'price': float(hit.price),
                'delivery_time_days': hit.delivery_time_days,
                'tags': hit.tags,
                'freelancer': {
                    'name': hit.freelancer_name,
                    'location': hit.freelancer_location,
                    'rating': float(hit.freelancer_rating),
                    'total_reviews': hit.freelancer_total_reviews,
                },
                'category': {
                    'name': hit.category_name,
                    'slug': hit.category_slug,
                },
                'created_at': hit.created_at.isoformat() if hit.created_at else None,
            })
        return results
    
    @classmethod
    def _build_filter_summary(cls, category, price_min, price_max, 
                             delivery_max_days, min_rating, location, tags):
        """Constrói resumo dos filtros aplicados"""
        return {
            'category': category,
            'price_range': [price_min, price_max],
            'delivery_max_days': delivery_max_days,
            'min_rating': min_rating,
            'location': location,
            'tags': tags,
        }