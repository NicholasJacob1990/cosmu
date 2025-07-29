# Especificações Técnicas Detalhadas
## GalaxIA Dashboard Enhancement Project

---

## 📁 Estrutura de Arquivos Sugerida

```
src/
├── api/
│   ├── dashboard.ts              # API client para dashboard
│   ├── projects.ts               # API client para projetos
│   ├── users.ts                  # API client para usuários
│   ├── ai.ts                     # API client para IA
│   └── types.ts                  # Tipos das APIs
├── store/
│   ├── dashboardStore.ts         # Estado global do dashboard
│   ├── authStore.ts              # Estado de autenticação
│   ├── realTimeStore.ts          # Estado para tempo real
│   └── index.ts                  # Export central
├── hooks/
│   ├── useWebSocket.ts           # Hook para WebSocket
│   ├── useResponsive.ts          # Hook para responsividade
│   ├── useAnalytics.ts           # Hook para analytics
│   ├── useDashboard.ts           # Hook principal do dashboard
│   └── useAI.ts                  # Hook para IA
├── components/
│   ├── dashboard/
│   │   ├── client/
│   │   │   ├── ClientDashboard.tsx
│   │   │   ├── ProjectsCommandPanel.tsx
│   │   │   ├── MessagesCenter.tsx
│   │   │   ├── PersonalizedDiscovery.tsx
│   │   │   └── SuccessMetrics.tsx
│   │   ├── professional/
│   │   │   ├── ProfessionalDashboard.tsx
│   │   │   ├── BusinessCommandPanel.tsx
│   │   │   ├── SalesPipeline.tsx
│   │   │   ├── ActiveProjects.tsx
│   │   │   ├── MarketIntelligence.tsx
│   │   │   └── PerformanceAnalytics.tsx
│   │   ├── shared/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── WidgetContainer.tsx
│   │   │   ├── LoadingStates.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   └── widgets/
│   │       ├── BaseWidget.tsx
│   │       ├── ChartWidget.tsx
│   │       ├── MetricWidget.tsx
│   │       └── ActionWidget.tsx
│   ├── analytics/
│   │   ├── AdvancedChart.tsx
│   │   ├── MetricsGrid.tsx
│   │   ├── TrendAnalysis.tsx
│   │   └── PredictiveInsights.tsx
│   ├── ai/
│   │   ├── AIAssistant.tsx
│   │   ├── RecommendationCard.tsx
│   │   ├── SmartSuggestions.tsx
│   │   └── ChatInterface.tsx
│   ├── mobile/
│   │   ├── MobileDashboard.tsx
│   │   ├── SwipeableCards.tsx
│   │   ├── BottomNavigation.tsx
│   │   └── TouchGestures.tsx
│   └── adaptive/
│       ├── AdaptiveLayout.tsx
│       ├── ResponsiveGrid.tsx
│       └── DeviceDetector.tsx
├── services/
│   ├── aiService.ts              # Serviço de IA
│   ├── analyticsService.ts       # Serviço de analytics
│   ├── personalizationService.ts # Serviço de personalização
│   ├── notificationService.ts    # Serviço de notificações
│   └── cacheService.ts           # Serviço de cache
├── utils/
│   ├── performance.ts            # Utilitários de performance
│   ├── validation.ts             # Validadores
│   ├── formatters.ts             # Formatadores de dados
│   └── constants.ts              # Constantes
├── types/
│   ├── dashboard.ts              # Tipos do dashboard
│   ├── user.ts                   # Tipos de usuário
│   ├── project.ts                # Tipos de projeto
│   ├── analytics.ts              # Tipos de analytics
│   └── api.ts                    # Tipos de API
└── styles/
    ├── globals.css               # Estilos globais
    ├── dashboard.css             # Estilos específicos do dashboard
    └── animations.css            # Animações customizadas
```

---

## 🎨 Design System e Componentes

### **Tokens de Design**
```typescript
// styles/tokens.ts
export const designTokens = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      500: '#0ea5e9',
      600: '#0284c7',
      900: '#0c4a6e',
    },
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      500: '#6b7280',
      900: '#111827',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
} as const;
```

