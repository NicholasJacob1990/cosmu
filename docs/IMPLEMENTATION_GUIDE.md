# Guia de Implementação - Dashboard Improvements
## Passo a Passo Detalhado para Desenvolvedores

---

## 🚀 Preparação do Ambiente

### **1. Dependências Necessárias**

```bash
# Instalar dependências principais
npm install zustand @tanstack/react-query framer-motion
npm install @radix-ui/react-select @radix-ui/react-dialog
npm install recharts d3 chart.js react-chartjs-2
npm install socket.io-client
npm install @types/d3 @types/chart.js

# Dependências de desenvolvimento
npm install -D @types/socket.io-client
npm install -D @playwright/test vitest @testing-library/react
npm install -D @storybook/react @storybook/addon-docs
```

### **2. Configuração de Variáveis de Ambiente**

```bash
# .env.local
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_OPENAI_API_KEY=sk-your-openai-key
VITE_AI_PROVIDER=openai
VITE_ANALYTICS_ENABLED=true
VITE_SENTRY_DSN=your-sentry-dsn
```

### **3. Configuração do Tailwind CSS**

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        galaxia: {
          magenta: '#e11d48',
          neon: '#06b6d4',
          'grad-a': '#8b5cf6',
          'grad-b': '#06b6d4',
          'grad-c': '#10b981',
          surface: '#f8fafc',
        },
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-in',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
```

---

## 📂 Fase 1: Estrutura Base e Estado Global

### **Passo 1.1: Criar o Store Principal**

```typescript
// src/store/dashboardStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface DashboardState {
  // ... (código do TECHNICAL_SPECIFICATIONS.md)
}

export const useDashboardStore = create<DashboardState & { actions: DashboardActions }>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Estado inicial
        user: null,
        projects: [],
        messages: [],
        notifications: [],
        analytics: null,
        
        // Actions implementadas com Immer para imutabilidade
        actions: {
          setUser: (user) => set((state) => {
            state.user = user;
            state.userType = user?.type || null;
          }),
          
          updateProject: (projectId, updates) => set((state) => {
            const projectIndex = state.projects.findIndex(p => p.id === projectId);
            if (projectIndex !== -1) {
              Object.assign(state.projects[projectIndex], updates);
            }
          }),
          
          addMessage: (message) => set((state) => {
            state.messages.unshift(message);
            // Manter apenas os últimos 100 mensagens
            if (state.messages.length > 100) {
              state.messages = state.messages.slice(0, 100);
            }
          }),
          
          // ... outras actions
        },
      })),
      {
        name: 'dashboard-store',
        partialize: (state) => ({
          user: state.user,
          layout: state.layout,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    { name: 'dashboard-store' }
  )
);
```

### **Passo 1.2: Implementar WebSocket Hook**

```typescript
// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

export const useWebSocket = (config: WebSocketConfig): WebSocketReturn => {
  // ... (implementação completa do TECHNICAL_SPECIFICATIONS.md)
  
  // Exemplo de uso específico para dashboard
  const { actions } = useDashboardStore();
  
  const handleMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'PROJECT_UPDATE':
        actions.updateProject(data.payload.projectId, data.payload.updates);
        break;
      case 'NEW_MESSAGE':
        actions.addMessage(data.payload.message);
        break;
      case 'NOTIFICATION':
        actions.addNotification(data.payload.notification);
        break;
    }
  }, [actions]);
  
  // Resto da implementação...
};
```

### **Passo 1.3: Criar API Client**

```typescript
// src/api/dashboardAPI.ts
class DashboardAPI {
  private baseURL: string;
  private headers: HeadersInit;
  
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }
  
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...this.headers,
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Client Dashboard endpoints
  async getClientDashboard(userId: string): Promise<ClientDashboardData> {
    return this.request(`/dashboard/client/${userId}`);
  }
  
  async getClientProjects(userId: string, filters?: ProjectFilters): Promise<Project[]> {
    const queryParams = filters ? `?${new URLSearchParams(filters)}` : '';
    return this.request(`/projects/client/${userId}${queryParams}`);
  }
  
  // Professional Dashboard endpoints
  async getProfessionalDashboard(userId: string): Promise<ProfessionalDashboardData> {
    return this.request(`/dashboard/professional/${userId}`);
  }
  
  async getSalesPipeline(userId: string): Promise<PipelineData> {
    return this.request(`/pipeline/${userId}`);
  }
  
  // Analytics endpoints
  async getAnalytics(userId: string, timeRange: TimeRange): Promise<AnalyticsData> {
    return this.request('/analytics', {
      method: 'POST',
      body: JSON.stringify({ userId, timeRange }),
    });
  }
}

