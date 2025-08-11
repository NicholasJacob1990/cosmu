"""
Idwall Provider - Melhor custo-benefício 1k-10k verificações/mês
Integração completa: KYC + PEP + AML em um só endpoint
"""

import requests
import os
import time
import logging
from typing import Dict
from django.conf import settings
from ..kyc_router import BaseKYCProvider, KYCPayload, KYCResult

logger = logging.getLogger(__name__)


class IdwallKYCProvider(BaseKYCProvider):
    """
    Provedor Idwall
    
    Vantagens:
    - Melhor custo-benefício para volume médio (R$ 2-3/verif)
    - PEP/AML/sanções incluídos
    - Cobertura completa Brasil (RG, CNH, CPF, CNPJ)
    - Background checks e OCR prontos
    
    Desvantagens:
    - Markup sobre APIs governamentais
    - Menos acurácia biométrica que Unico
    """
    
    def __init__(self):
        self.api_key = settings.KYC_PROVIDERS.get('idwall', {}).get('api_key', '')
        self.endpoint = settings.KYC_PROVIDERS.get('idwall', {}).get('endpoint', 'https://api.idwall.co/v2/')
        self.timeout = 30
    
    @property
    def name(self) -> str:
        return "idwall"
    
    def verify(self, user_id: int, payload: KYCPayload) -> KYCResult:
        """
        Executa verificação via Idwall
        """
        start_time = time.time()
        
        try:
            # Preparar dados para Idwall
            verification_data = {
                "document_front": payload.get('doc_front'),
                "document_back": payload.get('doc_back'), 
                "selfie": payload.get('selfie'),
                "document_type": payload.get('document_type', 'rg'),
                "check_pep": True,  # Sempre verificar PEP
                "check_sanctions": True,
                "match_selfie": bool(payload.get('selfie')),
                "extract_data": True,
                "user_metadata": {
                    "user_id": str(user_id),
                    "marketplace": "galaxia"
                }
            }
            
            # Fazer chamada para API Idwall
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
                'User-Agent': 'GalaxIA-Marketplace/1.0'
            }
            
            response = requests.post(
                f'{self.endpoint}kyc/verify',
                json=verification_data,
                headers=headers,
                timeout=self.timeout
            )
            
            latency_ms = int((time.time() - start_time) * 1000)
            
            if response.status_code == 200:
                data = response.json()
                
                # Mapear resposta Idwall para formato padrão
                success = data.get('approved', False)
                confidence_score = data.get('confidence', 0.0)
                pep_found = data.get('pep', {}).get('found', False)
                
                return KYCResult(
                    success=success,
                    confidence_score=confidence_score,
                    details={
                        'idwall_id': data.get('id'),
                        'document_data': data.get('document', {}),
                        'pep_details': data.get('pep', {}),
                        'sanctions': data.get('sanctions', {}),
                        'face_match': data.get('face_match', {}),
                        'provider': 'idwall'
                    },
                    pep_match=pep_found,
                    cost=self.get_cost_estimate(payload),
                    provider='idwall',
                    latency_ms=latency_ms,
                    requires_manual_review=data.get('manual_review', False)
                )
            else:
                logger.error(f"Idwall API error: {response.status_code} - {response.text}")
                return self._create_error_result(latency_ms, f"API Error: {response.status_code}")
                
        except requests.exceptions.Timeout:
            latency_ms = int((time.time() - start_time) * 1000)
            logger.error("Idwall API timeout")
            return self._create_error_result(latency_ms, "Timeout")
            
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            logger.error(f"Idwall provider error: {str(e)}")
            return self._create_error_result(latency_ms, str(e))
    
    def _create_error_result(self, latency_ms: int, error: str) -> KYCResult:
        """Cria resultado de erro padronizado"""
        return KYCResult(
            success=False,
            confidence_score=0.0,
            details={'error': error, 'provider': 'idwall'},
            pep_match=False,
            cost=0.0,
            provider='idwall',
            latency_ms=latency_ms,
            requires_manual_review=True
        )
    
    def get_cost_estimate(self, payload: KYCPayload) -> float:
        """
        Calcula custo estimado em BRL
        Idwall: R$ 2.40 médio (tabela de volume)
        """
        base_cost = 2.40  # BRL - média de propostas
        
        # Adicionar custo por serviços extras
        extra_cost = 0.0
        if payload.get('selfie'):
            extra_cost += 0.50  # Biometria
        
        # PEP/sanções já incluído no base_cost
        
        return base_cost + extra_cost
    
    def health_check(self) -> Dict:
        """
        Verifica saúde da API Idwall
        """
        try:
            response = requests.get(
                f'{self.endpoint}health',
                headers={'Authorization': f'Bearer {self.api_key}'},
                timeout=5
            )
            return {
                'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                'response_time_ms': response.elapsed.total_seconds() * 1000,
                'api_version': response.headers.get('X-API-Version', 'unknown')
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e)
            }