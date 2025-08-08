"""
Serviço de KYC (Know Your Customer) - GalaxIA Marketplace
Integração com provedores externos para verificação de identidade
"""

import hashlib
import requests
import logging
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
from datetime import datetime, timedelta
from django.conf import settings
from django.core.files.storage import default_storage
from django.utils import timezone
from django.db import transaction

from ..models import (
    KYCDocument, BiometricVerification, KYCProfile, 
    VerificationProvider, VerificationLog, DocumentType, 
    VerificationStatus, KYCLevel
)

logger = logging.getLogger(__name__)


class KYCProviderError(Exception):
    """Exceção personalizada para erros de provedores KYC"""
    pass


class BaseKYCProvider:
    """Classe base para provedores de verificação KYC"""
    
    def __init__(self, provider_config: VerificationProvider):
        self.provider = provider_config
        self.api_key = settings.KYC_PROVIDERS.get(provider_config.slug, {}).get('api_key')
        self.base_url = provider_config.api_endpoint
        
    def verify_document(self, document: KYCDocument) -> Dict:
        """Verifica um documento via API do provedor"""
        raise NotImplementedError("Subclasses must implement verify_document")
    
    def verify_biometric(self, biometric: BiometricVerification) -> Dict:
        """Verifica dados biométricos via API do provedor"""
        raise NotImplementedError("Subclasses must implement verify_biometric")
    
    def _make_request(self, endpoint: str, data: Dict, timeout: int = 30) -> Dict:
        """Faz requisição HTTP para o provedor"""
        url = f"{self.base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'GalaxIA-KYC/1.0'
        }
        
        start_time = datetime.now()
        
        try:
            response = requests.post(url, json=data, headers=headers, timeout=timeout)
            response_time = (datetime.now() - start_time).total_seconds()
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'data': response.json(),
                    'response_time': response_time,
                    'status_code': response.status_code
                }
            else:
                return {
                    'success': False,
                    'error': f'HTTP {response.status_code}: {response.text}',
                    'response_time': response_time,
                    'status_code': response.status_code
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': 'Request timeout',
                'response_time': timeout,
                'status_code': 408
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'response_time': (datetime.now() - start_time).total_seconds(),
                'status_code': 500
            }


class UnicoKYCProvider(BaseKYCProvider):
    """Provedor Unico para verificação KYC (Brasil)"""
    
    def verify_document(self, document: KYCDocument) -> Dict:
        """Verifica documento via Unico API"""
        data = {
            'document_type': document.document_type,
            'image_url': document.file_url,
            'user_id': str(document.user.id),
            'metadata': {
                'file_name': document.file_name,
                'upload_time': document.uploaded_at.isoformat()
            }
        }
        
        result = self._make_request('document/verify', data)
        
        if result['success']:
            api_response = result['data']
            
            # Processar resposta específica do Unico
            confidence_score = api_response.get('confidence', 0.0)
            ocr_data = api_response.get('extracted_data', {})
            
            return {
                'success': True,
                'confidence_score': confidence_score,
                'ocr_data': ocr_data,
                'status': VerificationStatus.APPROVED if confidence_score > 0.8 else VerificationStatus.MANUAL_REVIEW,
                'provider_response': api_response,
                'response_time': result['response_time']
            }
        else:
            return {
                'success': False,
                'error': result['error'],
                'status': VerificationStatus.REJECTED,
                'response_time': result['response_time']
            }
    
    def verify_biometric(self, biometric: BiometricVerification) -> Dict:
        """Verifica biometria via Unico API"""
        data = {
            'selfie_url': biometric.selfie_url,
            'liveness_video_url': biometric.liveness_video_url,
            'user_id': str(biometric.user.id),
            'device_info': biometric.device_info,
            'timestamp': biometric.timestamp_capture.isoformat()
        }
        
        result = self._make_request('biometric/verify', data)
        
        if result['success']:
            api_response = result['data']
            
            liveness_score = api_response.get('liveness_score', 0.0)
            quality_score = api_response.get('quality_score', 0.0)
            
            return {
                'success': True,
                'liveness_score': liveness_score,
                'quality_score': quality_score,
                'status': VerificationStatus.APPROVED if liveness_score > 0.85 else VerificationStatus.MANUAL_REVIEW,
                'provider_response': api_response,
                'response_time': result['response_time']
            }
        else:
            return {
                'success': False,
                'error': result['error'],
                'status': VerificationStatus.REJECTED,
                'response_time': result['response_time']
            }


