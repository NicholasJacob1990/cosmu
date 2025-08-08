"""
Unico Check Provider - Máxima acurácia biométrica (>99%)
Ideal para alto volume (≥10k/mês) ou verticais de alto risco
"""

import requests
import os
import time
import logging
from typing import Dict
from django.conf import settings
from ..kyc_router import BaseKYCProvider, KYCPayload, KYCResult

logger = logging.getLogger(__name__)


class UnicoKYCProvider(BaseKYCProvider):
    """
    Provedor Unico Check
    
    Vantagens:
    - Acurácia biométrica >99% (ABIS benchmark)
    - Liveness detection 3D robusto
    - Cobertura CNH nova geração
    - SDK white-label para mobile
    
    Desvantagens:
    - Custo mais alto que Datavalid direto
    - PEP como add-on opcional
    - SaaS mensal + excedente
    """
    
    def __init__(self):
        self.api_token = settings.KYC_PROVIDERS.get('unico', {}).get('api_key', '')
        self.endpoint = settings.KYC_PROVIDERS.get('unico', {}).get('endpoint', 'https://check.unico.io/api/v2/')
        self.timeout = 25
    
    @property
    def name(self) -> str:
        return "unico"
    
    def verify(self, user_id: int, payload: KYCPayload) -> KYCResult:
        """
        Executa verificação via Unico Check
        """
        start_time = time.time()
        
        try:
            # Preparar dados para Unico
            verification_data = {
                "document": {
                    "front": payload.get('doc_front'),
                    "back": payload.get('doc_back'),
                    "type": self._map_document_type(payload.get('document_type', 'rg'))
                },
                "biometry": {
                    "selfie": payload.get('selfie'),
                    "liveness_check": True,
                    "face_match": True
                },
                "options": {
                    "extract_data": True,
                    "quality_threshold": 0.7,  # Threshold mínimo de qualidade
                    "similarity_threshold": 0.85,  # Threshold face match
                    "anti_spoofing": True
                },
                "metadata": {
                    "user_id": str(user_id),
                    "source": "galaxia_marketplace"
                }
            }
            
            # Headers Unico
            headers = {
                'Authorization': f'Bearer {self.api_token}',
                'Content-Type': 'application/json',
                'X-Client-Version': 'galaxia-v1.0'
            }
            
            # Chamada para API Unico
            response = requests.post(
                f'{self.endpoint}verification',
                json=verification_data,
                headers=headers,
                timeout=self.timeout
            )
            
            latency_ms = int((time.time() - start_time) * 1000)
            
            if response.status_code == 200:
                data = response.json()
                
                # Mapear resposta Unico para formato padrão
                status = data.get('status', 'PENDING')
                success = status == 'APPROVED'
                
                # Scores detalhados do Unico
                document_score = data.get('document', {}).get('confidence', 0.0)
                liveness_score = data.get('biometry', {}).get('liveness_score', 0.0)
                similarity_score = data.get('biometry', {}).get('similarity_score', 0.0)
                
                # Confidence score combinado
                confidence_score = (document_score * 0.4 + liveness_score * 0.3 + similarity_score * 0.3)
                
                return KYCResult(
                    success=success,
                    confidence_score=confidence_score,
                    details={
                        'unico_id': data.get('verification_id'),
                        'status': status,
                        'document_analysis': data.get('document', {}),
                        'biometry_analysis': data.get('biometry', {}),
                        'quality_scores': {
                            'document': document_score,
                            'liveness': liveness_score,
                            'similarity': similarity_score
                        },
                        'extracted_data': data.get('extracted_data', {}),
                        'provider': 'unico_check'
                    },
                    pep_match=False,  # PEP é add-on separado
                    cost=self.get_cost_estimate(payload),
                    provider='unico',
                    latency_ms=latency_ms,
                    requires_manual_review=status in ['MANUAL_REVIEW', 'PENDING']
                )
                
            else:
                logger.error(f"Unico API error: {response.status_code} - {response.text}")
                return self._create_error_result(latency_ms, f"API Error: {response.status_code}")
                
        except requests.exceptions.Timeout:
            latency_ms = int((time.time() - start_time) * 1000)
            logger.error("Unico API timeout")
            return self._create_error_result(latency_ms, "Timeout")
            
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            logger.error(f"Unico provider error: {str(e)}")
            return self._create_error_result(latency_ms, str(e))
    
    def _map_document_type(self, doc_type: str) -> str:
        """Mapeia tipos de documento para formato Unico"""
        mapping = {
            'rg': 'RG',
            'cnh': 'CNH',
            'passport': 'PASSPORT',
            'crnm': 'CRNM'  # Carteira de Registro Nacional Migratório
        }
        return mapping.get(doc_type.lower(), 'RG')
    
    def _create_error_result(self, latency_ms: int, error: str) -> KYCResult:
        """Cria resultado de erro padronizado"""
        return KYCResult(
            success=False,
            confidence_score=0.0,
            details={'error': error, 'provider': 'unico_check'},
            pep_match=False,
            cost=0.0,
            provider='unico',
            latency_ms=latency_ms,
            requires_manual_review=True
        )
    
    def get_cost_estimate(self, payload: KYCPayload) -> float:
        """
        Calcula custo estimado em BRL
        Unico: R$ 1.90 médio para volume >10k/mês (após franquia mensal)
        """
        base_cost = 1.90  # BRL - volume alto
        
        # Ajustar por tipo de verificação
        if payload.get('selfie'):
            # Biometria + liveness está incluído no base_cost do Unico
            pass
        else:
            # Apenas documento, custo menor
            base_cost = 1.20
        
        return base_cost
    
    def get_biometric_quality_analysis(self, payload: KYCPayload) -> Dict:
        """
        Análise específica de qualidade biométrica do Unico
        Útil para debugging e otimização
        """
        if not payload.get('selfie'):
            return {'error': 'No selfie provided'}
        
        try:
            # Endpoint específico para análise de qualidade
            headers = {
                'Authorization': f'Bearer {self.api_token}',
                'Content-Type': 'application/json'
            }
            
            quality_data = {
                'image': payload['selfie'],
                'analysis_type': 'quality_only'
            }
            
            response = requests.post(
                f'{self.endpoint}biometry/analyze',
                json=quality_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {'error': f'Quality analysis failed: {response.status_code}'}
                
        except Exception as e:
            return {'error': str(e)}
    
    def health_check(self) -> Dict:
        """Verifica saúde da API Unico"""
        try:
            response = requests.get(
                f'{self.endpoint}health',
                headers={'Authorization': f'Bearer {self.api_token}'},
                timeout=5
            )
            return {
                'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                'response_time_ms': response.elapsed.total_seconds() * 1000,
                'service_version': response.headers.get('X-Service-Version', 'unknown')
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e)
            }