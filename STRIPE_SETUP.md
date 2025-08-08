# Configuração de Variáveis de Ambiente - Frontend

## Stripe Configuration

Para que o checkout funcione corretamente, você precisa configurar as chaves do Stripe no arquivo `.env.local` na raiz do projeto.

### Passos para Configuração:

1. **Crie o arquivo `.env.local`** na raiz do projeto:
   ```bash
   touch .env.local
   ```

2. **Adicione o conteúdo abaixo** ao arquivo `.env.local`:
   ```env
   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   
   # API Configuration  
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   
   # Environment
   NODE_ENV=development
   ```

3. **Obtenha suas chaves do Stripe**:
   - Acesse o [Stripe Dashboard](https://dashboard.stripe.com/)
   - Vá em "Developers" → "API keys"
   - Copie a "Publishable key" (começa com `pk_test_` para desenvolvimento)

4. **Substitua a chave no arquivo**:
   - Substitua `pk_test_your_stripe_publishable_key_here` pela sua chave real

5. **Reinicie o servidor**:
   ```bash
   npm run dev
   ```

### Variáveis Necessárias:

- **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`**: Chave publicável do Stripe (seguro expor no frontend)
- **`NEXT_PUBLIC_API_BASE_URL`**: URL base da API Django (padrão: http://localhost:8000)
- **`NODE_ENV`**: Ambiente atual (development, staging, production)

### Importante:

- O arquivo `.env.local` nunca deve ser commitado no git
- Use chaves de teste (`pk_test_`) para desenvolvimento
- Use chaves ao vivo (`pk_live_`) apenas em produção
- A chave publicável é segura para expor no frontend

### Testando a Configuração:

Após configurar, teste acessando:
- http://localhost:3000/checkout - Página de checkout
- http://localhost:3000/order-confirmation - Página de confirmação

O console do navegador deve mostrar que o Stripe foi carregado corretamente.