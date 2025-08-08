"""
Tasks assíncronas para o sistema de mensageria e notificações.
"""

import json
from celery import shared_task
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import SystemNotification, NotificationPreferences

User = get_user_model()


@shared_task
def send_email_notification(notification_id):
    """
    Envia notificação por email.
    """
    try:
        notification = SystemNotification.objects.get(id=notification_id)
        user = notification.user
        
        # Verificar preferências do usuário
        try:
            prefs = user.notification_preferences
            if not prefs.messages_email and notification.notification_type == 'message':
                return {'status': 'skipped', 'reason': 'email disabled for messages'}
            # Adicionar outras verificações conforme necessário
        except NotificationPreferences.DoesNotExist:
            pass  # Usar configurações padrão
        
        # Preparar dados do email
        context = {
            'user': user,
            'notification': notification,
            'site_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        }
        
        # Renderizar templates
        subject = f"GalaxIA - {notification.title}"
        html_message = render_to_string('emails/notification.html', context)
        text_message = render_to_string('emails/notification.txt', context)
        
        # Enviar email
        send_mail(
            subject=subject,
            message=text_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False
        )
        
        # Marcar como enviado
        notification.sent_email = True
        notification.save(update_fields=['sent_email'])
        
        return {'status': 'sent', 'email': user.email}
        
    except SystemNotification.DoesNotExist:
        return {'status': 'error', 'message': 'Notification not found'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


@shared_task
def send_push_notification(notification_id):
    """
    Envia notificação push (via WebSocket e/ou serviços push externos).
    """
    try:
        notification = SystemNotification.objects.get(id=notification_id)
        user = notification.user
        
        # Verificar preferências do usuário
        try:
            prefs = user.notification_preferences
            if not prefs.messages_push and notification.notification_type == 'message':
                return {'status': 'skipped', 'reason': 'push disabled for messages'}
        except NotificationPreferences.DoesNotExist:
            pass
        
        # Enviar via WebSocket
        channel_layer = get_channel_layer()
        notification_group = f'notifications_{user.id}'
        
        notification_data = {
            'type': 'notification_broadcast',
            'notification': {
                'id': str(notification.id),
                'type': notification.notification_type,
                'title': notification.title,
                'message': notification.message,
                'priority': notification.priority,
                'created_at': notification.created_at.isoformat(),
                'action_url': notification.action_url,
                'data': notification.data
            }
        }
        
        async_to_sync(channel_layer.group_send)(notification_group, notification_data)
        
        # Marcar como enviado
        notification.sent_push = True
        notification.save(update_fields=['sent_push'])
        
        return {'status': 'sent', 'user_id': str(user.id)}
        
    except SystemNotification.DoesNotExist:
        return {'status': 'error', 'message': 'Notification not found'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


@shared_task
def send_sms_notification(notification_id):
    """
    Envia notificação por SMS (integração com Twilio, AWS SNS, etc).
    """
    try:
        notification = SystemNotification.objects.get(id=notification_id)
        user = notification.user
        
        # Verificar preferências do usuário
        try:
            prefs = user.notification_preferences
            if not prefs.messages_sms and notification.notification_type == 'message':
                return {'status': 'skipped', 'reason': 'sms disabled for messages'}
        except NotificationPreferences.DoesNotExist:
            pass
        
        # Verificar se usuário tem telefone
        if not hasattr(user, 'phone_number') or not user.phone_number:
            return {'status': 'skipped', 'reason': 'no phone number'}
        
        # TODO: Implementar integração com provedor SMS
        # Exemplo com Twilio:
        # from twilio.rest import Client
        # client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        # message = client.messages.create(
        #     body=f"{notification.title}: {notification.message}",
        #     from_=settings.TWILIO_PHONE_NUMBER,
        #     to=user.phone_number
        # )
        
        # Por enquanto, apenas simular o envio
        print(f"SMS enviado para {user.phone_number}: {notification.title}")
        
        # Marcar como enviado
        notification.sent_sms = True
        notification.save(update_fields=['sent_sms'])
        
        return {'status': 'sent', 'phone': user.phone_number}
        
    except SystemNotification.DoesNotExist:
        return {'status': 'error', 'message': 'Notification not found'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


@shared_task
def process_notification(notification_id):
    """
    Processa uma notificação, enviando pelos canais apropriados.
    """
    try:
        notification = SystemNotification.objects.get(id=notification_id)
        user = notification.user
        
        # Obter preferências do usuário
        try:
            prefs = user.notification_preferences
        except NotificationPreferences.DoesNotExist:
            # Criar preferências padrão
            prefs = NotificationPreferences.objects.create(user=user)
        
        results = []
        
        # Verificar canais de notificação baseados no tipo
        notification_type = notification.notification_type
        
        # Email
        should_send_email = False
        if notification_type == 'message' and prefs.messages_email:
            should_send_email = True
        elif notification_type in ['payment_received', 'payment_sent'] and prefs.payments_email:
            should_send_email = True
        elif notification_type in ['project_update'] and prefs.project_updates_email:
            should_send_email = True
        elif notification_type in ['proposal_received', 'proposal_accepted', 'proposal_rejected'] and prefs.proposals_email:
            should_send_email = True
        elif notification_type == 'system' and prefs.system_email:
            should_send_email = True
        
        if should_send_email:
            send_email_notification.delay(notification_id)
            results.append('email_queued')
        
        # Push
        should_send_push = False
        if notification_type == 'message' and prefs.messages_push:
            should_send_push = True
        elif notification_type in ['payment_received', 'payment_sent'] and prefs.payments_push:
            should_send_push = True
        elif notification_type in ['project_update'] and prefs.project_updates_push:
            should_send_push = True
        elif notification_type in ['proposal_received', 'proposal_accepted', 'proposal_rejected'] and prefs.proposals_push:
            should_send_push = True
        elif notification_type == 'system' and prefs.system_push:
            should_send_push = True
        
        if should_send_push:
            send_push_notification.delay(notification_id)
            results.append('push_queued')
        
        # SMS (apenas para notificações urgentes ou de pagamento)
        should_send_sms = False
        if notification.priority == 'urgent':
            should_send_sms = True
        elif notification_type in ['payment_received', 'payment_sent'] and prefs.payments_sms:
            should_send_sms = True
        
        if should_send_sms:
            send_sms_notification.delay(notification_id)
            results.append('sms_queued')
        
        return {'status': 'processed', 'channels': results}
        
    except SystemNotification.DoesNotExist:
        return {'status': 'error', 'message': 'Notification not found'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


@shared_task
def cleanup_old_notifications():
    """
    Limpeza periódica de notificações antigas.
    """
    from datetime import timedelta
    from django.utils import timezone
    
    # Deletar notificações lidas mais antigas que 30 dias
    cutoff_date = timezone.now() - timedelta(days=30)
    
    deleted_count = SystemNotification.objects.filter(
        read=True,
        created_at__lt=cutoff_date
    ).delete()[0]
    
    return {'status': 'completed', 'deleted_count': deleted_count}


@shared_task
def send_digest_notifications():
    """
    Envia resumos de notificações para usuários com preferência de email diário/semanal.
    """
    from datetime import timedelta
    from django.utils import timezone
    from django.db.models import Count
    
    now = timezone.now()
    
    # Usuários com preferência de resumo diário
    daily_users = User.objects.filter(
        notification_preferences__email_frequency='daily'
    ).select_related('notification_preferences')
    
    for user in daily_users:
        # Notificações não lidas das últimas 24 horas
        yesterday = now - timedelta(days=1)
        unread_notifications = SystemNotification.objects.filter(
            user=user,
            read=False,
            created_at__gte=yesterday
        ).order_by('-created_at')
        
        if unread_notifications.exists():
            # Agrupar por tipo
            notifications_by_type = {}
            for notif in unread_notifications:
                notif_type = notif.get_notification_type_display()
                if notif_type not in notifications_by_type:
                    notifications_by_type[notif_type] = []
                notifications_by_type[notif_type].append(notif)
            
            # Enviar email resumo
            context = {
                'user': user,
                'notifications_by_type': notifications_by_type,
                'total_count': unread_notifications.count(),
                'site_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            }
            
            subject = f"GalaxIA - Resumo diário ({unread_notifications.count()} notificações)"
            html_message = render_to_string('emails/daily_digest.html', context)
            text_message = render_to_string('emails/daily_digest.txt', context)
            
            send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=True
            )
    
    return {'status': 'completed', 'processed_users': daily_users.count()}


# Função auxiliar para criar notificações
def create_notification(user, notification_type, title, message, **kwargs):
    """
    Função helper para criar e processar notificação.
    """
    notification = SystemNotification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        **kwargs
    )
    
    # Processar notificação de forma assíncrona
    process_notification.delay(notification.id)
    
    return notification


