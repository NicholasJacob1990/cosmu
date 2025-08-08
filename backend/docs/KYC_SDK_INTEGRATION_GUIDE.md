# 📱 Guia de Integração SDKs KYC Multi-Provider

## 🎯 **Estratégia de Implementação**

### **Fase 1: MVP - REST API Only** ✅ **IMPLEMENTADO**
```bash
# ✅ Já temos funcionando:
- Backend Strategy Pattern (4 provedores)
- Roteamento inteligente epsilon-greedy  
- Celery async processing
- Métricas em tempo real
```

### **Fase 2: Web SDKs** 🔄 **PRÓXIMO**
```bash
# Frontend React/Next.js
npm install @stripe/stripe-js
npm install @idwall/web-sdk
npm install @unico/web-capture
```

### **Fase 3: Mobile SDKs** 📱 **FUTURO**
```bash
# React Native
npm install @stripe/stripe-react-native
npm install react-native-idwall
npm install react-native-unico-check
```

---

## 🛠️ **Implementação por Provedor**

### **1. Stripe Identity** 🏆 **RECOMENDADO PARA MVP**

#### **Backend Setup** ✅ Já implementado
```python
# backend/api/services/providers/stripe_kyc.py
def create_verification_session(user_id, integration_type='hosted'):
    return stripe.identity.VerificationSession.create(
        type='document',
        metadata={'user_id': str(user_id)},
        options={
            'document': {
                'allowed_types': ['driving_license', 'passport', 'id_card'],
                'require_live_capture': True,
                'require_matching_selfie': True
            }
        },
        # Hosted = redireciona para Stripe
        # Embedded = usa Stripe Elements no seu site
        return_url='https://app.galaxia.com/kyc/callback' if integration_type == 'embedded' else None
    )
```

#### **Frontend Hosted Flow** 🎯 **MAIS SIMPLES**
```javascript
// frontend/src/components/KYCStripeHosted.tsx
import React from 'react';

export function KYCStripeHosted({ userId }) {
  const startVerification = async () => {
    const response = await fetch('/api/kyc/stripe/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: userId,
        integration_type: 'hosted' 
      })
    });
    
    const { session_url } = await response.json();
    
    // Redireciona para Stripe (UX limpa, LGPD compliant)
    window.location.href = session_url;
  };

  return (
    <button onClick={startVerification} className="btn-primary">
      🆔 Verificar Identidade
    </button>
  );
}
```

#### **Frontend Embedded Flow** ⚡ **MAIS CONTROLE**
```javascript
// frontend/src/components/KYCStripeEmbedded.tsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function IdentityVerificationForm({ userId }) {
  const stripe = useStripe();
  
  const handleVerification = async () => {
    const response = await fetch('/api/kyc/stripe/session', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, integration_type: 'embedded' })
    });
    
    const { client_secret } = await response.json();
    
    // Abrir modal Stripe Identity dentro do site
    const { error } = await stripe.verifyIdentity(client_secret);
    
    if (!error) {
      // Sucesso - atualizar UI
      window.location.href = '/dashboard?kyc=success';
    }
  };

  return (
    <div className="kyc-container">
      <h3>Verificação de Identidade</h3>
      <p>Para sua segurança, precisamos verificar sua identidade</p>
      <button onClick={handleVerification}>
        Iniciar Verificação
      </button>
    </div>
  );
}

export function KYCStripeEmbedded({ userId }) {
  return (
    <Elements stripe={stripePromise}>
      <IdentityVerificationForm userId={userId} />
    </Elements>
  );
}
```

---

### **2. Idwall** 🇧🇷 **MELHOR PARA DOCUMENTOS BR**

#### **Opção A: REST API Only** ✅ **JÁ IMPLEMENTADO**
```python
# Usar nosso IdwallKYCProvider atual
# Upload de fotos via frontend normal → backend processa
```

#### **Opção B: Widget JS** 🎨 **EXPERIÊNCIA PREMIUM**
```bash
npm install @idwall/web-sdk
# ou script tag:
# <script src="https://sdk.idwall.co/v1/idwall.min.js"></script>
```

```javascript
// frontend/src/components/KYCIdwall.tsx
import React, { useEffect } from 'react';

export function KYCIdwall({ userId, onSuccess, onError }) {
  useEffect(() => {
    // Carregar Idwall SDK
    window.IdwallSDK.init({
      publicKey: process.env.NEXT_PUBLIC_IDWALL_PUBLIC_KEY,
      env: 'sandbox', // ou 'production'
      theme: {
        primaryColor: '#6366f1', // Cor do seu brand
        borderRadius: '8px'
      }
    });
  }, []);

  const startVerification = () => {
    window.IdwallSDK.openModal({
      services: ['documents', 'face_match', 'pep_check'],
      user: {
        id: userId,
        email: 'user@example.com'
      },
      onSuccess: (result) => {
        // Enviar resultado para backend
        fetch('/api/kyc/idwall/callback', {
          method: 'POST',
          body: JSON.stringify({
            user_id: userId,
            idwall_result: result
          })
        }).then(() => onSuccess(result));
      },
      onError: (error) => {
        console.error('Idwall error:', error);
        onError(error);
      },
      onClose: () => {
        console.log('Modal fechado pelo usuário');
      }
    });
  };

  return (
    <div className="kyc-idwall">
      <button onClick={startVerification} className="btn-secondary">
        📄 Verificar Documentos BR
      </button>
    </div>
  );
}
```

---

### **3. Unico Check** 🔬 **BIOMETRIA PREMIUM**

#### **Web SDK** 
```bash
npm install @unico/web-capture
```

```javascript
// frontend/src/components/KYCUnico.tsx
import { UnicoWebCapture } from '@unico/web-capture';

export function KYCUnico({ userId }) {
  const unicoCapture = new UnicoWebCapture({
    hostKey: process.env.NEXT_PUBLIC_UNICO_HOST_KEY,
    hostInfo: 'galaxia-marketplace'
  });

  const startCapture = async () => {
    try {
      // 1. Capturar documento
      const documentResult = await unicoCapture.captureDocument({
        documentType: 'RG', // ou 'CNH', 'PASSPORT'
        side: 'front' // depois 'back' se necessário
      });

      // 2. Capturar selfie com liveness
      const selfieResult = await unicoCapture.captureSelfie({
        liveness: true,
        quality: 'high'
      });

      // 3. Enviar para backend
      const response = await fetch('/api/kyc/unico/verify', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          document: documentResult.base64,
          selfie: selfieResult.base64,
          liveness_result: selfieResult.livenessResult
        })
      });

      const result = await response.json();
      
      if (result.success) {
        window.location.href = '/dashboard?kyc=success';
      }
      
    } catch (error) {
      console.error('Unico error:', error);
      alert('Erro na captura. Tente novamente.');
    }
  };

  return (
    <div className="kyc-unico">
      <h4>Verificação Biométrica Avançada</h4>
      <p>Acurácia superior a 99% com detecção de vida</p>
      <button onClick={startCapture} className="btn-premium">
        🎯 Iniciar Captura Unico
      </button>
    </div>
  );
}
```

---

### **4. SERPRO Datavalid** 🏛️ **BACKEND ONLY**

```python
# backend/api/services/providers/datavalid_kyc.py
# ✅ Já implementado - apenas REST API
# Validação de CPF/CNH direto nas bases oficiais
# Não há SDK frontend (é apenas backend validation)
```

---

## 🔄 **Sistema Unificado no Frontend**

### **Componente Inteligente** que usa nosso roteador:

```javascript
// frontend/src/components/KYCIntelligent.tsx
import React, { useState, useEffect } from 'react';
import { KYCStripeHosted } from './KYCStripeHosted';
import { KYCIdwall } from './KYCIdwall';
import { KYCUnico } from './KYCUnico';

export function KYCIntelligent({ userId, userProfile }) {
  const [recommendedProvider, setRecommendedProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Consultar backend para recomendação inteligente
    fetch(`/api/kyc/recommend?user_id=${userId}&needs_biometric=true&needs_pep=true`)
      .then(res => res.json())
      .then(data => {
        setRecommendedProvider(data.provider);
        setLoading(false);
      });
  }, [userId]);

  const handleSuccess = (result) => {
    // KYC sucesso - atualizar perfil
    window.location.href = '/dashboard?kyc=approved';
  };

  const handleError = (error) => {
    // KYC erro - mostrar fallback
    console.error('KYC failed:', error);
    // Pode tentar outro provedor automaticamente
  };

  if (loading) {
    return <div className="loading">Selecionando melhor método...</div>;
  }

  // Renderizar componente baseado na recomendação do backend
  switch (recommendedProvider) {
    case 'stripe':
      return (
        <KYCStripeHosted 
          userId={userId} 
          onSuccess={handleSuccess}
          onError={handleError}
        />
      );
      
    case 'idwall':
      return (
        <KYCIdwall 
          userId={userId}
          onSuccess={handleSuccess} 
          onError={handleError}
        />
      );
      
    case 'unico':
      return (
        <KYCUnico 
          userId={userId}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      );
      
    default:
      return <div>Erro: Provedor não suportado</div>;
  }
}
```

---

## 📱 **Mobile (React Native)** - Futuro

```bash
# Quando chegar a fase mobile:
npm install @stripe/stripe-react-native
npm install react-native-idwall  
npm install react-native-unico-check
```

```javascript
// mobile/src/components/KYCMobile.tsx
import { StripeIdentitySheet } from '@stripe/stripe-react-native';
import { IdwallReactNative } from 'react-native-idwall';
import { UnicoReactNative } from 'react-native-unico-check';

export function KYCMobile({ userId, provider }) {
  // Implementação similar ao web, mas com SDKs nativos
  // Melhor UX, acesso à câmera otimizado, etc.
}
```

---

## 🎯 **Recomendação Final**

### **Para MVP (próximos 30 dias):**
1. ✅ **Backend multi-provider** (já implementado)
2. 🔄 **Frontend Stripe Hosted** (mais simples, compliance automático)
3. 🔄 **REST fallback** para outros provedores

### **Para Growth (2-6 meses):**
1. **Idwall Widget JS** (experiência brasileira premium)
2. **Unico Web SDK** (biometria avançada)
3. **A/B testing** entre provedores

### **Para Scale (6+ meses):**
1. **Mobile SDKs nativos**
2. **Liveness detection avançado**
3. **Otimização por região/demographic**

### **Código para começar hoje:**

```bash
# 1. Frontend simples
npm install @stripe/stripe-js

# 2. Adicionar endpoint no backend
# backend/api/views_kyc.py - criar stripe session endpoint

# 3. Testar fluxo completo
# curl -X POST localhost:8000/api/kyc/stripe/session -d '{"user_id": 1}'
```

**O sistema que implementamos é agnóstico aos SDKs** - pode usar REST hoje e evoluir para SDKs gradualmente, sem reescrever o backend! 🚀