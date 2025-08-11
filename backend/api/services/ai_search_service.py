"""
Serviço de integração com o sistema de busca inteligente marketplace_ai
"""
import requests
import logging
from typing import Dict, List, Any, Optional, TYPE_CHECKING
from django.conf import settings
from django.core.cache import cache

if TYPE_CHECKING:
    from ..models import ServicePackage, FreelancerProfile

logger = logging.getLogger(__name__)


class AISearchService:
    """
    Serviço para integração com o sistema de busca inteligente
    """
    
    # URL base do sistema marketplace_ai
    AI_SEARCH_BASE_URL = getattr(settings, 'AI_SEARCH_BASE_URL', 'http://localhost:8001')
    AI_SEARCH_TIMEOUT = getattr(settings, 'AI_SEARCH_TIMEOUT', 5)  # 5 segundos
    
    @classmethod
    def semantic_search(
        cls, 
        query: str, 
        category: Optional[str] = None,
        price_max: Optional[float] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        limit: int = 30
    ) -> Dict[str, Any]:
        """
        Realiza busca semântica usando o sistema de IA
        
        Args:
            query: Consulta em linguagem natural
            category: Categoria para filtrar
            price_max: Preço máximo
            lat: Latitude para busca geográfica
            lon: Longitude para busca geográfica
            limit: Número máximo de resultados
            
        Returns:
            Dict com resultados da busca IA e fallback tradicional
        """
        try:
            # Tentar busca no sistema de IA
            ai_results = cls._call_ai_search_api(query, category, price_max, lat, lon)
            
            if ai_results:
                # Enriquecer resultados com dados do backend principal
                enriched_results = cls._enrich_ai_results(ai_results['results'][:limit])
                
                return {
                    'success': True,
                    'source': 'ai',
                    'results': enriched_results,
                    'total': len(enriched_results),
                    'query': query,
                    'filters': {
                        'category': category,
                        'price_max': price_max,
                        'location': {'lat': lat, 'lon': lon} if lat and lon else None
                    }
                }
            else:
                # Fallback para busca tradicional
                return cls._traditional_search_fallback(query, category, price_max, limit)
                
        except Exception as e:
            logger.warning(f"Erro na busca IA: {str(e)}")
            # Fallback para busca tradicional em caso de erro
            return cls._traditional_search_fallback(query, category, price_max, limit)
    
    @classmethod
    def _call_ai_search_api(
        cls, 
        query: str, 
        category: Optional[str] = None,
        price_max: Optional[float] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Chama a API do sistema de busca IA
        """
        try:
            # Construir parâmetros
            params = {'q': query}
            
            if category:
                params['cat'] = category
            if price_max:
                params['price_max'] = price_max
            if lat:
                params['lat'] = lat
            if lon:
                params['lon'] = lon
            
            # Cache key para evitar chamadas desnecessárias
            cache_key = f"ai_search:{hash(str(sorted(params.items())))}"
            cached_result = cache.get(cache_key)
            
            if cached_result:
                return cached_result
            
            # Fazer requisição para o sistema de IA
            response = requests.get(
                f"{cls.AI_SEARCH_BASE_URL}/api/search/",
                params=params,
                timeout=cls.AI_SEARCH_TIMEOUT,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                result = response.json()
                # Cache por 5 minutos
                cache.set(cache_key, result, 300)
                return result
            else:
                logger.warning(f"API IA retornou status {response.status_code}")
                return None
                
        except requests.RequestException as e:
            logger.warning(f"Erro na requisição para API IA: {str(e)}")
            return None
    
    @classmethod
    def _enrich_ai_results(cls, ai_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Enriquece resultados da IA com dados completos do backend principal
        """
        from ..models import FreelancerProfile, ServicePackage
        
        enriched = []
        
        for result in ai_results:
            try:
                # Tentar encontrar o FreelancerProfile ou ServicePackage correspondente
                ai_id = result.get('id')
                
                # Primeiro tentar como ServicePackage
                try:
                    service_package = ServicePackage.objects.select_related(
                        'freelancer__user', 'category'
                    ).get(id=ai_id)
                    
                    enriched_result = {
                        'id': str(service_package.id),
                        'type': 'service_package',
                        'title': service_package.title,
                        'description': service_package.description,
                        'price': float(service_package.price),
                        'delivery_time': service_package.delivery_time_days,
                        'freelancer': {
                            'id': str(service_package.freelancer.id),
                            'name': service_package.freelancer.user.get_full_name(),
                            'avatar': service_package.freelancer.user.profile_image_url,
                            'rating': float(service_package.freelancer.average_rating),
                            'reviews_count': service_package.freelancer.total_reviews,
                            'location': service_package.freelancer.location,
                        },
                        'category': {
                            'id': str(service_package.category.id),
                            'name': service_package.category.name,
                            'slug': service_package.category.slug,
                        },
                        'images': service_package.images or [],
                        'tags': service_package.tags or [],
                        'ai_score': result.get('score', 0),
                        'ai_rating': result.get('rating'),
                        'created_at': service_package.created_at.isoformat(),
                        'updated_at': service_package.updated_at.isoformat(),
                    }
                    
                    enriched.append(enriched_result)
                    continue
                    
                except ServicePackage.DoesNotExist:
                    pass
                
                # Se não encontrou como ServicePackage, tentar como FreelancerProfile
                try:
                    freelancer = FreelancerProfile.objects.select_related('user').get(id=ai_id)
                    
                    enriched_result = {
                        'id': str(freelancer.id),
                        'type': 'freelancer_profile',
                        'title': freelancer.user.get_full_name(),
                        'description': freelancer.bio,
                        'hourly_rate': float(freelancer.hourly_rate) if freelancer.hourly_rate else None,
                        'freelancer': {
                            'id': str(freelancer.id),
                            'name': freelancer.user.get_full_name(),
                            'avatar': freelancer.user.profile_image_url,
                            'rating': float(freelancer.average_rating),
                            'reviews_count': freelancer.total_reviews,
                            'location': freelancer.location,
                            'skills': freelancer.skills or [],
                            'experience_years': freelancer.experience_years,
                            'success_rate': float(freelancer.success_rate),
                        },
                        'portfolio': freelancer.portfolio or [],
                        'certifications': freelancer.certifications or [],
                        'ai_score': result.get('score', 0),
                        'ai_rating': result.get('rating'),
                        'created_at': freelancer.user.date_joined.isoformat(),
                        'updated_at': freelancer.updated_at.isoformat(),
                    }
                    
                    enriched.append(enriched_result)
                    continue
                    
                except FreelancerProfile.DoesNotExist:
                    pass
                
                # Se não encontrou nos modelos principais, usar dados básicos da IA
                logger.warning(f"Objeto não encontrado no backend para ID da IA: {ai_id}")
                enriched.append({
                    'id': ai_id,
                    'type': 'ai_only',
                    'title': result.get('title', 'Título não disponível'),
                    'ai_score': result.get('score', 0),
                    'ai_rating': result.get('rating'),
                    'price_min': result.get('price_min'),
                })
                
            except Exception as e:
                logger.error(f"Erro ao enriquecer resultado IA {result}: {str(e)}")
                continue
        
        return enriched
    
    @classmethod
    def _traditional_search_fallback(
        cls, 
        query: str, 
        category: Optional[str] = None,
        price_max: Optional[float] = None,
        limit: int = 30
    ) -> Dict[str, Any]:
        """
        Busca tradicional como fallback quando IA não está disponível
        """
        try:
            from ..models import ServicePackage, Category
            from django.db.models import Q
            
            # Buscar em ServicePackages
            service_packages = ServicePackage.objects.select_related(
                'freelancer__user', 'category'
            ).filter(is_active=True)
            
            # Aplicar filtros de busca textual
            if query:
                service_packages = service_packages.filter(
                    Q(title__icontains=query) |
                    Q(description__icontains=query) |
                    Q(tags__icontains=query)
                )
            
            # Aplicar filtro de categoria
            if category:
                service_packages = service_packages.filter(
                    Q(category__name__icontains=category) |
                    Q(category__slug=category)
                )
            
            # Aplicar filtro de preço
            if price_max:
                service_packages = service_packages.filter(price__lte=price_max)
            
            # Ordenar por relevância (rating e reviews)
            service_packages = service_packages.order_by(
                '-freelancer__average_rating',
                '-freelancer__total_reviews',
                '-created_at'
            )[:limit]
            
            # Converter para formato padrão
            results = []
            for service in service_packages:
                results.append({
                    'id': str(service.id),
                    'type': 'service_package',
                    'title': service.title,
                    'description': service.description,
                    'price': float(service.price),
                    'delivery_time': service.delivery_time_days,
                    'freelancer': {
                        'id': str(service.freelancer.id),
                        'name': service.freelancer.user.get_full_name(),
                        'avatar': service.freelancer.user.profile_image_url,
                        'rating': float(service.freelancer.average_rating),
                        'reviews_count': service.freelancer.total_reviews,
                        'location': service.freelancer.location,
                    },
                    'category': {
                        'id': str(service.category.id),
                        'name': service.category.name,
                        'slug': service.category.slug,
                    },
                    'images': service.images or [],
                    'tags': service.tags or [],
                    'ai_score': None,  # Sem score da IA
                    'traditional_score': 1.0,  # Score tradicional
                    'created_at': service.created_at.isoformat(),
                    'updated_at': service.updated_at.isoformat(),
                })
            
            return {
                'success': True,
                'source': 'traditional',
                'results': results,
                'total': len(results),
                'query': query,
                'filters': {
                    'category': category,
                    'price_max': price_max,
                }
            }
            
        except Exception as e:
            logger.error(f"Erro na busca tradicional: {str(e)}")
            return {
                'success': False,
                'source': 'error',
                'results': [],
                'total': 0,
                'error': str(e)
            }
    
    @classmethod
    def sync_data_to_ai_system(cls, model_instance, action='update'):
        """
        Sincroniza dados do backend principal para o sistema de IA
        
        Args:
            model_instance: Instância do modelo (FreelancerProfile ou ServicePackage)
            action: 'create', 'update', 'delete'
        """
        try:
            from ..models import ServicePackage, FreelancerProfile
            
            if isinstance(model_instance, ServicePackage):
                data = cls._serialize_service_package_for_ai(model_instance)
            elif isinstance(model_instance, FreelancerProfile):
                data = cls._serialize_freelancer_for_ai(model_instance)
            else:
                logger.warning(f"Tipo de modelo não suportado para sync IA: {type(model_instance)}")
                return
            
            # Enviar para sistema de IA (endpoint de sincronização)
            sync_url = f"{cls.AI_SEARCH_BASE_URL}/api/sync/"
            
            payload = {
                'action': action,
                'type': data['type'],
                'data': data
            }
            
            response = requests.post(
                sync_url,
                json=payload,
                timeout=cls.AI_SEARCH_TIMEOUT,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code not in [200, 201]:
                logger.warning(f"Erro na sincronização IA: status {response.status_code}")
            
        except Exception as e:
            logger.error(f"Erro ao sincronizar com sistema IA: {str(e)}")
    
    @classmethod
    def _serialize_service_package_for_ai(cls, service_package: 'ServicePackage') -> Dict[str, Any]:
        """
        Serializa ServicePackage para formato compatível com sistema IA
        """
        return {
            'type': 'service_package',
            'id': str(service_package.id),
            'title': service_package.title,
            'description': service_package.description,
            'price': float(service_package.price),
            'price_min': float(service_package.price),  # Para compatibilidade
            'delivery_time': service_package.delivery_time_days,
            'category': service_package.category.name if service_package.category else None,
            'tags': service_package.tags or [],
            'freelancer_id': str(service_package.freelancer.id),
            'freelancer_name': service_package.freelancer.user.get_full_name(),
            'freelancer_rating': float(service_package.freelancer.average_rating),
            'freelancer_reviews': service_package.freelancer.total_reviews,
            'freelancer_location': service_package.freelancer.location,
            'is_active': service_package.is_active,
            'created_at': service_package.created_at.isoformat(),
            'updated_at': service_package.updated_at.isoformat(),
        }
    
    @classmethod
    def _serialize_freelancer_for_ai(cls, freelancer: 'FreelancerProfile') -> Dict[str, Any]:
        """
        Serializa FreelancerProfile para formato compatível com sistema IA
        """
        return {
            'type': 'freelancer_profile',
            'id': str(freelancer.id),
            'title': freelancer.user.get_full_name(),
            'description': freelancer.bio,
            'hourly_rate': float(freelancer.hourly_rate) if freelancer.hourly_rate else None,
            'price_min': float(freelancer.hourly_rate) if freelancer.hourly_rate else None,
            'skills': freelancer.skills or [],
            'experience_years': freelancer.experience_years,
            'rating': float(freelancer.average_rating),
            'reviews': freelancer.total_reviews,
            'location': freelancer.location,
            'success_rate': float(freelancer.success_rate),
            'portfolio': freelancer.portfolio or [],
            'certifications': freelancer.certifications or [],
            'is_available': freelancer.is_available,
            'created_at': freelancer.user.date_joined.isoformat(),
            'updated_at': freelancer.updated_at.isoformat(),
        }


# Função para auto-sync quando modelos são salvos
def auto_sync_to_ai_system(sender, instance, created, **kwargs):
    """
    Signal handler para sincronização automática com sistema IA
    """
    if hasattr(instance, '_skip_ai_sync'):
        return
        
    action = 'create' if created else 'update'
    AISearchService.sync_data_to_ai_system(instance, action)


def auto_sync_delete_to_ai_system(sender, instance, **kwargs):
    """
    Signal handler para deleção no sistema IA
    """
    if hasattr(instance, '_skip_ai_sync'):
        return
        
    AISearchService.sync_data_to_ai_system(instance, 'delete')