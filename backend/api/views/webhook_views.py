"""
Views para processamento de webhooks de provedores KYC
Seguindo padrões de segurança e validação HMAC
"""

import hashlib
import hmac
import json
import logging
from typing import Dict, Any

from django.conf import settings
from django.http import HttpResponse, HttpResponseBadRequest
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.views.generic import View
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..tasks.kyc_tasks import process_kyc_webhook

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class IdwallWebhookView(View):
    """
    Webhook receiver para Idwall
    
    Valida assinatura HMAC e processa eventos assincronamente
    """
    
    def post(self, request, *args, **kwargs):
        try:
            # Validar Content-Type
            if not request.content_type == 'application/json':
                logger.warning(f"Invalid content type from Idwall: {request.content_type}")
                return HttpResponseBadRequest("Invalid content type")
            
            # Extrair dados
            payload = request.body
            signature = request.META.get('HTTP_X_IDWALL_SIGNATURE', '')
            
            # Validar assinatura HMAC
            if not self.validate_signature(payload, signature):
                logger.error("Invalid Idwall webhook signature")
                return HttpResponseBadRequest("Invalid signature")
            
            # Parse JSON
            try:
                webhook_data = json.loads(payload.decode('utf-8'))
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON in Idwall webhook: {str(e)}")
                return HttpResponseBadRequest("Invalid JSON")
            
            # Log webhook recebido
            logger.info(f"Received Idwall webhook: {webhook_data.get('event_type', 'unknown')}")
            
            # Processar assincronamente
            process_kyc_webhook.delay(webhook_data, provider='idwall')
            
            # Responder imediatamente para o Idwall
            return HttpResponse("OK", status=200)
            
        except Exception as exc:
            logger.error(f"Error processing Idwall webhook: {str(exc)}")
            return HttpResponseBadRequest("Internal error")
    
    def validate_signature(self, payload: bytes, signature: str) -> bool:
        """
        Valida assinatura HMAC do Idwall
        
        Args:
            payload: Raw payload do webhook
            signature: Assinatura recebida no header
        
        Returns:
            True se válida, False caso contrário
        """
        try:
            secret = settings.KYC_PROVIDERS.get('idwall', {}).get('webhook_secret', '')
            if not secret:
                logger.error("Idwall webhook secret not configured")
                return False
            
            # Calcular HMAC esperado
            expected_signature = hmac.new(
                secret.encode('utf-8'),
                payload,
                hashlib.sha256
            ).hexdigest()
            
            # Comparar assinaturas (timing-safe)
            return hmac.compare_digest(f"sha256={expected_signature}", signature)
            
        except Exception as exc:
            logger.error(f"Error validating Idwall signature: {str(exc)}")
            return False