export const dashboardAPI = new DashboardAPI();
```

---

## 🤖 Fase 2: Sistema de IA

### **Passo 2.1: Implementar AI Service**

```typescript
// src/services/aiService.ts
import { OpenAI } from 'openai';

class AIService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Para desenvolvimento apenas
    });
  }
  
  async generateRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "Você é um assistente especializado em marketplace de freelancers..."
          },
          {
            role: "user",
            content: this.buildPrompt(context)
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });
      
      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('No response from AI');
      
      return JSON.parse(content);
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackRecommendations(context);
    }
  }
  
  private getFallbackRecommendations(context: RecommendationContext): Recommendation[] {
    // Recomendações estáticas como fallback
    return [
      {
        title: "Otimize seu perfil",
        description: "Complete todas as seções do seu perfil para atrair mais clientes",
        priority: "high",
        confidence: 0.9
      }
    ];
  }
}

export const aiService = new AIService();
```

### **Passo 2.2: Criar Hook para IA**

```typescript
// src/hooks/useAI.ts
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiService } from '@/services/aiService';

export const useAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateRecommendations = useCallback(async (context: RecommendationContext) => {
    setIsGenerating(true);
    try {
      const recommendations = await aiService.generateRecommendations(context);
      return recommendations;
    } finally {
      setIsGenerating(false);
    }
  }, []);
  
  const { data: pricingSuggestion, refetch: generatePricing } = useQuery({
    queryKey: ['ai-pricing'],
    queryFn: ({ queryKey }) => aiService.suggestPricing(queryKey[1] as ProjectData),
    enabled: false,
  });
  
  return {
    generateRecommendations,
    generatePricing,
    pricingSuggestion,
    isGenerating,
  };
};
```

---

## 📱 Fase 3: Responsividade Mobile

### **Passo 3.1: Implementar Sistema Responsivo**

```typescript
// src/hooks/useResponsive.ts
import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const breakpoints = {
    mobile: dimensions.width < 768,
    tablet: dimensions.width >= 768 && dimensions.width < 1024,
    desktop: dimensions.width >= 1024,
  };
  
  return {
    ...dimensions,
    ...breakpoints,
    isMobile: breakpoints.mobile,
    isTablet: breakpoints.tablet,
    isDesktop: breakpoints.desktop,
  };
};
```

### **Passo 3.2: Componente Adaptativo**

```typescript
// src/components/adaptive/AdaptiveLayout.tsx
import { useResponsive } from '@/hooks/useResponsive';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  mobileComponent?: React.ComponentType<any>;
  desktopComponent?: React.ComponentType<any>;
  props?: any;
}

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
  children,
  mobileComponent: MobileComponent,
  desktopComponent: DesktopComponent,
  props = {},
}) => {
  const { isMobile } = useResponsive();
  
  if (isMobile && MobileComponent) {
    return <MobileComponent {...props} />;
  }
  
  if (!isMobile && DesktopComponent) {
    return <DesktopComponent {...props} />;
  }
  
  return <>{children}</>;
};
```

---

## 📊 Fase 4: Analytics Avançado

### **Passo 4.1: Componente de Gráficos**

```typescript
// src/components/analytics/AdvancedChart.tsx
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ChartProps {
  data: any[];
  type: 'line' | 'area' | 'bar' | 'pie';
  xKey: string;
  yKey: string;
  title?: string;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  animated?: boolean;
}

