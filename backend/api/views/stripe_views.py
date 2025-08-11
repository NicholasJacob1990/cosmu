"""
Views para Stripe Connect - Sprint 3-4
Onboarding, gestão de contas e webhooks
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse
import logging
import json

from ..models import StripeAccount, PayoutSchedule
from ..serializers import StripeAccountSerializer, PayoutScheduleSerializer
from ..services.stripe_connect import StripeConnectService, StripeWebhookService

logger = logging.getLogger(__name__)


# ============================================================================
# Views de Onboarding
# ============================================================================

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_stripe_account(request):
    """
    Cria conta Stripe Connect para o usuário
    
    POST /api/stripe/accounts/create/
    {
        "account_type": "express",  // ou "custom"
        "country": "BR"
    }
    """
    try:
        data = request.data
        account_type = data.get('account_type', 'express')
        country = data.get('country', 'BR')
        
        # Validar tipo de conta
        if account_type not in ['express', 'custom', 'standard']:
            return Response({
                'error': 'Tipo de conta inválido. Use: express, custom ou standard'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Criar conta
        result = StripeConnectService.create_connect_account(
            user=request.user,
            account_type=account_type,
            country=country
        )
        
        if result['success']:
            return Response({
                'success': True,
                'account_id': result['account_id'],
                'status': result['account'].status,
                'message': 'Conta Stripe criada com sucesso'
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Erro ao criar conta Stripe: {str(e)}")
        return Response({
            'error': 'Erro interno do servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_onboarding_link(request):
    """
    Cria link de onboarding para completar setup
    
    POST /api/stripe/onboarding/
    {
        "return_url": "https://app.galaxia.com/dashboard",
        "refresh_url": "https://app.galaxia.com/onboarding"
    }
    """
    try:
        data = request.data
        return_url = data.get('return_url')
        refresh_url = data.get('refresh_url')
        
        if not return_url:
            return Response({
                'error': 'return_url é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Buscar conta do usuário
        try:
            stripe_account = StripeAccount.objects.get(user=request.user)
        except StripeAccount.DoesNotExist:
            return Response({
                'error': 'Usuário não possui conta Stripe. Crie uma conta primeiro.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Verificar se já está completo
        if stripe_account.onboarding_completed:
            return Response({
                'error': 'Onboarding já foi completado',
                'account_status': stripe_account.status
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Criar link
        result = StripeConnectService.create_onboarding_link(
            stripe_account_id=stripe_account.stripe_account_id,
            return_url=return_url,
            refresh_url=refresh_url
        )
        
        if result['success']:
            return Response({
                'success': True,
                'onboarding_url': result['onboarding_url'],
                'expires_at': result['expires_at'],
                'message': 'Link de onboarding criado com sucesso'
            })
        else:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Erro ao criar link onboarding: {str(e)}")
        return Response({
            'error': 'Erro interno do servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def account_status(request):
    """
    Consulta status atual da conta Stripe do usuário
    
    GET /api/stripe/status/
    """
    try:
        try:
            stripe_account = StripeAccount.objects.get(user=request.user)
        except StripeAccount.DoesNotExist:
            return Response({
                'has_account': False,
                'message': 'Usuário não possui conta Stripe'
            })
        
        # Atualizar status da conta
        result = StripeConnectService.update_account_status(
            stripe_account.stripe_account_id
        )
        
        if result['success']:
            updated_account = result['account']
            
            return Response({
                'has_account': True,
                'account': StripeAccountSerializer(updated_account).data,
                'needs_onboarding': not updated_account.onboarding_completed,
                'can_receive_payments': updated_account.can_receive_payments,
                'requirements': updated_account.requirements.get('currently_due', [])
            })
        else:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Erro ao consultar status: {str(e)}")
        return Response({
            'error': 'Erro interno do servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Views de Pagamentos (Checkout)
# ============================================================================

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_payment_intent(request):
    """
    Cria uma PaymentIntent para iniciar um pagamento.

    POST /api/stripe/create-payment-intent/
    {
        "amount": "150.50",          // Valor total da transação
        "currency": "brl",           // Moeda (default: brl)
        "professional_id": 123,      // ID do profissional que receberá
        "service_id": 456            // ID do serviço/produto sendo comprado
    }
    """
    try:
        data = request.data
        amount_str = data.get('amount')
        professional_id = data.get('professional_id')
        service_id = data.get('service_id')
        currency = data.get('currency', 'brl').lower()

        # --- Validação ---
        if not all([amount_str, professional_id, service_id]):
            return Response(
                {'error': 'Campos amount, professional_id e service_id são obrigatórios.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount_decimal = float(amount_str)
            if amount_decimal <= 0:
                raise ValueError()
        except (ValueError, TypeError):
            return Response(
                {'error': 'O campo amount deve ser um número positivo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # --- Lógica de Negócio ---
        # Buscar a conta Stripe do profissional
        try:
            professional_user = get_object_or_404(settings.AUTH_USER_MODEL, pk=professional_id)
            destination_account = get_object_or_404(StripeAccount, user=professional_user)
        except Exception:
            return Response(
                {'error': 'Profissional ou conta Stripe de destino não encontrada.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not destination_account.can_receive_payments:
            return Response(
                {'error': 'A conta de destino ainda não está habilitada para receber pagamentos.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- Interação com o Serviço Stripe ---
        result = StripeConnectService.create_payment_intent_with_transfer(
            amount=amount_decimal,
            currency=currency,
            destination_stripe_id=destination_account.stripe_account_id,
            metadata={
                'client_id': request.user.id,
                'professional_id': professional_id,
                'service_id': service_id,
                'platform': 'GalaxIA'
            }
        )

        if result['success']:
            return Response({
                'clientSecret': result['client_secret'],
                'paymentIntentId': result['payment_intent_id']
            })
        else:
            logger.error(f"Stripe Error ao criar PaymentIntent: {result.get('error')}")
            return Response(
                {'error': 'Falha ao criar a intenção de pagamento.', 'details': result.get('error')},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    except Exception as e:
        logger.exception("Erro crítico ao criar PaymentIntent")
        return Response(
            {'error': 'Ocorreu um erro interno no servidor.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ============================================================================
# Views de Gestão Financeira
# ============================================================================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def account_balance(request):
    """
    Consulta saldo disponível da conta Stripe
    
    GET /api/stripe/balance/
    """
    try:
        try:
            stripe_account = StripeAccount.objects.get(user=request.user)
        except StripeAccount.DoesNotExist:
            return Response({
                'error': 'Usuário não possui conta Stripe'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not stripe_account.can_receive_payments:
            return Response({
                'error': 'Conta não está verificada para receber pagamentos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Buscar saldo
        result = StripeConnectService.get_balance(
            stripe_account.stripe_account_id
        )
        
        if result['success']:
            return Response({
                'available': result['available'],
                'pending': result['pending'],
                'currency': result['currency'],
                'last_updated': timezone.now()
            })
        else:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Erro ao consultar saldo: {str(e)}")
        return Response({
            'error': 'Erro interno do servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_payout(request):
    """
    Cria saque para conta bancária
    
    POST /api/stripe/payout/
    {
        "amount": "100.00",
        "method": "standard"  // ou "instant"
    }
    """
    try:
        data = request.data
        amount = data.get('amount')
        method = data.get('method', 'standard')
        
        if not amount:
            return Response({
                'error': 'amount é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError()
        except (ValueError, TypeError):
            return Response({
                'error': 'amount deve ser um número positivo'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Buscar conta do usuário
        try:
            stripe_account = StripeAccount.objects.get(user=request.user)
        except StripeAccount.DoesNotExist:
            return Response({
                'error': 'Usuário não possui conta Stripe'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not stripe_account.can_receive_payments:
            return Response({
                'error': 'Conta não está verificada para criar saques'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Criar payout
        result = StripeConnectService.create_payout(
            stripe_account_id=stripe_account.stripe_account_id,
            amount=amount,
            method=method,
            metadata={
                'user_id': str(request.user.id),
                'created_via': 'api'
            }
        )
        
        if result['success']:
            return Response({
                'success': True,
                'payout_id': result['payout_id'],
                'amount': result['amount'],
                'estimated_arrival': result['estimated_arrival'],
                'message': 'Saque criado com sucesso'
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Erro ao criar payout: {str(e)}")
        return Response({
            'error': 'Erro interno do servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Views de Configuração
# ============================================================================

class PayoutScheduleView(generics.RetrieveUpdateAPIView):
    """
    Gestão de cronograma de pagamentos
    
    GET /api/stripe/payout-schedule/
    PUT /api/stripe/payout-schedule/
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PayoutScheduleSerializer
    
    def get_object(self):
        stripe_account = get_object_or_404(
            StripeAccount, 
            user=self.request.user
        )
        
        # Criar PayoutSchedule se não existir
        payout_schedule, created = PayoutSchedule.objects.get_or_create(
            stripe_account=stripe_account,
            defaults={
                'interval': 'weekly',
                'delay_days': 2,
                'minimum_amount': 50.00
            }
        )
        
        return payout_schedule


