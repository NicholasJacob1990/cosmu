# 📋 PLANO DE ONBOARDING PROFISSIONAL
## GalaxIA Marketplace - Cadastro e Verificação

> **Documento Técnico v1.1**  
> **Foco:** Detalha o processo de cadastro, verificação e criação de perfil para prestadores de serviços.

---

## 🚀 **FLUXO DE CADASTRO MULTI-ETAPAS**

### **ETAPA 1: REGISTRO INICIAL (2 minutos)**
```
Campos Obrigatórios:
┌─ Email + Confirmação
├─ Senha (mín. 8 caracteres, complexa)
├─ Nome Completo
├─ CPF/CNPJ
├─ Telefone com DDD
├─ Tipo de Conta: 
│  [ ] Pessoa Física  [ ] MEI  [ ] Empresa
└─ ✅ Aceite dos Termos de Uso e Política de Privacidade

Validações em Tempo Real:
├─ Email: Formato válido + verificação de domínio
├─ CPF/CNPJ: Algoritmo de validação + consulta SPC/Serasa
├─ Telefone: Formato brasileiro válido
└─ Senha: Força da senha em tempo real
```

**Características Técnicas:**
- Verificação de email **opcional** inicialmente (envio em background)
- Permite acesso imediato à plataforma após registro
- Auto-complete com dados públicos do CPF/CNPJ via API da Receita
- Rate limiting para prevenir spam
- Captcha invisível (reCAPTCHA v3)

---

### **ETAPA 2: PERFIL PROFISSIONAL BÁSICO (3 minutos)**
```
Informações Principais:
┌─ Título Profissional
│  ├─ Exemplo: "Designer Gráfico Especialista em Identidade Visual"
│  ├─ Máximo: 80 caracteres
│  └─ Sugestões automáticas baseadas em categorias
│
├─ Categoria Principal + até 3 Subcategorias
│  ├─ Saúde e Bem-estar: Medicina, Odontologia, Psicologia, Fisioterapia, Nutrição, etc.
│  ├─ Design: Logo, Flyer, Website, etc.
│  ├─ Programação: Frontend, Backend, Mobile, etc.
│  ├─ Marketing: SEO, Ads, Social Media, etc.
│  ├─ Redação: Blog, Copy, Técnica, etc.
│  ├─ Consultoria: Empresarial, Financeira, Jurídica, etc.
│  └─ [200+ categorias disponíveis incluindo profissões regulamentadas]
│
├─ Descrição Profissional
│  ├─ Máximo: 500 caracteres
│  ├─ Template sugerido por categoria
│  └─ Análise de tom profissional via IA
│
├─ Localização e Atendimento
│  ├─ CEP (busca automática do endereço)
│  ├─ Raio de Atendimento: 5km, 10km, 25km, 50km, Todo Estado, Todo Brasil
│  ├─ Atendimento: Presencial, Remoto, Ambos
│  └─ Horário de Funcionamento (opcional)
│
├─ Precificação Inicial
│  ├─ Valor/Hora: R$ 25 - R$ 500 (sugestões por categoria/região)
│  ├─ Valor Mínimo de Projeto: R$ 50 - R$ 5.000
│  └─ Modalidade: Por Hora, Por Projeto, Pacotes Fixos
│
└─ Foto de Perfil
   ├─ Opcional nesta etapa
   ├─ Aceita: JPG, PNG (máx 5MB)
   └─ Redimensionamento automático: 400x400px
```

**🤖 IA Integrada:**
- **Precificação Inteligente**: Análise de +10.000 perfis para sugerir preços competitivos
- **Validação de Conteúdo**: Verifica tom profissional e sugere melhorias
- **Autocomplete Inteligente**: Categorias e habilidades baseadas no texto digitado
- **Detecção de Localização**: Via CEP para otimizar buscas locais

---