export const AdvancedChart: React.FC<ChartProps> = ({
  data,
  type,
  xKey,
  yKey,
  title,
  height = 300,
  color = '#8884d8',
  showGrid = true,
  showTooltip = true,
  animated = true,
}) => {
  const formatData = useMemo(() => {
    return data.map(item => ({
      ...item,
      [yKey]: typeof item[yKey] === 'string' ? parseFloat(item[yKey]) : item[yKey],
    }));
  }, [data, yKey]);
  
  const renderChart = () => {
    const commonProps = {
      data: formatData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };
    
    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4 }}
              animationDuration={animated ? 1000 : 0}
            />
          </LineChart>
        );
        
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            <Area
              type="monotone"
              dataKey={yKey}
              stroke={color}
              fill={color}
              fillOpacity={0.3}
              animationDuration={animated ? 1000 : 0}
            />
          </AreaChart>
        );
        
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            <Bar
              dataKey={yKey}
              fill={color}
              animationDuration={animated ? 1000 : 0}
            />
          </BarChart>
        );
        
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={formatData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill={color}
              dataKey={yKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              animationDuration={animated ? 1000 : 0}
            >
              {formatData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
          </PieChart>
        );
        
      default:
        return <div>Tipo de gráfico não suportado</div>;
    }
  };
  
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};
```

### **Passo 4.2: Hook de Analytics**

```typescript
// src/hooks/useAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '@/store/dashboardStore';
import { dashboardAPI } from '@/api/dashboardAPI';

export const useAnalytics = (timeRange: TimeRange) => {
  const user = useDashboardStore(state => state.user);
  
  return useQuery({
    queryKey: ['analytics', user?.id, timeRange],
    queryFn: () => dashboardAPI.getAnalytics(user!.id, timeRange),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

export const usePerformanceMetrics = () => {
  const analytics = useAnalytics({ start: '30d', end: 'now' });
  
  return {
    ...analytics,
    metrics: analytics.data?.performance,
  };
};
```

---

## 🧪 Fase 5: Testes

### **Passo 5.1: Configurar Testes Unitários**

```typescript
// src/tests/setup.ts
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

```typescript
// src/tests/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/dashboard/client/:userId', (req, res, ctx) => {
    return res(
      ctx.json({
        user: { id: '123', name: 'Test User' },
        projects: [],
        messages: [],
        analytics: {},
      })
    );
  }),
];
```

### **Passo 5.2: Testes de Componentes**

```typescript
// src/components/dashboard/ProjectsCommandPanel.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectsCommandPanel } from './ProjectsCommandPanel';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('ProjectsCommandPanel', () => {
  it('should render loading state initially', () => {
    render(<ProjectsCommandPanel />, { wrapper: createWrapper() });
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });
  
  it('should render projects when data is loaded', async () => {
    render(<ProjectsCommandPanel />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('⚡ Painel de Comando de Projetos')).toBeInTheDocument();
    });
  });
});
```

### **Passo 5.3: Testes E2E**

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock de autenticação
    await page.route('/api/auth/me', async route => {
      await route.fulfill({
        json: { id: '123', type: 'client', name: 'Test User' }
      });
    });
    
    await page.goto('/client-dashboard');
  });
  
  test('should display dashboard widgets', async ({ page }) => {
    await expect(page.locator('[data-testid="projects-command-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="messages-center"]')).toBeVisible();
    await expect(page.locator('[data-testid="personalized-discovery"]')).toBeVisible();
  });
  
  test('should handle real-time updates', async ({ page }) => {
    // Simular WebSocket message
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('websocket-message', {
        detail: {
          type: 'PROJECT_UPDATE',
          data: { projectId: '123', status: 'completed' }
        }
      }));
    });
    
    await expect(page.locator('text=Projeto Concluído')).toBeVisible();
  });
});
```

---

## 🚀 Fase 6: Deploy e Monitoramento

### **Passo 6.1: Configuração de Performance**

```typescript
// src/utils/performance.ts
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  console.log(`${name}: ${end - start}ms`);
  
  // Enviar para serviço de analytics
  if (window.gtag) {
    window.gtag('event', 'timing_complete', {
      name,
      value: Math.round(end - start),
    });
  }
};

