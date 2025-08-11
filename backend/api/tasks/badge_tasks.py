"""
Celery tasks para sistema de badges e gamificação
"""

import logging
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List
from celery import shared_task
from django.utils import timezone
from django.db import transaction
from django.db.models import Avg, Count, Sum

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_level_up(self, user_id: int, old_level: str, new_level: str):
    """
    Processa level up do usuário - recompensas, badges, notificações
    """
    try:
        from django.contrib.auth import get_user_model
        from ..models import UserLevel, BadgeType, UserBadge
        
        User = get_user_model()
        user = User.objects.get(id=user_id)
        user_level = user.level
        
        logger.info(f"Processing level up for user {user_id}: {old_level} → {new_level}")
        
        # Recompensas base por level up
        level_rewards = {
            'verified': {'xp': 50, 'title': 'Identidade Verificada'},
            'professional': {'xp': 100, 'title': 'Profissional Verificado'},
            'expert': {'xp': 200, 'title': 'Especialista'},
            'elite': {'xp': 500, 'title': 'GalaxIA Elite'},
            'legend': {'xp': 1000, 'title': 'Lenda'},
        }
        
        reward = level_rewards.get(new_level, {})
        
        # Dar XP bônus
        if reward.get('xp'):
            user_level.add_xp(reward['xp'], source='level_up')
        
        # Dar badge de nível se existir
        try:
            level_badge = BadgeType.objects.get(
                slug=f'level_{new_level}',
                is_active=True
            )
            award_badge.delay(user_id, level_badge.id, f"Alcançou nível {reward.get('title', new_level)}")
        except BadgeType.DoesNotExist:
            logger.warning(f"No badge found for level {new_level}")
        
        # Verificar conquistas relacionadas a level
        check_level_achievements.delay(user_id, new_level)
        
        # Notificar usuário
        send_level_up_notification.delay(user_id, old_level, new_level, reward)
        
        # Atualizar ranking se necessário
        update_user_ranking.delay(user_id)
        
        return {
            'success': True,
            'user_id': user_id,
            'old_level': old_level,
            'new_level': new_level,
            'reward': reward
        }
        
    except Exception as exc:
        logger.error(f"Error processing level up: {str(exc)}")
        
        if self.request.retries < self.max_retries:
            retry_delay = 60 * (2 ** self.request.retries)
            logger.info(f"Retrying level up processing in {retry_delay} seconds")
            raise self.retry(countdown=retry_delay, exc=exc)
        
        return {'success': False, 'error': str(exc)}


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def award_badge(self, user_id: int, badge_type_id: int, earned_for: str = "", metadata: Dict = None):
    """
    Concede badge a um usuário
    """
    try:
        from django.contrib.auth import get_user_model
        from ..models import BadgeType, UserBadge, UserLevel
        
        User = get_user_model()
        user = User.objects.get(id=user_id)
        badge_type = BadgeType.objects.get(id=badge_type_id)
        
        # Verificar se badge já foi obtido (para badges não stackable)
        if not badge_type.is_stackable:
            if UserBadge.objects.filter(user=user, badge_type=badge_type).exists():
                logger.info(f"Badge {badge_type.name} already earned by user {user_id}")
                return {'success': True, 'already_earned': True}
        
        with transaction.atomic():
            # Criar ou atualizar badge
            if badge_type.is_stackable:
                user_badge, created = UserBadge.objects.get_or_create(
                    user=user,
                    badge_type=badge_type,
                    defaults={
                        'earned_for': earned_for,
                        'metadata': metadata or {}
                    }
                )
                if not created:
                    # Verificar limite
                    if badge_type.max_count and user_badge.count >= badge_type.max_count:
                        logger.info(f"Badge {badge_type.name} max count reached for user {user_id}")
                        return {'success': True, 'max_count_reached': True}
                    
                    user_badge.count += 1
                    user_badge.metadata.update(metadata or {})
                    user_badge.save()
            else:
                user_badge = UserBadge.objects.create(
                    user=user,
                    badge_type=badge_type,
                    earned_for=earned_for,
                    metadata=metadata or {}
                )
                created = True
            
            # Dar XP reward
            if badge_type.xp_reward > 0:
                user_level, _ = UserLevel.objects.get_or_create(user=user)
                user_level.add_xp(badge_type.xp_reward, source='badge_earned')
        
        # Notificar usuário
        send_badge_notification.delay(user_id, badge_type_id, created)
        
        # Log da conquista
        logger.info(
            f"Badge '{badge_type.name}' awarded to user {user_id} "
            f"(XP: +{badge_type.xp_reward}, for: {earned_for})"
        )
        
        return {
            'success': True,
            'badge_name': badge_type.name,
            'created': created,
            'xp_reward': badge_type.xp_reward
        }
        
    except Exception as exc:
        logger.error(f"Error awarding badge: {str(exc)}")
        
        if self.request.retries < self.max_retries:
            retry_delay = 30 * (2 ** self.request.retries)
            raise self.retry(countdown=retry_delay, exc=exc)
        
        return {'success': False, 'error': str(exc)}