### **Componente Base de Widget**
```typescript
// components/dashboard/widgets/BaseWidget.tsx
interface BaseWidgetProps {
  title: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  priority?: 'low' | 'medium' | 'high';
  refreshable?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export const BaseWidget: React.FC<BaseWidgetProps> = ({
  title,
  description,
  loading = false,
  error = null,
  children,
  actions,
  size = 'medium',
  priority = 'medium',
  refreshable = false,
  onRefresh,
  className,
}) => {
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-1',
    large: 'col-span-3 row-span-2',
  };

  const priorityClasses = {
    low: 'border-neutral-200',
    medium: 'border-neutral-300',
    high: 'border-primary-500',
  };

  if (loading) {
    return (
      <Card className={cn(sizeClasses[size], className)}>
        <CardHeader>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn(sizeClasses[size], 'border-error-300', className)}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-error-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">{error}</p>
            {refreshable && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Tentar novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(sizeClasses[size], priorityClasses[priority], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs">
              {description}
            </CardDescription>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {refreshable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          {actions}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
```

---

## 🔄 Sistema de Estado Global

### **Dashboard Store (Zustand)**
```typescript
// store/dashboardStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface DashboardState {
  // User data
  user: User | null;
  userType: 'client' | 'professional' | null;
  
  // Dashboard data
  projects: Project[];
  messages: Message[];
  notifications: Notification[];
  analytics: AnalyticsData | null;
  recommendations: Recommendation[];
  
  // UI state
  layout: DashboardLayout;
  activeWidgets: string[];
  sidebarCollapsed: boolean;
  
  // Real-time state
  isConnected: boolean;
  lastUpdated: Date | null;
  
  // Loading states
  loading: {
    dashboard: boolean;
    projects: boolean;
    analytics: boolean;
  };
  
  // Error states
  errors: {
    dashboard: string | null;
    projects: string | null;
    analytics: string | null;
  };
}

interface DashboardActions {
  // Data actions
  setUser: (user: User | null) => void;
  setProjects: (projects: Project[]) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  addMessage: (message: Message) => void;
  addNotification: (notification: Notification) => void;
  
  // UI actions
  updateLayout: (layout: Partial<DashboardLayout>) => void;
  toggleWidget: (widgetId: string) => void;
  toggleSidebar: () => void;
  
  // Loading actions
  setLoading: (key: keyof DashboardState['loading'], value: boolean) => void;
  setError: (key: keyof DashboardState['errors'], error: string | null) => void;
  
  // Real-time actions
  setConnectionStatus: (connected: boolean) => void;
  handleRealTimeUpdate: (update: RealTimeUpdate) => void;
  
  // Data fetching actions
  fetchDashboardData: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  
  // Reset actions
  reset: () => void;
}

const initialState: DashboardState = {
  user: null,
  userType: null,
  projects: [],
  messages: [],
  notifications: [],
  analytics: null,
  recommendations: [],
  layout: {
    grid: { columns: 12, rows: 'auto' },
    widgets: [],
  },
  activeWidgets: [],
  sidebarCollapsed: false,
  isConnected: false,
  lastUpdated: null,
  loading: {
    dashboard: false,
    projects: false,
    analytics: false,
  },
  errors: {
    dashboard: null,
    projects: null,
    analytics: null,
  },
};

export const useDashboardStore = create<DashboardState & { actions: DashboardActions }>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        actions: {
          setUser: (user) => set({ user, userType: user?.type || null }),
          
          setProjects: (projects) => set({ projects }),
          
          updateProject: (projectId, updates) =>
            set((state) => ({
              projects: state.projects.map((project) =>
                project.id === projectId ? { ...project, ...updates } : project
              ),
            })),
          
          addMessage: (message) =>
            set((state) => ({
              messages: [message, ...state.messages],
            })),
          
          addNotification: (notification) =>
            set((state) => ({
              notifications: [notification, ...state.notifications],
            })),
          
          updateLayout: (layout) =>
            set((state) => ({
              layout: { ...state.layout, ...layout },
            })),
          
          toggleWidget: (widgetId) =>
            set((state) => ({
              activeWidgets: state.activeWidgets.includes(widgetId)
                ? state.activeWidgets.filter((id) => id !== widgetId)
                : [...state.activeWidgets, widgetId],
            })),
          
          toggleSidebar: () =>
            set((state) => ({
              sidebarCollapsed: !state.sidebarCollapsed,
            })),
          
          setLoading: (key, value) =>
            set((state) => ({
              loading: { ...state.loading, [key]: value },
            })),
          
          setError: (key, error) =>
            set((state) => ({
              errors: { ...state.errors, [key]: error },
            })),
          
          setConnectionStatus: (connected) =>
            set({ isConnected: connected }),
          
          handleRealTimeUpdate: (update) => {
            const state = get();
            
            switch (update.type) {
              case 'PROJECT_UPDATE':
                state.actions.updateProject(update.data.projectId, update.data.updates);
                break;
              case 'NEW_MESSAGE':
                state.actions.addMessage(update.data.message);
                break;
              case 'NEW_NOTIFICATION':
                state.actions.addNotification(update.data.notification);
                break;
            }
            
            set({ lastUpdated: new Date() });
          },
          
          fetchDashboardData: async () => {
            const { setLoading, setError } = get().actions;
            
            try {
              setLoading('dashboard', true);
              setError('dashboard', null);
              
              const user = get().user;
              if (!user) throw new Error('User not authenticated');
              
              const dashboardData = await dashboardAPI.getDashboardData(user.id);
              
              set({
                projects: dashboardData.projects,
                messages: dashboardData.messages,
                notifications: dashboardData.notifications,
                analytics: dashboardData.analytics,
                recommendations: dashboardData.recommendations,
              });
            } catch (error) {
              setError('dashboard', error.message);
            } finally {
              setLoading('dashboard', false);
            }
          },
          
          fetchProjects: async () => {
            const { setLoading, setError } = get().actions;
            
            try {
              setLoading('projects', true);
              setError('projects', null);
              
              const user = get().user;
              if (!user) throw new Error('User not authenticated');
              
              const projects = await dashboardAPI.getProjects(user.id);
              set({ projects });
            } catch (error) {
              setError('projects', error.message);
            } finally {
              setLoading('projects', false);
            }
          },
          
          fetchAnalytics: async () => {
            const { setLoading, setError } = get().actions;
            
            try {
              setLoading('analytics', true);
              setError('analytics', null);
              
              const user = get().user;
              if (!user) throw new Error('User not authenticated');
              
              const analytics = await dashboardAPI.getAnalytics(user.id);
              set({ analytics });
            } catch (error) {
              setError('analytics', error.message);
            } finally {
              setLoading('analytics', false);
            }
          },
          
          reset: () => set(initialState),
        },
      }),
      {
        name: 'dashboard-store',
        partialize: (state) => ({
          user: state.user,
          userType: state.userType,
          layout: state.layout,
          activeWidgets: state.activeWidgets,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    { name: 'dashboard-store' }
  )
);

// Selector hooks for better performance
export const useUser = () => useDashboardStore((state) => state.user);
export const useProjects = () => useDashboardStore((state) => state.projects);
export const useMessages = () => useDashboardStore((state) => state.messages);
export const useNotifications = () => useDashboardStore((state) => state.notifications);
export const useAnalytics = () => useDashboardStore((state) => state.analytics);
export const useDashboardActions = () => useDashboardStore((state) => state.actions);
```

