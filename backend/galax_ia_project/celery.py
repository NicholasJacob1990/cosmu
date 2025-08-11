"""
Configuração do Celery para o projeto GalaxIA
"""
import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'galax_ia_project.settings')

app = Celery('galax_ia_project')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Configurações específicas para tarefas KYC
app.conf.update(
    # Routing de tarefas KYC para fila dedicada
    task_routes={
        'api.tasks.kyc_tasks.process_document_verification': {'queue': 'kyc'},
        'api.tasks.kyc_tasks.process_biometric_verification': {'queue': 'kyc'},
        'api.tasks.kyc_tasks.process_kyc_webhook': {'queue': 'kyc_webhooks'},
        'api.tasks.kyc_tasks.trigger_profile_update': {'queue': 'kyc'},
        'api.tasks.kyc_tasks.send_level_upgrade_notification': {'queue': 'notifications'},
        'api.tasks.kyc_tasks.cleanup_expired_verifications': {'queue': 'maintenance'},
        # Smart KYC routing tasks
        'api.tasks.kyc_tasks.smart_kyc_verification': {'queue': 'kyc_smart'},
        'api.tasks.kyc_tasks.optimize_kyc_routing': {'queue': 'kyc_optimization'},
        'api.tasks.kyc_tasks.reset_monthly_kyc_metrics': {'queue': 'maintenance'},
        'api.tasks.kyc_tasks.kyc_provider_health_check': {'queue': 'health_checks'},
        # Escrow and payment tasks
        'api.services.escrow_service.release_escrowed_funds': {'queue': 'escrow'},
        'api.services.escrow_service.send_payment_reminders': {'queue': 'notifications'},
        'api.services.escrow_service.process_failed_payments': {'queue': 'escrow'},
        # Badge and gamification tasks
        'api.tasks.badge_tasks.process_level_up': {'queue': 'badges'},
        'api.tasks.badge_tasks.award_badge': {'queue': 'badges'},
        'api.tasks.badge_tasks.check_user_badges': {'queue': 'badges'},
        'api.tasks.badge_tasks.process_project_completion': {'queue': 'badges'},
        'api.tasks.badge_tasks.update_user_streaks': {'queue': 'badges'},
    },
    
    # Configurações de retry
    task_default_retry_delay=60,  # 1 minuto
    task_max_retries=3,
    
    # Configurações de timeout
    task_soft_time_limit=300,  # 5 minutos
    task_time_limit=600,       # 10 minutos
    
    # Configurações de serialização
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    
    # Timezone
    timezone='America/Sao_Paulo',
    enable_utc=True,
)

# Tarefas agendadas (beat schedule)
app.conf.beat_schedule = {
    # Limpeza de verificações expiradas (diária às 2h)
    'cleanup-expired-kyc': {
        'task': 'api.tasks.kyc_tasks.cleanup_expired_verifications',
        'schedule': crontab(hour=2, minute=0),
        'options': {'queue': 'maintenance'}
    },
    
    # Atualização de métricas de provedores KYC (a cada 6h)
    'update-provider-metrics': {
        'task': 'api.tasks.kyc_tasks.update_provider_metrics',
        'schedule': crontab(minute=0, hour='*/6'),
        'options': {'queue': 'maintenance'}
    },
    
    # Otimização inteligente de roteamento KYC (a cada 2h)
    'optimize-kyc-routing': {
        'task': 'api.tasks.kyc_tasks.optimize_kyc_routing',
        'schedule': crontab(minute=0, hour='*/2'),
        'options': {'queue': 'kyc_optimization'}
    },
    
    # Reset mensal das métricas KYC (dia 1 de cada mês às 3h)
    'reset-monthly-kyc-metrics': {
        'task': 'api.tasks.kyc_tasks.reset_monthly_kyc_metrics',
        'schedule': crontab(hour=3, minute=0, day_of_month=1),
        'options': {'queue': 'maintenance'}
    },
    
    # Health check dos provedores KYC (a cada 15 min)
    'kyc-provider-health-check': {
        'task': 'api.tasks.kyc_tasks.kyc_provider_health_check',
        'schedule': crontab(minute='*/15'),
        'options': {'queue': 'health_checks'}
    },
    
    # Escrow and payment tasks
    # Processamento de releases automáticos (a cada 15 min)
    'process-auto-releases': {
        'task': 'api.services.escrow_service.send_payment_reminders',
        'schedule': crontab(minute='*/15'),
        'options': {'queue': 'escrow'}
    },
    
    # Lembretes de aprovação pendente (diário às 10h)
    'send-payment-reminders': {
        'task': 'api.services.escrow_service.send_payment_reminders',
        'schedule': crontab(hour=10, minute=0),
        'options': {'queue': 'notifications'}
    },
    
    # Reprocessamento de pagamentos falhados (a cada 4h)
    'process-failed-payments': {
        'task': 'api.services.escrow_service.process_failed_payments',
        'schedule': crontab(minute=0, hour='*/4'),
        'options': {'queue': 'escrow'}
    },

    # Badge and gamification tasks
    # Atualização de streaks (daily at 00:05)
    'update-user-streaks': {
        'task': 'api.tasks.badge_tasks.update_user_streaks',
        'schedule': crontab(hour=0, minute=5),
        'options': {'queue': 'badges'}
    },
}


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')


@app.task
def update_provider_metrics():
    """
    Atualiza métricas dos provedores KYC
    Task periódica para manter estatísticas atualizadas
    """
    try:
        from api.models import VerificationProvider, VerificationLog
        from django.db.models import Avg, Count
        from datetime import timedelta
        from django.utils import timezone
        
        # Últimas 24 horas
        last_24h = timezone.now() - timedelta(hours=24)
        
        for provider in VerificationProvider.objects.filter(is_active=True):
            logs = VerificationLog.objects.filter(
                provider=provider,
                created_at__gte=last_24h
            )
            
            if logs.exists():
                metrics = logs.aggregate(
                    success_rate=Avg('success'),
                    avg_response_time=Avg('response_time'),
                    total_verifications=Count('id')
                )
                
                # Atualizar métricas do provedor
                provider.success_rate = metrics['success_rate'] or 0.0
                provider.average_response_time = metrics['avg_response_time'] or 0.0
                provider.total_verifications += metrics['total_verifications']
                provider.save()
                
                print(f"Updated metrics for provider {provider.name}")
        
        return {'success': True, 'message': 'Provider metrics updated'}
        
    except Exception as exc:
        print(f"Error updating provider metrics: {str(exc)}")
        return {'success': False, 'error': str(exc)}