@shared_task
def check_user_badges(user_id: int, trigger_event: str = 'manual'):
    """
    Verifica todos os badges que o usuário pode ter ganho
    """
    try:
        from django.contrib.auth import get_user_model
        from ..models import BadgeType, UserBadge, UserLevel
        
        User = get_user_model()
        user = User.objects.get(id=user_id)
        user_level, _ = UserLevel.objects.get_or_create(user=user)
        
        # Buscar badges ativos que o usuário ainda não tem
        potential_badges = BadgeType.objects.filter(is_active=True)
        
        badges_awarded = []
        
        for badge_type in potential_badges:
            # Pular se já tem e não é stackable
            if not badge_type.is_stackable:
                if UserBadge.objects.filter(user=user, badge_type=badge_type).exists():
                    continue
            
            # Verificar se atende aos critérios
            if check_badge_criteria(user, user_level, badge_type, trigger_event):
                award_badge.delay(
                    user_id=user_id,
                    badge_type_id=badge_type.id,
                    earned_for=f"Triggered by: {trigger_event}"
                )
                badges_awarded.append(badge_type.name)
        
        logger.info(f"Checked badges for user {user_id}, awarded: {badges_awarded}")
        
        return {
            'success': True,
            'badges_awarded': badges_awarded,
            'trigger_event': trigger_event
        }
        
    except Exception as e:
        logger.error(f"Error checking user badges: {str(e)}")
        return {'success': False, 'error': str(e)}


def check_badge_criteria(user, user_level, badge_type, trigger_event) -> bool:
    """
    Verifica se usuário atende aos critérios de um badge
    """
    try:
        requirements = badge_type.requirements
        
        if not requirements:
            return False
        
        # Critérios de verificação
        if 'kyc_verified' in requirements:
            if not user_level.kyc_verified and requirements['kyc_verified']:
                return False
        
        if 'min_xp' in requirements:
            if user_level.total_xp < requirements['min_xp']:
                return False
        
        if 'min_level' in requirements:
            level_order = ['basic', 'verified', 'professional', 'expert', 'elite', 'legend']
            current_index = level_order.index(user_level.current_level)
            required_index = level_order.index(requirements['min_level'])
            if current_index < required_index:
                return False
        
        if 'min_projects' in requirements:
            if user_level.projects_completed < requirements['min_projects']:
                return False
        
        if 'min_rating' in requirements:
            if user_level.average_rating < requirements['min_rating']:
                return False
        
        if 'min_completion_rate' in requirements:
            if user_level.completion_rate < requirements['min_completion_rate']:
                return False
        
        if 'min_streak' in requirements:
            if user_level.active_streak_days < requirements['min_streak']:
                return False
        
        # Critérios de trigger específicos
        if 'trigger_events' in requirements:
            if trigger_event not in requirements['trigger_events']:
                return False
        
        # Critérios temporais
        if 'within_days' in requirements:
            user_age_days = (timezone.now() - user.date_joined).days
            if user_age_days > requirements['within_days']:
                return False
        
        return True
        
    except Exception as e:
        logger.error(f"Error checking badge criteria: {str(e)}")
        return False