# ============================================================================
# Webhooks
# ============================================================================

@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook(request):
    """
    Endpoint para receber webhooks do Stripe
    
    POST /api/stripe/webhooks/
    """
    try:
        payload = request.body.decode('utf-8')
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        if not sig_header:
            logger.error("Webhook sem assinatura Stripe")
            return HttpResponse(status=400)
        
        # Processar webhook
        result = StripeWebhookService.process_webhook(payload, sig_header)
        
        if result['success']:
            return HttpResponse(status=200)
        else:
            logger.error(f"Erro ao processar webhook: {result['error']}")
            return HttpResponse(status=400)
            
    except Exception as e:
        logger.error(f"Erro no webhook Stripe: {str(e)}")
        return HttpResponse(status=500)


# ============================================================================
# Views de Dashboard
# ============================================================================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def stripe_dashboard(request):
    """
    Dashboard completo da conta Stripe
    
    GET /api/stripe/dashboard/
    """
    try:
        try:
            stripe_account = StripeAccount.objects.get(user=request.user)
        except StripeAccount.DoesNotExist:
            return Response({
                'has_account': False,
                'onboarding_needed': True
            })
        
        # Buscar dados atualizados
        status_result = StripeConnectService.update_account_status(
            stripe_account.stripe_account_id
        )
        
        dashboard_data = {
            'account': StripeAccountSerializer(stripe_account).data,
            'has_account': True,
            'onboarding_needed': not stripe_account.onboarding_completed,
            'can_receive_payments': stripe_account.can_receive_payments,
            'requirements': stripe_account.requirements.get('currently_due', []),
            'balance': None,
            'recent_transfers': [],
            'recent_payouts': []
        }
        
        # Se conta está ativa, buscar mais dados
        if stripe_account.can_receive_payments:
            # Buscar saldo
            balance_result = StripeConnectService.get_balance(
                stripe_account.stripe_account_id
            )
            if balance_result['success']:
                dashboard_data['balance'] = {
                    'available': balance_result['available'],
                    'pending': balance_result['pending'],
                    'currency': balance_result['currency']
                }
            
            # TODO: Buscar transferências e payouts recentes
        
        return Response(dashboard_data)
        
    except Exception as e:
        logger.error(f"Erro no dashboard Stripe: {str(e)}")
        return Response({
            'error': 'Erro interno do servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)