@method_decorator(csrf_exempt, name='dispatch')
class UnicoWebhookView(View):
    """
    Webhook receiver para Unico
    """
    
    def post(self, request, *args, **kwargs):
        try:
            # Validação similar ao Idwall
            payload = request.body
            signature = request.META.get('HTTP_X_UNICO_SIGNATURE', '')
            
            if not self.validate_signature(payload, signature):
                logger.error("Invalid Unico webhook signature")
                return HttpResponseBadRequest("Invalid signature")
            
            try:
                webhook_data = json.loads(payload.decode('utf-8'))
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON in Unico webhook: {str(e)}")
                return HttpResponseBadRequest("Invalid JSON")
            
            logger.info(f"Received Unico webhook: {webhook_data.get('event', 'unknown')}")
            
            # Processar assincronamente
            process_kyc_webhook.delay(webhook_data, provider='unico')
            
            return HttpResponse("OK", status=200)
            
        except Exception as exc:
            logger.error(f"Error processing Unico webhook: {str(exc)}")
            return HttpResponseBadRequest("Internal error")
    
    def validate_signature(self, payload: bytes, signature: str) -> bool:
        """Valida assinatura HMAC do Unico"""
        try:
            secret = settings.KYC_PROVIDERS.get('unico', {}).get('webhook_secret', '')
            if not secret:
                logger.error("Unico webhook secret not configured")
                return False
            
            expected_signature = hmac.new(
                secret.encode('utf-8'),
                payload,
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(f"sha256={expected_signature}", signature)
            
        except Exception as exc:
            logger.error(f"Error validating Unico signature: {str(exc)}")
            return False


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def stripe_identity_webhook(request):
    """
    Webhook para Stripe Identity
    
    Reutiliza a validação do webhook do Stripe já existente
    """
    try:
        # Validar assinatura Stripe (usando lógica existente)
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        
        if not validate_stripe_signature(payload, sig_header):
            logger.error("Invalid Stripe Identity webhook signature")
            return Response(
                {'error': 'Invalid signature'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            webhook_data = json.loads(payload.decode('utf-8'))
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in Stripe webhook: {str(e)}")
            return Response(
                {'error': 'Invalid JSON'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Filtrar apenas eventos do Identity
        event_type = webhook_data.get('type', '')
        if not event_type.startswith('identity.'):
            logger.debug(f"Ignoring non-identity Stripe event: {event_type}")
            return Response({'status': 'ignored'}, status=200)
        
        logger.info(f"Received Stripe Identity webhook: {event_type}")
        
        # Processar assincronamente
        process_kyc_webhook.delay(webhook_data, provider='stripe')
        
        return Response({'status': 'ok'}, status=200)
        
    except Exception as exc:
        logger.error(f"Error processing Stripe Identity webhook: {str(exc)}")
        return Response(
            {'error': 'Internal error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def validate_stripe_signature(payload: bytes, signature: str) -> bool:
    """
    Valida assinatura do webhook Stripe
    
    Args:
        payload: Raw payload do webhook
        signature: Assinatura recebida no header
    
    Returns:
        True se válida, False caso contrário
    """
    try:
        import stripe
        
        endpoint_secret = settings.KYC_PROVIDERS.get('stripe', {}).get('webhook_secret', '')
        if not endpoint_secret:
            logger.error("Stripe webhook secret not configured")
            return False
        
        # Usar biblioteca oficial do Stripe para validação
        try:
            stripe.Webhook.construct_event(
                payload, signature, endpoint_secret
            )
            return True
        except stripe.error.SignatureVerificationError:
            return False
        except ValueError:
            # Invalid payload
            return False
            
    except ImportError:
        logger.error("Stripe library not available for signature validation")
        return False
    except Exception as exc:
        logger.error(f"Error validating Stripe signature: {str(exc)}")
        return False


@api_view(['GET'])
@permission_classes([AllowAny])
def webhook_health_check(request):
    """
    Health check endpoint para monitoramento de webhooks
    """
    try:
        from ..models import VerificationLog
        from datetime import timedelta
        from django.utils import timezone
        
        # Verificar se webhooks estão sendo processados
        recent_time = timezone.now() - timedelta(hours=1)
        recent_webhooks = VerificationLog.objects.filter(
            created_at__gte=recent_time
        ).count()
        
        # Status dos provedores
        providers_status = {}
        for provider_name in ['idwall', 'unico', 'stripe']:
            provider_config = settings.KYC_PROVIDERS.get(provider_name, {})
            providers_status[provider_name] = {
                'enabled': provider_config.get('enabled', False),
                'has_secret': bool(provider_config.get('webhook_secret', '')),
                'recent_webhooks': VerificationLog.objects.filter(
                    provider__slug=provider_name,
                    created_at__gte=recent_time
                ).count()
            }
        
        return Response({
            'status': 'healthy',
            'recent_webhooks_1h': recent_webhooks,
            'providers': providers_status,
            'timestamp': timezone.now().isoformat()
        })
        
    except Exception as exc:
        logger.error(f"Error in webhook health check: {str(exc)}")
        return Response(
            {
                'status': 'unhealthy',
                'error': str(exc),
                'timestamp': timezone.now().isoformat()
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@require_http_methods(["POST"])
@csrf_exempt
def test_webhook_endpoint(request):
    """
    Endpoint de teste para validar processamento de webhooks
    Deve ser removido em produção
    """
    if not settings.DEBUG:
        return HttpResponseBadRequest("Not available in production")
    
    try:
        payload = json.loads(request.body.decode('utf-8'))
        provider = payload.get('provider', 'test')
        
        logger.info(f"Test webhook received for provider: {provider}")
        
        # Processar como webhook real
        process_kyc_webhook.delay(payload, provider=provider)
        
        return HttpResponse("Test webhook processed", status=200)
        
    except Exception as exc:
        logger.error(f"Error in test webhook: {str(exc)}")
        return HttpResponseBadRequest(f"Error: {str(exc)}")


class WebhookMetricsView(View):
    """
    View para métricas de webhooks (apenas para staff)
    """
    
    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_staff:
            return HttpResponseBadRequest("Unauthorized")
        
        try:
            from ..models import VerificationLog
            from datetime import timedelta
            from django.utils import timezone
            from django.db.models import Count, Avg
            
            # Métricas dos últimos 7 dias
            week_ago = timezone.now() - timedelta(days=7)
            
            metrics = {
                'total_webhooks_7d': VerificationLog.objects.filter(
                    created_at__gte=week_ago
                ).count(),
                
                'success_rate_7d': VerificationLog.objects.filter(
                    created_at__gte=week_ago
                ).aggregate(
                    success_rate=Avg('success')
                )['success_rate'] or 0,
                
                'avg_response_time_7d': VerificationLog.objects.filter(
                    created_at__gte=week_ago
                ).aggregate(
                    avg_time=Avg('response_time')
                )['avg_time'] or 0,
                
                'by_provider_7d': list(
                    VerificationLog.objects.filter(
                        created_at__gte=week_ago
                    ).values('provider__name').annotate(
                        count=Count('id'),
                        success_rate=Avg('success')
                    )
                )
            }
            
            return HttpResponse(
                json.dumps(metrics, default=str, indent=2),
                content_type='application/json'
            )
            
        except Exception as exc:
            logger.error(f"Error generating webhook metrics: {str(exc)}")
            return HttpResponseBadRequest(f"Error: {str(exc)}")


# Mapeamento de URLs para facilitar configuração
webhook_url_patterns = [
    ('kyc/webhooks/idwall/', IdwallWebhookView.as_view(), 'idwall_webhook'),
    ('kyc/webhooks/unico/', UnicoWebhookView.as_view(), 'unico_webhook'),
    ('kyc/webhooks/stripe-identity/', stripe_identity_webhook, 'stripe_identity_webhook'),
    ('kyc/webhooks/health/', webhook_health_check, 'webhook_health'),
    ('kyc/webhooks/metrics/', WebhookMetricsView.as_view(), 'webhook_metrics'),
]

# Apenas em desenvolvimento
if settings.DEBUG:
    webhook_url_patterns.append(
        ('kyc/webhooks/test/', test_webhook_endpoint, 'test_webhook')
    )