### **ETAPA 3: EXPERIÊNCIA E COMPETÊNCIAS (5 minutos)**
```
Experiência Profissional:
┌─ Experiência Principal (mín. 1, máx. 5)
│  ├─ Empresa/Cliente
│  ├─ Cargo/Função
│  ├─ Período: (MM/YYYY - Atual/MM/YYYY)
│  ├─ Descrição (máx. 300 caracteres)
│  └─ Principais Conquistas
│
├─ Habilidades Técnicas (máx 15)
│  ├─ Busca com autocomplete de +5.000 skills
│  ├─ Nível de Proficiência:
│  │  ├─ 🟢 Básico (0-1 ano)
│  │  ├─ 🟡 Intermediário (1-3 anos)
│  │  ├─ 🟠 Avançado (3-5 anos)
│  │  └─ 🔴 Expert (5+ anos)
│  └─ Certificações relacionadas (opcional)
│
├─ Formação Acadêmica
│  ├─ Nível: Fundamental, Médio, Técnico, Superior, Pós, MBA, Mestrado, Doutorado
│  ├─ Curso/Área
│  ├─ Instituição
│  ├─ Status: Cursando, Concluído, Interrompido
│  └─ Período (opcional se cursando)
│
├─ Certificações Profissionais
│  ├─ Nome da Certificação
│  ├─ Instituição Certificadora
│  ├─ Data de Conclusão
│  ├─ Validade (se aplicável)
│  └─ Número do Certificado (opcional)
│
└─ Idiomas
   ├─ Português (padrão)
   ├─ Inglês: Básico, Intermediário, Avançado, Fluente, Nativo
   ├─ Espanhol: [mesmos níveis]
   └─ Outros idiomas: [campo livre]
```

**📂 Importação Automática:**
- **LinkedIn**: Via API oficial ou upload de PDF do perfil
- **Currículo PDF**: OCR + IA para extração automática de dados
- **Plataforma Lattes**: Para profissionais acadêmicos
- **Google Scholar**: Para pesquisadores
- **GitHub**: Para desenvolvedores (projetos, linguagens, atividade)

**🔍 Validação de Dados:**
- Cross-check com bases públicas (Lattes, LinkedIn público)
- Verificação de existência de instituições
- Validação de períodos (sem sobreposições impossíveis)

---

### **ETAPA 4: PORTFÓLIO E SHOWCASE (7 minutos)**
```
Portfólio Principal:
┌─ Projetos em Destaque (mín. 3, máx. 10)
│  ├─ Título do Projeto (máx. 100 caracteres)
│  ├─ Cliente/Empresa (pode ser "Confidencial")
│  ├─ Categoria do Projeto
│  ├─ Descrição Detalhada (máx. 1000 caracteres)
│  │  ├─ Desafio enfrentado
│  │  ├─ Solução implementada
│  │  ├─ Resultados obtidos
│  │  └─ Tecnologias/ferramentas utilizadas
│  ├─ Data de Conclusão
│  ├─ Duração do Projeto
│  ├─ Valor do Projeto (opcional, exibido como faixa)
│  └─ Tags/Palavras-chave
│
├─ Mídia do Portfólio:
│  ├─ Imagens: JPG, PNG, WebP (máx 10MB cada, até 5 por projeto)
│  ├─ Vídeos: MP4, MOV (máx 100MB, até 2 por projeto)
│  ├─ Documentos: PDF (máx 25MB, até 3 por projeto)
│  ├─ Links Externos:
│  │  ├─ Behance, Dribbble (para designers)
│  │  ├─ GitHub, GitLab (para desenvolvedores)
│  │  ├─ Website/Blog pessoal
│  │  └─ Casos de estudo online
│  └─ Proteção de IP: Watermark automático opcional
│
├─ Depoimentos de Clientes (opcional)
│  ├─ Nome do Cliente
│  ├─ Empresa/Cargo
│  ├─ Depoimento (máx. 500 caracteres)
│  ├─ Foto do Cliente (opcional)
│  ├─ Projeto Relacionado
│  └─ Avaliação (1-5 estrelas)
│
└─ Certificados e Prêmios
   ├─ Upload de certificados (PDF/imagem)
   ├─ Prêmios recebidos
   ├─ Reconhecimentos profissionais
   └─ Participação em eventos relevantes
```

