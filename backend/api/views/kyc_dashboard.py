"""
Dashboard views para monitoramento do sistema KYC multi-provider
"""

import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Avg, Sum, Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.core.cache import cache

from ..models import KYCProviderStats, VerificationLog, KYCProviderConfig
from ..services.kyc_router import kyc_router

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def kyc_provider_dashboard(request):
    """
    Dashboard principal com métricas de todos os provedores KYC
    """
    try:
        # Cache por 5 minutos
        cache_key = 'kyc_dashboard_data'
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        # Buscar todas as estatísticas
        stats = list(KYCProviderStats.objects.all())
        configs = {
            config.name: config 
            for config in KYCProviderConfig.objects.all()
        }
        
        # Métricas consolidadas
        total_attempts = sum(s.attempts for s in stats)
        total_successes = sum(s.successes for s in stats)
        total_cost = sum(float(s.monthly_spent) for s in stats)
        
        dashboard_data = {
            'summary': {
                'total_attempts': total_attempts,
                'total_successes': total_successes,
                'overall_success_rate': total_successes / max(total_attempts, 1),
                'total_monthly_cost': total_cost,
                'active_providers': len([s for s in stats if s.is_active]),
                'current_epsilon': kyc_router.epsilon
            },
            'providers': [],
            'recommendations': kyc_router.get_provider_recommendations(),
            'routing_history': get_routing_history(),
            'cost_analysis': get_cost_analysis(stats),
            'last_updated': timezone.now().isoformat()
        }
        
        # Dados detalhados por provedor
        for stat in stats:
            config = configs.get(stat.name, {})
            
            provider_data = {
                'name': stat.name,
                'display_name': getattr(config, 'display_name', stat.name.title()),
                'is_active': stat.is_active,
                'attempts': stat.attempts,
                'successes': stat.successes,
                'success_rate': stat.success_rate,
                'cost_per_ok': stat.cost_per_ok,
                'monthly_budget': float(stat.monthly_budget),
                'monthly_spent': float(stat.monthly_spent),
                'budget_remaining': stat.budget_remaining,
                'budget_utilization': float(stat.monthly_spent) / float(stat.monthly_budget) if stat.monthly_budget > 0 else 0,
                'free_tier_limit': stat.free_tier_limit,
                'free_tier_remaining': stat.free_tier_remaining,
                'utility_score': stat.utility_score,
                'last_ms_p95': stat.last_ms_p95,
                'pep_hits': stat.pep_hits,
                'capabilities': {
                    'supports_documents': getattr(config, 'supports_documents', True),
                    'supports_biometric': getattr(config, 'supports_biometric', False),
                    'supports_pep': getattr(config, 'supports_pep', False),
                    'supports_brazil': getattr(config, 'supports_brazil', True)
                },
                'health_status': get_provider_health(stat.name)
            }
            
            dashboard_data['providers'].append(provider_data)
        
        # Ordenar por utility score
        dashboard_data['providers'].sort(key=lambda p: p['utility_score'], reverse=True)
        
        # Cache por 5 minutos
        cache.set(cache_key, dashboard_data, 300)
        
        return Response(dashboard_data)
        
    except Exception as e:
        logger.error(f"Error generating KYC dashboard: {str(e)}")
        return Response(
            {'error': 'Failed to generate dashboard'}, 
            status=500
        )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def kyc_routing_analytics(request):
    """
    Analytics detalhados do roteamento KYC
    """
    try:
        days = int(request.GET.get('days', 7))
        since = timezone.now() - timedelta(days=days)
        
        # Análise de roteamento por dia
        daily_routing = []
        
        for i in range(days):
            day_start = since + timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            
            day_logs = VerificationLog.objects.filter(
                created_at__gte=day_start,
                created_at__lt=day_end
            )
            
            if day_logs.exists():
                daily_data = day_logs.values('provider__name').annotate(
                    count=Count('id'),
                    success_rate=Avg('success'),
                    avg_cost=Avg('cost'),
                    avg_response_time=Avg('response_time')
                )
                
                daily_routing.append({
                    'date': day_start.date().isoformat(),
                    'providers': list(daily_data)
                })
        
        # Análise de custos por hora do dia
        hourly_costs = []
        for hour in range(24):
            hour_logs = VerificationLog.objects.filter(
                created_at__gte=since,
                created_at__hour=hour
            )
            
            if hour_logs.exists():
                hourly_costs.append({
                    'hour': hour,
                    'total_cost': hour_logs.aggregate(Sum('cost'))['cost__sum'] or 0,
                    'avg_response_time': hour_logs.aggregate(Avg('response_time'))['response_time__avg'] or 0
                })
        
        # Performance por tipo de verificação
        verification_types = VerificationLog.objects.filter(
            created_at__gte=since
        ).values('verification_type').annotate(
            count=Count('id'),
            success_rate=Avg('success'),
            avg_cost=Avg('cost')
        )
        
        return Response({
            'period': f'Last {days} days',
            'daily_routing': daily_routing,
            'hourly_costs': hourly_costs,
            'verification_types': list(verification_types),
            'routing_efficiency': calculate_routing_efficiency(since),
            'cost_savings': calculate_cost_savings(since)
        })
        
    except Exception as e:
        logger.error(f"Error generating routing analytics: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def adjust_kyc_settings(request):
    """
    Endpoint para ajustar configurações do roteamento KYC
    """
    try:
        data = request.data
        
        # Ajustar epsilon
        if 'epsilon' in data:
            new_epsilon = float(data['epsilon'])
            if 0.01 <= new_epsilon <= 0.5:
                kyc_router.epsilon = new_epsilon
                logger.info(f"KYC epsilon adjusted to {new_epsilon}")
            else:
                return Response(
                    {'error': 'Epsilon must be between 0.01 and 0.5'}, 
                    status=400
                )
        
        # Ajustar orçamentos de provedores
        if 'provider_budgets' in data:
            for provider_name, budget in data['provider_budgets'].items():
                try:
                    stats = KYCProviderStats.objects.get(name=provider_name)
                    stats.monthly_budget = budget
                    stats.save()
                    logger.info(f"Budget for {provider_name} set to R$ {budget}")
                except KYCProviderStats.DoesNotExist:
                    logger.warning(f"Provider {provider_name} not found")
        
        # Ativar/desativar provedores
        if 'provider_status' in data:
            for provider_name, is_active in data['provider_status'].items():
                try:
                    stats = KYCProviderStats.objects.get(name=provider_name)
                    stats.is_active = bool(is_active)
                    stats.save()
                    logger.info(f"Provider {provider_name} {'activated' if is_active else 'deactivated'}")
                except KYCProviderStats.DoesNotExist:
                    logger.warning(f"Provider {provider_name} not found")
        
        return Response({
            'success': True,
            'current_epsilon': kyc_router.epsilon,
            'message': 'Settings updated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error adjusting KYC settings: {str(e)}")
        return Response({'error': str(e)}, status=500)


def get_routing_history():
    """Obtém histórico de roteamento das últimas 24h"""
    try:
        last_24h = timezone.now() - timedelta(hours=24)
        
        routing_data = VerificationLog.objects.filter(
            created_at__gte=last_24h
        ).values('provider__name').annotate(
            count=Count('id'),
            success_rate=Avg('success')
        ).order_by('-count')
        
        return list(routing_data)
        
    except Exception:
        return []


def get_cost_analysis(stats):
    """Análise de custos por provedor"""
    try:
        cost_analysis = {
            'total_budget': sum(float(s.monthly_budget) for s in stats),
            'total_spent': sum(float(s.monthly_spent) for s in stats),
            'by_provider': []
        }
        
        for stat in stats:
            cost_analysis['by_provider'].append({
                'name': stat.name,
                'budget': float(stat.monthly_budget),
                'spent': float(stat.monthly_spent),
                'utilization': float(stat.monthly_spent) / float(stat.monthly_budget) if stat.monthly_budget > 0 else 0,
                'cost_per_success': stat.cost_per_ok,
                'efficiency_score': stat.successes / max(float(stat.monthly_spent), 0.01)
            })
        
        return cost_analysis
        
    except Exception:
        return {'error': 'Failed to calculate cost analysis'}


def get_provider_health(provider_name):
    """Obtém status de saúde do provedor"""
    try:
        cache_key = f'provider_health_{provider_name}'
        health = cache.get(cache_key)
        
        if health is None:
            # Se não há cache, assumir saudável
            health = {'status': 'unknown', 'last_check': 'never'}
        
        return health
        
    except Exception:
        return {'status': 'error'}


def calculate_routing_efficiency(since):
    """Calcula eficiência do roteamento inteligente"""
    try:
        logs = VerificationLog.objects.filter(created_at__gte=since)
        
        if not logs.exists():
            return {'efficiency': 0, 'note': 'No data available'}
        
        # Métricas de eficiência
        total_cost = logs.aggregate(Sum('cost'))['cost__sum'] or 0
        total_successes = logs.filter(success=True).count()
        avg_response_time = logs.aggregate(Avg('response_time'))['response_time__avg'] or 0
        
        # Score de eficiência (simplificado)
        cost_efficiency = total_successes / max(total_cost, 0.01)
        time_efficiency = 1 / max(avg_response_time, 1)
        
        efficiency_score = (cost_efficiency * 0.7 + time_efficiency * 0.3)
        
        return {
            'efficiency_score': min(efficiency_score, 1.0),
            'total_cost': total_cost,
            'total_successes': total_successes,
            'avg_response_time': avg_response_time
        }
        
    except Exception as e:
        return {'efficiency': 0, 'error': str(e)}


def calculate_cost_savings(since):
    """Calcula economia gerada pelo roteamento inteligente"""
    try:
        # Comparar custo real vs custo se fosse sempre o provedor mais caro
        logs = VerificationLog.objects.filter(created_at__gte=since)
        
        if not logs.exists():
            return {'savings': 0}
        
        actual_cost = logs.aggregate(Sum('cost'))['cost__sum'] or 0
        
        # Simular custo se usasse sempre o provedor mais caro
        highest_cost_provider = KYCProviderStats.objects.order_by('-cost_per_ok').first()
        if highest_cost_provider:
            simulated_cost = logs.count() * highest_cost_provider.cost_per_ok
            savings = max(0, simulated_cost - actual_cost)
            savings_percentage = (savings / max(simulated_cost, 0.01)) * 100
        else:
            savings = 0
            savings_percentage = 0
        
        return {
            'actual_cost': actual_cost,
            'simulated_cost': simulated_cost if 'simulated_cost' in locals() else 0,
            'savings_amount': savings,
            'savings_percentage': savings_percentage
        }
        
    except Exception as e:
        return {'savings': 0, 'error': str(e)}