class IDWallKYCProvider(BaseKYCProvider):
    """Provedor IDwall para verificação KYC (Brasil)"""
    
    def verify_document(self, document: KYCDocument) -> Dict:
        """Verifica documento via IDwall API"""
        data = {
            'type': document.document_type,
            'image': document.file_url,
            'validate_with_cpf': True,
            'user_metadata': {
                'user_id': str(document.user.id),
                'email': document.user.email
            }
        }
        
        result = self._make_request('validations', data)
        
        if result['success']:
            api_response = result['data']
            
            confidence = api_response.get('result', {}).get('confidence', 0.0)
            extracted_data = api_response.get('result', {}).get('extracted_data', {})
            
            return {
                'success': True,
                'confidence_score': confidence,
                'ocr_data': extracted_data,
                'status': VerificationStatus.APPROVED if confidence > 0.85 else VerificationStatus.MANUAL_REVIEW,
                'provider_response': api_response,
                'response_time': result['response_time']
            }
        else:
            return {
                'success': False,
                'error': result['error'],
                'status': VerificationStatus.REJECTED,
                'response_time': result['response_time']
            }
    
    def verify_biometric(self, biometric: BiometricVerification) -> Dict:
        """IDwall não suporta verificação biométrica diretamente"""
        return {
            'success': False,
            'error': 'IDwall provider does not support biometric verification',
            'status': VerificationStatus.REJECTED
        }