**🎨 Recursos Avançados de Upload:**
- **Drag & Drop Interface**: Arrastar arquivos direto para upload
- **Batch Upload**: Múltiplos arquivos simultaneamente
- **Preview em Tempo Real**: Visualização imediata do resultado
- **Otimização Automática**: 
  - Redimensionamento inteligente de imagens
  - Compressão sem perda de qualidade
  - Conversão automática para WebP
  - Geração de thumbnails
- **Integração Cloud**: Google Drive, Dropbox, OneDrive
- **Proteção**: Watermark automático, proteção contra download

**📱 Compatibilidade:**
- Upload via mobile com câmera
- Suporte a todas as resoluções
- Processamento em background
- Notificação de conclusão

---

### **ETAPA 5: SERVIÇOS E PACOTES (5 minutos)**
```
Criação de Serviços:
┌─ Serviços Oferecidos (mín. 1, máx. 20)
│  ├─ Nome do Serviço (máx. 80 caracteres)
│  │  └─ Ex: "Criação de Logo + Manual de Marca Completo"
│  ├─ Categoria Principal + Subcategorias
│  ├─ Descrição Detalhada (máx. 2000 caracteres)
│  │  ├─ O que está incluso
│  │  ├─ O que NÃO está incluso
│  │  ├─ Processo de trabalho
│  │  └─ Requisitos do cliente
│  ├─ Tempo de Entrega: 1-30 dias
│  ├─ Revisões Incluídas: 0-10
│  ├─ Imagem de Capa (obrigatória)
│  └─ Tags/Keywords para SEO
│
├─ Estrutura de Pacotes (Modelo Fiverr):
│  ├─ 🥉 BÁSICO (obrigatório)
│  │  ├─ Preço: R$ 50 - R$ 2.000
│  │  ├─ Entrega: 1-7 dias
│  │  ├─ Revisões: 1-2
│  │  └─ Funcionalidades essenciais
│  │
│  ├─ 🥈 PADRÃO (opcional)
│  │  ├─ Preço: 1.5x - 3x do básico
│  │  ├─ Entrega: +50% do tempo básico
│  │  ├─ Revisões: +1-2 extras
│  │  └─ Funcionalidades extras populares
│  │
│  └─ 🥇 PREMIUM (opcional)
│     ├─ Preço: 2x - 5x do básico
│     ├─ Entrega: +100% do tempo básico
│     ├─ Revisões: ilimitadas ou muitas
│     └─ Solução completa + consultoria
│
├─ Extras/Add-ons Personalizados:
│  ├─ Entrega expressa (24h, 48h) +R$ X
│  ├─ Revisões extras +R$ X por revisão
│  ├─ Licença comercial +R$ X
│  ├─ Arquivos fonte +R$ X
│  ├─ Consultoria adicional +R$ X/hora
│  ├─ Suporte pós-entrega +R$ X/mês
│  └─ Criação de variações +R$ X por variação
│
├─ Configurações de Disponibilidade:
│  ├─ Status: Ativo, Pausado, Rascunho
│  ├─ Limite de pedidos simultâneos: 1-20
│  ├─ Agenda de disponibilidade
│  ├─ Período de férias/indisponibilidade
│  └─ Resposta automática personalizada
│
└─ SEO e Visibilidade:
   ├─ Palavras-chave principais (máx. 10)
   ├─ Localização de atendimento
   ├─ Público-alvo
   └─ Diferencial competitivo
```

**💡 Sugestões Inteligentes Baseadas em IA:**
- **Análise de Concorrência**: Precificação baseada em +50.000 serviços similares
- **Templates Dinâmicos**: Descrições pré-preenchidas por categoria
- **Estimativa de Tempo**: Machine learning baseado em projetos históricos
- **Otimização de SEO**: Sugestão de palavras-chave com alto potencial
- **A/B Testing**: Sugestões de melhorias baseadas em performance
- **Sazonalidade**: Alertas sobre picos de demanda por categoria

---

## 🔐 **SISTEMA DE VERIFICAÇÃO E CONFIANÇA**

