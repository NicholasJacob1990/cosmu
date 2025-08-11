"""
Tasks para automação do sistema de agendamento e notificações
"""
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from celery import shared_task

from .models import Booking, BookingChangeRequest


@shared_task
def send_booking_reminder():
    """
    Envia lembretes de agendamento 24h antes do horário marcado
    """
    tomorrow = timezone.now() + timedelta(hours=24)
    tomorrow_end = tomorrow + timedelta(hours=1)
    
    # Buscar agendamentos para amanhã que ainda não tiveram lembrete enviado
    bookings = Booking.objects.filter(
        scheduled_start__gte=tomorrow,
        scheduled_start__lt=tomorrow_end,
        status__in=['scheduled', 'confirmed'],
        reminder_sent=False
    )
    
    sent_count = 0
    for booking in bookings:
        try:
            # Enviar email para cliente
            send_mail(
                subject=f'Lembrete: Serviço agendado para amanhã',
                message=f'''
                Olá {booking.client.get_full_name()},
                
                Este é um lembrete de que você tem um serviço agendado para amanhã:
                
                Freelancer: {booking.freelancer.user.get_full_name()}
                Data/Hora: {booking.scheduled_start.strftime('%d/%m/%Y às %H:%M')}
                Duração: {booking.duration_hours}h
                
                {f"Link da reunião: {booking.meeting_link}" if booking.meeting_link else ""}
                
                Atenciosamente,
                Equipe GalaxIA
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[booking.client.email],
                fail_silently=True,
            )
            
            # Enviar email para freelancer
            send_mail(
                subject=f'Lembrete: Serviço agendado para amanhã',
                message=f'''
                Olá {booking.freelancer.user.get_full_name()},
                
                Este é um lembrete de que você tem um serviço agendado para amanhã:
                
                Cliente: {booking.client.get_full_name()}
                Data/Hora: {booking.scheduled_start.strftime('%d/%m/%Y às %H:%M')}
                Duração: {booking.duration_hours}h
                
                {f"Link da reunião: {booking.meeting_link}" if booking.meeting_link else ""}
                
                Notas do cliente: {booking.notes or "Nenhuma"}
                
                Atenciosamente,
                Equipe GalaxIA
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[booking.freelancer.user.email],
                fail_silently=True,
            )
            
            # Marcar lembrete como enviado
            booking.reminder_sent = True
            booking.save()
            sent_count += 1
            
        except Exception as e:
            print(f"Erro ao enviar lembrete para booking {booking.id}: {str(e)}")
    
    return f"Lembretes enviados: {sent_count}"


@shared_task
def send_booking_confirmation(booking_id):
    """
    Envia confirmação de agendamento criado
    """
    try:
        booking = Booking.objects.get(id=booking_id)
        
        # Email para cliente
        send_mail(
            subject='Agendamento Confirmado - GalaxIA',
            message=f'''
            Olá {booking.client.get_full_name()},
            
            Seu agendamento foi confirmado com sucesso!
            
            Detalhes do agendamento:
            - Freelancer: {booking.freelancer.user.get_full_name()}
            - Data/Hora: {booking.scheduled_start.strftime('%d/%m/%Y às %H:%M')}
            - Duração: {booking.duration_hours}h
            - Status: {booking.get_status_display()}
            
            {f"Link da reunião: {booking.meeting_link}" if booking.meeting_link else ""}
            
            Você receberá um lembrete 24h antes do agendamento.
            
            Atenciosamente,
            Equipe GalaxIA
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[booking.client.email],
            fail_silently=True,
        )
        
        # Email para freelancer
        send_mail(
            subject='Novo Agendamento Recebido - GalaxIA',
            message=f'''
            Olá {booking.freelancer.user.get_full_name()},
            
            Você recebeu um novo agendamento!
            
            Detalhes do agendamento:
            - Cliente: {booking.client.get_full_name()}
            - Data/Hora: {booking.scheduled_start.strftime('%d/%m/%Y às %H:%M')}
            - Duração: {booking.duration_hours}h
            - Status: {booking.get_status_display()}
            
            {f"Link da reunião: {booking.meeting_link}" if booking.meeting_link else ""}
            
            Notas do cliente: {booking.notes or "Nenhuma"}
            
            Acesse seu painel para gerenciar este agendamento.
            
            Atenciosamente,
            Equipe GalaxIA
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[booking.freelancer.user.email],
            fail_silently=True,
        )
        
        # Marcar confirmação como enviada
        booking.confirmation_sent = True
        booking.save()
        
        return f"Confirmação enviada para booking {booking_id}"
        
    except Booking.DoesNotExist:
        return f"Booking {booking_id} não encontrado"
    except Exception as e:
        return f"Erro ao enviar confirmação: {str(e)}"


