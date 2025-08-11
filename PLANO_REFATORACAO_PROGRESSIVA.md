# Plano de Refatoração Progressiva - GalaxIA

## Objetivo
Migrar gradualmente as páginas de `src/pages/` para `app/`, substituindo dependências do React Router por equivalentes do Next.js.

## Estratégia
1. Começar pelas páginas mais simples (menos dependências)
2. Migrar uma página por vez
3. Testar cada migração antes de prosseguir
4. Manter ambas versões funcionando durante a transição

## Ordem de Migração

### Fase 1 - Páginas Simples (Sem estado complexo)
1. **Login** ✅ Prioridade Alta
   - Substituir `useNavigate` por `useRouter`
   - Ajustar redirecionamentos
   - Tempo estimado: 30 min

2. **NotFound** ✅ Prioridade Alta
   - Página estática simples
   - Apenas ajustes de navegação
   - Tempo estimado: 15 min

3. **RegisterChoice** ✅ Prioridade Alta
   - Links simples para outras páginas
   - Substituir navegação
   - Tempo estimado: 20 min

4. **ProfessionalTypeChoice** ✅ Prioridade Alta
   - Similar ao RegisterChoice
   - Tempo estimado: 20 min

### Fase 2 - Páginas com Formulários
5. **SimpleRegistration**
   - Formulário básico
   - Integração com API
   - Tempo estimado: 45 min

6. **Registration** 
   - Formulário mais complexo
   - Upload de arquivos
   - Tempo estimado: 1h

7. **ServicePost**
   - Criação de serviços
   - Tempo estimado: 45 min

8. **ProjectPost**
   - Criação de projetos
   - Tempo estimado: 45 min

### Fase 3 - Páginas de Listagem
9. **Services**
   - Listagem com filtros
   - Paginação
   - Tempo estimado: 1h

10. **Freelancers**
    - Similar a Services
    - Tempo estimado: 1h

11. **SearchResults**
    - Busca e filtros
    - Tempo estimado: 1h

### Fase 4 - Páginas de Detalhes
12. **ServiceDetail**
    - Exibição de dados
    - Interações simples
    - Tempo estimado: 45 min

13. **FreelancerProfile**
    - Perfil público
    - Tempo estimado: 45 min

14. **ProjectDetail**
    - Detalhes do projeto
    - Tempo estimado: 45 min

### Fase 5 - Páginas Complexas
15. **Dashboard (Client/Freelancer)**
    - WebSocket
    - Estado complexo
    - Múltiplos componentes
    - Tempo estimado: 2-3h

16. **ProjectWorkspace**
    - Chat em tempo real
    - Gestão de milestones
    - Tempo estimado: 2-3h

17. **ManageProposals**
    - Gestão de propostas
    - Tempo estimado: 1.5h

## Checklist para cada migração

- [ ] Copiar conteúdo do componente para `app/[rota]/page.tsx`
- [ ] Substituir imports:
  - `useNavigate` → `useRouter` do `next/navigation`
  - `Link` do React Router → `Link` do `next/link`
  - `useParams` → `params` como prop
  - `useSearchParams` do React Router → `useSearchParams` do `next/navigation`
- [ ] Ajustar navegação programática:
  - `navigate('/path')` → `router.push('/path')`
  - `navigate(-1)` → `router.back()`
- [ ] Verificar e ajustar:
  - Metadata (title, description)
  - Loading states
  - Error boundaries
- [ ] Testar:
  - Navegação
  - Funcionalidades
  - Responsividade
- [ ] Remover arquivo antigo de `src/pages/` (após validação)

## Exemplo de Migração - Login

### Antes (src/pages/Login.tsx)
```tsx
import { useNavigate } from '@/lib/navigation';

export function Login() {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate('/dashboard');
  };
  // ...
}
```

### Depois (app/login/page.tsx)
```tsx
'use client';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  const handleLogin = () => {
    router.push('/dashboard');
  };
  // ...
}
```

## Benefícios da Migração
1. Performance melhorada com SSR/SSG do Next.js
2. SEO otimizado
3. Roteamento mais eficiente
4. Menor bundle size
5. Melhor developer experience

## Observações
- Manter backup do código original
- Documentar mudanças significativas
- Comunicar progresso à equipe
- Priorizar páginas mais acessadas