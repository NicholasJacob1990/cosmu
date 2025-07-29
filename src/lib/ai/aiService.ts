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
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
    this.baseURL = import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1';
  }

  private buildRecommendationPrompt(user: User, metrics: DashboardMetrics, projects: Project[]): string {
    const projectSummary = projects.slice(0, 5).map(p => `- ${p.title} (Status: ${p.status}, Orçamento: ${p.budget.max}))`).join('\n');

    return `
      Aja como um consultor de negócios especialista para freelancers na plataforma GalaxIA.
      
      Analise os seguintes dados do profissional:
      - Perfil: ${user.name}, ${user.type}
      - Métricas Chave:
        - Receita Total: ${metrics.totalRevenue}
        - Crescimento da Receita: ${metrics.revenueGrowth}%
        - Projetos Ativos: ${metrics.activeProjects}
        - Projetos Concluídos: ${metrics.completedProjects}
        - Avaliação Média: ${metrics.averageRating}
        - Taxa de Conversão: ${metrics.conversionRate}%
        - NPS: ${metrics.npsScore}
      - Projetos Recentes:
        ${projectSummary}

      Baseado nesses dados, gere 3 recomendações concretas e acionáveis para ajudar este profissional a ter mais sucesso. 
      As recomendações devem se enquadrar nos seguintes tipos: 'price_optimization', 'project_match', 'skill_development', 'market_trend'.

      Retorne estritamente um array JSON de objetos, sem nenhum texto ou formatação adicional. O formato de cada objeto deve ser:
      {
        "id": "string",
        "type": "'price_optimization' | 'project_match' | 'skill_development' | 'market_trend'",
        "title": "string",
        "description": "string",
        "confidence": "number (0 a 1)",
        "priority": "'low' | 'medium' | 'high'",
        "actionable": "boolean",
        "estimatedImpact": "string",
        "category": "string"
      }
    `;
  }
  
  // Generate recommendations based on user profile and performance
  async generateRecommendations(
    user: User, 
    metrics: DashboardMetrics, 
    projects: Project[]
  ): Promise<Recommendation[]> {
    if (!this.apiKey) {
      console.warn("OpenAI API key is not configured. Returning fallback recommendations.");
      return this.getFallbackRecommendations();
    }

    try {
      const prompt = this.buildRecommendationPrompt(user, metrics, projects);

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
      }
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in AI response');
      }

      // Robust JSON parsing
      const jsonMatch = content.match(/\[.*\]/s);
      if (!jsonMatch) {
        console.error("No valid JSON array found in AI response:", content);
        return this.getFallbackRecommendations();
      }
      
      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return this.getFallbackRecommendations();
    }
  }

  private buildPricingPrompt(projectDescription: string, category: string): string {
    return `
      Aja como um especialista em precificação de projetos freelance para a plataforma GalaxIA.

      Analise a seguinte descrição de projeto na categoria "${category}":
      ---
      ${projectDescription}
      ---

      Com base na descrição, forneça uma sugestão de preço. 
      Considere a complexidade, as tecnologias envolvidas e o esforço estimado.

      Retorne estritamente um objeto JSON, sem nenhum texto ou formatação adicional. O formato do objeto deve ser:
      {
        "suggestedPrice": "number",
        "confidence": "number (0 a 1)",
        "reasoning": "string (explique brevemente como chegou a este preço)",
        "priceRange": {
          "min": "number",
          "max": "number"
        }
      }
    `;
  }
  
  // Generate pricing suggestions for a project
  async suggestPricing(projectDescription: string, category: string): Promise<{
    suggestedPrice: number;
    confidence: number;
    reasoning: string;
    priceRange: { min: number; max: number };
  }> {
    if (!this.apiKey) {
      console.warn("OpenAI API key is not configured. Returning fallback pricing.");
      return this.getFallbackPricing();
    }

    try {
      const prompt = this.buildPricingPrompt(projectDescription, category);
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in AI response');
      }

      const jsonMatch = content.match(/{.*}/s);
      if (!jsonMatch) {
        console.error("No valid JSON object found in AI response:", content);
        return this.getFallbackPricing();
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.error('Failed to suggest pricing:', error);
      return this.getFallbackPricing();
    }
  }

  private getFallbackPricing(): {
    suggestedPrice: number;
    confidence: number;
    reasoning: string;
    priceRange: { min: number; max: number };
  } {
    return {
      suggestedPrice: 2500,
      confidence: 0.5,
      reasoning: 'Preço baseado em média de mercado genérica.',
      priceRange: { min: 2000, max: 3500 }
    };
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