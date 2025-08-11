"""
Serviço Completo para Stripe Connect - Sprint 3-4
Sistema avançado de onboarding, webhooks e transferências automáticas
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
    def create_connect_account(
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
                                    'interval': 'weekly',
                                    'weekly_anchor': 'friday'
                                }
                            },
                            'branding': {
                                'primary_color': '#6366f1',
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
                                    'interval': 'manual'
                                }
                            }
                        }
                    })
                
                # Adicionar dados do indivíduo
                if user.first_name and user.last_name:
                    account_data['individual'] = {
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name
                    }
                
                # Criar conta no Stripe
                stripe_account = stripe.Account.create(**account_data)
                
                # Salvar no banco
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
        method: str = 'standard',
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

    @staticmethod
    def create_payment_intent_with_transfer(
        amount: Decimal,
        currency: str,
        destination_stripe_id: str,
        metadata: dict = None
    ) -> Dict[str, Any]:
        """
        Cria uma PaymentIntent com transferência de destino e taxa de aplicação.
        Este é o método recomendado para o fluxo de pagamentos do marketplace.
        """
        try:
            # Converter valor para centavos (menor unidade da moeda)
            amount_cents = int(amount * 100)
            
            # Calcular a taxa da plataforma (application_fee)
            # Esta taxa é retida pela plataforma do valor total da transação.
            application_fee_cents = int(amount_cents * PLATFORM_FEE_PERCENTAGE)

            # Criar a PaymentIntent no Stripe
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency,
                payment_method_types=['card', 'boleto', 'pix'],
                application_fee_amount=application_fee_cents,
                transfer_data={
                    'destination': destination_stripe_id,
                },
                description=f"Pagamento para serviço na plataforma GalaxIA. Total: {amount}",
                metadata=metadata or {}
            )
            
            # TODO: Salvar uma prévia do PaymentIntent no banco de dados aqui se necessário
            
            return {
                'success': True,
                'payment_intent_id': payment_intent.id,
                'client_secret': payment_intent.client_secret,
                'status': payment_intent.status
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Erro Stripe ao criar Payment Intent com transferência: {str(e)}")
            return {'success': False, 'error': str(e)}
        except Exception as e:
            logger.exception("Erro genérico ao criar Payment Intent com transferência")
            return {'success': False, 'error': 'Erro interno do servidor'}
    
    @staticmethod
    def get_balance(stripe_account_id: str) -> Dict[str, Any]:
        """
        Obtém saldo disponível da conta Connect
        """
        try:
            balance = stripe.Balance.retrieve(stripe_account=stripe_account_id)
            
            # Converter de centavos para reais
            available_balance = sum([
                bal.amount for bal in balance.available
                if bal.currency == 'brl'
            ]) / 100
            
            pending_balance = sum([
                bal.amount for bal in balance.pending
                if bal.currency == 'brl'
            ]) / 100
            
            return {
                'success': True,
                'available': Decimal(str(available_balance)),
                'pending': Decimal(str(pending_balance)),
                'currency': 'BRL'
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Erro ao obter saldo: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }


class StripeWebhookService:
    """Serviço para processamento de webhooks do Stripe"""
    
    @staticmethod
    def process_webhook(payload: str, sig_header: str) -> Dict[str, Any]:
        """
        Processa webhook do Stripe com verificação de assinatura
        """
        try:
            endpoint_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')
            
            # Verificar assinatura
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
            
            # Processar evento baseado no tipo
            if event['type'] == 'account.updated':
                return StripeWebhookService._handle_account_updated(event)
            elif event['type'] == 'payment_intent.succeeded':
                return StripeWebhookService._handle_payment_succeeded(event)
            elif event['type'] == 'payment_intent.payment_failed':
                return StripeWebhookService._handle_payment_failed(event)
            elif event['type'] == 'payout.paid':
                return StripeWebhookService._handle_payout_paid(event)
            elif event['type'] == 'payout.failed':
                return StripeWebhookService._handle_payout_failed(event)
            else:
                logger.info(f"Webhook não processado: {event['type']}")
                return {'success': True, 'processed': False}
            
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Webhook signature verification failed: {str(e)}")
            return {'success': False, 'error': 'Invalid signature'}
        except Exception as e:
            logger.error(f"Erro ao processar webhook: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def _handle_account_updated(event) -> Dict[str, Any]:
        """Processa atualização de conta Connect"""
        try:
            account_id = event['data']['object']['id']
            result = StripeConnectService.update_account_status(account_id)
            
            if result['success']:
                logger.info(f"Conta {account_id} atualizada via webhook")
            
            return result
            
        except Exception as e:
            logger.error(f"Erro ao processar account.updated: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def _handle_payment_succeeded(event) -> Dict[str, Any]:
        """Processa pagamento bem-sucedido"""
        try:
            payment_intent = event['data']['object']
            pi_id = payment_intent['id']
            
            # Atualizar PaymentIntent no banco
            from ..models import PaymentIntent
            try:
                db_pi = PaymentIntent.objects.get(stripe_payment_intent_id=pi_id)
                db_pi.status = 'succeeded'
                db_pi.confirmed_at = timezone.now()
                db_pi.save()
                
                # Atualizar Transaction relacionada
                transaction = db_pi.transaction
                transaction.status = 'completed'
                transaction.processed_at = timezone.now()
                transaction.save()
                
                logger.info(f"Payment Intent {pi_id} marcado como sucedido")
                
            except PaymentIntent.DoesNotExist:
                logger.warning(f"PaymentIntent {pi_id} não encontrado no banco")
            
            return {'success': True, 'processed': True}
            
        except Exception as e:
            logger.error(f"Erro ao processar payment_intent.succeeded: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def _handle_payment_failed(event) -> Dict[str, Any]:
        """Processa falha de pagamento"""
        try:
            payment_intent = event['data']['object']
            pi_id = payment_intent['id']
            
            # Atualizar PaymentIntent no banco
            from ..models import PaymentIntent
            try:
                db_pi = PaymentIntent.objects.get(stripe_payment_intent_id=pi_id)
                db_pi.status = 'requires_payment_method'
                db_pi.save()
                
                # Atualizar Transaction relacionada
                transaction = db_pi.transaction
                transaction.status = 'failed'
                transaction.metadata.update({
                    'failure_reason': payment_intent.get('last_payment_error', {}).get('message', 'Unknown')
                })
                transaction.save()
                
                logger.warning(f"Payment Intent {pi_id} falhou")
                
            except PaymentIntent.DoesNotExist:
                logger.warning(f"PaymentIntent {pi_id} não encontrado no banco")
            
            return {'success': True, 'processed': True}
            
        except Exception as e:
            logger.error(f"Erro ao processar payment_intent.payment_failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def _handle_payout_paid(event) -> Dict[str, Any]:
        """Processa payout pago"""
        try:
            payout = event['data']['object']
            payout_id = payout['id']
            
            logger.info(f"Payout {payout_id} foi pago com sucesso")
            
            # TODO: Atualizar PayoutSchedule se necessário
            
            return {'success': True, 'processed': True}
            
        except Exception as e:
            logger.error(f"Erro ao processar payout.paid: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def _handle_payout_failed(event) -> Dict[str, Any]:
        """Processa falha de payout"""
        try:
            payout = event['data']['object']
            payout_id = payout['id']
            
            logger.warning(f"Payout {payout_id} falhou")
            
            # TODO: Notificar usuário sobre falha no saque
            
            return {'success': True, 'processed': True}
            
        except Exception as e:
            logger.error(f"Erro ao processar payout.failed: {str(e)}")
            return {'success': False, 'error': str(e)}