@shared_task
def check_level_achievements(user_id: int, new_level: str):
    """
    Verifica conquistas relacionadas a alcançar um nível específico
    """
    try:
        from django.contrib.auth import get_user_model
        from ..models import Achievement, UserAchievement
        
        User = get_user_model()
        user = User.objects.get(id=user_id)
        
        # Buscar conquistas relacionadas a níveis
        level_achievements = Achievement.objects.filter(
            is_active=True,
            requirements__required_level=new_level
        )
        
        for achievement in level_achievements:
            # Verificar se já tem a conquista
            if UserAchievement.objects.filter(user=user, achievement=achievement).exists():
                continue
            
            # Verificar critérios adicionais
            if check_achievement_criteria(user, achievement):
                # Dar conquista
                UserAchievement.objects.create(
                    user=user,
                    achievement=achievement,
                    progress_data={'level_achieved': new_level}
                )
                
                # Recompensas da conquista
                if achievement.xp_reward > 0:
                    user.level.add_xp(achievement.xp_reward, source='achievement')
                
                if achievement.badge_reward:
                    award_badge.delay(
                        user_id=user_id,
                        badge_type_id=achievement.badge_reward.id,
                        earned_for=f"Conquista: {achievement.name}"
                    )
                
                logger.info(f"Achievement '{achievement.name}' earned by user {user_id}")
        
        return {'success': True}
        
    except Exception as e:
        logger.error(f"Error checking level achievements: {str(e)}")
        return {'success': False, 'error': str(e)}


def check_achievement_criteria(user, achievement) -> bool:
    """
    Verifica critérios específicos de uma conquista
    """
    # Implementar lógica específica de critérios de conquistas
    # Por enquanto, retorna True para conquistas de nível
    return True


@shared_task
def update_user_ranking(user_id: int):
    """
    Atualiza ranking do usuário após mudanças significativas
    """
    try:
        # Implementar lógica de ranking global
        # Por enquanto, apenas log
        logger.info(f"Ranking updated for user {user_id}")
        return {'success': True}
        
    except Exception as e:
        logger.error(f"Error updating user ranking: {str(e)}")
        return {'success': False, 'error': str(e)}


@shared_task
def send_level_up_notification(user_id: int, old_level: str, new_level: str, reward: Dict):
    """
    Envia notificação de level up
    """
    try:
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        user = User.objects.get(id=user_id)
        
        # Implementar sistema de notificações
        # Por enquanto, apenas log
        logger.info(
            f"Level up notification sent to user {user_id}: "
            f"{old_level} → {new_level}, reward: {reward}"
        )
        
        return {'success': True}
        
    except Exception as e:
        logger.error(f"Error sending level up notification: {str(e)}")
        return {'success': False, 'error': str(e)}


@shared_task
def send_badge_notification(user_id: int, badge_type_id: int, is_new: bool):
    """
    Envia notificação de badge conquistado
    """
    try:
        from django.contrib.auth import get_user_model
        from ..models import BadgeType
        
        User = get_user_model()
        user = User.objects.get(id=user_id)
        badge_type = BadgeType.objects.get(id=badge_type_id)
        
        # Implementar sistema de notificações
        # Por enquanto, apenas log
        action = "new badge" if is_new else "badge upgraded"
        logger.info(
            f"Badge notification sent to user {user_id}: "
            f"{action} '{badge_type.name}' ({badge_type.get_rarity_display()})"
        )
        
        return {'success': True}
        
    except Exception as e:
        logger.error(f"Error sending badge notification: {str(e)}")
        return {'success': False, 'error': str(e)}