---

## 🌐 Sistema WebSocket

### **WebSocket Hook**
```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

interface WebSocketReturn {
  socket: WebSocket | null;
  isConnected: boolean;
  error: string | null;
  send: (data: any) => boolean;
  reconnect: () => void;
  disconnect: () => void;
}

export const useWebSocket = (config: WebSocketConfig): WebSocketReturn => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const reconnectCount = useRef(0);
  const maxReconnectAttempts = config.reconnectAttempts || 5;
  const reconnectInterval = config.reconnectInterval || 5000;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { actions } = useDashboardStore();
  
  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(config.url, config.protocols);
      
      ws.onopen = (event) => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectCount.current = 0;
        actions.setConnectionStatus(true);
        config.onOpen?.(event);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          actions.handleRealTimeUpdate(data);
        } catch (parseError) {
          console.error('Failed to parse WebSocket message:', parseError);
        }
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setSocket(null);
        actions.setConnectionStatus(false);
        config.onClose?.(event);
        
        // Attempt to reconnect if not a manual disconnect
        if (event.code !== 1000 && reconnectCount.current < maxReconnectAttempts) {
          reconnectCount.current++;
          setError(`Conexão perdida. Tentativa ${reconnectCount.current}/${maxReconnectAttempts}...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectCount.current >= maxReconnectAttempts) {
          setError('Não foi possível restabelecer a conexão. Recarregue a página.');
        }
      };
      
      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Erro de conexão');
        config.onError?.(event);
      };
      
      setSocket(ws);
    } catch (connectionError) {
      console.error('Failed to create WebSocket connection:', connectionError);
      setError('Falha ao conectar');
    }
  }, [config, actions, maxReconnectAttempts, reconnectInterval]);
  
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket) {
      socket.close(1000, 'Manual disconnect');
    }
  }, [socket]);
  
  const reconnect = useCallback(() => {
    disconnect();
    reconnectCount.current = 0;
    setError(null);
    connect();
  }, [disconnect, connect]);
  
  const send = useCallback((data: any): boolean => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(data));
        return true;
      } catch (sendError) {
        console.error('Failed to send WebSocket message:', sendError);
        setError('Falha ao enviar mensagem');
        return false;
      }
    }
    return false;
  }, [socket]);
  
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  return {
    socket,
    isConnected,
    error,
    send,
    reconnect,
    disconnect,
  };
};