### **NÍVEL 0: CADASTRO BÁSICO** ⭐
```
Status: "Cadastro Básico"
Requisitos:
✅ Email verificado (código + link)
✅ Telefone verificado (SMS + WhatsApp)
✅ CPF/CNPJ válido e ativo
✅ Perfil básico completo (80%+)

Benefícios:
├─ Pode receber propostas básicas
├─ Pode enviar até 5 propostas/dia
├─ Acesso ao chat básico
└─ Comissão: 15% por transação

Limitações:
├─ Projetos até R$ 500
├─ Não aparece em "Verificados"
├─ Sem badge de confiança
└─ Sem suporte prioritário
```

### **NÍVEL 1: IDENTIDADE VERIFICADA** ⭐⭐
```
Status: "Identidade Verificada"
Requisitos Adicionais:
✅ Documento oficial com foto
│  ├─ RG (frente e verso)
│  ├─ CNH (frente e verso)
│  ├─ Passaporte (página principal)
│  └─ Certificado de Reservista (se aplicável)
✅ Comprovante de endereço (últimos 3 meses)
│  ├─ Conta de luz, água, gás
│  ├─ Fatura de cartão/banco
│  ├─ Contrato de aluguel
│  └─ Declaração de imposto de renda
✅ Selfie com documento em mãos
✅ Verificação biométrica facial
✅ Consulta CPF/CNPJ em bureaus de crédito

Benefícios:
├─ Badge "Identidade Verificada"
├─ Projetos até R$ 5.000
├─ 10 propostas/dia
├─ Prioridade moderada no suporte
├─ Comissão: 12% por transação
└─ Aparece na categoria "Verificados"

Tempo de Processamento: 24-48h
```

### **NÍVEL 2: PROFISSIONAL VERIFICADO** ⭐⭐⭐
```
Status: "Profissional Verificado"
Requisitos Adicionais:
✅ Verificação de formação acadêmica
│  ├─ Diploma digitalizado
│  ├─ Histórico escolar
│  └─ Consulta ao MEC (quando aplicável)
✅ Certificações profissionais validadas
│  ├─ Certificados digitalizados
│  ├─ Verificação com instituições
│  └─ Validação de numeração
✅ Referências profissionais
│  ├─ 2 contatos verificados
│  ├─ LinkedIn público ativo
│  └─ Histórico profissional consistente
✅ Portfolio autenticado
│  ├─ Projetos com comprovação
│  ├─ Depoimentos verificados
│  └─ Links funcionais validados
✅ Teste básico de competências
│  ├─ Quiz específico da área (10-20 questões)
│  ├─ Nota mínima: 70%
│  └─ Refazível após 30 dias

Benefícios:
├─ Badge "Profissional Verificado"
├─ Projetos até R$ 25.000
├─ 20 propostas/dia
├─ Suporte prioritário
├─ Comissão: 10% por transação
├─ Destaque nas buscas
├─ Acesso a projetos VIP
└─ Kit de marketing digital

Tempo de Processamento: 3-5 dias úteis
```

### **NÍVEL 3: GALAXIA ELITE** ⭐⭐⭐⭐⭐
```
Status: "GalaxIA Elite" (Apenas por convite ou candidatura)
Requisitos Adicionais:
✅ Todas as verificações anteriores
✅ Portfólio excepcional (avaliação manual)
✅ Teste prático avançado da área
│  ├─ Projeto real de 2-4 horas
│  ├─ Avaliação por especialistas
│  └─ Nota mínima: 85%
✅ Entrevista por vídeo (30 minutos)
│  ├─ Avaliação técnica
│  ├─ Soft skills
│  └─ Comunicação profissional
✅ Histórico na plataforma (mín. 6 meses)
│  ├─ 20+ projetos concluídos
│  ├─ Avaliação média: 4.8/5.0
│  ├─ Taxa de sucesso: 95%+
│  └─ Tempo médio de resposta: <2h
✅ Especialização comprovada
│  ├─ Nicho específico de expertise
│  ├─ Cases de sucesso documentados
│  └─ Reconhecimento do mercado

Benefícios Exclusivos:
├─ Badge dourado "GalaxIA Elite"
├─ Projetos ilimitados em valor
├─ Propostas ilimitadas
├─ Comissão: 7% por transação
├─ Gerente de conta dedicado
├─ Participação em eventos exclusivos
├─ Programa de referência VIP
├─ Marketing conjunto GalaxIA
├─ Acesso antecipado a novos recursos
├─ Dashboard avançado de analytics
├─ API de integração personalizada
└─ Certificado digital GalaxIA Elite

Processo de Candidatura:
├─ Self-application (formulário avançado)
├─ Convite baseado em performance
├─ Indicação de clientes VIP
└─ Headhunting ativo da plataforma

Tempo de Processamento: 7-14 dias úteis
Reavaliação: Anual (automática)
```

