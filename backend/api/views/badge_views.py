"""
Views para sistema de badges e gamificação
"""

import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Count, Avg, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator

from ..models import UserLevel, BadgeType, UserBadge, XPActivity, Achievement, UserAchievement
from ..tasks.badge_tasks import check_user_badges, award_badge, process_project_completion

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_gamification(request):
    """
    Perfil completo de gamificação do usuário
    """
    try:
        user = request.user
        user_level, created = UserLevel.objects.get_or_create(user=user)
        
        # Badges do usuário
        user_badges = UserBadge.objects.filter(user=user).select_related('badge_type')
        badges_data = []
        
        for user_badge in user_badges:
            badge_data = {
                'id': user_badge.badge_type.id,
                'name': user_badge.badge_type.name,
                'description': user_badge.badge_type.description,
                'category': user_badge.badge_type.get_category_display(),
                'rarity': user_badge.badge_type.get_rarity_display(),
                'icon': user_badge.badge_type.icon,
                'color': user_badge.badge_type.color,
                'earned_at': user_badge.earned_at,
                'earned_for': user_badge.earned_for,
                'count': user_badge.count if user_badge.badge_type.is_stackable else 1,
                'xp_reward': user_badge.badge_type.xp_reward
            }
            badges_data.append(badge_data)
        
        # Conquistas do usuário
        user_achievements = UserAchievement.objects.filter(user=user).select_related('achievement')
        achievements_data = []
        
        for user_achievement in user_achievements:
            achievement_data = {
                'id': user_achievement.achievement.id,
                'name': user_achievement.achievement.name,
                'description': user_achievement.achievement.description,
                'type': user_achievement.achievement.get_achievement_type_display(),
                'icon': user_achievement.achievement.icon,
                'color': user_achievement.achievement.color,
                'earned_at': user_achievement.earned_at,
                'xp_reward': user_achievement.achievement.xp_reward
            }
            achievements_data.append(achievement_data)
        
        # Atividades XP recentes
        recent_xp = XPActivity.objects.filter(user=user).order_by('-created_at')[:10]
        xp_activities = []
        
        for activity in recent_xp:
            xp_activities.append({
                'amount': activity.amount,
                'source': activity.get_source_display(),
                'description': activity.description,
                'created_at': activity.created_at
            })
        
        # Ranking aproximado
        user_rank = UserLevel.objects.filter(total_xp__gt=user_level.total_xp).count() + 1
        total_users = UserLevel.objects.count()
        
        # Próximos badges disponíveis
        next_badges = get_available_badges(user, user_level)
        
        return Response({
            'user_level': {
                'current_level': user_level.get_current_level_display(),
                'next_level': user_level.next_level,
                'total_xp': user_level.total_xp,
                'current_level_xp': user_level.current_level_xp,
                'xp_to_next_level': user_level.xp_to_next_level,
                'progress_percentage': user_level.level_progress_percentage,
                'projects_completed': user_level.projects_completed,
                'services_delivered': user_level.services_delivered,
                'average_rating': user_level.average_rating,
                'completion_rate': user_level.completion_rate,
                'active_streak_days': user_level.active_streak_days,
                'max_streak_days': user_level.max_streak_days,
                'rank': user_rank,
                'total_users': total_users,
                'percentile': round((1 - (user_rank - 1) / total_users) * 100, 1) if total_users > 0 else 0
            },
            'badges': {
                'earned': badges_data,
                'total_count': len(badges_data),
                'by_category': get_badges_by_category(user_badges),
                'next_available': next_badges
            },
            'achievements': {
                'earned': achievements_data,
                'total_count': len(achievements_data)
            },
            'recent_activity': xp_activities
        })
        
    except Exception as e:
        logger.error(f"Error getting user gamification profile: {str(e)}")
        return Response(
            {'error': 'Failed to load gamification profile'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def get_badges_by_category(user_badges):
    """Organiza badges por categoria"""
    by_category = {}
    for user_badge in user_badges:
        category = user_badge.badge_type.category
        if category not in by_category:
            by_category[category] = []
        
        by_category[category].append({
            'name': user_badge.badge_type.name,
            'icon': user_badge.badge_type.icon,
            'rarity': user_badge.badge_type.rarity,
            'count': user_badge.count
        })
    
    return by_category


def get_available_badges(user, user_level):
    """Encontra próximos badges que o usuário pode conquistar"""
    # Badges que o usuário ainda não tem
    earned_badge_ids = UserBadge.objects.filter(user=user).values_list('badge_type_id', flat=True)
    available_badges = BadgeType.objects.filter(
        is_active=True
    ).exclude(
        id__in=earned_badge_ids
    )[:5]  # Próximos 5
    
    next_badges = []
    for badge in available_badges:
        # Verificar o quão próximo está dos requisitos
        progress = calculate_badge_progress(user_level, badge)
        
        next_badges.append({
            'id': badge.id,
            'name': badge.name,
            'description': badge.description,
            'icon': badge.icon,
            'color': badge.color,
            'rarity': badge.get_rarity_display(),
            'xp_reward': badge.xp_reward,
            'progress': progress
        })
    
    return sorted(next_badges, key=lambda x: x['progress'], reverse=True)


def calculate_badge_progress(user_level, badge_type):
    """Calcula progresso em direção a um badge (0-100%)"""
    requirements = badge_type.requirements
    
    if not requirements:
        return 0
    
    progress_scores = []
    
    # Verificar cada requisito
    if 'min_xp' in requirements:
        progress = min(100, (user_level.total_xp / requirements['min_xp']) * 100)
        progress_scores.append(progress)
    
    if 'min_projects' in requirements:
        progress = min(100, (user_level.projects_completed / requirements['min_projects']) * 100)
        progress_scores.append(progress)
    
    if 'min_rating' in requirements:
        if user_level.average_rating > 0:
            progress = min(100, (user_level.average_rating / requirements['min_rating']) * 100)
        else:
            progress = 0
        progress_scores.append(progress)
    
    if 'min_completion_rate' in requirements:
        progress = min(100, (user_level.completion_rate / requirements['min_completion_rate']) * 100)
        progress_scores.append(progress)
    
    if 'min_streak' in requirements:
        progress = min(100, (user_level.active_streak_days / requirements['min_streak']) * 100)
        progress_scores.append(progress)
    
    # Retornar média dos progressos ou 100% se não há requisitos numéricos
    return round(sum(progress_scores) / len(progress_scores) if progress_scores else 100, 1)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_leaderboard(request):
    """
    Ranking de usuários por XP
    """
    try:
        # Parâmetros de paginação
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 20))
        
        # Filtros
        timeframe = request.GET.get('timeframe', 'all')  # all, month, week
        category = request.GET.get('category', 'xp')  # xp, projects, rating
        
        # Base queryset
        queryset = UserLevel.objects.select_related('user')
        
        # Filtrar por período
        if timeframe == 'month':
            month_ago = timezone.now() - timedelta(days=30)
            # Implementar filtro por atividade recente
            queryset = queryset.filter(last_activity__gte=month_ago)
        elif timeframe == 'week':
            week_ago = timezone.now() - timedelta(days=7)
            queryset = queryset.filter(last_activity__gte=week_ago)
        
        # Ordenar por categoria
        if category == 'projects':
            queryset = queryset.order_by('-projects_completed', '-total_xp')
        elif category == 'rating':
            queryset = queryset.filter(average_rating__gt=0).order_by('-average_rating', '-total_xp')
        else:
            queryset = queryset.order_by('-total_xp')
        
        # Paginação
        start = (page - 1) * per_page
        end = start + per_page
        
        leaderboard_users = queryset[start:end]
        total_count = queryset.count()
        
        # Encontrar posição do usuário atual
        user_level = UserLevel.objects.filter(user=request.user).first()
        user_rank = None
        
        if user_level:
            if category == 'projects':
                user_rank = UserLevel.objects.filter(
                    Q(projects_completed__gt=user_level.projects_completed) |
                    Q(projects_completed=user_level.projects_completed, total_xp__gt=user_level.total_xp)
                ).count() + 1
            elif category == 'rating':
                user_rank = UserLevel.objects.filter(
                    average_rating__gt=0
                ).filter(
                    Q(average_rating__gt=user_level.average_rating) |
                    Q(average_rating=user_level.average_rating, total_xp__gt=user_level.total_xp)
                ).count() + 1
            else:
                user_rank = UserLevel.objects.filter(total_xp__gt=user_level.total_xp).count() + 1
        
        # Serializar dados
        leaderboard_data = []
        for i, level in enumerate(leaderboard_users):
            rank = start + i + 1
            
            leaderboard_data.append({
                'rank': rank,
                'user': {
                    'id': level.user.id,
                    'name': level.user.get_full_name() or level.user.email.split('@')[0],
                    'avatar_url': getattr(level.user, 'avatar_url', None)
                },
                'level': level.get_current_level_display(),
                'total_xp': level.total_xp,
                'projects_completed': level.projects_completed,
                'average_rating': level.average_rating,
                'badges_count': level.user.badges.count(),
                'is_current_user': level.user.id == request.user.id
            })
        
        return Response({
            'leaderboard': leaderboard_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_count': total_count,
                'total_pages': (total_count + per_page - 1) // per_page
            },
            'current_user_rank': user_rank,
            'filters': {
                'timeframe': timeframe,
                'category': category
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting leaderboard: {str(e)}")
        return Response(
            {'error': 'Failed to load leaderboard'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manual_check_badges(request):
    """
    Verifica manualmente badges do usuário (para testing)
    """
    try:
        user = request.user
        trigger_event = request.data.get('trigger_event', 'manual')
        
        # Disparar verificação assíncrona
        task = check_user_badges.delay(user.id, trigger_event)
        
        return Response({
            'success': True,
            'task_id': task.id,
            'message': 'Badge check queued for processing'
        })
        
    except Exception as e:
        logger.error(f"Error triggering badge check: {str(e)}")
        return Response(
            {'error': 'Failed to trigger badge check'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def simulate_project_completion(request):
    """
    Simula conclusão de projeto (para testing)
    """
    try:
        user = request.user
        rating = request.data.get('rating', 4.5)
        project_id = request.data.get('project_id', 'test-project')
        
        # Disparar processamento
        task = process_project_completion.delay(user.id, project_id, rating)
        
        return Response({
            'success': True,
            'task_id': task.id,
            'message': f'Project completion simulated with rating {rating}'
        })
        
    except Exception as e:
        logger.error(f"Error simulating project completion: {str(e)}")
        return Response(
            {'error': 'Failed to simulate project completion'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def badges_catalog(request):
    """
    Catálogo público de todos os badges disponíveis
    """
    try:
        badges = BadgeType.objects.filter(is_active=True).order_by('category', 'rarity')
        
        badges_data = []
        for badge in badges:
            badges_data.append({
                'id': badge.id,
                'name': badge.name,
                'description': badge.description,
                'category': badge.get_category_display(),
                'rarity': badge.get_rarity_display(),
                'icon': badge.icon,
                'color': badge.color,
                'xp_reward': badge.xp_reward,
                'is_stackable': badge.is_stackable,
                'max_count': badge.max_count,
                'requirements_hint': format_requirements_hint(badge.requirements)
            })
        
        # Estatísticas
        total_count = len(badges_data)
        by_category = {}
        by_rarity = {}
        
        for badge in badges:
            # Por categoria
            category = badge.get_category_display()
            if category not in by_category:
                by_category[category] = 0
            by_category[category] += 1
            
            # Por raridade
            rarity = badge.get_rarity_display()
            if rarity not in by_rarity:
                by_rarity[rarity] = 0
            by_rarity[rarity] += 1
        
        return Response({
            'badges': badges_data,
            'statistics': {
                'total_count': total_count,
                'by_category': by_category,
                'by_rarity': by_rarity
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting badges catalog: {str(e)}")
        return Response(
            {'error': 'Failed to load badges catalog'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def format_requirements_hint(requirements):
    """Formata dica dos requisitos para display público"""
    if not requirements:
        return "Requisitos especiais"
    
    hints = []
    
    if 'min_xp' in requirements:
        hints.append(f"{requirements['min_xp']} XP")
    
    if 'min_projects' in requirements:
        hints.append(f"{requirements['min_projects']} projetos")
    
    if 'min_rating' in requirements:
        hints.append(f"Rating {requirements['min_rating']}")
    
    if 'min_streak' in requirements:
        hints.append(f"{requirements['min_streak']} dias consecutivos")
    
    if 'kyc_verified' in requirements:
        hints.append("Identidade verificada")
    
    if 'professional_verified' in requirements:
        hints.append("Profissional verificado")
    
    return " • ".join(hints) if hints else "Requisitos especiais"


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def xp_history(request):
    """
    Histórico de XP do usuário
    """
    try:
        user = request.user
        days = int(request.GET.get('days', 30))
        
        since = timezone.now() - timedelta(days=days)
        activities = XPActivity.objects.filter(
            user=user,
            created_at__gte=since
        ).order_by('-created_at')
        
        # Agrupar por dia
        daily_xp = {}
        activities_data = []
        
        for activity in activities:
            date_key = activity.created_at.date().isoformat()
            
            if date_key not in daily_xp:
                daily_xp[date_key] = 0
            daily_xp[date_key] += activity.amount
            
            activities_data.append({
                'amount': activity.amount,
                'source': activity.get_source_display(),
                'description': activity.description,
                'created_at': activity.created_at,
                'total_xp_after': activity.total_xp_after
            })
        
        # Converter para lista ordenada
        daily_chart = [
            {'date': date, 'xp': xp} 
            for date, xp in sorted(daily_xp.items())
        ]
        
        return Response({
            'activities': activities_data,
            'daily_chart': daily_chart,
            'period_total': sum(daily_xp.values()),
            'days': days
        })
        
    except Exception as e:
        logger.error(f"Error getting XP history: {str(e)}")
        return Response(
            {'error': 'Failed to load XP history'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )