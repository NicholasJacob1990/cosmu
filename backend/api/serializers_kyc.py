"""
Serializers para Sistema KYC (Know Your Customer) - GalaxIA Marketplace
"""

import json
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    KYCDocument, BiometricVerification, KYCProfile, 
    VerificationProvider, VerificationLog, 
    DocumentType, VerificationStatus, KYCLevel
)

User = get_user_model()


class KYCDocumentSerializer(serializers.ModelSerializer):
    """Serializer para documentos KYC"""
    
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    verified_by_email = serializers.CharField(source='verified_by.email', read_only=True)
    
    class Meta:
        model = KYCDocument
        fields = [
            'id', 'document_type', 'document_type_display',
            'file_url', 'file_name', 'file_size',
            'status', 'status_display', 'is_expired',
            'confidence_score', 'verification_provider',
            'uploaded_at', 'processed_at', 'verified_at',
            'rejection_reason', 'user_email', 'verified_by_email',
            'ocr_data'
        ]
        read_only_fields = [
            'id', 'file_url', 'file_size', 'confidence_score',
            'verification_provider', 'uploaded_at', 'processed_at',
            'verified_at', 'rejection_reason'
        ]
    
    def to_representation(self, instance):
        """Customiza a representação dos dados"""
        data = super().to_representation(instance)
        
        # Ocultar dados sensíveis do OCR para usuários não-admin
        request = self.context.get('request')
        if request and not request.user.is_staff:
            # Remover dados sensíveis do OCR
            if data.get('ocr_data'):
                data['ocr_data'] = {
                    'has_data': bool(data['ocr_data']),
                    'extracted_fields': list(data['ocr_data'].keys()) if data['ocr_data'] else []
                }
        
        return data


class BiometricVerificationSerializer(serializers.ModelSerializer):
    """Serializer para verificações biométricas"""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = BiometricVerification
        fields = [
            'id', 'selfie_url', 'liveness_video_url',
            'liveness_score', 'face_match_score', 'quality_score',
            'status', 'status_display', 'is_valid',
            'verification_provider', 'timestamp_capture',
            'created_at', 'processed_at', 'user_email'
        ]
        read_only_fields = [
            'id', 'selfie_url', 'liveness_video_url',
            'liveness_score', 'face_match_score', 'quality_score',
            'status', 'verification_provider', 'timestamp_capture',
            'created_at', 'processed_at'
        ]
    
    def to_representation(self, instance):
        """Customiza a representação dos dados"""
        data = super().to_representation(instance)
        
        # Ocultar URLs de arquivos para usuários não-admin
        request = self.context.get('request')
        if request and not request.user.is_staff:
            data['selfie_url'] = '***' if data['selfie_url'] else None
            data['liveness_video_url'] = '***' if data['liveness_video_url'] else None
        
        return data


class KYCProfileSerializer(serializers.ModelSerializer):
    """Serializer para perfil KYC completo"""
    
    current_level_display = serializers.CharField(source='get_current_level_display', read_only=True)
    risk_level_display = serializers.CharField(source='get_risk_level_display', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    verification_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = KYCProfile
        fields = [
            'id', 'current_level', 'current_level_display',
            'identity_verified', 'address_verified', 
            'biometric_verified', 'professional_verified',
            'overall_trust_score', 'identity_confidence',
            'document_confidence', 'biometric_confidence',
            'risk_level', 'risk_level_display',
            'first_verification_at', 'last_verification_at',
            'verification_attempts', 'user_email', 'user_name',
            'verification_summary'
        ]
        read_only_fields = [
            'id', 'identity_verified', 'address_verified',
            'biometric_verified', 'professional_verified',
            'overall_trust_score', 'identity_confidence',
            'document_confidence', 'biometric_confidence',
            'first_verification_at', 'last_verification_at',
            'verification_attempts'
        ]
    
    def get_user_name(self, obj):
        """Retorna nome completo do usuário"""
        return f"{obj.user.first_name} {obj.user.last_name}".strip()
    
    def get_verification_summary(self, obj):
        """Resumo das verificações realizadas"""
        return {
            'completed_verifications': sum([
                obj.identity_verified,
                obj.address_verified,
                obj.biometric_verified,
                obj.professional_verified
            ]),
            'total_verifications': 4,
            'completion_percentage': obj.overall_trust_score * 100,
            'next_steps': self._get_next_steps(obj)
        }
    
    def _get_next_steps(self, obj):
        """Determina próximos passos para o usuário"""
        next_steps = []
        
        if not obj.identity_verified:
            next_steps.append({
                'type': 'document',
                'title': 'Enviar documento com foto',
                'description': 'RG, CNH ou Passaporte'
            })
        
        if not obj.address_verified:
            next_steps.append({
                'type': 'address',
                'title': 'Enviar comprovante de endereço',
                'description': 'Conta de luz, água ou gás dos últimos 3 meses'
            })
        
        if not obj.biometric_verified:
            next_steps.append({
                'type': 'biometric',
                'title': 'Verificação biométrica',
                'description': 'Selfie com documento em mãos'
            })
        
        if not obj.professional_verified and obj.identity_verified:
            next_steps.append({
                'type': 'professional',
                'title': 'Verificação profissional',
                'description': 'Diploma ou certificações da área'
            })
        
        return next_steps


class DocumentUploadSerializer(serializers.Serializer):
    """Serializer para upload de documentos"""
    
    document_type = serializers.ChoiceField(choices=DocumentType.choices)
    file = serializers.FileField()
    metadata = serializers.JSONField(required=False, default=dict)
    
    def validate_file(self, value):
        """Valida arquivo enviado"""
        # Verificar extensão
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf']
        file_extension = value.name.lower().split('.')[-1]
        
        if f'.{file_extension}' not in allowed_extensions:
            raise serializers.ValidationError(
                f'Extensão de arquivo não permitida. Permitidas: {", ".join(allowed_extensions)}'
            )
        
        # Verificar tamanho (máximo 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f'Arquivo muito grande. Máximo permitido: {max_size // (1024*1024)}MB'
            )
        
        return value
    
    def validate_metadata(self, value):
        """Valida metadados opcionais"""
        if not isinstance(value, dict):
            raise serializers.ValidationError('Metadata deve ser um objeto JSON válido')
        
        return value


class BiometricUploadSerializer(serializers.Serializer):
    """Serializer para upload de dados biométricos"""
    
    selfie = serializers.ImageField()
    liveness_video = serializers.FileField(required=False)
    device_info = serializers.JSONField(required=False, default=dict)
    geolocation = serializers.JSONField(required=False, default=dict)
    
    def validate_selfie(self, value):
        """Valida arquivo de selfie"""
        # Verificar tipo de imagem
        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                f'Tipo de imagem não permitido: {value.content_type}'
            )
        
        # Verificar tamanho (máximo 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f'Imagem muito grande. Máximo: {max_size // (1024*1024)}MB'
            )
        
        return value
    
    def validate_liveness_video(self, value):
        """Valida vídeo de liveness"""
        if not value:
            return value
        
        # Verificar tipo de vídeo
        if not value.content_type.startswith('video/'):
            raise serializers.ValidationError('Arquivo deve ser um vídeo válido')
        
        # Verificar tamanho (máximo 20MB)
        max_size = 20 * 1024 * 1024  # 20MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f'Vídeo muito grande. Máximo: {max_size // (1024*1024)}MB'
            )
        
        return value


class VerificationProviderSerializer(serializers.ModelSerializer):
    """Serializer para provedores de verificação (Admin only)"""
    
    class Meta:
        model = VerificationProvider
        fields = [
            'id', 'name', 'slug', 'is_active',
            'supports_documents', 'supports_biometric',
            'supports_address', 'supports_brazil',
            'cost_per_verification', 'monthly_limit',
            'total_verifications', 'success_rate',
            'average_response_time', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_verifications', 'success_rate',
            'average_response_time', 'created_at', 'updated_at'
        ]


class VerificationLogSerializer(serializers.ModelSerializer):
    """Serializer para logs de verificação (Admin only)"""
    
    user_email = serializers.CharField(source='user.email', read_only=True)
    provider_name = serializers.CharField(source='provider.name', read_only=True)
    
    class Meta:
        model = VerificationLog
        fields = [
            'id', 'user_email', 'provider_name',
            'verification_type', 'success', 'error_message',
            'confidence_score', 'response_time', 'cost',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class VerificationStatusSerializer(serializers.Serializer):
    """Serializer para status de verificação completo"""
    
    current_level = serializers.CharField()
    current_level_display = serializers.CharField()
    trust_score = serializers.FloatField()
    verifications = serializers.DictField()
    documents = serializers.DictField()
    biometric = serializers.DictField(allow_null=True)
    next_level = serializers.CharField(allow_null=True)
    next_level_requirements = serializers.ListField()
    
    class Meta:
        fields = [
            'current_level', 'current_level_display', 'trust_score',
            'verifications', 'documents', 'biometric',
            'next_level', 'next_level_requirements'
        ]


class ManualVerificationSerializer(serializers.Serializer):
    """Serializer para aprovação manual de documentos (Admin only)"""
    
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500)
    
    def validate(self, attrs):
        """Validação cruzada"""
        if attrs['action'] == 'reject' and not attrs.get('reason'):
            raise serializers.ValidationError({
                'reason': 'Motivo é obrigatório para rejeições'
            })
        
        return attrs


class KYCStatsSerializer(serializers.Serializer):
    """Serializer para estatísticas KYC (Admin only)"""
    
    total_users = serializers.IntegerField()
    verified_users = serializers.IntegerField()
    pending_verifications = serializers.IntegerField()
    rejection_rate = serializers.FloatField()
    average_processing_time = serializers.FloatField()
    verification_breakdown = serializers.DictField()
    provider_performance = serializers.ListField()
    
    class Meta:
        fields = [
            'total_users', 'verified_users', 'pending_verifications',
            'rejection_rate', 'average_processing_time',
            'verification_breakdown', 'provider_performance'
        ]