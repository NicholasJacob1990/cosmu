"""
Serviço Completo para integração com Stripe Connect - Sprint 3-4
Gerencia contas Express/Custom, onboarding, webhooks, pagamentos e transferências
"""
import stripe
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from typing import Dict, Any, Optional, List
import logging
import json

logger = logging.getLogger(__name__)

# Configurar Stripe
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', 'sk_test_...')

# Constantes para Stripe Connect
PLATFORM_FEE_PERCENTAGE = Decimal('0.10')  # 10% fee da plataforma
STRIPE_APPLICATION_FEE_PERCENTAGE = Decimal('0.029')  # 2.9% fee do Stripe

class StripeConnectService:
    """Serviço completo para Stripe Connect - Sprint 3-4"""
    
    @staticmethod
    def create_express_account(
        user, 
        account_type: str = 'express',
        country: str = 'BR'
    ) -> Dict[str, Any]:
        """
        Cria uma conta Stripe Connect para um usuário
        
        Args:
            user: Usuário Django
            account_type: Tipo de conta ('express', 'custom', 'standard')
            country: País da conta (padrão 'BR')
        """
        try:
            with transaction.atomic():
                # Verificar se já existe conta
                from ..models import StripeAccount
                existing_account = StripeAccount.objects.filter(user=user).first()
                if existing_account:
                    return {
                        'success': False,
                        'error': 'Usuário já possui conta Stripe',
                        'account': existing_account
                    }
                
                # Preparar dados base
                account_data = {
                    'type': account_type,
                    'country': country,
                    'email': user.email,
                    'business_type': 'individual',
                    'metadata': {
                        'user_id': str(user.id),
                        'platform': 'galaxia',
                        'created_via': 'api'
                    }
                }
                
                # Configurações específicas por tipo
                if account_type == 'express':
                    account_data.update({
                        'capabilities': {
                            'card_payments': {'requested': True},
                            'transfers': {'requested': True},
                        },
                        'settings': {
                            'payouts': {
                                'schedule': {
                                    'interval': 'weekly',  # Pagamentos semanais por padrão
                                    'weekly_anchor': 'friday'
                                }
                            },
                            'branding': {
                                'primary_color': '#6366f1',  # Cor da GalaxIA
                                'secondary_color': '#4f46e5'
                            }
                        }
                    })
                elif account_type == 'custom':
                    account_data.update({
                        'capabilities': {
                            'card_payments': {'requested': True},
                            'transfers': {'requested': True},
                            'tax_reporting_us_1099_k': {'requested': True},
                        },
                        'settings': {
                            'payouts': {
                                'schedule': {
                                    'interval': 'manual'  # Custom accounts têm controle manual
                                }
                            }
                        }
                    })
                
                # Adicionar dados do indivíduo se disponível
                if user.first_name and user.last_name:
                    account_data['individual'] = {
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name
                    }
                
                # Criar conta no Stripe
                stripe_account = stripe.Account.create(**account_data)
                
                # Salvar no banco de dados
                db_account = StripeAccount.objects.create(
                    user=user,
                    stripe_account_id=stripe_account.id,
                    account_type=account_type,
                    status='pending',
                    capabilities=stripe_account.capabilities or {},
                    requirements=stripe_account.requirements or {},
                    settings=stripe_account.settings or {}
                )
                
                logger.info(f"Conta Stripe criada: {stripe_account.id} para usuário {user.id}")
                
                return {
                    'success': True,
                    'account': db_account,
                    'stripe_account': stripe_account,
                    'account_id': stripe_account.id
                }
            
        except stripe.error.StripeError as e:
            logger.error(f"Erro ao criar conta Stripe: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
        except Exception as e:
            logger.error(f"Erro interno ao criar conta Stripe: {str(e)}")
            return {
                'success': False,
                'error': 'Erro interno do servidor'
            }
    
    @staticmethod
    def create_onboarding_link(
        stripe_account_id: str,
        return_url: str,
        refresh_url: str = None
    ) -> Dict[str, Any]:
        """
        Cria link de onboarding automático para completar setup da conta
        
        Args:
            stripe_account_id: ID da conta Stripe Connect
            return_url: URL de retorno após onboarding
            refresh_url: URL para refresh se expirar
        """
        try:
            refresh_url = refresh_url or return_url
            
            account_link = stripe.AccountLink.create(
                account=stripe_account_id,
                return_url=return_url,
                refresh_url=refresh_url,
                type='account_onboarding'
            )
            
            # Atualizar link no banco
            from ..models import StripeAccount
            try:
                db_account = StripeAccount.objects.get(stripe_account_id=stripe_account_id)
                db_account.onboarding_link = account_link.url
                db_account.save()
            except StripeAccount.DoesNotExist:
                logger.warning(f"Conta não encontrada no banco: {stripe_account_id}")
            
            return {
                'success': True,
                'onboarding_url': account_link.url,
                'expires_at': account_link.expires_at
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Erro ao criar link onboarding: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def update_account_status(stripe_account_id: str) -> Dict[str, Any]:
        """
        Atualiza status da conta baseado nos dados do Stripe
        """
        try:
            # Buscar dados atualizados do Stripe
            stripe_account = stripe.Account.retrieve(stripe_account_id)
            
            # Atualizar no banco
            from ..models import StripeAccount
            db_account = StripeAccount.objects.get(stripe_account_id=stripe_account_id)
            
            # Determinar status
            new_status = 'pending'
            if stripe_account.details_submitted and not stripe_account.requirements.currently_due:
                if stripe_account.capabilities.get('transfers') == 'active':
                    new_status = 'verified'
                else:
                    new_status = 'restricted'
            elif stripe_account.requirements.disabled_reason:
                new_status = 'rejected'
            
            # Verificar se onboarding foi completado
            onboarding_completed = (
                stripe_account.details_submitted and 
                not stripe_account.requirements.currently_due
            )
            
            # Atualizar dados
            db_account.status = new_status
            db_account.capabilities = stripe_account.capabilities or {}
            db_account.requirements = stripe_account.requirements or {}
            db_account.settings = stripe_account.settings or {}
            
            if onboarding_completed and not db_account.onboarding_completed:
                db_account.onboarding_completed = True
                db_account.onboarding_completed_at = timezone.now()
            
            db_account.save()
            
            return {
                'success': True,
                'account': db_account,
                'status': new_status,
                'can_receive_payments': db_account.can_receive_payments
            }
            
        except StripeAccount.DoesNotExist:
            return {
                'success': False,
                'error': 'Conta não encontrada no banco de dados'
            }
        except stripe.error.StripeError as e:
            logger.error(f"Erro ao atualizar status da conta: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def create_transfer(
        destination_account_id: str,
        amount: Decimal,
        source_transaction_id: str,
        description: str = "",
        metadata: dict = None
    ) -> Dict[str, Any]:
        """
        Cria transferência para conta Connect
        
        Args:
            destination_account_id: Conta destino Connect
            amount: Valor a transferir
            source_transaction_id: ID da transação original
            description: Descrição da transferência
            metadata: Metadados adicionais
        """
        try:
            # Calcular taxas
            platform_fee = amount * PLATFORM_FEE_PERCENTAGE
            transfer_amount = amount - platform_fee
            
            # Converter para centavos (Stripe usa centavos)
            transfer_amount_cents = int(transfer_amount * 100)
            
            transfer = stripe.Transfer.create(
                amount=transfer_amount_cents,
                currency='brl',
                destination=destination_account_id,
                source_transaction=source_transaction_id,
                description=description or f"Transferência GalaxIA - R$ {transfer_amount}",
                metadata={
                    'platform_fee': str(platform_fee),
                    'original_amount': str(amount),
                    'transfer_amount': str(transfer_amount),
                    **(metadata or {})
                }
            )
            
            return {
                'success': True,
                'transfer': transfer,
                'transfer_id': transfer.id,
                'amount_transferred': transfer_amount,
                'platform_fee': platform_fee
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Erro ao criar transferência: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def create_payout(
        stripe_account_id: str,
        amount: Decimal,
        method: str = 'instant',
        metadata: dict = None
    ) -> Dict[str, Any]:
        """
        Cria saque para conta bancária do Connect account
        """
        try:
            # Converter para centavos
            amount_cents = int(amount * 100)
            
            payout = stripe.Payout.create(
                amount=amount_cents,
                currency='brl',
                method=method,  # 'instant' or 'standard'
                metadata=metadata or {},
                stripe_account=stripe_account_id
            )
            
            return {
                'success': True,
                'payout': payout,
                'payout_id': payout.id,
                'amount': amount,
                'estimated_arrival': payout.arrival_date
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Erro ao criar payout: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }


class StripeService:
    """Serviço original mantido para compatibilidade"""
    
    @staticmethod
    def create_express_account(freelancer_profile) -> Dict[str, Any]:
        """
        Wrapper para compatibilidade - usar StripeConnectService.create_express_account
        """
        try:
            account_link = stripe.AccountLink.create(
                account=account_id,
                return_url=return_url,
                refresh_url=refresh_url,
                type='account_onboarding',
            )
            
            return {
                'success': True,
                'url': account_link.url
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Erro ao criar link de onboarding: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def check_account_status(account_id: str) -> Dict[str, Any]:
        """
        Verifica o status de uma conta Stripe Connect
        """
        try:
            account = stripe.Account.retrieve(account_id)
            
            # Verificar se pode receber pagamentos
            can_receive_payments = (
                account.charges_enabled and 
                account.payouts_enabled and
                account.details_submitted
            )
            
            # Verificar requirements pendentes
            requirements = account.requirements
            
            return {
                'success': True,
                'account': account,
                'can_receive_payments': can_receive_payments,
                'requirements': {
                    'currently_due': requirements.currently_due,
                    'eventually_due': requirements.eventually_due,
                    'past_due': requirements.past_due,
                    'pending_verification': requirements.pending_verification
                }
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Erro ao verificar status da conta: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def create_payment_intent(
        amount: Decimal, 
        freelancer_account_id: str,
        order_id: str,
        platform_fee_percentage: Decimal = Decimal('10.0')
    ) -> Dict[str, Any]:
        """
        Cria um Payment Intent com split automático de comissão
        """
        try:
            # Calcular valores
            amount_cents = int(amount * 100)  # Converter para centavos
            platform_fee = int((amount * platform_fee_percentage / 100) * 100)
            
            # Criar Payment Intent
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='brl',
                automatic_payment_methods={
                    'enabled': True,
                },
                application_fee_amount=platform_fee,
                transfer_data={
                    'destination': freelancer_account_id,
                },
                metadata={
                    'order_id': order_id,
                    'platform': 'galaxia',
                    'type': 'service_payment'
                }
            )
            
            return {
                'success': True,
                'payment_intent': intent,
                'client_secret': intent.client_secret,
                'amount': amount,
                'platform_fee': Decimal(platform_fee) / 100,
                'freelancer_amount': amount - (Decimal(platform_fee) / 100)
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Erro ao criar Payment Intent: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def create_escrow_payment_intent(
        amount: Decimal,
        order_id: str,
        platform_fee_percentage: Decimal = Decimal('10.0')
    ) -> Dict[str, Any]:
        """
        Cria Payment Intent para escrow (sem transferência imediata)
        """
        try:
            amount_cents = int(amount * 100)
            
            # Criar Payment Intent sem transferência automática
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='brl',
                automatic_payment_methods={
                    'enabled': True,
                },
                capture_method='manual',  # Requer captura manual
                metadata={
                    'order_id': order_id,
                    'platform': 'galaxia',
                    'type': 'escrow_payment',
                    'platform_fee_percentage': str(platform_fee_percentage)
                }
            )
            
            return {
                'success': True,
                'payment_intent': intent,
                'client_secret': intent.client_secret,
                'amount': amount
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Erro ao criar Payment Intent para escrow: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def capture_and_transfer_escrow(
        payment_intent_id: str,
        freelancer_account_id: str,
        platform_fee_percentage: Decimal = Decimal('10.0')
    ) -> Dict[str, Any]:
        """
        Captura pagamento em escrow e transfere para o freelancer
        """
        try:
            # Capturar o pagamento
            intent = stripe.PaymentIntent.capture(payment_intent_id)
            
            if intent.status == 'succeeded':
                # Calcular valores
                total_amount = Decimal(intent.amount) / 100
                platform_fee = total_amount * platform_fee_percentage / 100
                freelancer_amount = total_amount - platform_fee
                
                # Criar transferência para o freelancer
                transfer = stripe.Transfer.create(
                    amount=int(freelancer_amount * 100),
                    currency='brl',
                    destination=freelancer_account_id,
                    metadata={
                        'payment_intent_id': payment_intent_id,
                        'platform': 'galaxia',
                        'type': 'escrow_release'
                    }
                )
                
                return {
                    'success': True,
                    'payment_intent': intent,
                    'transfer': transfer,
                    'total_amount': total_amount,
                    'platform_fee': platform_fee,
                    'freelancer_amount': freelancer_amount
                }
            else:
                return {
                    'success': False,
                    'error': f'Pagamento não foi capturado. Status: {intent.status}'
                }
                
        except stripe.error.StripeError as e:
            logger.error(f"Erro ao capturar e transferir escrow: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def refund_payment(payment_intent_id: str, amount: Optional[Decimal] = None) -> Dict[str, Any]:
        """
        Cria reembolso total ou parcial
        """
        try:
            refund_data = {
                'payment_intent': payment_intent_id
            }
            
            if amount:
                refund_data['amount'] = int(amount * 100)
            
            refund = stripe.Refund.create(**refund_data)
            
            return {
                'success': True,
                'refund': refund,
                'amount': Decimal(refund.amount) / 100
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Erro ao criar reembolso: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def create_payout(account_id: str, amount: Decimal) -> Dict[str, Any]:
        """
        Cria um saque manual para conta conectada
        """
        try:
            payout = stripe.Payout.create(
                amount=int(amount * 100),
                currency='brl',
                stripe_account=account_id,
                metadata={
                    'platform': 'galaxia',
                    'type': 'manual_payout'
                }
            )
            
            return {
                'success': True,
                'payout': payout,
                'amount': amount
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Erro ao criar saque: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_balance(account_id: str) -> Dict[str, Any]:
        """
        Obtém saldo disponível de uma conta conectada
        """
        try:
            balance = stripe.Balance.retrieve(stripe_account=account_id)
            
            available = 0
            pending = 0
            
            for available_balance in balance.available:
                if available_balance.currency == 'brl':
                    available = Decimal(available_balance.amount) / 100
                    break
            
            for pending_balance in balance.pending:
                if pending_balance.currency == 'brl':
                    pending = Decimal(pending_balance.amount) / 100
                    break
            
            return {
                'success': True,
                'available': available,
                'pending': pending,
                'balance': balance
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Erro ao obter saldo: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def handle_webhook(payload: bytes, sig_header: str) -> Dict[str, Any]:
        """
        Processa webhooks do Stripe
        """
        endpoint_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
            
            return {
                'success': True,
                'event': event
            }
            
        except ValueError as e:
            logger.error(f"Payload inválido no webhook: {str(e)}")
            return {
                'success': False,
                'error': 'Invalid payload'
            }
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Assinatura inválida no webhook: {str(e)}")
            return {
                'success': False,
                'error': 'Invalid signature'
            }


class EscrowService:
    """Serviço específico para operações de escrow"""
    
    @staticmethod
    def create_escrow(order, amount: Decimal) -> Dict[str, Any]:
        """
        Cria uma custódia para um pedido
        """
        # Criar Payment Intent em modo escrow
        result = StripeService.create_escrow_payment_intent(
            amount=amount,
            order_id=str(order.id)
        )
        
        if result['success']:
            # Atualizar status do pedido
            order.escrow_status = 'held'
            order.save()
            
            # Criar transação
            from ..models import Transaction
            Transaction.objects.create(
                order=order,
                type='payment',
                status='pending',
                amount=amount,
                currency='BRL',
                payment_method='card',
                provider='stripe',
                transaction_id=result['payment_intent'].id,
                metadata={
                    'client_secret': result['client_secret'],
                    'escrow': True
                }
            )
        
        return result
    
    @staticmethod
    def release_escrow(order) -> Dict[str, Any]:
        """
        Libera fundos do escrow para o freelancer
        """
        try:
            # Buscar transação original
            escrow_transaction = order.transactions.filter(
                type='payment',
                provider='stripe',
                status='completed'
            ).first()
            
            if not escrow_transaction:
                return {
                    'success': False,
                    'error': 'Transação de escrow não encontrada'
                }
            
            # Obter account_id do freelancer
            freelancer = order.freelancer
            if not hasattr(freelancer, 'stripe_account_id') or not freelancer.stripe_account_id:
                return {
                    'success': False,
                    'error': 'Freelancer não possui conta Stripe configurada'
                }
            
            # Capturar e transferir
            result = StripeService.capture_and_transfer_escrow(
                payment_intent_id=escrow_transaction.transaction_id,
                freelancer_account_id=freelancer.stripe_account_id
            )
            
            if result['success']:
                # Atualizar status do pedido
                order.escrow_status = 'released'
                order.status = 'completed'
                order.completed_at = timezone.now()
                order.save()
                
                # Criar transação de liberação
                from ..models import Transaction
                Transaction.objects.create(
                    order=order,
                    type='release',
                    status='completed',
                    amount=result['freelancer_amount'],
                    currency='BRL',
                    provider='stripe',
                    transaction_id=result['transfer'].id,
                    metadata={
                        'original_payment': escrow_transaction.transaction_id,
                        'platform_fee': str(result['platform_fee'])
                    }
                )
            
            return result
            
        except Exception as e:
            logger.error(f"Erro ao liberar escrow: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def refund_escrow(order, amount: Optional[Decimal] = None) -> Dict[str, Any]:
        """
        Reembolsa pagamento em escrow
        """
        try:
            # Buscar transação original
            escrow_transaction = order.transactions.filter(
                type='payment',
                provider='stripe',
                status='completed'
            ).first()
            
            if not escrow_transaction:
                return {
                    'success': False,
                    'error': 'Transação de escrow não encontrada'
                }
            
            # Criar reembolso
            result = StripeService.refund_payment(
                payment_intent_id=escrow_transaction.transaction_id,
                amount=amount
            )
            
            if result['success']:
                # Atualizar status do pedido
                order.escrow_status = 'refunded'
                order.status = 'cancelled'
                order.save()
                
                # Criar transação de reembolso
                from ..models import Transaction
                Transaction.objects.create(
                    order=order,
                    type='refund',
                    status='completed',
                    amount=result['amount'],
                    currency='BRL',
                    provider='stripe',
                    transaction_id=result['refund'].id,
                    metadata={
                        'original_payment': escrow_transaction.transaction_id
                    }
                )
            
            return result
            
        except Exception as e:
            logger.error(f"Erro ao reembolsar escrow: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }