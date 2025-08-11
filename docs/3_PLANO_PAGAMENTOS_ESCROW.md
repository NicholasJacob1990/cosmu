# 💰 PLANO DE PAGAMENTOS E ESCROW
## GalaxIA Marketplace - Sistema de Custódia e Transações

> **Documento Técnico v1.1**  
> **Foco:** Descreve o sistema de escrow, fluxo de pagamentos, gestão de disputas e conformidade legal.

---

## 💰 **SISTEMA DE ESCROW (CUSTÓDIA) E GESTÃO DE PAGAMENTOS**

### **Filosofia do Sistema de Custódia**

Baseado nas melhores práticas de gestão de escrow para transações seguras, o sistema GalaxIA implementa um **modelo de custódia obrigatória** onde todos os pagamentos ficam retidos até a aprovação expressa do cliente. Esta abordagem garante:

- **Proteção Total ao Cliente:** Fundos só são liberados após confirmação de satisfação
- **Segurança para o Prestador:** Garantia de que o pagamento está reservado e será liberado
- **Transparência Completa:** Todas as partes sabem exatamente o status dos pagamentos
- **Conformidade Legal:** Atendimento às regulamentações brasileiras de custódia

---

### **FLUXO COMPLETO DE ESCROW POR PROJETO**

#### **ETAPA 1: Criação da Custódia (Início do Projeto)**
```
┌─ CLIENTE ACEITA PROPOSTA ─────────────────────────────────────────┐
│                                                                    │
│ 1. Cliente seleciona proposta de R$ 2.500,00                     │
│ 2. Sistema calcula valores:                                        │
│    ├─ Valor do Serviço: R$ 2.500,00                             │
│    ├─ Taxa GalaxIA (10%): R$ 250,00                             │
│    ├─ Taxa de Processamento (3%): R$ 75,00                       │
│    └─ TOTAL A DEBITAR: R$ 2.825,00                              │
│                                                                    │
│ 3. Débito automático do cartão/conta do cliente                  │
│ 4. Criação da conta escrow com ID único                          │
│ 5. Status inicial: "FUNDOS_EM_CUSTODIA"                         │
│                                                                    │
│ 📊 Notificações automáticas:                                     │
│ ├─ Cliente: "Pagamento processado, projeto iniciado"             │
│ ├─ Prestador: "Projeto confirmado, inicie o trabalho"           │
│ └─ Sistema: Log de auditoria criado                              │
└────────────────────────────────────────────────────────────────────┘
```

#### **ETAPA 2: Monitoramento Durante Execução**
```typescript
interface EscrowAccount {
  projectId: string;
  clientId: string;
  providerId: string;
  status: EscrowStatus;
  amounts: {
    serviceValue: number;
    platformFee: number;
    processingFee: number;
    totalHeld: number;
  };
  timeline: {
    createdAt: Date;
    estimatedDelivery: Date;
    actualDelivery?: Date;
    approvalDeadline: Date;
    maxHoldPeriod: Date; // 30 dias máximo
  };
  milestones: ProjectMilestone[];
  disputeResolution?: DisputeCase;
}

enum EscrowStatus {
  FUNDS_HELD = 'FUNDOS_EM_CUSTODIA',
  DELIVERY_SUBMITTED = 'ENTREGA_ENVIADA',
  UNDER_REVIEW = 'EM_ANALISE_CLIENTE',
  REVISION_REQUESTED = 'REVISAO_SOLICITADA',
  APPROVED = 'APROVADO_CLIENTE',
  FUNDS_RELEASED = 'PAGAMENTO_LIBERADO',
  IN_DISPUTE = 'EM_DISPUTA',
  REFUNDED = 'REEMBOLSADO'
}
```

#### **ETAPA 3: Entrega e Processo de Aprovação**
```
┌─ PRESTADOR ENVIA ENTREGA ─────────────────────────────────────────┐
│                                                                    │
│ 1. Prestador faz upload dos arquivos finais                      │
│ 2. Sistema atualiza status: "ENTREGA_ENVIADA"                    │
│ 3. Timer de aprovação inicia: 7 dias para análise                │
│                                                                    │
│ 📨 Notificação automática para o cliente:                        │
│ ├─ "Seu projeto foi entregue e aguarda aprovação"                │
│ ├─ Link direto para visualização                                  │
│ ├─ Prazo: 7 dias para análise                                    │
│ └─ Ações: [Aprovar] [Solicitar Revisão] [Abrir Disputa]         │
│                                                                    │
│ 📊 Dashboard do prestador:                                        │
│ ├─ Status: "Aguardando aprovação do cliente"                     │
│ ├─ Prazo restante: 6 dias, 14 horas                             │
│ └─ Valor em custódia: R$ 2.500,00 (garantido)                   │
└────────────────────────────────────────────────────────────────────┘
```

