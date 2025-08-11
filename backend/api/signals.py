"""
Signals para sincronização automática com sistema de IA
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.conf import settings
from .models import ServicePackage, FreelancerProfile
from .services.ai_search_service import auto_sync_to_ai_system, auto_sync_delete_to_ai_system
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=ServicePackage)
def sync_service_package_to_ai(sender, instance, created, **kwargs):
    """
    Sincroniza ServicePackage com sistema de IA quando criado ou atualizado
    """
    if getattr(settings, 'AI_SEARCH_ENABLED', True):
        try:
            auto_sync_to_ai_system(sender, instance, created, **kwargs)
        except Exception as e:
            logger.error(f"Erro ao sincronizar ServicePackage {instance.id} com IA: {str(e)}")


@receiver(post_save, sender=FreelancerProfile)
def sync_freelancer_profile_to_ai(sender, instance, created, **kwargs):
    """
    Sincroniza FreelancerProfile com sistema de IA quando criado ou atualizado
    """
    if getattr(settings, 'AI_SEARCH_ENABLED', True):
        try:
            auto_sync_to_ai_system(sender, instance, created, **kwargs)
        except Exception as e:
            logger.error(f"Erro ao sincronizar FreelancerProfile {instance.id} com IA: {str(e)}")


@receiver(post_delete, sender=ServicePackage)
def delete_service_package_from_ai(sender, instance, **kwargs):
    """
    Remove ServicePackage do sistema de IA quando deletado
    """
    if getattr(settings, 'AI_SEARCH_ENABLED', True):
        try:
            auto_sync_delete_to_ai_system(sender, instance, **kwargs)
        except Exception as e:
            logger.error(f"Erro ao deletar ServicePackage {instance.id} da IA: {str(e)}")


@receiver(post_delete, sender=FreelancerProfile)
def delete_freelancer_profile_from_ai(sender, instance, **kwargs):
    """
    Remove FreelancerProfile do sistema de IA quando deletado
    """
    if getattr(settings, 'AI_SEARCH_ENABLED', True):
        try:
            auto_sync_delete_to_ai_system(sender, instance, **kwargs)
        except Exception as e:
            logger.error(f"Erro ao deletar FreelancerProfile {instance.id} da IA: {str(e)}")