---

## 🎨 **FLUXOS FRONTEND ADAPTATIVOS POR TIPO DE PROFISSIONAL**

### **Sistema de Detecção e Branching**
```typescript
interface AdaptiveOnboardingFlow {
  // Detecção inicial do tipo de profissional
  detectProfessionalType(): ProfessionalType
  
  // Fluxos condicionais baseados no tipo
  getConditionalFlow(type: ProfessionalType): RegistrationFlow
  
  // Validações específicas por categoria
  getRequiredValidations(type: ProfessionalType): ValidationRule[]
}

enum ProfessionalType {
  HEALTH_PROFESSIONAL = 'health',
  CREATIVE_PROFESSIONAL = 'creative', 
  TECH_PROFESSIONAL = 'tech',
  BUSINESS_CONSULTANT = 'business',
  EDUCATION_PROFESSIONAL = 'education',
  LEGAL_PROFESSIONAL = 'legal'
}
```

### **FLUXO 1: PROFISSIONAIS DE SAÚDE** 🏥
```
Características do Fluxo:
├─ Maior rigor na validação de documentos
├─ Integração obrigatória com conselhos profissionais
├─ Fluxo mais longo (25-30 minutos total)
└─ Compliance específico para dados de saúde

Etapas Específicas:
┌─ ETAPA 1: Registro Básico (2 min)
│  ├─ Detecção automática: "Sou profissional de saúde"
│  ├─ Aviso sobre regulamentações específicas
│  └─ Aceite de termos específicos para saúde
│
├─ ETAPA 2: Tipo de Profissional (1 min)  
│  ├─ Seleção do conselho: CRM, CRO, CRP, etc.
│  ├─ Preview das validações necessárias
│  └─ Estimativa de tempo para conclusão
│
├─ ETAPA 3: Validação Profissional (10 min)
│  ├─ Upload de carteira profissional
│  ├─ Consulta automática ao conselho
│  ├─ Verificação de especialidades
│  └─ Seguro de responsabilidade civil
│
├─ ETAPA 4: Configuração de Atendimento (8 min)
│  ├─ Modalidades: Presencial/Telemedicina
│  ├─ Tipos de consulta oferecidos
│  ├─ Duração e intervalo padrão
│  └─ Política de cancelamento
│
└─ ETAPA 5: Compliance e Finalização (4 min)
   ├─ Código de ética profissional
   ├─ LGPD específica para dados de saúde
   ├─ Configuração de prontuário
   └─ Agenda e disponibilidade inicial
```

### **FLUXO 2: PROFISSIONAIS CRIATIVOS** 🎨
```
Características do Fluxo:
├─ Foco no portfolio visual
├─ Upload de múltiplas mídias
├─ Fluxo mais visual e criativo
└─ Integração com plataformas criativas

Etapas Específicas:
┌─ ETAPA 1: Registro Básico (2 min)
│  ├─ Detecção: "Sou designer/criativo"
│  ├─ Seleção de área criativa
│  └─ Estilo visual personalizado
│
├─ ETAPA 2: Portfolio Showcase (10 min)
│  ├─ Upload drag-and-drop intuitivo
│  ├─ Galeria visual em grid
│  ├─ Preview em tempo real
│  ├─ Integração Behance/Dribbble
│  └─ Categorização por tipo de projeto
│
├─ ETAPA 3: Estilo e Especialização (5 min)
│  ├─ Tags de estilo visual
│  ├─ Ferramentas dominadas
│  ├─ Nicho de especialização
│  └─ Preferências de projeto
│
└─ ETAPA 4: Precificação Criativa (3 min)
   ├─ Pacotes por complexidade
   ├─ Extras creativos (revisões, etc)
   ├─ Tempo de produção estimado
   └─ Licenças e direitos autorais
```