@shared_task
def send_booking_status_update(booking_id, previous_status):
    """
    Envia notificação quando status do agendamento muda
    """
    try:
        booking = Booking.objects.get(id=booking_id)
        
        # Definir mensagens baseadas no status
        status_messages = {
            'confirmed': 'foi confirmado',
            'in_progress': 'foi iniciado',
            'completed': 'foi concluído',
            'cancelled': 'foi cancelado',
            'no_show': 'foi marcado como ausência'
        }
        
        status_msg = status_messages.get(booking.status, 'teve seu status atualizado')
        
        # Email para cliente
        send_mail(
            subject=f'Agendamento {status_msg} - GalaxIA',
            message=f'''
            Olá {booking.client.get_full_name()},
            
            Seu agendamento {status_msg}.
            
            Detalhes:
            - Freelancer: {booking.freelancer.user.get_full_name()}
            - Data/Hora: {booking.scheduled_start.strftime('%d/%m/%Y às %H:%M')}
            - Status anterior: {previous_status}
            - Status atual: {booking.get_status_display()}
            
            {f"Notas do freelancer: {booking.freelancer_notes}" if booking.freelancer_notes else ""}
            
            Atenciosamente,
            Equipe GalaxIA
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[booking.client.email],
            fail_silently=True,
        )
        
        # Email para freelancer (apenas se não foi ele que mudou o status)
        if booking.status != 'confirmed':  # Freelancer geralmente é quem confirma
            send_mail(
                subject=f'Agendamento {status_msg} - GalaxIA',
                message=f'''
                Olá {booking.freelancer.user.get_full_name()},
                
                O agendamento com {booking.client.get_full_name()} {status_msg}.
                
                Detalhes:
                - Data/Hora: {booking.scheduled_start.strftime('%d/%m/%Y às %H:%M')}
                - Status anterior: {previous_status}
                - Status atual: {booking.get_status_display()}
                
                Atenciosamente,
                Equipe GalaxIA
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[booking.freelancer.user.email],
                fail_silently=True,
            )
        
        return f"Notificação de status enviada para booking {booking_id}"
        
    except Booking.DoesNotExist:
        return f"Booking {booking_id} não encontrado"
    except Exception as e:
        return f"Erro ao enviar notificação de status: {str(e)}"


