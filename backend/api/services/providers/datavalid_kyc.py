"""
SERPRO Datavalid Provider - Acesso direto às bases oficiais brasileiras
Melhor custo para alto volume (R$ 0.08-0.30/consulta)
"""

import requests
import os
import time
import logging
from typing import Dict, Optional
from datetime import datetime, timedelta
from django.conf import settings
from django.core.cache import cache
from ..kyc_router import BaseKYCProvider, KYCPayload, KYCResult

logger = logging.getLogger(__name__)


class DatavalidKYCProvider(BaseKYCProvider):
    """
    Provedor SERPRO Datavalid
    
    Vantagens:
    - Acesso direto à base oficial (Receita, Denatran, etc.)
    - Menor custo por consulta (R$ 0.08-0.30)
    - Dados sempre atualizados
    - Sem markup de terceiros
    
    Desvantagens:
    - Burocracia de contratação (convênio SERPRO)
    - Não inclui PEP/sanções nativamente
    - SLA "governamental"
    - UX de biometria por sua conta
    """
    
    def __init__(self):
        self.client_id = settings.KYC_PROVIDERS.get('serpro', {}).get('client_id', '')
        self.client_secret = settings.KYC_PROVIDERS.get('serpro', {}).get('client_secret', '')
        self.endpoint = settings.KYC_PROVIDERS.get('serpro', {}).get('endpoint', 'https://apigateway.serpro.gov.br/')
        self.timeout = 35  # APIs gov podem ser mais lentas
        self._token_cache_key = 'datavalid_oauth_token'
    
    @property
    def name(self) -> str:
        return "datavalid"
    
    def verify(self, user_id: int, payload: KYCPayload) -> KYCResult:
        """
        Executa verificação via SERPRO Datavalid
        """
        start_time = time.time()
        
        try:
            # Obter token OAuth2
            token = self._get_oauth_token()
            if not token:
                return self._create_error_result(0, "Failed to obtain OAuth token")
            
            # Extrair dados do usuário do payload
            user_data = payload.get('user_data', {})
            cpf = user_data.get('cpf', '').replace('.', '').replace('-', '')
            nome = user_data.get('nome', '')
            data_nascimento = user_data.get('data_nascimento', '')
            
            if not all([cpf, nome, data_nascimento]):
                return self._create_error_result(0, "Missing required user data (CPF, nome, data_nascimento)")
            
            # Verificação CPF básica
            cpf_result = self._verify_cpf(token, cpf, nome, data_nascimento)
            
            # Se tem CNH, verificar também
            cnh_result = None
            cnh = user_data.get('cnh')
            if cnh and payload.get('document_type') == 'cnh':
                cnh_result = self._verify_cnh(token, cnh, cpf)
            
            # Verificação biométrica (se disponível)
            biometric_result = None
            if payload.get('selfie') and cpf_result.get('success'):
                biometric_result = self._verify_biometric(token, cpf, payload['selfie'])
            
            latency_ms = int((time.time() - start_time) * 1000)
            
            # Consolidar resultados
            success = cpf_result.get('success', False)
            if cnh_result:
                success = success and cnh_result.get('success', False)
            if biometric_result:
                success = success and biometric_result.get('success', False)
            
            # Calcular confidence score
            confidence_score = self._calculate_confidence(cpf_result, cnh_result, biometric_result)
            
            return KYCResult(
                success=success,
                confidence_score=confidence_score,
                details={
                    'cpf_verification': cpf_result,
                    'cnh_verification': cnh_result,
                    'biometric_verification': biometric_result,
                    'provider': 'serpro_datavalid'
                },
                pep_match=False,  # Datavalid não inclui PEP
                cost=self.get_cost_estimate(payload),
                provider='datavalid',
                latency_ms=latency_ms,
                requires_manual_review=not success
            )
            
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            logger.error(f"Datavalid provider error: {str(e)}")
            return self._create_error_result(latency_ms, str(e))
    
    def _get_oauth_token(self) -> Optional[str]:
        """
        Obtém token OAuth2 do SERPRO (cache 30min)
        """
        # Verificar cache primeiro
        cached_token = cache.get(self._token_cache_key)
        if cached_token:
            return cached_token
        
        try:
            auth_data = {
                'grant_type': 'client_credentials',
                'client_id': self.client_id,
                'client_secret': self.client_secret
            }
            
            response = requests.post(
                f'{self.endpoint}oauth2/token',
                data=auth_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                timeout=10
            )
            
            if response.status_code == 200:
                token_data = response.json()
                access_token = token_data['access_token']
                expires_in = token_data.get('expires_in', 1800)  # Default 30min
                
                # Cache por 90% do tempo de expiração
                cache_ttl = int(expires_in * 0.9)
                cache.set(self._token_cache_key, access_token, cache_ttl)
                
                return access_token
            else:
                logger.error(f"OAuth token error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"OAuth token exception: {str(e)}")
            return None
    
    def _verify_cpf(self, token: str, cpf: str, nome: str, data_nascimento: str) -> Dict:
        """Verificação CPF via Datavalid"""
        try:
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'cpf': cpf,
                'nome': nome,
                'dataNascimento': data_nascimento
            }
            
            response = requests.post(
                f'{self.endpoint}api/cidadao/v1/validar-cpf',
                json=data,
                headers=headers,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                match_code = result.get('matchCode', 'N')
                
                return {
                    'success': match_code == 'A',  # A = dados conferem
                    'match_code': match_code,
                    'details': result,
                    'confidence': 0.95 if match_code == 'A' else 0.0
                }
            else:
                return {
                    'success': False,
                    'error': f'CPF verification failed: {response.status_code}',
                    'confidence': 0.0
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'confidence': 0.0
            }
    
    def _verify_cnh(self, token: str, cnh: str, cpf: str) -> Dict:
        """Verificação CNH via Datavalid"""
        try:
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'numeroCNH': cnh,
                'cpf': cpf
            }
            
            response = requests.post(
                f'{self.endpoint}api/detran/v1/validar-cnh',
                json=data,
                headers=headers,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                valid = result.get('situacaoCNH') == 'REGULAR'
                
                return {
                    'success': valid,
                    'details': result,
                    'confidence': 0.9 if valid else 0.0
                }
            else:
                return {
                    'success': False,
                    'error': f'CNH verification failed: {response.status_code}',
                    'confidence': 0.0
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'confidence': 0.0
            }
    
    def _verify_biometric(self, token: str, cpf: str, selfie_b64: str) -> Dict:
        """
        Verificação biométrica via Datavalid (quando disponível)
        NOTA: Este serviço tem disponibilidade limitada
        """
        try:
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'cpf': cpf,
                'imageSelfie': selfie_b64
            }
            
            response = requests.post(
                f'{self.endpoint}api/biometria/v1/verificar',
                json=data,
                headers=headers,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                similarity = result.get('similarityScore', 0)
                
                return {
                    'success': similarity >= 85,  # Threshold 85%
                    'similarity_score': similarity,
                    'details': result,
                    'confidence': similarity / 100.0
                }
            else:
                # Biometria pode não estar disponível
                logger.warning(f"Biometric verification unavailable: {response.status_code}")
                return {
                    'success': True,  # Não falhar se biometria indisponível
                    'similarity_score': 0,
                    'note': 'Biometric service unavailable',
                    'confidence': 0.0
                }
                
        except Exception as e:
            return {
                'success': True,  # Não falhar por problema na biometria
                'error': str(e),
                'confidence': 0.0
            }
    
    def _calculate_confidence(self, cpf_result: Dict, cnh_result: Optional[Dict], biometric_result: Optional[Dict]) -> float:
        """Calcula confidence score consolidado"""
        scores = []
        
        # CPF é obrigatório (peso 60%)
        if cpf_result:
            scores.append(cpf_result.get('confidence', 0.0) * 0.6)
        
        # CNH opcional (peso 25%)
        if cnh_result:
            scores.append(cnh_result.get('confidence', 0.0) * 0.25)
        
        # Biometria opcional (peso 15%)
        if biometric_result:
            scores.append(biometric_result.get('confidence', 0.0) * 0.15)
        
        return min(sum(scores), 1.0)
    
    def _create_error_result(self, latency_ms: int, error: str) -> KYCResult:
        """Cria resultado de erro padronizado"""
        return KYCResult(
            success=False,
            confidence_score=0.0,
            details={'error': error, 'provider': 'serpro_datavalid'},
            pep_match=False,
            cost=0.0,
            provider='datavalid',
            latency_ms=latency_ms,
            requires_manual_review=True
        )
    
    def get_cost_estimate(self, payload: KYCPayload) -> float:
        """
        Calcula custo estimado em BRL
        Datavalid: R$ 0.08 CPF básico, R$ 0.30 CNH+biometria
        """
        base_cost = 0.08  # CPF básico
        
        if payload.get('document_type') == 'cnh':
            base_cost += 0.15  # CNH
        
        if payload.get('selfie'):
            base_cost += 0.07  # Biometria (quando disponível)
        
        return base_cost
    
    def health_check(self) -> Dict:
        """Verifica saúde das APIs SERPRO"""
        try:
            token = self._get_oauth_token()
            if not token:
                return {'status': 'unhealthy', 'error': 'Cannot obtain OAuth token'}
            
            # Teste básico de conectividade
            response = requests.get(
                f'{self.endpoint}api/status',
                headers={'Authorization': f'Bearer {token}'},
                timeout=5
            )
            
            return {
                'status': 'healthy' if response.status_code == 200 else 'degraded',
                'response_time_ms': response.elapsed.total_seconds() * 1000,
                'token_valid': bool(token)
            }
            
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e)
            }