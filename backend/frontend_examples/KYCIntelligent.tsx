/**
 * Exemplo de integração frontend para Sistema KYC Multi-Provider
 * React/Next.js component que usa roteamento inteligente do backend
 */

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Types
interface KYCRecommendation {
  provider: string;
  integration_type: string;
  publishable_key?: string;
  public_key?: string;
  host_key?: string;
  supported_documents: string[];
  capabilities: {
    biometric: boolean;
    pep: boolean;
    documents: boolean;
  };
}

interface KYCStatus {
  status: 'not_started' | 'pending' | 'approved' | 'rejected' | 'processing';
  provider?: string;
  confidence_score?: number;
  rejection_reason?: string;
}

// ============================================================================
// Componente Principal
// ============================================================================

export function KYCIntelligent({ userId }: { userId: string }) {
  const [recommendation, setRecommendation] = useState<KYCRecommendation | null>(null);
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadKYCRecommendation();
    checkKYCStatus();
  }, [userId]);

  const loadKYCRecommendation = async () => {
    try {
      const response = await fetch('/api/kyc/recommend/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          needs_biometric: true,
          needs_pep: true,
          integration_type: 'hosted' // ou 'embedded'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setRecommendation(data.recommendation);
      }
    } catch (error) {
      console.error('Error loading KYC recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkKYCStatus = async () => {
    try {
      const response = await fetch('/api/kyc/user/status/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      setKycStatus(data);
    } catch (error) {
      console.error('Error checking KYC status:', error);
    }
  };

  const handleKYCSuccess = (result: any) => {
    setProcessing(false);
    // Recarregar status
    checkKYCStatus();
    // Notificar sucesso
    alert('Verificação de identidade concluída com sucesso!');
  };

  const handleKYCError = (error: any) => {
    setProcessing(false);
    console.error('KYC Error:', error);
    alert('Erro na verificação. Tente novamente.');
  };

  // Estados de loading e já verificado
  if (loading) {
    return (
      <div className="kyc-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p>Carregando recomendação de verificação...</p>
      </div>
    );
  }

  if (kycStatus?.status === 'approved') {
    return (
      <div className="kyc-approved bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-green-400 text-2xl">✅</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Identidade Verificada
            </h3>
            <p className="text-sm text-green-700">
              Verificado via {kycStatus.provider} - Confiança: {(kycStatus.confidence_score! * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (kycStatus?.status === 'pending' || processing) {
    return (
      <div className="kyc-pending bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Verificação em Processamento
            </h3>
            <p className="text-sm text-yellow-700">
              Aguarde enquanto analisamos seus documentos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar componente baseado na recomendação
  if (!recommendation) {
    return (
      <div className="kyc-error bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Erro ao carregar opções de verificação.</p>
      </div>
    );
  }

  return (
    <div className="kyc-container space-y-4">
      <div className="kyc-header">
        <h2 className="text-xl font-semibold text-gray-900">
          Verificação de Identidade
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Recomendado: {recommendation.provider.toUpperCase()}
        </p>
      </div>

      {/* Renderizar componente específico do provedor */}
      {recommendation.provider === 'stripe' && (
        <StripeKYCComponent 
          recommendation={recommendation}
          onSuccess={handleKYCSuccess}
          onError={handleKYCError}
          setProcessing={setProcessing}
        />
      )}

      {recommendation.provider === 'idwall' && (
        <IdwallKYCComponent 
          recommendation={recommendation}
          onSuccess={handleKYCSuccess}
          onError={handleKYCError}
          setProcessing={setProcessing}
        />
      )}

      {recommendation.provider === 'unico' && (
        <UnicoKYCComponent 
          recommendation={recommendation}
          onSuccess={handleKYCSuccess}
          onError={handleKYCError}
          setProcessing={setProcessing}
        />
      )}
    </div>
  );
}

// ============================================================================
// Componentes Específicos por Provedor
// ============================================================================

function StripeKYCComponent({ 
  recommendation, 
  onSuccess, 
  onError, 
  setProcessing 
}: any) {
  const startStripeVerification = async () => {
    try {
      setProcessing(true);

      // Criar sessão Stripe
      const response = await fetch('/api/kyc/stripe/session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          integration_type: 'hosted',
          return_url: `${window.location.origin}/kyc/callback`
        })
      });

      const data = await response.json();

      if (data.success) {
        // Hosted flow - redirecionar para Stripe
        window.location.href = data.session_url;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      onError(error);
    }
  };

  return (
    <div className="stripe-kyc bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <img 
          src="/icons/stripe-logo.svg" 
          alt="Stripe" 
          className="w-8 h-8"
        />
        <div>
          <h3 className="font-medium text-gray-900">Stripe Identity</h3>
          <p className="text-sm text-gray-500">Verificação internacional</p>
        </div>
      </div>

      <ul className="text-sm text-gray-600 space-y-1 mb-4">
        <li>✓ Passaportes e CNH nova geração</li>
        <li>✓ Verificação biométrica automática</li>
        <li>✓ Processo seguro e rápido</li>
      </ul>

      <button
        onClick={startStripeVerification}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        🆔 Verificar com Stripe
      </button>
    </div>
  );
}

function IdwallKYCComponent({ 
  recommendation, 
  onSuccess, 
  onError, 
  setProcessing 
}: any) {
  const startIdwallVerification = async () => {
    try {
      setProcessing(true);

      // Buscar configuração do widget
      const configResponse = await fetch('/api/kyc/idwall/config/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const configData = await configResponse.json();

      if (!configData.success) {
        throw new Error('Falha ao carregar configuração Idwall');
      }

      // Carregar SDK Idwall dinamicamente
      const script = document.createElement('script');
      script.src = 'https://sdk.idwall.co/v1/idwall.min.js';
      script.onload = () => {
        // Inicializar SDK
        (window as any).IdwallSDK.init({
          publicKey: configData.config.public_key,
          environment: configData.config.environment,
          theme: configData.config.theme
        });

        // Abrir modal
        (window as any).IdwallSDK.openModal({
          services: configData.config.services,
          user: configData.config.user,
          onSuccess: async (result: any) => {
            // Enviar resultado para backend
            await fetch('/api/kyc/sdk/result/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              },
              body: JSON.stringify({
                provider: 'idwall',
                result: result
              })
            });

            onSuccess(result);
          },
          onError: onError,
          onClose: () => setProcessing(false)
        });
      };

      document.head.appendChild(script);
    } catch (error) {
      onError(error);
    }
  };

  return (
    <div className="idwall-kyc bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <img 
          src="/icons/idwall-logo.svg" 
          alt="Idwall" 
          className="w-8 h-8"
        />
        <div>
          <h3 className="font-medium text-gray-900">Idwall</h3>
          <p className="text-sm text-gray-500">Verificação brasileira completa</p>
        </div>
      </div>

      <ul className="text-sm text-gray-600 space-y-1 mb-4">
        <li>✓ RG, CNH, CPF, CNPJ</li>
        <li>✓ Verificação PEP/Sanções incluída</li>
        <li>✓ Background check completo</li>
      </ul>

      <button
        onClick={startIdwallVerification}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
      >
        📄 Verificar com Idwall
      </button>
    </div>
  );
}

function UnicoKYCComponent({ 
  recommendation, 
  onSuccess, 
  onError, 
  setProcessing 
}: any) {
  const startUnicoVerification = async () => {
    try {
      setProcessing(true);

      // Buscar configuração
      const configResponse = await fetch('/api/kyc/unico/config/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const configData = await configResponse.json();

      if (!configData.success) {
        throw new Error('Falha ao carregar configuração Unico');
      }

      // Implementação Unico SDK seria aqui
      // Por enquanto, simular processo
      setTimeout(() => {
        onSuccess({
          status: 'APPROVED',
          similarity_score: 95,
          liveness_passed: true
        });
      }, 3000);

    } catch (error) {
      onError(error);
    }
  };

  return (
    <div className="unico-kyc bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <img 
          src="/icons/unico-logo.svg" 
          alt="Unico" 
          className="w-8 h-8"
        />
        <div>
          <h3 className="font-medium text-gray-900">Unico Check</h3>
          <p className="text-sm text-gray-500">Biometria premium +99% acurácia</p>
        </div>
      </div>

      <ul className="text-sm text-gray-600 space-y-1 mb-4">
        <li>✓ Liveness detection 3D</li>
        <li>✓ Face match ultra preciso</li>
        <li>✓ Anti-spoofing avançado</li>
      </ul>

      <button
        onClick={startUnicoVerification}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
      >
        🎯 Verificar com Unico
      </button>
    </div>
  );
}

export default KYCIntelligent;