@shared_task
def send_change_request_notification(change_request_id):
    """
    Envia notificação de solicitação de alteração de agendamento
    """
    try:
        change_request = BookingChangeRequest.objects.get(id=change_request_id)
        booking = change_request.booking
        
        # Determinar quem deve receber a notificação
        if change_request.requested_by == booking.client:
            # Cliente solicitou, notificar freelancer
            recipient = booking.freelancer.user
            recipient_name = booking.freelancer.user.get_full_name()
            requester_name = booking.client.get_full_name()
        else:
            # Freelancer solicitou, notificar cliente
            recipient = booking.client
            recipient_name = booking.client.get_full_name()
            requester_name = booking.freelancer.user.get_full_name()
        
        request_type_msgs = {
            'reschedule': 'reagendamento',
            'cancel': 'cancelamento',
            'extend': 'extensão'
        }
        
        request_type = request_type_msgs.get(change_request.request_type, 'alteração')
        
        send_mail(
            subject=f'Solicitação de {request_type} de agendamento - GalaxIA',
            message=f'''
            Olá {recipient_name},
            
            {requester_name} solicitou {request_type} para o seguinte agendamento:
            
            Agendamento atual:
            - Data/Hora: {booking.scheduled_start.strftime('%d/%m/%Y às %H:%M')}
            - Duração: {booking.duration_hours}h
            
            {f'''Novo horário solicitado:
            - Data/Hora: {change_request.new_start.strftime('%d/%m/%Y às %H:%M')}
            - Até: {change_request.new_end.strftime('%d/%m/%Y às %H:%M')}
            ''' if change_request.new_start else ''}
            
            Motivo: {change_request.reason}
            
            Acesse seu painel para aprovar ou rejeitar esta solicitação.
            
            Atenciosamente,
            Equipe GalaxIA
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient.email],
            fail_silently=True,
        )
        
        return f"Notificação de solicitação enviada para change request {change_request_id}"
        
    except BookingChangeRequest.DoesNotExist:
        return f"Change request {change_request_id} não encontrado"
    except Exception as e:
        return f"Erro ao enviar notificação de solicitação: {str(e)}"


@shared_task
def clean_expired_time_slots():
    """
    Remove slots de tempo expirados (datas passadas)
    """
    from .models import TimeSlot
    from datetime import date
    
    expired_slots = TimeSlot.objects.filter(date__lt=date.today())
    count = expired_slots.count()
    expired_slots.delete()
    
    return f"Removidos {count} slots de tempo expirados"


@shared_task
def auto_complete_past_bookings():
    """
    Marca automaticamente como concluídos agendamentos que já passaram
    e ainda estão com status 'in_progress'
    """
    past_bookings = Booking.objects.filter(
        scheduled_end__lt=timezone.now(),
        status='in_progress'
    )
    
    count = 0
    for booking in past_bookings:
        booking.status = 'completed'
        booking.actual_end = booking.scheduled_end
        booking.save()
        
        # Enviar notificação de conclusão automática
        send_booking_status_update.delay(booking.id, 'in_progress')
        count += 1
    
    return f"Marcados como concluídos automaticamente: {count} agendamentos"


# Tasks para Sistema de Disputas

@shared_task
def send_dispute_notification(dispute_id):
    """
    Envia notificação quando uma nova disputa é aberta
    """
    try:
        from .models import Dispute
        dispute = Dispute.objects.get(id=dispute_id)
        
        # Determinar quem deve receber a notificação
        if dispute.opened_by == dispute.client:
            # Cliente abriu, notificar freelancer
            recipient = dispute.freelancer.user
            other_party = "cliente"
        else:
            # Freelancer abriu, notificar cliente
            recipient = dispute.client
            other_party = "freelancer"
        
        # Enviar email
        send_mail(
            subject=f'Nova Disputa Aberta - {dispute.dispute_number}',
            message=f'''
            Olá {recipient.get_full_name()},
            
            Uma nova disputa foi aberta pelo {other_party} relacionada ao seu projeto.
            
            Detalhes da Disputa:
            - Número: {dispute.dispute_number}
            - Categoria: {dispute.get_category_display()}
            - Título: {dispute.title}
            - Valor em disputa: R$ {dispute.disputed_amount}
            
            Descrição:
            {dispute.description}
            
            Você tem 48 horas para responder a esta disputa. Caso não responda,
            o sistema poderá resolver automaticamente a favor da outra parte.
            
            Acesse seu painel para responder: {settings.FRONTEND_URL}/disputes/{dispute.id}
            
            Atenciosamente,
            Equipe GalaxIA - Central de Mediação
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient.email],
            fail_silently=True,
        )
        
        return f"Notificação de disputa enviada para {recipient.email}"
        
    except Dispute.DoesNotExist:
        return f"Disputa {dispute_id} não encontrada"
    except Exception as e:
        return f"Erro ao enviar notificação: {str(e)}"