#### **ETAPA 4: Cenários de Aprovação**

**Cenário A: Aprovação Direta**
```
┌─ CLIENTE APROVA ──────────────────────────────────────────────────┐
│                                                                    │
│ ✅ Cliente clica em "Aprovar Entrega"                            │
│ ├─ Confirmação obrigatória: "Você está satisfeito?"              │
│ ├─ Avaliação opcional (1-5 estrelas)                             │
│ └─ Comentário opcional para feedback                              │
│                                                                    │
│ 💰 Liberação automática em 2 horas úteis:                        │
│ ├─ R$ 2.250,00 → Conta do prestador (90%)                       │
│ ├─ R$ 250,00 → Receita GalaxIA (10%)                            │
│ └─ Status: "PAGAMENTO_LIBERADO"                                  │
│                                                                    │
│ 📨 Notificações:                                                  │
│ ├─ Prestador: "Pagamento liberado - R$ 2.250,00"                │
│ ├─ Cliente: "Projeto concluído com sucesso"                      │
│ └─ Ambos: Convite para futuros projetos                          │
└────────────────────────────────────────────────────────────────────┘
```

**Cenário B: Solicitação de Revisão**
```
┌─ CLIENTE SOLICITA REVISÃO ────────────────────────────────────────┐
│                                                                    │
│ ⚠️ Cliente clica em "Solicitar Revisão"                          │
│ ├─ Formulário obrigatório com detalhes específicos               │
│ ├─ Opção de anexar referências/exemplos                          │
│ └─ Prazo para nova entrega: 3-7 dias (negociável)               │
│                                                                    │
│ 🔄 Processo de revisão:                                           │
│ ├─ Status: "REVISAO_SOLICITADA"                                  │
│ ├─ Fundos permanecem em custódia                                 │
│ ├─ Prestador tem prazo para nova entrega                         │
│ └─ Máximo 2 revisões incluídas (contrato padrão)                │
│                                                                    │
│ 📊 Tracking automático:                                           │
│ ├─ Número da revisão (1ª, 2ª, etc.)                             │
│ ├─ Tempo gasto em revisões                                       │
│ └─ Histórico completo de alterações                              │
└────────────────────────────────────────────────────────────────────┘
```

**Cenário C: Aprovação Automática (Timeout)**
```
┌─ APROVAÇÃO POR INATIVIDADE ───────────────────────────────────────┐
│                                                                    │
│ ⏰ Cliente não respondeu em 7 dias                               │
│                                                                    │
│ 📨 Sequência de lembretes automáticos:                            │
│ ├─ Dia 3: "Lembre-se de revisar sua entrega"                    │
│ ├─ Dia 5: "Apenas 2 dias para aprovação"                        │
│ ├─ Dia 6: "Último dia para aprovação"                           │
│ └─ Dia 7: "Aprovação automática em 2 horas"                     │
│                                                                    │
│ ✅ Aprovação automática acionada:                                │
│ ├─ Status: "APROVADO_AUTOMATICAMENTE"                            │
│ ├─ Pagamento liberado normalmente                                │
│ ├─ Cliente ainda pode avaliar por 15 dias                       │
│ └─ Sistema gera relatório de inatividade                         │
└────────────────────────────────────────────────────────────────────┘
```

---

### **SISTEMA DE DISPUTAS E MEDIAÇÃO**

#### **Abertura de Disputa**
```
┌─ PROCESSO DE DISPUTA ─────────────────────────────────────────────┐
│                                                                    │
│ 🚨 Cliente ou Prestador abre disputa                             │
│                                                                    │
│ 📋 Informações obrigatórias:                                     │
│ ├─ Categoria da disputa (qualidade, prazo, escopo)               │
│ ├─ Descrição detalhada do problema                               │
│ ├─ Evidências (arquivos, prints, conversas)                      │
│ ├─ Solução proposta                                              │
│ └─ Valor em questão                                               │
│                                                                    │
│ ⏸️ Status escrow: "EM_DISPUTA"                                   │
│ ├─ Fundos congelados até resolução                               │
│ ├─ Ambas as partes notificadas                                   │
│ └─ Prazo: 48h para resposta da outra parte                      │
└────────────────────────────────────────────────────────────────────┘
```

#### **Processo de Mediação**
```typescript
interface DisputeResolution {
  disputeId: string;
  projectId: string;
  initiator: 'CLIENT' | 'PROVIDER';
  category: DisputeCategory;
  status: DisputeStatus;
  timeline: {
    opened: Date;
    responseDeadline: Date;
    mediationStarted?: Date;
    resolved?: Date;
  };
  evidence: Evidence[];
  mediatorAssigned?: string;
  resolution?: {
    type: 'REFUND_FULL' | 'REFUND_PARTIAL' | 'RELEASE_FULL' | 'RELEASE_PARTIAL';
    amount: number;
    reasoning: string;
    agreedByBoth: boolean;
  };
}

// Processo de mediação em 3 níveis
const mediationLevels = {
  LEVEL_1: 'Resolução automática via IA (24h)',
  LEVEL_2: 'Mediação por especialista GalaxIA (72h)', 
  LEVEL_3: 'Arbitragem externa vinculante (7 dias)'
};
```

---

### **GESTÃO FINANCEIRA E COMPLIANCE**

#### **Conta Escrow Centralizada**
```
┌─ ESTRUTURA FINANCEIRA ────────────────────────────────────────────┐
│                                                                    │
│ 🏦 Conta Escrow Master (Banco do Brasil)                         │
│ ├─ Segregação total dos fundos dos clientes                      │
│ ├─ Auditoria mensal por empresa independente                     │
│ ├─ Seguro garantia de até R$ 10 milhões                         │
│ └─ Compliance com Circular 3.978 do Banco Central               │
│                                                                    │
│ 📊 Sub-contas virtuais por projeto:                              │
│ ├─ ID único para cada transação                                  │
│ ├─ Rastreabilidade completa (blockchain)                         │
│ ├─ Reconciliação automática diária                               │
│ └─ Relatórios em tempo real                                      │
│                                                                    │
│ 🔐 Segurança multicamadas:                                       │
│ ├─ Criptografia AES-256 para dados                              │
│ ├─ Autenticação multifator para liberações                       │
│ ├─ Logs imutáveis de todas as transações                        │
│ └─ Backup geográfico redundante                                  │
└────────────────────────────────────────────────────────────────────┘
```

---

### **AUTOMATIZAÇÕES E INTELIGÊNCIA**

#### **IA de Prevenção de Disputas**
```typescript
interface DisputePreventionAI {
  // Análise de risco em tempo real
  riskFactors: {
    communicationGaps: number; // Dias sem comunicação
    scopeChanges: number; // Mudanças de escopo não documentadas
    timelineDeviations: number; // Atrasos vs cronograma
    satisfactionScore: number; // Based on sentiment analysis
  };
  
  // Intervenções automáticas
  interventions: {
    proactiveReminders: boolean; // Lembretes antes dos prazos
    mediationSuggestion: boolean; // Sugerir conversa
    scopeDocumentation: boolean; // Forçar documentação de mudanças
    qualityCheckpoints: boolean; // Checkpoints intermediários
  };
  
  // Score de probabilidade de disputa (0-100)
  disputeProbability: number;
}

// Ações automáticas baseadas no score
const preventiveActions = {
  'low_risk': 'Monitoramento padrão',
  'medium_risk': 'Lembretes proativos + check-in semanal',
  'high_risk': 'Mediação preventiva + milestone forçado',
  'critical_risk': 'Intervenção humana obrigatória'
};
```

#### **Otimização de Cash Flow**
```javascript
// Sistema inteligente de liberação de pagamentos
const cashFlowOptimization = {
  // Análise de padrões de aprovação por cliente
  clientBehaviorAnalysis: {
    averageApprovalTime: '2.3 days',
    autoApprovalRate: '78%',
    disputeHistoryScore: 'low_risk',
    paymentReliability: 'excellent'
  },
  
  // Liberação antecipada para prestadores qualificados
  earlyReleaseProgram: {
    eligibility: 'Elite + 4.8★ + 0% disputas últimos 6 meses',
    percentage: '50% após entrega + 50% após aprovação',
    fee: '1% adicional sobre valor antecipado'
  },
  
  // Seguros e garantias
  insuranceOptions: {
    projectInsurance: 'Até R$ 10k por projeto',
    performanceBond: 'Para projetos acima R$ 5k',
    paymentProtection: 'Cobertura 100% para clientes verificados'
  }
};
```

---

### **MÉTRICAS E KPIs DO SISTEMA ESCROW**

#### **Dashboards Executivos**
```
┌─ SAÚDE DO SISTEMA ESCROW ─────────────────────────────────────────┐
│                                                                    │
│ 💰 VOLUME FINANCEIRO (30 dias):                                  │
│ ├─ Total processado: R$ 2.4M (+18% vs mês anterior)             │
│ ├─ Média em custódia: R$ 380k (15% do volume mensal)            │
│ ├─ Tempo médio de liberação: 2.8 dias                           │
│ └─ Taxa de disputa: 0.3% (6 de 2.123 projetos)                 │
│                                                                    │
│ ⚡ PERFORMANCE OPERACIONAL:                                       │
│ ├─ Aprovação automática: 73% dos projetos                       │
│ ├─ Aprovação manual: 25% dos projetos                           │
│ ├─ Disputas resolvidas: 2% dos projetos                         │
│ ├─ SLA cumprimento: 99.2% (liberação em 2h)                    │
│ └─ Satisfação cliente: 4.7/5 com sistema escrow                 │
│                                                                    │
│ 🔐 SEGURANÇA E COMPLIANCE:                                        │
│ ├─ Funds segregation: 100% em conta separada                    │
│ ├─ Daily reconciliation: Automated + verified                   │
│ ├─ Audit compliance: 99.8% (última auditoria)                   │
│ ├─ Security incidents: 0 (último ano)                           │
│ └─ Regulatory reports: 100% em dia                              │
└────────────────────────────────────────────────────────────────────┘
```

---

### **GUIA DE IMPLEMENTAÇÃO TÉCNICA (Baseado em Stripe Connect)**

#### **Estrutura de Tabelas (Simplificada)**
```sql
-- escrow_transactions
CREATE TABLE escrow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    value DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, HELD, RELEASED, DISPUTED, CANCELLED
    release_at TIMESTAMP,
    dispute_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- dispute_logs
CREATE TABLE dispute_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_id UUID NOT NULL REFERENCES escrow_transactions(id),
    message TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

#### **Fluxo Prático com Stripe Connect**
1.  **Criação de Contas:**
    *   Cada vendedor tem uma conta Stripe Connect (Express ou Custom) vinculada à plataforma.
    *   A GalaxIA atua como a "platform account".

2.  **Checkout:**
    *   O cliente paga (Cartão, PIX) usando a API de Payment Intents do Stripe.
    *   O valor é capturado e retido temporariamente na conta da plataforma, **sem ser transferido** para o vendedor.

3.  **Retenção (Lógica de Backend):**
    *   O backend da GalaxIA controla o status da transação, mantendo o valor retido.
    *   Nenhuma transferência é feita para a conta do vendedor neste momento.

4.  **Liberação:**
    *   Após a confirmação do cliente (ou timeout), o backend chama a API do Stripe para criar uma **Transferência** (`transfer`) do valor retido para a conta Stripe Connect do vendedor.
    *   A comissão da GalaxIA (`application_fee_amount`) é automaticamente deduzida durante a transferência.

5.  **Reembolso/Disputa:**
    *   Se a disputa for resolvida a favor do cliente, o backend chama a API de **Reembolso** (`refund`) sobre o Payment Intent original.

#### **Checklist de Implementação de Escrow**

| Item                                              | Pronto? |
| ------------------------------------------------- | ------- |
| Modelo de dados de transação escrow               | ✅       |
| Integração com gateway de pagamento (Stripe)      | ☐       |
| Tela de confirmação de entrega para comprador     | ☐       |
| Lógica de liberação manual e automática           | ☐       |
| Sistema de disputa (comentários, evidências)      | ☐       |
| Painel admin para intervenção manual              | ☐       |
| Logs de auditoria e histórico de ações            | ☐       |
| Notificações (email, push, etc.)                  | ☐       |
| Testes de casos extremos (fraude, falha, timeout) | ☐       |
| Cláusulas legais nos Termos de Uso                | ✅       | 