@shared_task
def update_user_streaks():
    """
    Atualiza streaks de atividade de todos os usuários (daily job)
    """
    try:
        from ..models import UserLevel
        from datetime import date, timedelta
        
        updated_count = 0
        streak_bonuses = 0
        
        for user_level in UserLevel.objects.all():
            yesterday = timezone.now() - timedelta(days=1)
            
            # Verificar se teve atividade ontem
            # (implementar lógica de atividade baseada em models relevantes)
            had_activity = True  # Placeholder
            
            if had_activity:
                user_level.active_streak_days += 1
                if user_level.active_streak_days > user_level.max_streak_days:
                    user_level.max_streak_days = user_level.active_streak_days
                
                # Bônus de streak a cada 7 dias
                if user_level.active_streak_days % 7 == 0:
                    bonus_xp = 50 + (user_level.active_streak_days // 7) * 10
                    user_level.add_xp(bonus_xp, source='streak_bonus')
                    streak_bonuses += 1
                    
                    logger.info(
                        f"Streak bonus for user {user_level.user.id}: "
                        f"{user_level.active_streak_days} days, +{bonus_xp} XP"
                    )
                
            else:
                # Reset streak
                user_level.active_streak_days = 0
            
            user_level.save()
            updated_count += 1
        
        logger.info(
            f"Updated streaks for {updated_count} users, "
            f"{streak_bonuses} streak bonuses awarded"
        )
        
        return {
            'success': True,
            'updated_count': updated_count,
            'streak_bonuses': streak_bonuses
        }
        
    except Exception as e:
        logger.error(f"Error updating user streaks: {str(e)}")
        return {'success': False, 'error': str(e)}


@shared_task
def process_project_completion(user_id: int, project_id: str, rating: float = None):
    """
    Processa conclusão de projeto - XP, badges, métricas
    """
    try:
        from django.contrib.auth import get_user_model
        from ..models import UserLevel
        
        User = get_user_model()
        user = User.objects.get(id=user_id)
        user_level, _ = UserLevel.objects.get_or_create(user=user)
        
        # Atualizar métricas
        user_level.projects_completed += 1
        
        # XP base por conclusão
        base_xp = 25
        
        # Bônus por rating
        rating_bonus = 0
        if rating:
            if rating >= 4.5:
                rating_bonus = 20
            elif rating >= 4.0:
                rating_bonus = 10
            elif rating >= 3.5:
                rating_bonus = 5
        
        total_xp = base_xp + rating_bonus
        
        # Adicionar XP
        leveled_up = user_level.add_xp(total_xp, source='project_completed')
        
        # Atualizar rating médio
        if rating:
            # Calcular nova média (simplificado)
            if user_level.average_rating == 0:
                user_level.average_rating = rating
            else:
                # Média ponderada simples
                total_projects = user_level.projects_completed
                user_level.average_rating = (
                    (user_level.average_rating * (total_projects - 1) + rating) / total_projects
                )
        
        user_level.save()
        
        # Verificar badges relacionados a projetos
        check_user_badges.delay(user_id, 'project_completed')
        
        # Primeiro projeto?
        if user_level.projects_completed == 1:
            try:
                first_project_badge = BadgeType.objects.get(slug='first_project')
                award_badge.delay(
                    user_id=user_id,
                    badge_type_id=first_project_badge.id,
                    earned_for="Primeiro projeto concluído"
                )
            except BadgeType.DoesNotExist:
                pass
        
        logger.info(
            f"Project completion processed for user {user_id}: "
            f"+{total_xp} XP, rating: {rating}, leveled_up: {leveled_up}"
        )
        
        return {
            'success': True,
            'xp_awarded': total_xp,
            'leveled_up': leveled_up,
            'total_projects': user_level.projects_completed
        }
        
    except Exception as e:
        logger.error(f"Error processing project completion: {str(e)}")
        return {'success': False, 'error': str(e)}