@shared_task
def send_dispute_resolution_notification(dispute_id):
    """
    Envia notificação quando uma disputa é resolvida
    """
    try:
        from .models import Dispute
        dispute = Dispute.objects.get(id=dispute_id)
        
        if not hasattr(dispute, 'resolution'):
            return "Disputa sem resolução"
        
        resolution = dispute.resolution
        
        # Notificar cliente
        send_mail(
            subject=f'Disputa Resolvida - {dispute.dispute_number}',
            message=f'''
            Olá {dispute.client.get_full_name()},
            
            A disputa {dispute.dispute_number} foi resolvida por nossa equipe de mediação.
            
            Resolução: {resolution.get_outcome_display()}
            
            Detalhes Financeiros:
            - Reembolso: R$ {resolution.refund_amount}
            - Pagamento ao freelancer: R$ {resolution.freelancer_payment}
            
            Justificativa:
            {resolution.reasoning}
            
            {f"Ações adicionais: {resolution.additional_actions}" if resolution.additional_actions else ""}
            
            Você tem 72 horas para concordar com esta resolução. Caso não haja manifestação,
            a resolução será automaticamente executada.
            
            Acesse seu painel: {settings.FRONTEND_URL}/disputes/{dispute.id}
            
            Atenciosamente,
            Equipe GalaxIA - Central de Mediação
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[dispute.client.email],
            fail_silently=True,
        )
        
        # Notificar freelancer
        send_mail(
            subject=f'Disputa Resolvida - {dispute.dispute_number}',
            message=f'''
            Olá {dispute.freelancer.user.get_full_name()},
            
            A disputa {dispute.dispute_number} foi resolvida por nossa equipe de mediação.
            
            Resolução: {resolution.get_outcome_display()}
            
            Detalhes Financeiros:
            - Reembolso ao cliente: R$ {resolution.refund_amount}
            - Seu pagamento: R$ {resolution.freelancer_payment}
            
            Justificativa:
            {resolution.reasoning}
            
            {f"Ações adicionais: {resolution.additional_actions}" if resolution.additional_actions else ""}
            
            Você tem 72 horas para concordar com esta resolução. Caso não haja manifestação,
            a resolução será automaticamente executada.
            
            Acesse seu painel: {settings.FRONTEND_URL}/disputes/{dispute.id}
            
            Atenciosamente,
            Equipe GalaxIA - Central de Mediação
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[dispute.freelancer.user.email],
            fail_silently=True,
        )
        
        return f"Notificações de resolução enviadas para ambas as partes"
        
    except Dispute.DoesNotExist:
        return f"Disputa {dispute_id} não encontrada"
    except Exception as e:
        return f"Erro ao enviar notificação: {str(e)}"


@shared_task
def process_overdue_disputes():
    """
    Processa disputas em atraso para auto-resolução
    """
    from django.utils import timezone
    from .models import Dispute
    
    # Disputas abertas há mais de 48h sem resposta
    overdue_disputes = Dispute.objects.filter(
        status='open',
        auto_resolution_deadline__lt=timezone.now(),
        responded_at__isnull=True
    )
    
    count = 0
    for dispute in overdue_disputes:
        # Auto-resolver em favor de quem abriu a disputa
        if dispute.opened_by == dispute.client:
            # Cliente abriu, resolver em favor do cliente
            dispute.status = 'resolved_client'
            dispute.resolution_notes = "Resolução automática - freelancer não respondeu no prazo"
        else:
            # Freelancer abriu, resolver em favor do freelancer
            dispute.status = 'resolved_freelancer'
            dispute.resolution_notes = "Resolução automática - cliente não respondeu no prazo"
        
        dispute.resolved_at = timezone.now()
        dispute.save()
        count += 1
        
        # Criar mensagem automática
        from .models import DisputeMessage
        DisputeMessage.objects.create(
            dispute=dispute,
            message_type='auto_resolution',
            content=f"Disputa resolvida automaticamente em favor de {dispute.opened_by.get_full_name()} devido à falta de resposta da outra parte no prazo de 48 horas."
        )
        
        # Notificar as partes
        send_dispute_resolution_notification.delay(dispute.id)
    
    return f"Auto-resolvidas {count} disputas em atraso"


