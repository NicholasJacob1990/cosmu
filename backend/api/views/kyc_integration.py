"""
Views específicas para integração com SDKs dos provedores KYC
"""

import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

from ..services.kyc_router import kyc_router, get_kyc_provider
from ..models import KYCDocument

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kyc_recommend_provider(request):
    """
    Endpoint para frontend consultar qual provedor usar
    Baseado no roteamento inteligente + requisitos do usuário
    """
    try:
        user = request.user
        
        # Analisar requisitos da solicitação
        needs_biometric = request.data.get('needs_biometric', True)
        needs_pep = request.data.get('needs_pep', True)
        integration_type = request.data.get('integration_type', 'hosted')  # hosted, embedded, sdk
        
        # Usar roteador inteligente
        recommended_provider = kyc_router.choose_provider(
            user=user,
            needs_biometric=needs_biometric,
            needs_pep=needs_pep
        )
        
        # Buscar configurações específicas do provedor
        provider_config = {
            'provider': recommended_provider,
            'integration_type': integration_type,
            'capabilities': {
                'biometric': needs_biometric,
                'pep': needs_pep,
                'documents': True
            }
        }
        
        # Adicionar configurações específicas por provedor
        if recommended_provider == 'stripe':
            provider_config.update({
                'publishable_key': settings.KYC_PROVIDERS.get('stripe', {}).get('publishable_key'),
                'supports_hosted': True,
                'supports_embedded': True,
                'supported_documents': ['passport', 'driving_license', 'id_card']
            })
        elif recommended_provider == 'idwall':
            provider_config.update({
                'public_key': settings.KYC_PROVIDERS.get('idwall', {}).get('public_key'),
                'supports_widget': True,
                'supports_pep': True,
                'supported_documents': ['rg', 'cnh', 'cpf', 'cnpj']
            })
        elif recommended_provider == 'unico':
            provider_config.update({
                'host_key': settings.KYC_PROVIDERS.get('unico', {}).get('host_key'),
                'supports_liveness': True,
                'accuracy_rate': 0.99,
                'supported_documents': ['rg', 'cnh', 'passport']
            })
        
        return Response({
            'success': True,
            'recommendation': provider_config,
            'routing_reason': f'Selected based on utility score and user requirements'
        })
        
    except Exception as e:
        logger.error(f"Error recommending KYC provider: {str(e)}")
        return Response(
            {'success': False, 'error': 'Failed to recommend provider'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stripe_create_session(request):
    """
    Criar sessão Stripe Identity (hosted ou embedded)
    """
    try:
        user = request.user
        integration_type = request.data.get('integration_type', 'hosted')
        return_url = request.data.get('return_url', 'https://app.galaxia.com/kyc/callback')
        
        # Instanciar provedor Stripe
        stripe_provider = get_kyc_provider('stripe')
        
        # Preparar payload
        payload = {
            'integration_type': integration_type,
            'return_url': return_url,
            'user_data': {
                'email': user.email,
                'name': user.get_full_name()
            }
        }
        
        # Criar sessão (simulada por enquanto)
        import stripe
        stripe.api_key = settings.KYC_PROVIDERS.get('stripe', {}).get('api_key', '')
        
        session_config = {
            'type': 'document',
            'metadata': {
                'user_id': str(user.id),
                'marketplace': 'galaxia'
            },
            'options': {
                'document': {
                    'allowed_types': ['driving_license', 'passport', 'id_card'],
                    'require_id_number': True,
                    'require_live_capture': True,
                    'require_matching_selfie': True
                }
            }
        }
        
        if integration_type == 'embedded':
            session_config['return_url'] = return_url
        
        verification_session = stripe.identity.VerificationSession.create(**session_config)
        
        # Criar registro no banco
        document = KYCDocument.objects.create(
            user=user,
            document_type='passport',  # Default
            status='pending',
            verification_provider='stripe',
            external_id=verification_session.id
        )
        
        response_data = {
            'success': True,
            'session_id': verification_session.id,
            'document_id': str(document.id)
        }
        
        if integration_type == 'hosted':
            response_data['session_url'] = verification_session.url
        else:
            response_data['client_secret'] = verification_session.client_secret
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Error creating Stripe session: {str(e)}")
        return Response(
            {'success': False, 'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def idwall_widget_config(request):
    """
    Configuração para Idwall Widget JS
    """
    try:
        user = request.user
        
        config = {
            'success': True,
            'config': {
                'public_key': settings.KYC_PROVIDERS.get('idwall', {}).get('public_key'),
                'environment': 'sandbox',  # TODO: usar settings
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'name': user.get_full_name()
                },
                'services': ['documents', 'face_match', 'pep_check'],
                'theme': {
                    'primary_color': '#6366f1',
                    'border_radius': '8px',
                    'font_family': 'Inter, sans-serif'
                },
                'callbacks': {
                    'success_url': '/api/kyc/idwall/callback',
                    'error_url': '/api/kyc/idwall/error'
                }
            }
        }
        
        return Response(config)
        
    except Exception as e:
        logger.error(f"Error creating Idwall config: {str(e)}")
        return Response(
            {'success': False, 'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unico_capture_config(request):
    """
    Configuração para Unico Web Capture SDK
    """
    try:
        user = request.user
        
        config = {
            'success': True,
            'config': {
                'host_key': settings.KYC_PROVIDERS.get('unico', {}).get('host_key'),
                'host_info': 'galaxia-marketplace',
                'user': {
                    'id': str(user.id),
                    'cpf': getattr(user, 'cpf', None)  # Se disponível
                },
                'document_options': {
                    'types': ['RG', 'CNH', 'PASSPORT'],
                    'quality': 'high',
                    'auto_capture': True
                },
                'selfie_options': {
                    'liveness': True,
                    'quality': 'high',
                    'timeout': 30
                },
                'webhook_url': '/api/kyc/unico/callback'
            }
        }
        
        return Response(config)
        
    except Exception as e:
        logger.error(f"Error creating Unico config: {str(e)}")
        return Response(
            {'success': False, 'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_sdk_result(request):
    """
    Processa resultado de verificação vinda de SDK frontend
    """
    try:
        user = request.user
        provider = request.data.get('provider')
        result_data = request.data.get('result')
        
        if not provider or not result_data:
            return Response(
                {'success': False, 'error': 'Missing provider or result data'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Disparar task assíncrona para processar resultado
        from ..tasks.kyc_tasks import process_sdk_kyc_result
        
        task = process_sdk_kyc_result.delay(
            user_id=user.id,
            provider=provider,
            result_data=result_data
        )
        
        return Response({
            'success': True,
            'task_id': task.id,
            'message': 'SDK result queued for processing'
        })
        
    except Exception as e:
        logger.error(f"Error processing SDK result: {str(e)}")
        return Response(
            {'success': False, 'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kyc_status(request):
    """
    Consultar status atual do KYC do usuário
    """
    try:
        user = request.user
        
        # Buscar última verificação
        latest_verification = KYCDocument.objects.filter(
            user=user
        ).order_by('-created_at').first()
        
        if not latest_verification:
            return Response({
                'status': 'not_started',
                'message': 'KYC not initiated'
            })
        
        return Response({
            'status': latest_verification.status,
            'provider': latest_verification.verification_provider,
            'confidence_score': latest_verification.confidence_score,
            'created_at': latest_verification.created_at,
            'processed_at': latest_verification.processed_at,
            'rejection_reason': latest_verification.rejection_reason
        })
        
    except Exception as e:
        logger.error(f"Error checking KYC status: {str(e)}")
        return Response(
            {'success': False, 'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )