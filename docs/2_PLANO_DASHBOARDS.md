# 🖥️ PLANO DE DASHBOARDS
## GalaxIA Marketplace - Visão Cliente e Profissional

> **Documento Técnico v1.1**  
> **Foco:** Detalha a arquitetura, UX e funcionalidades dos dashboards do cliente e do profissional.

---

## 🖥️ **TELA PRINCIPAL DO CLIENTE (DASHBOARD PÓS-LOGIN)**

### **Filosofia de Design e Objetivos**

Baseado nas melhores práticas de **Upwork, Fiverr, Workana** e tendências de UX 2025, o dashboard do cliente GalaxIA será uma **central de contratação e gestão de projetos** orientada à ação e resultados. A filosofia integra:

#### **Princípios de Design 2025:**
- **Clareza e Minimalismo:** Interface limpa com hierarquia visual clara, focando nos 20% de métricas que geram 80% das decisões
- **Storytelling de Dados:** Cada widget conta uma história específica (progresso, oportunidades, histórico)
- **Mobile-First Responsivo:** 80% dos usuários acessam via mobile - design adaptativo obrigatório
- **Acessibilidade WCAG 2.1 AA:** Contraste 4.5:1, navegação por teclado, suporte a leitores de tela
- **Personalização Inteligente:** IA sugere ações baseadas no comportamento e histórico do cliente

#### **Objetivos Primários:**
1. **Reduzir Tempo de Decisão:** Informações críticas visíveis em 3 segundos
2. **Aumentar Recontratação:** Facilitar contratação de prestadores com histórico positivo
3. **Melhorar Acompanhamento:** Status de projetos sempre visível e acionável
4. **Fomentar Confiança:** Transparência total em pagamentos, entregas e comunicação

---

### **Arquitetura de Layout (Design System 2025)**

#### **1. Header Inteligente (Fixo - 64px)**
```
┌─ Logo GalaxIA                    🔍 Busca Global (com IA)           🔔 📊 👤 ─┐
│  "Cosmic Connections"              "Encontre serviços..."            (4) Painel │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Características Técnicas:**
- **Busca com IA:** Sugestões inteligentes baseadas em histórico e tendências
- **Notificações Contextuais:** Badges numerados com priorização por urgência
- **Mini Dashboard:** Ícone com métricas rápidas (projetos ativos, mensagens não lidas)
- **Tema Adaptativo:** Auto-switch entre light/dark baseado em horário

#### **2. Sidebar Responsiva (240px Desktop / Hidden Mobile)**
```
📊 Dashboard                    
📋 Meus Projetos        (12 ativos)
💬 Mensagens           (3 não lidas)  
⭐ Listas Salvas        (47 itens)
💳 Pagamentos          
🔍 Buscar Serviços              
───────────────────────────────
[+ POSTAR NOVO PROJETO]         
```

**Features Avançadas:**
- **Contadores Dinâmicos:** Atualizados em tempo real via WebSocket
- **Menu Contextual:** Expandido no desktop, burger menu no mobile
- **Progresso Visual:** Barras de progresso dos projetos ativos

#### **3. Área Principal - Sistema de Cards Modulares**

**Baseado no Princípio da Pirâmide Invertida:**
1. **Informações Críticas** (Top): Ações urgentes que exigem decisão
2. **Contexto Importante** (Meio): Métricas de acompanhamento e status
3. **Informações de Apoio** (Bottom): Recomendações e descoberta

---

### **Widgets do Dashboard - Especificação Detalhada**

#### **Widget 1: Painel de Comando de Projetos** ⚡
```
┌─ PROJETOS QUE PRECISAM DA SUA ATENÇÃO ─────────────────────────┐
│                                                                 │
│ 🔄 Logo Empresa XYZ • João Silva                               │
│ ├─ Status: Entrega Realizada - Aguardando Sua Revisão          │
│ ├─ ⏰ Há 2 horas • 📁 3 arquivos                               │
│ └─ [Revisar Entrega] [💬 Enviar Mensagem]                      │
│                                                                 │
│ 🟡 Website Responsivo • Maria Santos                           │
│ ├─ Status: Em Desenvolvimento - Prazo em 2 dias                │
│ ├─ ⏰ Atualizado há 4h • 📊 70% concluído                     │
│ └─ [Ver Progresso] [💬 Chat]                                   │
│                                                                 │
│ 🟢 Copywriting Blog • Pedro Lima                               │
│ ├─ Status: Aguardando Aprovação de Pagamento                   │
│ ├─ ⏰ Concluído ontem • ⭐ Avaliação pendente                  │
│ └─ [Liberar Pagamento] [⭐ Avaliar]                            │
│                                                                 │
│ 📎 Ver todos os projetos (12 ativos)                          │
└─────────────────────────────────────────────────────────────────┘
```

**Design System:**
- **Cores de Status:** 🔴 Urgente • 🟡 Atenção • 🟢 OK • 🔵 Concluído
- **Ações Inteligentes:** Botões mudam baseado no status do projeto
- **Micro-animações:** Pulse suave em itens urgentes
- **Responsividade:** Cards empilhados em mobile

#### **Widget 2: Centro de Mensagens Ativas** 💬
```
┌─ CONVERSAS RECENTES ──────────────────────────────────────────┐
│                                                                 │
│ 👤 Ana Designer          🔴 Nova mensagem • há 15min           │
│ ├─ "Enviei 3 opções de logo para..."                          │
│ ├─ Projeto: Identidade Visual Completa                         │
│ └─ [Responder] [Ver Projeto]                                   │
│                                                                 │
│ 👤 Carlos Dev            📎 Anexo • há 1h                     │
│ ├─ "Link do site em homologação pronto"                       │
│ ├─ Projeto: Landing Page E-commerce                            │
│ └─ [Ver Anexo] [Testar Site]                                  │
│                                                                 │
│ 💬 Abrir caixa de entrada completa (8 conversas)               │
└─────────────────────────────────────────────────────────────────┘
```

**Features Avançadas:**
- **Preview Inteligente:** Mostra tipo de conteúdo (texto, arquivo, link)
- **Notificações Push:** Integração com navegador para alerts
- **Status de Leitura:** Indicadores visuais de lida/não lida
- **Filtros Rápidos:** Por projeto, urgência, tipo de mensagem

#### **Widget 3: Recontratação Inteligente** 🔄
```
┌─ PRESTADORES RECOMENDADOS PARA VOCÊ ─────────────────────────┐
│                                                                 │
│ ⭐⭐⭐⭐⭐ João Silva • Designer Gráfico                     │
│ ├─ 5 projetos concluídos • Última: há 2 meses                │
│ ├─ Especialidade: Logos e Identidade Visual                    │
│ └─ [Contratar Novamente] [Ver Portfólio]                      │
│                                                                 │
│ ⭐⭐⭐⭐⭐ Maria Santos • Desenvolvedora                      │
│ ├─ 3 projetos concluídos • Última: há 1 mês                  │
│ ├─ Especialidade: WordPress e E-commerce                       │
│ └─ [Conversar Diretamente] [Ver Perfil]                       │
│                                                                 │
│ 🔍 Ver mais recomendações baseadas no seu histórico            │
└─────────────────────────────────────────────────────────────────┘
```

**IA de Recomendação:**
- **Análise de Compatibilidade:** Score baseado em projetos anteriores
- **Disponibilidade Real-time:** Status atual do prestador
- **Precificação Inteligente:** Faixa de preços baseada no histórico

#### **Widget 4: Descoberta Personalizada** 🎯
```
┌─ TALENTOS EM ALTA PARA SEUS PROJETOS ──────────────────────────┐
│                                                                 │
│ 🔥 Tendência: Motion Design                                    │
│ ├─ 3 prestadores especialistas • A partir de R$ 350          │
│ ├─ "Para dar vida às suas apresentações"                       │
│ └─ [Explorar Motion Design]                                     │
│                                                                 │
│ ⚡ Novo na plataforma: SEO Técnico                            │
│ ├─ Ana Costa • 8 anos exp. • Recém chegou                    │
│ ├─ Oferta especial: -20% no primeiro projeto                   │
│ └─ [Ver Perfil] [Conversar]                                   │
│                                                                 │
│ 🎨 Para você: Design de Infográficos                          │
│ ├─ Baseado em: "Design Gráfico" do seu histórico             │
│ ├─ 12 prestadores disponíveis • R$ 180-850                    │
│ └─ [Ver Especialistas]                                          │
└─────────────────────────────────────────────────────────────────┘
```

**Engine de Descoberta:**
- **ML Collaborative Filtering:** Baseado em clientes similares
- **Sazonalidade:** Antecipa necessidades (ex: design de fim de ano)
- **Tendências de Mercado:** Integra dados externos e análise de buscas

#### **Widget 5: Métricas de Sucesso** 📊
```
┌─ SEUS NÚMEROS ────────────────────────────────────────────────┐
│                                                                 │
│ Este mês:                                                      │
│ 💰 R$ 4.750 investidos     📈 +23% vs mês anterior           │
│ 🎯 5 projetos concluídos   ⭐ 4.8/5 satisfação média         │
│ ⚡ 1.2h tempo resp. médio  🔄 3 prestadores recontratados      │
│                                                                 │
│ 📊 [Ver relatório completo] [Exportar dados]                  │
└─────────────────────────────────────────────────────────────────┘
```

**Analytics Avançado:**
- **ROI Calculado:** Retorno estimado dos investimentos em design/marketing
- **Benchmarking:** Comparação com clientes similares (anonimizada)
- **Previsibilidade:** Sugestões de budget baseadas em sazonalidade

---

## 🧑‍💻 **TELA PRINCIPAL DO PROFISSIONAL (DASHBOARD PÓS-LOGIN)**

### **Filosofia de Design e Objetivos**

O dashboard do profissional é uma **central de gestão de negócios e crescimento profissional**, fundamentalmente diferente do cliente. Baseado em insights de plataformas como **Upwork Pro, Fiverr Business** e **Workana Elite**, foca em:

#### **Princípios Diferenciadores:**
- **Business Intelligence:** Métricas de crescimento, performance e oportunidades
- **Gestão de Pipeline:** Controle total do funil de vendas e projetos
- **Otimização de Receita:** Análise de precificação, sazonalidade e ROI por cliente
- **Brand Building:** Ferramentas para construir reputação e autoridade no nicho
- **Eficiência Operacional:** Automatização de tarefas administrativas

#### **Objetivos Estratégicos:**
1. **Maximizar Revenue per Hour:** Otimizar precificação e seleção de projetos
2. **Reduzir Carga Administrativa:** Automatizar comunicação e gestão
3. **Acelerar Crescimento:** Identificar oportunidades de upsell e expansão
4. **Construir Reputação:** Ferramentas de marketing pessoal e networking

---

### **Arquitetura Orientada ao Negócio**

#### **1. Header de Produtividade (Fixo - 64px)**
```
┌─ GalaxIA Pro               🎯 Meta Mensal: 87%    💰📊📈 Perfil ─┐
│  João Silva • Elite        R$ 13.400 / R$ 15.000    🟢 Online   │
└─────────────────────────────────────────────────────────────────┘
```

**Características Business:**
- **Meta Tracker:** Progresso financeiro mensal em tempo real
- **Status de Disponibilidade:** Online/Ocupado/Indisponível com controle manual
- **Switcher de Perfis:** Alternância rápida entre perfil público/privado
- **Quick Stats:** Receita, projetos ativos, taxa de conversão

#### **2. Sidebar de Gestão (240px Desktop)**
```
📊 Dashboard Business           
💼 Pipeline de Vendas    (23 leads)
🚀 Projetos Ativos       (8 em andamento)
💰 Financeiro           (R$ 23k este mês)
⭐ Performance          (4.9/5 • 97% taxa)
📈 Analytics            (ROI, conversão)  
🎯 Oportunidades        (12 matches)
───────────────────────────────────────
[🔍 BUSCAR PROJETOS]              
[📝 CRIAR PROPOSTA RÁPIDA]         
```

**Features Avançadas:**
- **Smart Notifications:** IA prioriza alertas por valor/urgência
- **Revenue Tracking:** Progresso para metas financeiras
- **Lead Scoring:** Qualificação automática de oportunidades

---

### **Widgets Especializados - Especificação Business**

#### **Widget 1: Central de Comando Business** 🎯
```
┌─ STATUS DO SEU NEGÓCIO ────────────────────────────────────────┐
│                                                                 │
│ 🚀 Disponível para Projetos Premium                           │
│ ├─ Agenda: 40h disponíveis próximas 2 semanas                │
│ ├─ Pipeline: R$ 45.000 em negociação                         │
│ └─ [⚙️ Configurar Disponibilidade] [📊 Ver Pipeline]           │
│                                                                 │
│ 📈 Performance Esta Semana:                                   │
│ ├─ 💰 R$ 3.450 faturados • +15% vs semana anterior          │
│ ├─ ⏱️ 28h trabalhadas • 32% tempo em projetos premium         │
│ ├─ 📊 4 propostas enviadas • 75% taxa de conversão            │
│ └─ ⭐ 2 avaliações 5★ recebidas                               │
│                                                                 │
│ 🎯 Próximas Ações Prioritárias:                              │
│ ├─ Entregar: Logo Startup Tech (em 18h)                      │
│ ├─ Proposta: E-commerce Premium (R$ 15k)                     │
│ └─ Follow-up: Cliente VIP sem resposta há 2 dias            │
└─────────────────────────────────────────────────────────────────┘
```

**Business Intelligence:**
- **Revenue Forecasting:** Previsão baseada em pipeline atual
- **Capacity Planning:** Otimização de agenda e precificação
- **Priority Matrix:** Eisenhower aplicado a projetos e propostas
- **Performance Benchmarking:** Comparação com top performers da categoria

#### **Widget 2: Pipeline de Vendas Avançado** 💰
```
┌─ FUNIL DE VENDAS E OPORTUNIDADES ─────────────────────────────┐
│                                                                 │
│ 🔥 QUENTES • R$ 28.000 (Prob. 85%)                           │
│ ├─ E-commerce Completo • Startup Food • R$ 15.000            │
│ │  └─ Reunião agendada: Amanhã 14h [🔗 Link Meet]            │
│ ├─ Rebranding Corporativo • Empresa Tech • R$ 8.500          │
│ │  └─ Aguardando aprovação: Proposta enviada há 1 dia        │
│ └─ App Mobile UI/UX • Fintech • R$ 4.500                     │
│    └─ Negociação: Desconto solicitado - Resposta pendente    │
│                                                                 │
│ 🟡 MORNOS • R$ 17.500 (Prob. 45%)                           │
│ ├─ Logo + Identidade • Clínica • R$ 2.800                   │
│ ├─ Website Responsivo • Consultoria • R$ 4.200               │
│ ├─ Social Media Pack • Influencer • R$ 1.500                 │
│ └─ [+3 oportunidades] [Ver pipeline completo]                │
│                                                                 │
│ 📊 Taxa Conversão Média: 67% • Tempo Médio Fechamento: 4.2d   │
└─────────────────────────────────────────────────────────────────┘
```

**CRM Integrado:**
- **Lead Scoring IA:** Machine learning analisa perfil do cliente e probabilidade
- **Follow-up Automatizado:** Sequências de email personalizadas
- **Mood Analysis:** IA detecta tom das mensagens (interessado/hesitante/pressa)
- **Competitive Intelligence:** Alertas quando cliente avalia concorrentes

#### **Widget 3: Projetos em Execução** ⚡
```
┌─ PROJETOS ATIVOS - GESTÃO OPERACIONAL ────────────────────────┐
│                                                                 │
│ 🔴 URGENTE • Logo Tech Startup • Cliente: Maria CEO           │
│ ├─ ⏰ Entrega: Em 18 horas • Status: 90% concluído           │
│ ├─ 💬 Última msg: "Adorei as opções!" (há 2h)               │
│ └─ [📤 Enviar Entrega] [💬 Chat] [⏰ Solicitar Extensão]     │
│                                                                 │
│ 🟡 EM PRAZO • E-commerce Design • Cliente: João Loja         │
│ ├─ ⏰ Entrega: 3 dias • Status: 60% concluído               │
│ ├─ 📋 Milestone: Homepage aprovada ✅ • Produtos pendente     │
│ └─ [📊 Atualizar Status] [📤 Enviar Preview] [💬 Chat]       │
│                                                                 │
│ 🟢 TRANQUILO • Manual Marca • Cliente: Ana Marketing         │
│ ├─ ⏰ Entrega: 1 semana • Status: 35% concluído             │
│ ├─ 📋 Próximo: Definir tipografia e paleta de cores          │
│ └─ [📝 Fazer Update] [📎 Compartilhar WIP] [📅 Agendar]      │
│                                                                 │
│ 📈 Produtividade: 127% da média • Satisfação: 4.9/5 ★        │
└─────────────────────────────────────────────────────────────────┘
```

**Project Management Avançado:**
- **Time Tracking Automático:** Integração com Toggl/Clockify via API
- **Smart Milestones:** IA sugere checkpoints baseados no tipo de projeto
- **Client Satisfaction Predictor:** Análise de sentimento em tempo real
- **Automated Status Reports:** Updates automáticos para clientes

#### **Widget 4: Inteligência de Mercado** 📈
```
┌─ OPORTUNIDADES E MARKET INTELLIGENCE ─────────────────────────┐
│                                                                 │
│ 🎯 MATCHES PERFEITOS PARA VOCÊ (Score IA: 95%+)              │
│ ├─ Rebranding Completo • R$ 12.000 • Publicado há 2h        │
│ │  └─ "Procuro designer com exp. em startups tech"           │
│ │  └─ [📝 Enviar Proposta] [❤️ Salvar] [👁️ Ver Detalhes]     │
│ ├─ UI/UX App Fitness • R$ 8.500 • 3 propostas               │
│ │  └─ Cliente já contratou você antes (2022)                 │
│ │  └─ [💬 Conversar Diretamente] [📋 Ver Histórico]          │
│                                                                 │
│ 📊 MARKET TRENDS PARA VOCÊ:                                   │
│ ├─ ⬆️ Logo Design: +23% demanda (vs mês anterior)            │
│ ├─ 💰 Sua categoria: R$ 2.800 preço médio (+8%)             │
│ ├─ 🔥 Em alta: Motion Graphics (+45% buscas)                 │
│ └─ 💡 Sugestão: Adicione "Animação" às suas skills          │
│                                                                 │
│ 🏆 SEUS CONCORRENTES:                                         │
│ ├─ Ana Designer: 4.8★ • R$ 2.200 médio • 12 proj/mês       │
│ ├─ Carlos Creative: 4.9★ • R$ 3.100 médio • 8 proj/mês     │
│ └─ [📊 Ver análise completa da concorrência]                 │
└─────────────────────────────────────────────────────────────────┘
```

**Market Intelligence Engine:**
- **Demand Forecasting:** IA prevê picos de demanda por categoria
- **Pricing Optimization:** Sugere ajustes baseados em performance e mercado
- **Competitor Analysis:** Monitora top performers sem violar privacidade
- **Skill Gap Analysis:** Identifica habilidades em alta que você poderia desenvolver

#### **Widget 5: Performance Analytics** 📊
```
┌─ ANALYTICS DO SEU NEGÓCIO ────────────────────────────────────┐
│                                                                 │
│ 💰 FINANCEIRO (Últimos 30 dias):                             │
│ ├─ Faturamento: R$ 23.400 (+31% vs mês anterior)            │
│ ├─ RPH (Revenue per Hour): R$ 185 (+12%)                     │
│ ├─ Projetos concluídos: 11 • Ticket médio: R$ 2.127         │
│ └─ Projeção próximo mês: R$ 28.600 (confiança: 82%)         │
│                                                                 │
│ ⭐ QUALIDADE & SATISFAÇÃO:                                    │
│ ├─ NPS Score: 91 (Promotor) • Avaliação média: 4.89/5       │
│ ├─ Taxa recontratação: 73% • Referências geradas: 8         │
│ ├─ Tempo médio entrega: 0.8 dias antes do prazo             │
│ └─ Zero disputas • 100% projetos aprovados na 1ª tentativa  │
│                                                                 │
│ 🎯 CONVERSÃO & VENDAS:                                        │
│ ├─ Propostas enviadas: 18 • Taxa conversão: 67%             │
│ ├─ Tempo médio resposta: 1.2h • Taxa resposta: 98%          │
│ ├─ Profile views: 1,247 (+23%) • Conversion view→contact: 12% │
│ └─ [📈 Ver relatório detalhado] [📤 Exportar dados]          │
└─────────────────────────────────────────────────────────────────┘
```

**Advanced Analytics:**
- **Cohort Analysis:** Análise de retenção de clientes por período
- **A/B Testing:** Teste de diferentes versões de perfil e propostas
- **Seasonal Intelligence:** Identificação de padrões sazonais no seu nicho
- **ROI Calculation:** Retorno real do tempo investido por tipo de projeto

---

### **Diferenciação Clara: Cliente vs Profissional**

#### **Comparação Estratégica:**

| Aspecto | **Dashboard Cliente** | **Dashboard Profissional** |
|---------|----------------------|----------------------------|
| **Foco Principal** | Contratação e Gestão | Vendas e Produtividade |
| **Métricas Chave** | Projetos, Gastos, Satisfação | Revenue, Pipeline, Performance |
| **Linguagem UX** | "Seus projetos", "Contratar" | "Seu negócio", "Oportunidades" |
| **Cor Primária** | Azul confiança | Verde crescimento |
| **Ações Principais** | Revisar, Aprovar, Contratar | Propor, Entregar, Otimizar |
| **Analytics** | Histórico de contratações | Business Intelligence |
| **Notificações** | Updates de projetos | Oportunidades de negócio |
| **Time Sensitivity** | Revisões pendentes | Deadlines e follow-ups |

#### **Tecnologia Diferenciada:**

**Cliente (B2C Focus):**
- Simplicidade e clareza visual
- Foco em mobile-first
- Integração com ferramentas de comunicação
- Analytics de satisfação

**Profissional (B2B Focus):**
- Business intelligence avançado
- Integração com ferramentas de produtividade
- CRM e sales automation
- Financial reporting e forecasting 