// Hook específico para dashboard
export const useDashboardWebSocket = () => {
  const user = useDashboardStore((state) => state.user);
  
  return useWebSocket({
    url: `${import.meta.env.VITE_WS_URL}/dashboard?userId=${user?.id}`,
    reconnectAttempts: 5,
    reconnectInterval: 3000,
  });
};
```

---

## 🤖 Sistema de IA

### **AI Service**
```typescript
// services/aiService.ts
interface AIProvider {
  generateRecommendations(context: RecommendationContext): Promise<Recommendation[]>;
  suggestPricing(projectData: ProjectData): Promise<PricingSuggestion>;
  generateProposal(briefing: string): Promise<string>;
  analyzeMarketTrends(category: string): Promise<MarketAnalysis>;
  optimizeWorkflow(userBehavior: UserBehavior): Promise<WorkflowSuggestion[]>;
}

interface RecommendationContext {
  userProfile: UserProfile;
  projectHistory: Project[];
  marketTrends: MarketTrend[];
  currentProjects: Project[];
}

interface PricingSuggestion {
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  reasoning: string;
  marketComparison: {
    averagePrice: number;
    competitorPrices: number[];
  };
  confidence: number;
}

class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async generateRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const prompt = this.buildRecommendationPrompt(context);
    
    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente especializado em marketplace de freelancers. 
                   Analise o contexto do usuário e gere recomendações personalizadas 
                   baseadas no histórico, tendências de mercado e comportamento.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });
    
    return this.parseRecommendations(response.choices[0].message.content);
  }
  
  async suggestPricing(projectData: ProjectData): Promise<PricingSuggestion> {
    const prompt = `
      Analise este projeto e sugira um preço competitivo:
      
      Título: ${projectData.title}
      Descrição: ${projectData.description}
      Categoria: ${projectData.category}
      Prazo: ${projectData.deadline}
      Complexidade: ${projectData.complexity}
      
      Considere:
      - Preços médios do mercado brasileiro
      - Complexidade técnica
      - Prazo solicitado
      - Valor entregue ao cliente
      
      Retorne em formato JSON com:
      - suggestedPrice: número
      - priceRange: {min, max}
      - reasoning: string explicando o cálculo
      - confidence: número de 0 a 1
    `;
    
    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    });
    
    return JSON.parse(response.choices[0].message.content);
  }
  
  async generateProposal(briefing: string): Promise<string> {
    const prompt = `
      Crie uma proposta profissional e persuasiva baseada neste briefing:
      
      ${briefing}
      
      A proposta deve incluir:
      1. Compreensão do problema/necessidade
      2. Solução proposta
      3. Metodologia de trabalho
      4. Entregáveis
      5. Cronograma
      6. Diferenciais competitivos
      
      Tom: Profissional, confiante e orientado a resultados.
      Tamanho: Entre 300-500 palavras.
    `;
    
    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
    });
    
    return response.choices[0].message.content;
  }
  
  private async makeRequest(endpoint: string, body: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  private buildRecommendationPrompt(context: RecommendationContext): string {
    return `
      Contexto do usuário:
      - Tipo: ${context.userProfile.type}
      - Categorias de interesse: ${context.userProfile.categories.join(', ')}
      - Orçamento médio: R$ ${context.userProfile.averageBudget}
      - Localização: ${context.userProfile.location}
      - Projetos concluídos: ${context.projectHistory.length}
      - Taxa de sucesso: ${context.userProfile.successRate}%
      
      Projetos atuais: ${context.currentProjects.length}
      
      Tendências de mercado:
      ${context.marketTrends.map(trend => `- ${trend.category}: ${trend.growth}%`).join('\n')}
      
      Gere 3-5 recomendações personalizadas no formato JSON:
      [
        {
          "title": "Título da recomendação",
          "description": "Descrição detalhada",
          "category": "categoria",
          "priority": "high|medium|low",
          "reasoning": "Por que esta recomendação é relevante",
          "actionItems": ["ação 1", "ação 2"],
          "expectedImpact": "Impacto esperado",
          "confidence": 0.85
        }
      ]
    `;
  }
  
  private parseRecommendations(content: string): Recommendation[] {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse AI recommendations:', error);
      return [];
    }
  }
}

