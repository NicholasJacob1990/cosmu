"""
Views para Sistema KYC (Know Your Customer) - GalaxIA Marketplace
APIs para upload, verificação e gestão de documentos KYC
"""

import json
import logging
from typing import Dict, Any
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import transaction
from django.utils import timezone

from .models import (
    KYCDocument, BiometricVerification, KYCProfile, 
    DocumentType, VerificationStatus, KYCLevel
)
from .services.kyc_service import kyc_service
from .serializers_kyc import (
    KYCDocumentSerializer, BiometricVerificationSerializer,
    KYCProfileSerializer, DocumentUploadSerializer
)

User = get_user_model()
logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_document(request):
    """
    Upload de documento para verificação KYC
    
    Parâmetros:
    - document_type: Tipo do documento (rg, cpf, cnh, passport, etc.)
    - file: Arquivo do documento (imagem ou PDF)
    - metadata: Metadados opcionais (JSON string)
    """
    try:
        serializer = DocumentUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Dados inválidos', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        document_type = serializer.validated_data['document_type']
        file = serializer.validated_data['file']
        metadata = serializer.validated_data.get('metadata', {})
        
        # Validações específicas por tipo de documento
        validation_result = _validate_document_upload(document_type, file, request.user)
        if not validation_result['valid']:
            return Response(
                {'error': validation_result['message']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Upload e criação do documento
        with transaction.atomic():
            document = kyc_service.upload_document(
                user=request.user,
                document_type=document_type,
                file=file,
                metadata=metadata
            )
            
            # Iniciar verificação assíncrona
            task_id = kyc_service.verify_document_async(document)
        
        return Response({
            'success': True,
            'document_id': str(document.id),
            'status': document.status,
            'task_id': task_id,
            'message': 'Documento enviado com sucesso. Verificação em processamento.'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error uploading document for user {request.user.id}: {str(e)}")
        return Response(
            {'error': 'Erro interno do servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_biometric(request):
    """
    Upload de dados biométricos (selfie + liveness)
    
    Parâmetros:
    - selfie: Arquivo da selfie
    - liveness_video: Vídeo de liveness (opcional)
    - device_info: Informações do dispositivo (JSON string)
    - geolocation: Coordenadas GPS (JSON string)
    """
    try:
        # Validar arquivos obrigatórios
        if 'selfie' not in request.FILES:
            return Response(
                {'error': 'Selfie é obrigatória'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        selfie_file = request.FILES['selfie']
        liveness_video = request.FILES.get('liveness_video')
        
        # Parsear dados JSON
        device_info = {}
        geolocation = {}
        
        if 'device_info' in request.data:
            try:
                device_info = json.loads(request.data['device_info'])
            except json.JSONDecodeError:
                device_info = {}
        
        if 'geolocation' in request.data:
            try:
                geolocation = json.loads(request.data['geolocation'])
            except json.JSONDecodeError:
                geolocation = {}
        
        # Validações de arquivo
        validation_result = _validate_biometric_upload(selfie_file, liveness_video)
        if not validation_result['valid']:
            return Response(
                {'error': validation_result['message']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar biometria
        with transaction.atomic():
            biometric = kyc_service.verify_biometric(
                user=request.user,
                selfie_file=selfie_file,
                liveness_video_file=liveness_video,
                device_info=device_info
            )
        
        return Response({
            'success': True,
            'biometric_id': str(biometric.id),
            'status': biometric.status,
            'liveness_score': biometric.liveness_score,
            'quality_score': biometric.quality_score,
            'message': 'Verificação biométrica iniciada.'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error uploading biometric for user {request.user.id}: {str(e)}")
        return Response(
            {'error': 'Erro interno do servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def verification_status(request):
    """
    Obtém status completo de verificação KYC do usuário
    """
    try:
        verification_data = kyc_service.get_user_verification_status(request.user)
        
        return Response({
            'success': True,
            'data': verification_data
        })
        
    except Exception as e:
        logger.error(f"Error getting verification status for user {request.user.id}: {str(e)}")
        return Response(
            {'error': 'Erro ao obter status de verificação'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_documents(request):
    """
    Lista documentos KYC do usuário
    """
    try:
        documents = KYCDocument.objects.filter(user=request.user).order_by('-uploaded_at')
        serializer = KYCDocumentSerializer(documents, many=True)
        
        return Response({
            'success': True,
            'documents': serializer.data
        })
        
    except Exception as e:
        logger.error(f"Error listing documents for user {request.user.id}: {str(e)}")
        return Response(
            {'error': 'Erro ao listar documentos'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def verification_levels(request):
    """
    Retorna informações sobre os níveis de verificação disponíveis
    """
    try:
        user_profile, created = KYCProfile.objects.get_or_create(user=request.user)
        
        levels = [
            {
                'level': KYCLevel.BASIC,
                'name': 'Cadastro Básico ⭐',
                'description': 'Email e telefone verificados',
                'benefits': [
                    'Propostas básicas até R$ 500',
                    '5 propostas por dia',
                    'Comissão 15%'
                ],
                'requirements': [
                    'Email verificado',
                    'Telefone verificado',
                    'CPF válido',
                    'Perfil 80% completo'
                ],
                'is_current': user_profile.current_level == KYCLevel.BASIC,
                'is_available': True,
                'estimated_time': '5 minutos'
            },
            {
                'level': KYCLevel.IDENTITY_VERIFIED,
                'name': 'Identidade Verificada ⭐⭐',
                'description': 'Documentos e biometria verificados',
                'benefits': [
                    'Projetos até R$ 5.000',
                    '10 propostas por dia',
                    'Comissão 12%',
                    'Badge "Identidade Verificada"'
                ],
                'requirements': [
                    'Todos do nível anterior',
                    'Documento oficial com foto',
                    'Comprovante de endereço',
                    'Verificação biométrica facial'
                ],
                'is_current': user_profile.current_level == KYCLevel.IDENTITY_VERIFIED,
                'is_available': user_profile.can_upgrade_to_level(KYCLevel.IDENTITY_VERIFIED),
                'estimated_time': '24-48 horas'
            },
            {
                'level': KYCLevel.PROFESSIONAL_VERIFIED,
                'name': 'Profissional Verificado ⭐⭐⭐',
                'description': 'Qualificações profissionais validadas',
                'benefits': [
                    'Projetos até R$ 25.000',
                    '20 propostas por dia',
                    'Comissão 10%',
                    'Destaque nas buscas'
                ],
                'requirements': [
                    'Todos do nível anterior',
                    'Diploma/certificações validadas',
                    'Referências profissionais',
                    'Portfolio autenticado'
                ],
                'is_current': user_profile.current_level == KYCLevel.PROFESSIONAL_VERIFIED,
                'is_available': user_profile.can_upgrade_to_level(KYCLevel.PROFESSIONAL_VERIFIED),
                'estimated_time': '3-5 dias úteis'
            },
            {
                'level': KYCLevel.GALAXIA_ELITE,
                'name': 'GalaxIA Elite ⭐⭐⭐⭐⭐',
                'description': 'Máximo nível de confiança',
                'benefits': [
                    'Projetos ilimitados',
                    'Comissão 7%',
                    'Gerente de conta dedicado',
                    'Marketing conjunto'
                ],
                'requirements': [
                    'Todos do nível anterior',
                    '6+ meses na plataforma',
                    '20+ projetos concluídos',
                    'Rating 4.8/5.0+',
                    'Entrevista por vídeo'
                ],
                'is_current': user_profile.current_level == KYCLevel.GALAXIA_ELITE,
                'is_available': user_profile.can_upgrade_to_level(KYCLevel.GALAXIA_ELITE),
                'estimated_time': '1-2 semanas'
            }
        ]
        
        return Response({
            'success': True,
            'current_level': user_profile.current_level,
            'trust_score': user_profile.overall_trust_score,
            'levels': levels
        })
        
    except Exception as e:
        logger.error(f"Error getting verification levels for user {request.user.id}: {str(e)}")
        return Response(
            {'error': 'Erro ao obter níveis de verificação'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def retry_verification(request, document_id):
    """
    Reprocessa verificação de um documento rejeitado
    """
    try:
        document = KYCDocument.objects.get(
            id=document_id,
            user=request.user
        )
        
        if document.status not in [VerificationStatus.REJECTED, VerificationStatus.MANUAL_REVIEW]:
            return Response(
                {'error': 'Documento não pode ser reprocessado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Resetar status e tentar novamente
        document.status = VerificationStatus.PENDING
        document.rejection_reason = ''
        document.save()
        
        verification_started = kyc_service.verify_document(document)
        
        return Response({
            'success': True,
            'verification_started': verification_started,
            'status': document.status,
            'message': 'Verificação reiniciada com sucesso.'
        })
        
    except KYCDocument.DoesNotExist:
        return Response(
            {'error': 'Documento não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error retrying verification for document {document_id}: {str(e)}")
        return Response(
            {'error': 'Erro ao reiniciar verificação'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Admin Views (apenas para staff)

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def pending_verifications(request):
    """
    Lista verificações pendentes para revisão manual (Admin only)
    """
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        status_filter = request.GET.get('status', VerificationStatus.MANUAL_REVIEW)
        
        documents = KYCDocument.objects.filter(
            status=status_filter
        ).select_related('user').order_by('uploaded_at')
        
        total = documents.count()
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated_documents = documents[start:end]
        serializer = KYCDocumentSerializer(paginated_documents, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'pages': (total + page_size - 1) // page_size
            }
        })
        
    except Exception as e:
        logger.error(f"Error listing pending verifications: {str(e)}")
        return Response(
            {'error': 'Erro ao listar verificações pendentes'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def manual_approve_document(request, document_id):
    """
    Aprovação manual de documento (Admin only)
    """
    try:
        document = KYCDocument.objects.get(id=document_id)
        
        action = request.data.get('action')  # 'approve' or 'reject'
        reason = request.data.get('reason', '')
        
        if action not in ['approve', 'reject']:
            return Response(
                {'error': 'Ação deve ser "approve" ou "reject"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            if action == 'approve':
                document.mark_as_processed(
                    VerificationStatus.APPROVED,
                    verified_by=request.user
                )
                kyc_service._update_kyc_profile_from_document(document)
                message = 'Documento aprovado com sucesso'
            else:
                document.rejection_reason = reason
                document.mark_as_processed(VerificationStatus.REJECTED)
                message = 'Documento rejeitado'
        
        return Response({
            'success': True,
            'message': message,
            'status': document.status
        })
        
    except KYCDocument.DoesNotExist:
        return Response(
            {'error': 'Documento não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error in manual document approval {document_id}: {str(e)}")
        return Response(
            {'error': 'Erro na aprovação manual'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Funções auxiliares

def _validate_document_upload(document_type: str, file: InMemoryUploadedFile, user: User) -> Dict[str, Any]:
    """Valida upload de documento"""
    
    # Verificar tipo de arquivo
    allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if file.content_type not in allowed_types:
        return {
            'valid': False,
            'message': f'Tipo de arquivo não permitido: {file.content_type}'
        }
    
    # Verificar tamanho (máximo 10MB)
    max_size = 10 * 1024 * 1024  # 10MB
    if file.size > max_size:
        return {
            'valid': False,
            'message': f'Arquivo muito grande. Máximo: {max_size // (1024*1024)}MB'
        }
    
    # Verificar se já existe documento do mesmo tipo aprovado
    existing_approved = KYCDocument.objects.filter(
        user=user,
        document_type=document_type,
        status=VerificationStatus.APPROVED
    ).exists()
    
    if existing_approved:
        return {
            'valid': False,
            'message': f'Já existe um {document_type} aprovado para este usuário'
        }
    
    return {'valid': True}


def _validate_biometric_upload(selfie_file: InMemoryUploadedFile, liveness_video: InMemoryUploadedFile = None) -> Dict[str, Any]:
    """Valida upload de dados biométricos"""
    
    # Validar selfie
    if selfie_file.content_type not in ['image/jpeg', 'image/png', 'image/webp']:
        return {
            'valid': False,
            'message': 'Selfie deve ser uma imagem (JPEG, PNG ou WebP)'
        }
    
    # Verificar tamanho da selfie (máximo 5MB)
    max_image_size = 5 * 1024 * 1024  # 5MB
    if selfie_file.size > max_image_size:
        return {
            'valid': False,
            'message': 'Selfie muito grande. Máximo: 5MB'
        }
    
    # Validar vídeo de liveness se fornecido
    if liveness_video:
        if not liveness_video.content_type.startswith('video/'):
            return {
                'valid': False,
                'message': 'Arquivo de liveness deve ser um vídeo'
            }
        
        # Verificar tamanho do vídeo (máximo 20MB)
        max_video_size = 20 * 1024 * 1024  # 20MB
        if liveness_video.size > max_video_size:
            return {
                'valid': False,
                'message': 'Vídeo de liveness muito grande. Máximo: 20MB'
            }
    
    return {'valid': True}