@shared_task
def escalate_disputes_to_mediation():
    """
    Escala disputas para mediação quando não há acordo
    """
    from django.utils import timezone
    from .models import Dispute
    
    # Disputas em análise há mais de 72h sem resolução
    disputes_for_mediation = Dispute.objects.filter(
        status='in_review',
        responded_at__lt=timezone.now() - timedelta(hours=72)
    )
    
    count = 0
    for dispute in disputes_for_mediation:
        dispute.status = 'in_mediation'
        dispute.mediation_started_at = timezone.now()
        dispute.mediation_deadline = timezone.now() + timedelta(hours=72)
        dispute.save()
        count += 1
        
        # Criar mensagem automática
        from .models import DisputeMessage
        DisputeMessage.objects.create(
            dispute=dispute,
            message_type='system',
            content="Disputa escalada para mediação devido à falta de acordo entre as partes. Um mediador será designado em breve."
        )
        
        # Notificar administradores
        from django.contrib.auth import get_user_model
        User = get_user_model()
        admins = User.objects.filter(is_staff=True)
        
        for admin in admins:
            send_mail(
                subject=f'Nova Disputa para Mediação - {dispute.dispute_number}',
                message=f'''
                Uma nova disputa foi escalada para mediação:
                
                - Número: {dispute.dispute_number}
                - Categoria: {dispute.get_category_display()}
                - Valor: R$ {dispute.disputed_amount}
                - Cliente: {dispute.client.get_full_name()}
                - Freelancer: {dispute.freelancer.user.get_full_name()}
                
                Acesse o painel admin para designar um mediador.
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin.email],
                fail_silently=True,
            )
    
    return f"Escaladas {count} disputas para mediação"


@shared_task
def reminder_dispute_deadline():
    """
    Envia lembretes sobre prazos de disputa
    """
    from django.utils import timezone
    from .models import Dispute
    
    # Disputas próximas do prazo (6h antes)
    reminder_time = timezone.now() + timedelta(hours=6)
    
    disputes_near_deadline = Dispute.objects.filter(
        status='open',
        auto_resolution_deadline__lte=reminder_time,
        auto_resolution_deadline__gt=timezone.now(),
        responded_at__isnull=True
    )
    
    count = 0
    for dispute in disputes_near_deadline:
        # Determinar quem deve receber o lembrete
        if dispute.opened_by == dispute.client:
            recipient = dispute.freelancer.user
        else:
            recipient = dispute.client
        
        send_mail(
            subject=f'Lembrete: Prazo de Resposta - Disputa {dispute.dispute_number}',
            message=f'''
            Olá {recipient.get_full_name()},
            
            Este é um lembrete de que você tem aproximadamente 6 horas para responder
            à disputa {dispute.dispute_number}.
            
            Caso não responda até {dispute.auto_resolution_deadline.strftime('%d/%m/%Y às %H:%M')},
            a disputa poderá ser resolvida automaticamente.
            
            Acesse seu painel: {settings.FRONTEND_URL}/disputes/{dispute.id}
            
            Atenciosamente,
            Equipe GalaxIA
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient.email],
            fail_silently=True,
        )
        count += 1
    
    return f"Enviados {count} lembretes de prazo"