### **FLUXO 3: PROFISSIONAIS DE TECNOLOGIA** 💻
```
Características do Fluxo:
├─ Integração com GitHub/GitLab
├─ Testes técnicos opcionais
├─ Foco em stack tecnológico
└─ Portfolio baseado em projetos

Etapas Específicas:
┌─ ETAPA 1: Registro Básico (2 min)
│  ├─ Detecção: "Sou desenvolvedor/tech"
│  ├─ Área de atuação: Frontend, Backend, etc.
│  └─ Nível de experiência
│
├─ ETAPA 2: Stack Tecnológico (5 min)
│  ├─ Linguagens de programação
│  ├─ Frameworks e bibliotecas  
│  ├─ Ferramentas e metodologias
│  └─ Certificações técnicas
│
├─ ETAPA 3: Portfolio Técnico (8 min)
│  ├─ Integração automática GitHub
│  ├─ Repositórios em destaque
│  ├─ Análise automática de código
│  ├─ Stack Overflow integration
│  └─ Projetos pessoais/comerciais
│
└─ ETAPA 4: Especialização e Preços (5 min)
   ├─ Tipos de projeto preferidos
   ├─ Metodologias de trabalho (Agile, etc)
   ├─ Disponibilidade (full-time, part-time)
   └─ Pricing por complexidade
```

### **FLUXO 4: CONSULTORES DE NEGÓCIOS** 💼
```
Características do Fluxo:
├─ Foco em credenciais e experiência
├─ Cases de sucesso detalhados
├─ Networking e referências
└─ Precificação premium

Etapas Específicas:
┌─ ETAPA 1: Registro Básico (2 min)
│  ├─ Detecção: "Sou consultor"
│  ├─ Área de consultoria
│  └─ Tamanho de empresas atendidas
│
├─ ETAPA 2: Credenciais e Formação (7 min)
│  ├─ MBA e especializações
│  ├─ Certificações profissionais
│  ├─ Experiência corporativa
│  └─ Idiomas e mercados
│
├─ ETAPA 3: Cases de Sucesso (8 min)
│  ├─ Projetos transformacionais
│  ├─ ROI demonstrado
│  ├─ Depoimentos de C-Level
│  └─ Métricas de impacto
│
└─ ETAPA 4: Metodologia e Preços (3 min)
   ├─ Frameworks utilizados
   ├─ Duração típica de projetos
   ├─ Modelo de precificação
   └─ Disponibilidade e agenda
```

---

## 📱 **FUNCIONALIDADE DE PORTFÓLIO E COMPARTILHAMENTO SOCIAL**

### **VISÃO GERAL DA NOVA ABORDAGEM**

Com base em uma reavaliação estratégica, a integração com APIs de redes sociais (como Ayrshare e Unipile) será **descontinuada** para a versão inicial. A nova abordagem prioriza a simplicidade, a velocidade de desenvolvimento e a inclusão de todos os usuários, sem a necessidade de contas Business/Creator no Instagram ou de integrações complexas.

1.  **Upload de Portfólio Manual:** Todos os prestadores de serviço, independentemente do nível da conta, poderão fazer upload de suas mídias (imagens, vídeos) diretamente na plataforma.
2.  **Mural de Exposição:** O conteúdo será exibido em um formato de "mural" ou "grid" no perfil do prestador, similar à experiência visual do Instagram ou Pinterest, criando um portfólio rico e atraente.
3.  **Compartilhamento Simplificado:** Em vez de automação, o foco será em fornecer ferramentas fáceis para que os próprios prestadores (ou clientes) possam compartilhar os trabalhos em suas redes sociais, usando tecnologias nativas e universais. 