// Factory para diferentes providers
export class AIServiceFactory {
  static create(provider: 'openai' | 'claude' | 'gemini'): AIProvider {
    switch (provider) {
      case 'openai':
        return new OpenAIProvider(import.meta.env.VITE_OPENAI_API_KEY);
      case 'claude':
        return new ClaudeProvider(import.meta.env.VITE_CLAUDE_API_KEY);
      case 'gemini':
        return new GeminiProvider(import.meta.env.VITE_GEMINI_API_KEY);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
}

// Hook para usar IA no React
export const useAI = () => {
  const [aiService] = useState(() => 
    AIServiceFactory.create(import.meta.env.VITE_AI_PROVIDER || 'openai')
  );
  
  const generateRecommendations = useCallback(
    async (context: RecommendationContext) => {
      return aiService.generateRecommendations(context);
    },
    [aiService]
  );
  
  const suggestPricing = useCallback(
    async (projectData: ProjectData) => {
      return aiService.suggestPricing(projectData);
    },
    [aiService]
  );
  
  const generateProposal = useCallback(
    async (briefing: string) => {
      return aiService.generateProposal(briefing);
    },
    [aiService]
  );
  
  return {
    generateRecommendations,
    suggestPricing,
    generateProposal,
  };
};
```

---

## 📱 Sistema Mobile Responsivo

### **Hook de Responsividade**
```typescript
// hooks/useResponsive.ts
import { useState, useEffect } from 'react';

interface ScreenSize {
  width: number;
  height: number;
}

interface Breakpoints {
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
  wide: boolean;
}

interface ResponsiveHook {
  screenSize: ScreenSize;
  breakpoints: Breakpoints;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  orientation: 'portrait' | 'landscape';
}

export const useResponsive = (): ResponsiveHook => {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });
  
  const getBreakpoints = (width: number): Breakpoints => ({
    mobile: width < 768,
    tablet: width >= 768 && width < 1024,
    desktop: width >= 1024 && width < 1440,
    wide: width >= 1440,
  });
  
  const breakpoints = getBreakpoints(screenSize.width);
  
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    screenSize,
    breakpoints,
    isMobile: breakpoints.mobile,
    isTablet: breakpoints.tablet,
    isDesktop: breakpoints.desktop,
    isWide: breakpoints.wide,
    orientation: screenSize.width > screenSize.height ? 'landscape' : 'portrait',
  };
};

// Hook para detectar gestos touch
export const useTouchGestures = () => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };
  
  const getSwipeDirection = () => {
    if (!touchStart || !touchEnd) return null;
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        return deltaX > 0 ? 'left' : 'right';
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        return deltaY > 0 ? 'up' : 'down';
      }
    }
    
    return null;
  };
  
  return {
    handleTouchStart,
    handleTouchMove,
    getSwipeDirection,
    touchStart,
    touchEnd,
  };
};
```

### **Componente Mobile Dashboard**
```typescript
// components/mobile/MobileDashboard.tsx
import { useState } from 'react';
import { useTouchGestures, useResponsive } from '@/hooks';
import { AnimatePresence, motion } from 'framer-motion';

