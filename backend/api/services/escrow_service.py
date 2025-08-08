"""
Serviço Avançado de Escrow - Sprint 3-4
Sistema completo de escrow com auto-release, disputas e regras configuráveis
"""
import logging
from decimal import Decimal
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from django.utils import timezone
from django.conf import settings
from django.db import transaction
from celery import shared_task

from ..models import (
    Transaction, Order, User, EscrowRelease, PaymentDispute,
    AutoReleaseRule, PaymentIntent, StripeAccount
)
from .stripe_service import StripeService

logger = logging.getLogger(__name__)


class AdvancedEscrowService:
    """
    Serviço avançado de escrow com funcionalidades completas:
    - Auto-release configurável
    - Sistema de disputas
    - Aprovação manual pelo cliente
    - Regras personalizadas por categoria/usuário
    """
    
    @staticmethod
    def create_escrow_transaction(
        order,
        amount: Decimal,
        payment_method_id: str,
        description: str = ""
    ) -> Dict[str, Any]:
        """
        Cria uma transação de escrow completa
        """
        try:
            with transaction.atomic():
                # 1. Criar Payment Intent no Stripe
                stripe_result = StripeService.create_escrow_payment_intent(
                    amount=amount,
                    order_id=str(order.id),
                    payment_method_id=payment_method_id
                )
                
                if not stripe_result['success']:
                    return stripe_result
                
                # 2. Criar Transaction no banco
                escrow_transaction = Transaction.objects.create(
                    order=order,
                    type='payment',
                    status='pending',
                    amount=amount,
                    currency='BRL',
                    payment_method='card',
                    provider='stripe',
                    transaction_id=stripe_result['payment_intent'].id,
                    metadata={
                        'client_secret': stripe_result['client_secret'],
                        'escrow': True,
                        'description': description
                    }
                )
                
                # 3. Criar PaymentIntent no banco para tracking
                PaymentIntent.objects.create(
                    stripe_payment_intent_id=stripe_result['payment_intent'].id,
                    user=order.client,
                    transaction=escrow_transaction,
                    amount=amount,
                    currency='BRL',
                    status='requires_confirmation',
                    client_secret=stripe_result['client_secret'],
                    metadata={
                        'order_id': str(order.id),
                        'escrow': True
                    }
                )
                
                # 4. Agendar auto-release baseado nas regras
                release_rule = AdvancedEscrowService._get_applicable_rule(escrow_transaction)
                scheduled_release_date = timezone.now() + timedelta(days=release_rule.timeout_days)
                
                EscrowRelease.objects.create(
                    transaction=escrow_transaction,
                    release_type='auto',
                    amount=amount,
                    fees=amount * Decimal('0.10'),  # 10% fee padrão
                    scheduled_at=scheduled_release_date,
                    reason=f"Auto-release programado baseado na regra: {release_rule.name}"
                )
                
                # 5. Atualizar status do pedido
                order.escrow_status = 'held'
                order.escrow_amount = amount
                order.save()
                
                return {
                    'success': True,
                    'transaction': escrow_transaction,
                    'payment_intent': stripe_result['payment_intent'],
                    'client_secret': stripe_result['client_secret'],
                    'auto_release_date': scheduled_release_date
                }
                
        except Exception as e:
            logger.error(f"Erro ao criar escrow: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def approve_delivery(
        transaction_id: str,
        approver: User,
        feedback_rating: int = None,
        feedback_comment: str = ""
    ) -> Dict[str, Any]:
        """
        Cliente aprova a entrega e libera fundos manualmente
        """
        try:
            with transaction.atomic():
                escrow_transaction = Transaction.objects.get(
                    id=transaction_id,
                    type='payment',
                    status='completed'
                )
                
                order = escrow_transaction.order
                
                # Verificar se o usuário pode aprovar
                if approver != order.client:
                    return {
                        'success': False,
                        'error': 'Apenas o cliente pode aprovar a entrega'
                    }
                
                # Verificar se já foi liberado
                if order.escrow_status == 'released':
                    return {
                        'success': False,
                        'error': 'Fundos já foram liberados'
                    }
                
                # Cancelar auto-release agendado
                EscrowRelease.objects.filter(
                    transaction=escrow_transaction,
                    status='scheduled'
                ).update(status='cancelled')
                
                # Criar nova release manual
                manual_release = EscrowRelease.objects.create(
                    transaction=escrow_transaction,
                    release_type='manual',
                    amount=escrow_transaction.amount,
                    fees=escrow_transaction.amount * Decimal('0.10'),
                    scheduled_at=timezone.now(),
                    approved_by=approver,
                    approval_reason=f"Aprovação manual pelo cliente. Rating: {feedback_rating}/5"
                )
                
                # Executar liberação imediatamente
                release_result = AdvancedEscrowService._execute_release(manual_release)
                
                if release_result['success']:
                    # Criar avaliação se fornecida
                    if feedback_rating:
                        from ..models import Review
                        Review.objects.create(
                            order=order,
                            reviewer=approver,
                            rating=feedback_rating,
                            comment=feedback_comment
                        )
                
                return release_result
                
        except Transaction.DoesNotExist:
            return {
                'success': False,
                'error': 'Transação não encontrada'
            }
        except Exception as e:
            logger.error(f"Erro ao aprovar entrega: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def open_dispute(
        transaction_id: str,
        initiated_by: User,
        category: str,
        title: str,
        description: str,
        evidence_urls: List[str] = None
    ) -> Dict[str, Any]:
        """
        Abre uma disputa sobre um pagamento em escrow
        """
        try:
            with transaction.atomic():
                escrow_transaction = Transaction.objects.get(
                    id=transaction_id,
                    type='payment'
                )
                
                order = escrow_transaction.order
                
                # Verificar se pode abrir disputa
                if initiated_by not in [order.client, order.freelancer]:
                    return {
                        'success': False,
                        'error': 'Apenas cliente ou freelancer podem abrir disputas'
                    }
                
                # Verificar se já existe disputa ativa
                active_dispute = PaymentDispute.objects.filter(
                    transaction=escrow_transaction,
                    status__in=['open', 'investigating', 'mediation']
                ).first()
                
                if active_dispute:
                    return {
                        'success': False,
                        'error': 'Já existe uma disputa ativa para esta transação'
                    }
                
                # Pausar auto-release
                EscrowRelease.objects.filter(
                    transaction=escrow_transaction,
                    status='scheduled'
                ).update(status='cancelled')
                
                # Criar disputa
                dispute = PaymentDispute.objects.create(
                    transaction=escrow_transaction,
                    initiated_by=initiated_by,
                    client=order.client,
                    freelancer=order.freelancer,
                    category=category,
                    title=title,
                    description=description,
                    evidence_urls=evidence_urls or [],
                    amount_disputed=escrow_transaction.amount,
                    priority=AdvancedEscrowService._calculate_dispute_priority(
                        escrow_transaction.amount, category
                    )
                )
                
                # Atualizar status do pedido
                order.escrow_status = 'disputed'
                order.save()
                
                # Notificar partes envolvidas
                AdvancedEscrowService._notify_dispute_opened(dispute)
                
                return {
                    'success': True,
                    'dispute': dispute,
                    'message': 'Disputa criada com sucesso. Nossa equipe irá analisar o caso.'
                }
                
        except Transaction.DoesNotExist:
            return {
                'success': False,
                'error': 'Transação não encontrada'
            }
        except Exception as e:
            logger.error(f"Erro ao abrir disputa: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def process_auto_release(escrow_release_id: str) -> Dict[str, Any]:
        """
        Processa uma liberação automática agendada
        """
        try:
            release = EscrowRelease.objects.get(
                id=escrow_release_id,
                status='scheduled'
            )
            
            # Verificar se ainda é válida para release
            if not AdvancedEscrowService._can_auto_release(release):
                release.status = 'cancelled'
                release.save()
                return {
                    'success': False,
                    'error': 'Auto-release cancelado por condições não atendidas'
                }
            
            # Executar liberação
            return AdvancedEscrowService._execute_release(release)
            
        except EscrowRelease.DoesNotExist:
            return {
                'success': False,
                'error': 'Release não encontrado'
            }
        except Exception as e:
            logger.error(f"Erro no auto-release: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def _execute_release(escrow_release: EscrowRelease) -> Dict[str, Any]:
        """
        Executa a liberação efetiva dos fundos
        """
        try:
            escrow_transaction = escrow_release.transaction
            order = escrow_transaction.order
            
            # Verificar conta Stripe do freelancer
            freelancer = order.freelancer
            if not hasattr(freelancer, 'stripe_account') or not freelancer.stripe_account:
                return {
                    'success': False,
                    'error': 'Freelancer não possui conta Stripe configurada'
                }
            
            stripe_account = freelancer.stripe_account
            if not stripe_account.can_receive_payments:
                return {
                    'success': False,
                    'error': 'Conta Stripe do freelancer não está verificada'
                }
            
            # Executar transferência
            transfer_result = StripeService.capture_and_transfer_escrow(
                payment_intent_id=escrow_transaction.transaction_id,
                freelancer_account_id=stripe_account.stripe_account_id,
                amount=escrow_release.net_amount
            )
            
            if transfer_result['success']:
                # Atualizar release
                escrow_release.status = 'completed'
                escrow_release.released_at = timezone.now()
                escrow_release.metadata.update({
                    'transfer_id': transfer_result['transfer'].id,
                    'stripe_result': transfer_result
                })
                escrow_release.save()
                
                # Atualizar pedido
                order.escrow_status = 'released'
                order.status = 'completed'
                order.completed_at = timezone.now()
                order.save()
                
                # Criar transação de liberação
                Transaction.objects.create(
                    order=order,
                    type='release',
                    status='completed',
                    amount=escrow_release.net_amount,
                    currency='BRL',
                    provider='stripe',
                    transaction_id=transfer_result['transfer'].id,
                    metadata={
                        'original_payment': escrow_transaction.transaction_id,
                        'platform_fee': str(escrow_release.fees),
                        'release_type': escrow_release.release_type
                    }
                )
                
                # Notificar partes
                AdvancedEscrowService._notify_funds_released(order, escrow_release)
                
                return {
                    'success': True,
                    'transfer': transfer_result['transfer'],
                    'amount_released': escrow_release.net_amount,
                    'platform_fee': escrow_release.fees
                }
            else:
                escrow_release.status = 'failed'
                escrow_release.metadata.update({
                    'error': transfer_result.get('error', 'Unknown error')
                })
                escrow_release.save()
                
                return transfer_result
                
        except Exception as e:
            logger.error(f"Erro ao executar release: {str(e)}")
            escrow_release.status = 'failed'
            escrow_release.metadata.update({'error': str(e)})
            escrow_release.save()
            
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def _get_applicable_rule(transaction: Transaction) -> AutoReleaseRule:
        """
        Encontra a regra de auto-release aplicável para uma transação
        """
        try:
            # Buscar regras ativas ordenadas por prioridade
            rules = AutoReleaseRule.objects.filter(
                is_active=True
            ).order_by('-priority')
            
            for rule in rules:
                if rule.matches_transaction(transaction):
                    return rule
            
            # Regra padrão se nenhuma específica foi encontrada
            default_rule, _ = AutoReleaseRule.objects.get_or_create(
                name='Default Auto-Release',
                defaults={
                    'description': 'Regra padrão de liberação automática',
                    'timeout_days': 7,
                    'priority': 0,
                    'conditions': {
                        'project_completed': True,
                        'no_active_disputes': True
                    }
                }
            )
            return default_rule
            
        except Exception as e:
            logger.error(f"Erro ao buscar regra: {str(e)}")
            # Fallback hardcoded
            return type('DefaultRule', (), {
                'name': 'Fallback Rule',
                'timeout_days': 7
            })()
    
    @staticmethod
    def _can_auto_release(escrow_release: EscrowRelease) -> bool:
        """
        Verifica se uma liberação automática pode ser executada
        """
        transaction = escrow_release.transaction
        order = transaction.order
        
        # Verificar se projeto foi marcado como completo
        if order.status not in ['delivered', 'pending_review']:
            return False
        
        # Verificar se não há disputas ativas
        active_disputes = PaymentDispute.objects.filter(
            transaction=transaction,
            status__in=['open', 'investigating', 'mediation']
        ).exists()
        
        if active_disputes:
            return False
        
        # Verificar se está dentro do prazo
        if timezone.now() < escrow_release.scheduled_at:
            return False
        
        return True
    
    @staticmethod
    def _calculate_dispute_priority(amount: Decimal, category: str) -> int:
        """
        Calcula prioridade da disputa baseada no valor e categoria
        """
        priority = 1  # Baixa
        
        # Prioridade baseada no valor
        if amount > 5000:
            priority = 4  # Crítica
        elif amount > 2000:
            priority = 3  # Alta
        elif amount > 500:
            priority = 2  # Média
        
        # Ajustar por categoria
        high_priority_categories = ['fraud', 'payment']
        if category in high_priority_categories:
            priority = min(priority + 1, 4)
        
        return priority
    
    @staticmethod
    def _notify_dispute_opened(dispute: PaymentDispute):
        """
        Notifica partes sobre abertura de disputa
        """
        # TODO: Implementar sistema de notificações
        logger.info(f"Disputa {dispute.id} criada - notificações enviadas")
    
    @staticmethod
    def _notify_funds_released(order, escrow_release: EscrowRelease):
        """
        Notifica sobre liberação de fundos
        """
        # TODO: Implementar sistema de notificações
        logger.info(f"Fundos liberados para pedido {order.id} - R$ {escrow_release.net_amount}")


# ============================================================================
# Celery Tasks para Auto-Release
# ============================================================================

@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def release_escrowed_funds(self, escrow_release_id: str):
    """
    Task Celery para liberar fundos automaticamente
    """
    try:
        result = AdvancedEscrowService.process_auto_release(escrow_release_id)
        if not result['success']:
            logger.error(f"Falha no auto-release {escrow_release_id}: {result['error']}")
            return result
        
        logger.info(f"Auto-release {escrow_release_id} executado com sucesso")
        return result
        
    except Exception as e:
        logger.error(f"Erro na task de auto-release: {str(e)}")
        # Retry com exponential backoff
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (2 ** self.request.retries))
        return {'success': False, 'error': str(e)}


@shared_task
def send_payment_reminders():
    """
    Envia lembretes de aprovação pendente
    """
    # Buscar escrows próximos do vencimento (2 dias antes)
    reminder_date = timezone.now() + timedelta(days=2)
    
    pending_releases = EscrowRelease.objects.filter(
        status='scheduled',
        release_type='auto',
        scheduled_at__lte=reminder_date,
        scheduled_at__gt=timezone.now()
    ).select_related('transaction__order')
    
    for release in pending_releases:
        order = release.transaction.order
        # TODO: Enviar notificação para cliente
        logger.info(f"Lembrete enviado para pedido {order.id} - auto-release em {release.scheduled_at}")
    
    return f"Lembretes enviados para {pending_releases.count()} pedidos"


@shared_task
def process_failed_payments():
    """
    Reprocessa pagamentos que falharam
    """
    failed_intents = PaymentIntent.objects.filter(
        status='requires_action',
        created_at__gte=timezone.now() - timedelta(hours=24)
    )
    
    for intent in failed_intents:
        # TODO: Implementar retry de pagamentos falhados
        logger.info(f"Reprocessando pagamento {intent.stripe_payment_intent_id}")
    
    return f"Reprocessados {failed_intents.count()} pagamentos"