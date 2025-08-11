import { Project, User, DashboardMetrics } from '@/store/dashboardStore';

interface Recommendation {
  id: string;
  type: 'price_optimization' | 'project_match' | 'skill_development' | 'market_trend';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  estimatedImpact: string;
  category: string;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'opportunity' | 'trend' | 'achievement';
  actionItems: string[];
  relevanceScore: number;
}

interface MarketAnalysis {
  category: string;
  averagePrice: number;
  demandTrend: 'increasing' | 'stable' | 'decreasing';
  competitionLevel: 'low' | 'medium' | 'high';
  suggestedPriceRange: { min: number; max: number };
  keySkills: string[];
  opportunities: string[];
}

class AIService {
  private apiKey: string | null;
  private baseURL: string;
  
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || null;
    this.baseURL = process.env.NEXT_PUBLIC_AI_API_URL || 'https://api.openai.com/v1';
  }
  
  // Generate recommendations based on user profile and performance
  async generateRecommendations(
    user: User, 
    metrics: DashboardMetrics, 
    projects: Project[]
  ): Promise<Recommendation[]> {
    try {
      // Mock recommendations for now - replace with actual AI calls
      const recommendations: Recommendation[] = [];
      
      // Price optimization
      if (metrics.conversionRate < 60) {
        recommendations.push({
          id: 'price-opt-1',
          type: 'price_optimization',
          title: 'Considere ajustar seus preços',
          description: 'Sua taxa de conversão está abaixo da média. Considere reduzir preços em 10-15% para aumentar conversões.',
          confidence: 0.8,
          priority: 'high',
          actionable: true,
          estimatedImpact: '+25% em conversões',
          category: 'Precificação'
        });
      }
      
      // Skill development
      const incompleteProjects = projects.filter(p => p.status === 'active').length;
      if (incompleteProjects > 5) {
        recommendations.push({
          id: 'skill-dev-1',
          type: 'skill_development',
          title: 'Melhore gestão de projetos',
          description: 'Você tem muitos projetos ativos. Considere cursos de gestão de tempo e projetos.',
          confidence: 0.7,
          priority: 'medium',
          actionable: true,
          estimatedImpact: '+30% eficiência',
          category: 'Desenvolvimento'
        });
      }
      
      // Market trend
      recommendations.push({
        id: 'market-trend-1',
        type: 'market_trend',
        title: 'IA está em alta demanda',
        description: 'Projetos relacionados a IA cresceram 150% este mês. Considere desenvolver skills nesta área.',
        confidence: 0.9,
        priority: 'high',
        actionable: true,
        estimatedImpact: '+40% oportunidades',
        category: 'Tendências'
      });
      
      return recommendations;
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return this.getFallbackRecommendations();
    }
  }
  
  // Generate pricing suggestions for a project
  async suggestPricing(projectDescription: string, category: string): Promise<{
    suggestedPrice: number;
    confidence: number;
    reasoning: string;
    priceRange: { min: number; max: number };
  }> {
    try {
      // Mock pricing for now
      const basePrice = this.calculateBasePrice(category);
      const complexityMultiplier = this.analyzeComplexity(projectDescription);
      
      return {
        suggestedPrice: Math.round(basePrice * complexityMultiplier),
        confidence: 0.75,
        reasoning: `Baseado na categoria "${category}" e complexidade estimada do projeto`,
        priceRange: {
          min: Math.round(basePrice * complexityMultiplier * 0.8),
          max: Math.round(basePrice * complexityMultiplier * 1.3)
        }
      };
    } catch (error) {
      console.error('Failed to suggest pricing:', error);
      return {
        suggestedPrice: 2500,
        confidence: 0.5,
        reasoning: 'Preço baseado em média de mercado',
        priceRange: { min: 2000, max: 3500 }
      };
    }
  }
  
  // Generate AI insights about performance
  async generateInsights(
    metrics: DashboardMetrics,
    projects: Project[]
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // Revenue trend analysis
    if (metrics.revenueGrowth > 20) {
      insights.push({
        id: 'revenue-growth',
        title: 'Crescimento Acelerado Detectado',
        description: `Sua receita cresceu ${metrics.revenueGrowth}% este mês. Esta é uma tendência excelente!`,
        type: 'achievement',
        actionItems: [
          'Mantenha a qualidade do serviço',
          'Considere aumentar preços gradualmente',
          'Documente seus processos de sucesso'
        ],
        relevanceScore: 0.9
      });
    }
    
    // Response time optimization
    if (metrics.responseTime > 2) {
      insights.push({
        id: 'response-time',
        title: 'Oportunidade de Melhoria na Resposta',
        description: 'Seu tempo de resposta está acima da média ideal de 1.5h',
        type: 'opportunity',
        actionItems: [
          'Configure notificações push',
          'Use templates para respostas comuns',
          'Defina horários específicos para checkar mensagens'
        ],
        relevanceScore: 0.7
      });
    }
    
    // Market position
    if (metrics.npsScore > 80) {
      insights.push({
        id: 'market-position',
        title: 'Excelente Posicionamento no Mercado',
        description: `Com NPS de ${metrics.npsScore}, você está no top 10% dos profissionais`,
        type: 'achievement',
        actionItems: [
          'Solicite mais referências dos clientes satisfeitos',
          'Crie case studies dos seus melhores projetos',
          'Considere aumentar seus preços'
        ],
        relevanceScore: 0.8
      });
    }
    
    return insights;
  }
  
  // Analyze market trends for a specific category
  async analyzeMarket(category: string): Promise<MarketAnalysis> {
    // Mock market analysis
    const marketData: Record<string, MarketAnalysis> = {
      'Web Development': {
        category: 'Web Development',
        averagePrice: 3500,
        demandTrend: 'increasing',
        competitionLevel: 'high',
        suggestedPriceRange: { min: 2500, max: 5000 },
        keySkills: ['React', 'Node.js', 'TypeScript', 'Next.js'],
        opportunities: [
          'E-commerce platforms',
          'Progressive Web Apps',
          'API integrations'
        ]
      },
      'Design': {
        category: 'Design',
        averagePrice: 2800,
        demandTrend: 'stable',
        competitionLevel: 'medium',
        suggestedPriceRange: { min: 2000, max: 4000 },
        keySkills: ['Figma', 'UI/UX', 'Branding', 'Prototyping'],
        opportunities: [
          'Mobile app design',
          'Design systems',
          'Accessibility design'
        ]
      }
    };
    
    return marketData[category] || marketData['Web Development'];
  }
  
  private calculateBasePrice(category: string): number {
    const basePrices: Record<string, number> = {
      'Web Development': 3000,
      'Mobile Development': 4000,
      'Design': 2500,
      'Content Writing': 1500,
      'Marketing': 2000
    };
    
    return basePrices[category] || 2500;
  }
  
  private analyzeComplexity(description: string): number {
    let multiplier = 1;
    
    // Simple keyword analysis
    const complexityKeywords = [
      'integration', 'api', 'database', 'authentication', 'payment',
      'real-time', 'mobile', 'responsive', 'custom', 'advanced'
    ];
    
    const keywordCount = complexityKeywords.reduce((count, keyword) => {
      return count + (description.toLowerCase().includes(keyword) ? 1 : 0);
    }, 0);
    
    multiplier += keywordCount * 0.2;
    
    // Length analysis
    if (description.length > 500) multiplier += 0.3;
    if (description.length > 1000) multiplier += 0.2;
    
    return Math.min(multiplier, 2.5); // Cap at 2.5x
  }
  
  private getFallbackRecommendations(): Recommendation[] {
    return [
      {
        id: 'fallback-1',
        type: 'market_trend',
        title: 'Continue acompanhando tendências',
        description: 'Mantenha-se atualizado com as últimas tendências do mercado.',
        confidence: 0.6,
        priority: 'medium',
        actionable: true,
        estimatedImpact: 'Melhoria contínua',
        category: 'Geral'
      }
    ];
  }
}

export const aiService = new AIService();
export type { Recommendation, AIInsight, MarketAnalysis };