interface MobileDashboardProps {
  userType: 'client' | 'professional';
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({ userType }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { handleTouchStart, handleTouchMove, getSwipeDirection } = useTouchGestures();
  const { isMobile } = useResponsive();
  
  const clientTabs = [
    { id: 'projects', label: 'Projetos', icon: FolderOpen },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare },
    { id: 'discover', label: 'Descobrir', icon: Search },
    { id: 'metrics', label: 'Métricas', icon: BarChart3 },
  ];
  
  const professionalTabs = [
    { id: 'pipeline', label: 'Pipeline', icon: TrendingUp },
    { id: 'projects', label: 'Projetos', icon: FolderOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'market', label: 'Mercado', icon: Globe },
  ];
  
  const tabs = userType === 'client' ? clientTabs : professionalTabs;
  
  const handleTouchEnd = () => {
    const direction = getSwipeDirection();
    
    if (direction === 'left' && activeTab < tabs.length - 1) {
      setActiveTab(activeTab + 1);
    } else if (direction === 'right' && activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };
  
  if (!isMobile) {
    return null; // Render desktop version
  }
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          <GalaxiaLogo />
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main 
        className="flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="h-full"
          >
            <TabContent 
              tabId={tabs[activeTab].id} 
              userType={userType}
            />
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Bottom Navigation */}
      <nav className="border-t bg-background">
        <div className="grid grid-cols-4 gap-1">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === index;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-3 text-xs transition-colors',
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

// Componente para renderizar conteúdo das abas
const TabContent: React.FC<{ tabId: string; userType: string }> = ({ tabId, userType }) => {
  const renderContent = () => {
    switch (tabId) {
      case 'projects':
        return <MobileProjectsList userType={userType} />;
      case 'messages':
        return <MobileMessagesList />;
      case 'discover':
        return <MobileDiscovery />;
      case 'metrics':
        return <MobileMetrics userType={userType} />;
      case 'pipeline':
        return <MobilePipeline />;
      case 'analytics':
        return <MobileAnalytics />;
      case 'market':
        return <MobileMarket />;
      default:
        return <div>Tab not found</div>;
    }
  };
  
  return (
    <div className="h-full overflow-auto p-4">
      {renderContent()}
    </div>
  );
};
```

---

## 📊 Sistema de Analytics

### **Analytics Service**
```typescript
// services/analyticsService.ts
interface AnalyticsData {
  performance: PerformanceMetrics;
  trends: TrendData[];
  predictions: PredictionData;
  comparisons: ComparisonData;
  realTimeMetrics: RealTimeMetrics;
}

interface PerformanceMetrics {
  projectSuccessRate: number;
  averageCompletionTime: number;
  clientSatisfactionScore: number;
  revenueGrowth: number;
  marketPosition: number;
  conversionRate: number;
  responseTime: number;
}

interface TrendData {
  category: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dataPoints: {
    date: string;
    value: number;
    change: number;
  }[];
  trend: 'up' | 'down' | 'stable';
  significance: number;
}

interface PredictionData {
  revenueForcast: {
    nextMonth: number;
    nextQuarter: number;
    confidence: number;
  };
  demandPrediction: {
    category: string;
    expectedGrowth: number;
    seasonality: SeasonalityData;
  }[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    recommendations: string[];
  };
}

class AdvancedAnalyticsService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes
  
