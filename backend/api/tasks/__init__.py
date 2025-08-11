"""
Tarefas Celery para a aplicação API da GalaxIA
"""

# Import das tarefas para descoberta automática pelo Celery
from .kyc_tasks import (
    process_document_verification,
    process_biometric_verification,
    process_kyc_webhook,
    trigger_profile_update,
    send_level_upgrade_notification,
    cleanup_expired_verifications
)

__all__ = [
    'process_document_verification',
    'process_biometric_verification', 
    'process_kyc_webhook',
    'trigger_profile_update',
    'send_level_upgrade_notification',
    'cleanup_expired_verifications'
]