export const withPerformanceMonitoring = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    return measurePerformance(name, () => fn(...args));
  }) as T;
};
```

### **Passo 6.2: Error Boundary**

```typescript
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Enviar erro para serviço de monitoramento
    if (import.meta.env.PROD) {
      // Sentry, Bugsnag, etc.
    }
    
    this.props.onError?.(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Algo deu errado</h2>
            <p className="text-muted-foreground mb-4">
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

---

## 📋 Checklist de Implementação

### **Fase 1: Base (Semana 1-2)**
- [ ] ✅ Configurar Zustand store
- [ ] ✅ Implementar WebSocket hook
- [ ] ✅ Criar API clients
- [ ] ✅ Configurar React Query
- [ ] ✅ Implementar Error Boundary

### **Fase 2: IA (Semana 3-4)**
- [ ] ✅ Integrar OpenAI API
- [ ] ✅ Implementar sistema de recomendações
- [ ] ✅ Criar componentes de IA
- [ ] ✅ Adicionar fallbacks para IA

### **Fase 3: Mobile (Semana 5-6)**
- [ ] ✅ Implementar hooks responsivos
- [ ] ✅ Criar componentes adaptativos
- [ ] ✅ Desenvolver navegação mobile
- [ ] ✅ Implementar gestos touch

### **Fase 4: Analytics (Semana 7-8)**
- [ ] ✅ Implementar serviço de analytics
- [ ] ✅ Criar componentes de gráficos
- [ ] ✅ Adicionar métricas preditivas
- [ ] ✅ Implementar comparações de mercado

### **Fase 5: Testes (Semana 9)**
- [ ] ✅ Configurar ambiente de testes
- [ ] ✅ Escrever testes unitários
- [ ] ✅ Implementar testes E2E
- [ ] ✅ Configurar CI/CD

### **Fase 6: Deploy (Semana 10)**
- [ ] ✅ Otimizar performance
- [ ] ✅ Configurar monitoramento
- [ ] ✅ Deploy em produção
- [ ] ✅ Documentação final

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev                 # Servidor de desenvolvimento
npm run build              # Build de produção
npm run preview            # Preview do build

# Testes
npm run test               # Testes unitários
npm run test:coverage      # Coverage dos testes
npm run test:e2e          # Testes E2E
npm run test:watch        # Testes em modo watch

# Linting e formatação
npm run lint              # ESLint
npm run lint:fix          # Fix automático
npm run format            # Prettier

# Storybook
npm run storybook         # Servidor do Storybook
npm run build-storybook   # Build do Storybook

# Análise
npm run analyze           # Análise do bundle
npm run lighthouse        # Audit de performance
```

---

## 📞 Suporte e Debugging

### **Logs de Debug**
```typescript
// Ativar logs detalhados em desenvolvimento
if (import.meta.env.DEV) {
  localStorage.setItem('debug', 'dashboard:*');
}
```

### **Performance Profiling**
```typescript
// Usar React DevTools Profiler
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  console.log('Component render:', { id, phase, actualDuration });
};

<Profiler id="Dashboard" onRender={onRenderCallback}>
  <Dashboard />
</Profiler>
```

### **Troubleshooting Comum**
1. **WebSocket não conecta**: Verificar variáveis de ambiente
2. **IA não responde**: Verificar API key e limites de rate
3. **Gráficos não renderizam**: Verificar formato dos dados
4. **Performance ruim**: Usar React.memo e useMemo
5. **Testes falhando**: Verificar mocks e providers

Este guia fornece todos os passos necessários para implementar as melhorias dos dashboards da GalaxIA de forma organizada e eficiente.