class KYCService:
    """Serviço principal para gerenciar verificações KYC"""
    
    def __init__(self):
        self._providers = None
    
    @property
    def providers(self) -> Dict[str, BaseKYCProvider]:
        """Lazy loading dos provedores"""
        if self._providers is None:
            self._providers = self._load_providers()
        return self._providers
    
    def _load_providers(self) -> Dict[str, BaseKYCProvider]:
        """Carrega provedores ativos"""
        providers = {}
        
        for provider_config in VerificationProvider.objects.filter(is_active=True):
            if provider_config.slug == 'unico':
                providers['unico'] = UnicoKYCProvider(provider_config)
            elif provider_config.slug == 'idwall':
                providers['idwall'] = IDWallKYCProvider(provider_config)
        
        return providers
    
    def upload_document(self, user, document_type: str, file, metadata: Dict = None) -> KYCDocument:
        """Upload e processamento inicial de documento"""
        
        # Gerar hash do arquivo
        file_content = file.read()
        file_hash = hashlib.sha256(file_content).hexdigest()
        file.seek(0)  # Reset file pointer
        
        # Verificar se já existe documento com mesmo hash
        existing = KYCDocument.objects.filter(
            user=user,
            document_type=document_type,
            file_hash=file_hash
        ).first()
        
        if existing:
            logger.info(f"Document already exists for user {user.id}: {existing.id}")
            return existing
        
        # Upload para storage (S3)
        file_name = f"kyc/{user.id}/{document_type}_{timezone.now().strftime('%Y%m%d_%H%M%S')}_{file.name}"
        file_path = default_storage.save(file_name, file)
        file_url = default_storage.url(file_path)
        
        # Criar registro do documento
        document = KYCDocument.objects.create(
            user=user,
            document_type=document_type,
            file_url=file_url,
            file_name=file.name,
            file_size=len(file_content),
            file_hash=file_hash,
            status=VerificationStatus.PENDING
        )
        
        logger.info(f"Document uploaded for user {user.id}: {document.id}")
        return document
    
    def verify_document_async(self, document: KYCDocument, provider_name: str = None) -> str:
        """
        Inicia verificação assíncrona de documento
        
        Returns:
            Task ID da verificação assíncrona
        """
        from ..tasks.kyc_tasks import process_document_verification
        
        # Disparar task assíncrona
        task = process_document_verification.delay(str(document.id), provider_name)
        
        logger.info(f"Async verification started for document {document.id}, task: {task.id}")
        return task.id
    
    def verify_document(self, document: KYCDocument, provider_name: str = None) -> bool:
        """
        Verifica documento usando provedor KYC (versão síncrona para compatibilidade)
        
        NOTA: Esta versão é mantida para compatibilidade mas recomenda-se usar verify_document_async
        """
        
        if provider_name and provider_name in self.providers:
            provider = self.providers[provider_name]
        else:
            # Usar provedor padrão ou primeiro disponível
            provider = next(iter(self.providers.values())) if self.providers else None
        
        if not provider:
            logger.error("No KYC provider available")
            document.mark_as_processed(VerificationStatus.REJECTED)
            return False
        
        try:
            # Marcar como processando
            document.status = VerificationStatus.PROCESSING
            document.save()
            
            # Chamar API do provedor
            result = provider.verify_document(document)
            
            # Log da verificação
            log_entry = VerificationLog.objects.create(
                user=document.user,
                provider=provider.provider,
                verification_type=f"document_{document.document_type}",
                request_data={'document_id': str(document.id)},
                response_data=result.get('provider_response', {}),
                success=result['success'],
                error_message=result.get('error', ''),
                confidence_score=result.get('confidence_score', 0.0),
                response_time=result.get('response_time', 0.0),
                cost=provider.provider.cost_per_verification
            )
            
            if result['success']:
                # Atualizar documento com resultado
                document.confidence_score = result['confidence_score']
                document.ocr_data = result['ocr_data']
                document.verification_provider = provider.provider.name
                document.mark_as_processed(
                    result['status'],
                    result['provider_response']
                )
                
                # Atualizar perfil KYC se aprovado
                if result['status'] == VerificationStatus.APPROVED:
                    self._update_kyc_profile_from_document(document)
                
                logger.info(f"Document verified successfully: {document.id}")
                return True
            else:
                document.rejection_reason = result.get('error', 'Verification failed')
                document.mark_as_processed(VerificationStatus.REJECTED)
                
                logger.warning(f"Document verification failed: {document.id} - {result.get('error')}")
                return False
                
        except Exception as e:
            logger.error(f"Error verifying document {document.id}: {str(e)}")
            document.rejection_reason = f"System error: {str(e)}"
            document.mark_as_processed(VerificationStatus.REJECTED)
            return False
    
    def verify_biometric(self, user, selfie_file, liveness_video_file=None, device_info=None) -> BiometricVerification:
        """Verifica dados biométricos"""
        
        # Upload dos arquivos
        selfie_name = f"kyc/{user.id}/biometric/selfie_{timezone.now().strftime('%Y%m%d_%H%M%S')}.jpg"
        selfie_path = default_storage.save(selfie_name, selfie_file)
        selfie_url = default_storage.url(selfie_path)
        
        liveness_video_url = ""
        if liveness_video_file:
            video_name = f"kyc/{user.id}/biometric/liveness_{timezone.now().strftime('%Y%m%d_%H%M%S')}.mp4"
            video_path = default_storage.save(video_name, liveness_video_file)
            liveness_video_url = default_storage.url(video_path)
        
        # Criar registro biométrico
        biometric = BiometricVerification.objects.create(
            user=user,
            selfie_url=selfie_url,
            liveness_video_url=liveness_video_url,
            device_info=device_info or {},
            timestamp_capture=timezone.now(),
            status=VerificationStatus.PENDING
        )
        
        # Encontrar provedor que suporta biometria
        provider = None
        for p in self.providers.values():
            if p.provider.supports_biometric:
                provider = p
                break
        
        if not provider:
            logger.error("No biometric provider available")
            biometric.status = VerificationStatus.REJECTED
            biometric.save()
            return biometric
        
        try:
            # Verificar biometria
            biometric.status = VerificationStatus.PROCESSING
            biometric.save()
            
            result = provider.verify_biometric(biometric)
            
            # Log da verificação
            VerificationLog.objects.create(
                user=user,
                provider=provider.provider,
                verification_type="biometric",
                request_data={'biometric_id': str(biometric.id)},
                response_data=result.get('provider_response', {}),
                success=result['success'],
                error_message=result.get('error', ''),
                confidence_score=result.get('liveness_score', 0.0),
                response_time=result.get('response_time', 0.0),
                cost=provider.provider.cost_per_verification
            )
            
            if result['success']:
                biometric.liveness_score = result.get('liveness_score', 0.0)
                biometric.quality_score = result.get('quality_score', 0.0)
                biometric.verification_provider = provider.provider.name
                biometric.status = result['status']
                biometric.provider_response = result.get('provider_response', {})
                biometric.processed_at = timezone.now()
                biometric.save()
                
                # Atualizar perfil KYC se aprovado
                if result['status'] == VerificationStatus.APPROVED:
                    self._update_kyc_profile_from_biometric(biometric)
                
                logger.info(f"Biometric verified successfully: {biometric.id}")
            else:
                biometric.status = VerificationStatus.REJECTED
                biometric.save()
                logger.warning(f"Biometric verification failed: {biometric.id}")
            
        except Exception as e:
            logger.error(f"Error verifying biometric {biometric.id}: {str(e)}")
            biometric.status = VerificationStatus.REJECTED
            biometric.save()
        
        return biometric
    
    def _update_kyc_profile_from_document(self, document: KYCDocument):
        """Atualiza perfil KYC baseado em documento aprovado"""
        profile, created = KYCProfile.objects.get_or_create(user=document.user)
        
        if document.document_type in [DocumentType.RG, DocumentType.CPF, DocumentType.CNH, DocumentType.PASSPORT]:
            profile.identity_verified = True
            profile.identity_confidence = document.confidence_score
            
            # Extrair dados do OCR
            if document.ocr_data:
                profile.verified_full_name = document.ocr_data.get('nome', '')
                profile.verified_document_number = document.ocr_data.get('numero', '')
                profile.verified_birth_date = document.ocr_data.get('data_nascimento')
        
        elif document.document_type == DocumentType.PROOF_ADDRESS:
            profile.address_verified = True
            profile.verified_address = document.ocr_data.get('endereco', '') if document.ocr_data else ''
        
        elif document.document_type in [DocumentType.DIPLOMA, DocumentType.CERTIFICATE]:
            profile.professional_verified = True
        
        # Atualizar scores e nível
        profile.document_confidence = max(profile.document_confidence, document.confidence_score)
        profile.last_verification_at = timezone.now()
        if not profile.first_verification_at:
            profile.first_verification_at = timezone.now()
        
        profile.calculate_trust_score()
        profile.upgrade_level()
        profile.save()
    
    def _update_kyc_profile_from_biometric(self, biometric: BiometricVerification):
        """Atualiza perfil KYC baseado em verificação biométrica"""
        profile, created = KYCProfile.objects.get_or_create(user=biometric.user)
        
        profile.biometric_verified = True
        profile.biometric_confidence = biometric.liveness_score
        profile.last_verification_at = timezone.now()
        
        if not profile.first_verification_at:
            profile.first_verification_at = timezone.now()
        
        profile.calculate_trust_score()
        profile.upgrade_level()
        profile.save()
    
    def get_user_verification_status(self, user) -> Dict:
        """Obtém status completo de verificação do usuário"""
        try:
            profile = user.kyc_profile
        except KYCProfile.DoesNotExist:
            profile = KYCProfile.objects.create(user=user)
        
        # Documentos por tipo
        documents = {}
        for doc in user.kyc_documents.all():
            documents[doc.document_type] = {
                'status': doc.status,
                'uploaded_at': doc.uploaded_at,
                'confidence_score': doc.confidence_score
            }
        
        # Verificações biométricas
        biometric = user.biometric_verifications.filter(
            status=VerificationStatus.APPROVED
        ).first()
        
        return {
            'current_level': profile.current_level,
            'current_level_display': profile.get_current_level_display(),
            'trust_score': profile.overall_trust_score,
            'verifications': {
                'identity': profile.identity_verified,
                'address': profile.address_verified,
                'biometric': profile.biometric_verified,
                'professional': profile.professional_verified,
            },
            'documents': documents,
            'biometric': {
                'verified': profile.biometric_verified,
                'liveness_score': biometric.liveness_score if biometric else 0.0,
                'quality_score': biometric.quality_score if biometric else 0.0,
            } if biometric else None,
            'next_level': self._get_next_available_level(profile),
            'next_level_requirements': self._get_level_requirements(profile)
        }
    
    def _get_next_available_level(self, profile: KYCProfile) -> Optional[str]:
        """Determina próximo nível disponível"""
        levels = [KYCLevel.BASIC, KYCLevel.IDENTITY_VERIFIED, KYCLevel.PROFESSIONAL_VERIFIED, KYCLevel.GALAXIA_ELITE]
        current_index = levels.index(profile.current_level)
        
        for i in range(current_index + 1, len(levels)):
            if profile.can_upgrade_to_level(levels[i]):
                return levels[i]
        
        return None
    
    def _get_level_requirements(self, profile: KYCProfile) -> Dict:
        """Retorna requisitos para próximo nível"""
        next_level = self._get_next_available_level(profile)
        
        if not next_level:
            return {}
        
        requirements = {
            KYCLevel.IDENTITY_VERIFIED: [
                {'type': 'document', 'name': 'Documento com foto', 'required': True},
                {'type': 'address', 'name': 'Comprovante de endereço', 'required': True},
                {'type': 'biometric', 'name': 'Verificação biométrica', 'required': True},
            ],
            KYCLevel.PROFESSIONAL_VERIFIED: [
                {'type': 'professional', 'name': 'Formação/Certificações', 'required': True},
                {'type': 'references', 'name': 'Referências profissionais', 'required': True},
            ],
            KYCLevel.GALAXIA_ELITE: [
                {'type': 'experience', 'name': '6+ meses na plataforma', 'required': True},
                {'type': 'projects', 'name': '20+ projetos concluídos', 'required': True},
                {'type': 'rating', 'name': 'Rating 4.8/5.0+', 'required': True},
                {'type': 'interview', 'name': 'Entrevista por vídeo', 'required': True},
            ]
        }
        
        return requirements.get(next_level, [])


# Instância singleton do serviço
kyc_service = KYCService()