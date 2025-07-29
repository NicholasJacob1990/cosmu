import { User } from '@/store/dashboardStore';

// Tipos de Widgets disponíveis
export type WidgetType = 
  | 'welcome'
  | 'projectsCommand'
  | 'messages'
  | 'personalizedDiscovery'
  | 'successMetrics'
  | 'salesPipeline'
  | 'activeProjects'
  | 'marketIntelligence'
  | 'performanceAnalytics';

// Configuração de um widget no layout
export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
  config?: Record<string, any>; // Configurações específicas do widget
}

// Layout do Dashboard
export interface DashboardLayout {
  widgets: WidgetConfig[];
  theme: 'light' | 'dark' | 'system';
}

// Preferências do usuário
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  favoriteWidgets: WidgetType[];
  // Outras preferências podem ser adicionadas aqui
}

// Mock de dados de comportamento do usuário
interface UserBehavior {
  mostUsedWidgets: WidgetType[];
  loginFrequency: 'daily' | 'weekly' | 'monthly';
  peakHours: string[]; // ex: ['09:00-11:00', '14:00-16:00']
}

class PersonalizationEngine {
  // Simula a busca de comportamento do usuário a partir de uma API de analytics
  private async getUserBehavior(userId: string): Promise<UserBehavior> {
    console.log(`Fetching behavior for user ${userId}...`);
    // Em uma implementação real, isso viria de uma API que analisa logs de atividade
    return {
      mostUsedWidgets: ['projectsCommand', 'messages', 'performanceAnalytics'],
      loginFrequency: 'daily',
      peakHours: ['10:00-12:00'],
    };
  }

  // Simula a busca de preferências salvas do usuário
  private async getUserPreferences(userId: string): Promise<UserPreferences> {
    console.log(`Fetching preferences for user ${userId}...`);
    // Em uma implementação real, isso viria do backend
    const savedPrefs = localStorage.getItem(`user-prefs-${userId}`);
    if (savedPrefs) {
      return JSON.parse(savedPrefs);
    }
    return {
      theme: 'system',
      favoriteWidgets: [],
    };
  }

  // Gera um layout otimizado baseado no comportamento e preferências
  private generateLayout(behavior: UserBehavior, preferences: UserPreferences): DashboardLayout {
    const widgetPriority: WidgetType[] = [
      ...preferences.favoriteWidgets,
      ...behavior.mostUsedWidgets,
      // Fallback widgets
      'welcome',
      'projectsCommand',
      'messages',
      'performanceAnalytics'
    ];

    const uniqueWidgets = [...new Set(widgetPriority)];

    const widgets: WidgetConfig[] = uniqueWidgets.map((type, index) => ({
      id: `${type}-${index}`,
      type,
      position: { x: (index % 3) * 4, y: Math.floor(index / 3) * 4 },
      size: { width: 4, height: 4 },
      visible: true,
    }));
    
    return {
      widgets,
      theme: preferences.theme,
    };
  }

  // Método público para obter o layout personalizado
  async getPersonalizedLayout(user: User): Promise<DashboardLayout> {
    const [behavior, preferences] = await Promise.all([
      this.getUserBehavior(user.id),
      this.getUserPreferences(user.id)
    ]);
    
    return this.generateLayout(behavior, preferences);
  }

  // Método público para salvar as preferências do usuário
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const currentPrefs = await this.getUserPreferences(userId);
    const newPrefs = { ...currentPrefs, ...preferences };
    
    // Em uma implementação real, isso seria salvo no backend
    localStorage.setItem(`user-prefs-${userId}`, JSON.stringify(newPrefs));
    
    console.log(`Updated preferences for user ${userId}:`, newPrefs);
    return newPrefs;
  }
}

export const personalizationEngine = new PersonalizationEngine();