  async getAnalytics(
    userId: string, 
    timeRange: TimeRange,
    metrics?: string[]
  ): Promise<AnalyticsData> {
    const cacheKey = `analytics-${userId}-${timeRange.start}-${timeRange.end}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    
    const [performance, trends, predictions, comparisons, realTimeMetrics] = await Promise.all([
      this.getPerformanceMetrics(userId, timeRange),
      this.getTrendAnalysis(userId, timeRange),
      this.getPredictiveAnalytics(userId),
      this.getMarketComparisons(userId),
      this.getRealTimeMetrics(userId),
    ]);
    
    const analyticsData = {
      performance,
      trends,
      predictions,
      comparisons,
      realTimeMetrics,
    };
    
    // Cache the results
    this.cache.set(cacheKey, {
      data: analyticsData,
      timestamp: Date.now(),
    });
    
    return analyticsData;
  }
  
  private async getPerformanceMetrics(
    userId: string, 
    timeRange: TimeRange
  ): Promise<PerformanceMetrics> {
    const response = await fetch(`/api/analytics/performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, timeRange }),
    });
    
    return response.json();
  }
  
  private async getTrendAnalysis(
    userId: string, 
    timeRange: TimeRange
  ): Promise<TrendData[]> {
    // Implementar análise de tendências usando algoritmos estatísticos
    const response = await fetch(`/api/analytics/trends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, timeRange }),
    });
    
    const rawData = await response.json();
    
    // Aplicar algoritmos de detecção de tendências
    return rawData.map((item: any) => ({
      ...item,
      trend: this.detectTrend(item.dataPoints),
      significance: this.calculateSignificance(item.dataPoints),
    }));
  }
  
  private async getPredictiveAnalytics(userId: string): Promise<PredictionData> {
    // Implementar modelos preditivos
    // Para MVP, usar regressão linear simples
    // Futuramente: integrar com ML models (TensorFlow.js, etc.)
    
    const historicalData = await this.getHistoricalData(userId);
    
    const revenueForcast = this.forecastRevenue(historicalData.revenue);
    const demandPrediction = this.predictDemand(historicalData.projects);
    const riskAssessment = this.assessRisk(historicalData);
    
    return {
      revenueForcast,
      demandPrediction,
      riskAssessment,
    };
  }
  
  private detectTrend(dataPoints: any[]): 'up' | 'down' | 'stable' {
    if (dataPoints.length < 2) return 'stable';
    
    const firstValue = dataPoints[0].value;
    const lastValue = dataPoints[dataPoints.length - 1].value;
    const changePercentage = ((lastValue - firstValue) / firstValue) * 100;
    
    if (changePercentage > 5) return 'up';
    if (changePercentage < -5) return 'down';
    return 'stable';
  }
  
  private calculateSignificance(dataPoints: any[]): number {
    // Calcular significância estatística das mudanças
    // Implementar teste t ou análise de variância
    const values = dataPoints.map(p => p.value);
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2)) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Retornar coeficiente de variação como proxy para significância
    return stdDev / mean;
  }
  
  private forecastRevenue(revenueData: any[]): any {
    // Implementar regressão linear para previsão de receita
    const n = revenueData.length;
    if (n < 3) return { nextMonth: 0, nextQuarter: 0, confidence: 0 };
    
    // Calcular linha de tendência
    const x = revenueData.map((_, i) => i);
    const y = revenueData.map(d => d.value);
    
    const sumX = x.reduce((a, b) => a + b);
    const sumY = y.reduce((a, b) => a + b);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Prever próximos valores
    const nextMonth = slope * n + intercept;
    const nextQuarter = slope * (n + 3) + intercept;
    
    // Calcular confiança baseada em R²
    const yMean = sumY / n;
    const totalSumSquares = y.reduce((acc, yi) => acc + Math.pow(yi - yMean, 2), 0);
    const residualSumSquares = y.reduce((acc, yi, i) => {
      const predicted = slope * i + intercept;
      return acc + Math.pow(yi - predicted, 2);
    }, 0);
    
    const rSquared = 1 - (residualSumSquares / totalSumSquares);
    
    return {
      nextMonth: Math.max(0, nextMonth),
      nextQuarter: Math.max(0, nextQuarter),
      confidence: Math.max(0, Math.min(1, rSquared)),
    };
  }
}

// Hook para usar analytics
export const useAnalytics = (userId: string, timeRange: TimeRange) => {
  const [analyticsService] = useState(() => new AdvancedAnalyticsService());
  
  return useQuery({
    queryKey: ['analytics', userId, timeRange],
    queryFn: () => analyticsService.getAnalytics(userId, timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
```

---

Esta documentação técnica fornece as especificações detalhadas para implementar todas as melhorias propostas nos dashboards da GalaxIA, seguindo as melhores práticas de desenvolvimento e arquitetura de software moderna.