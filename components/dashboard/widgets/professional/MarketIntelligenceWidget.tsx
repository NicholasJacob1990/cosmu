import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users,
  Eye,
  Zap,
  Award,
  Clock,
  Star,
  BarChart3,
  RefreshCw,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Lightbulb,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketTrend {
  id: string;
  category: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  description: string;
  confidence: number;
  timeframe: string;
}

interface CompetitorInsight {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  priceRange: {
    min: number;
    max: number;
  };
  specialties: string[];
  strengths: string[];
  weaknesses: string[];
  marketShare: number;
  recentActivity: string;
}

interface OpportunityAlert {
  id: string;
  type: 'trend' | 'gap' | 'price' | 'demand';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  timeframe: string;
  tags: string[];
}

interface MarketMetric {
  id: string;
  label: string;
  value: string;
  change: {
    value: string;
    trend: 'up' | 'down' | 'stable';
  };
  benchmark: string;
  icon: any;
  color: string;
}

export function MarketIntelligenceWidget() {
  const [activeTab, setActiveTab] = useState('trends');
  
  const [trends] = useState<MarketTrend[]>([
    {
      id: '1',
      category: 'Desenvolvimento Mobile',
      trend: 'up',
      change: 23,
      description: 'Apps com IA estão em alta demanda',
      confidence: 85,
      timeframe: '30 dias'
    },
    {
      id: '2',
      category: 'UI/UX Design',
      trend: 'up',
      change: 18,
      description: 'Designs minimalistas e acessíveis',
      confidence: 78,
      timeframe: '30 dias'
    },
    {
      id: '3',
      category: 'Marketing Digital',
      trend: 'down',
      change: -12,
      description: 'Saturação em redes sociais tradicionais',
      confidence: 72,
      timeframe: '30 dias'
    },
    {
      id: '4',
      category: 'Desenvolvimento Web',
      trend: 'stable',
      change: 3,
      description: 'Demanda constante por sites corporativos',
      confidence: 90,
      timeframe: '30 dias'
    }
  ]);

  const [competitors] = useState<CompetitorInsight[]>([
    {
      id: '1',
      name: 'DevStudio Pro',
      avatar: '',
      rating: 4.8,
      priceRange: { min: 80, max: 150 },
      specialties: ['React', 'Node.js', 'Mobile'],
      strengths: ['Entregas rápidas', 'Código limpo'],
      weaknesses: ['Preço alto', 'Pouco marketing'],
      marketShare: 15,
      recentActivity: 'Contratou 3 desenvolvedores sêniores'
    },
    {
      id: '2',
      name: 'Creative Solutions',
      avatar: '',
      rating: 4.6,
      priceRange: { min: 60, max: 120 },
      specialties: ['Design', 'Branding', 'UI/UX'],
      strengths: ['Portfolio forte', 'Clientes premium'],
      weaknesses: ['Capacidade limitada', 'Processo lento'],
      marketShare: 12,
      recentActivity: 'Lançou serviço de design system'
    },
    {
      id: '3',
      name: 'TechBuilder',
      avatar: '',
      rating: 4.4,
      priceRange: { min: 45, max: 90 },
      specialties: ['WordPress', 'E-commerce', 'SEO'],
      strengths: ['Preço competitivo', 'Suporte 24/7'],
      weaknesses: ['Qualidade inconsistente', 'High turnover'],
      marketShare: 20,
      recentActivity: 'Reduziu preços em 15%'
    }
  ]);

  const [opportunities] = useState<OpportunityAlert[]>([
    {
      id: '1',
      type: 'trend',
      title: 'Boom em Aplicações de IA',
      description: 'Demanda por integração de IA em apps existentes cresceu 45% este mês',
      impact: 'high',
      actionable: true,
      timeframe: '6 meses',
      tags: ['IA', 'Integração', 'Mobile']
    },
    {
      id: '2',
      type: 'gap',
      title: 'Lacuna em Acessibilidade Web',
      description: 'Poucos profissionais oferecem auditoria completa de acessibilidade',
      impact: 'medium',
      actionable: true,
      timeframe: '3 meses',
      tags: ['Acessibilidade', 'Web', 'Auditoria']  
    },
    {
      id: '3',
      type: 'price',
      title: 'Oportunidade de Reposicionamento',
      description: 'Seus preços estão 20% abaixo da média do mercado premium',
      impact: 'high',
      actionable: true,
      timeframe: '1 mês',
      tags: ['Pricing', 'Premium', 'Reposicionamento']
    },
    {
      id: '4',
      type: 'demand',
      title: 'Crescimento em E-commerce B2B',
      description: 'Empresas B2B buscando soluções de e-commerce customizadas',
      impact: 'medium',
      actionable: true,
      timeframe: '4 meses',
      tags: ['E-commerce', 'B2B', 'Customização']
    }
  ]);

  const [metrics] = useState<MarketMetric[]>([
    {
      id: 'demand',
      label: 'Índice de Demanda',
      value: '78',
      change: { value: '+12', trend: 'up' },
      benchmark: 'Média: 65',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      id: 'competition',
      label: 'Pressão Competitiva',
      value: 'Média',
      change: { value: '+5%', trend: 'up' },
      benchmark: 'Estável',
      icon: Users,
      color: 'text-yellow-600'
    },
    {
      id: 'pricing',
      label: 'Posição de Preço',
      value: 'Premium',
      change: { value: 'Melhorou', trend: 'up' },
      benchmark: 'Top 25%',
      icon: DollarSign,
      color: 'text-blue-600'
    },
    {
      id: 'opportunity',
      label: 'Score de Oportunidade',
      value: '84',
      change: { value: '+7', trend: 'up' },
      benchmark: 'Excelente',
      icon: Target,
      color: 'text-purple-600'
    }
  ]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <ArrowDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'gap':
        return <Target className="h-4 w-4 text-purple-600" />;
      case 'price':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'demand':
        return <Users className="h-4 w-4 text-orange-600" />;
      default:
        return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Inteligência de Mercado
            <Zap className="h-4 w-4 text-galaxia-neon" />
          </CardTitle>
          <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Market Health Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-purple-600">84</div>
              <div className="text-xs text-muted-foreground">Score Oportunidade</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">+23%</div>
              <div className="text-xs text-muted-foreground">Crescimento Demanda</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="competitors">Concorrentes</TabsTrigger>
            <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-3">
            <div className="max-h-80 overflow-y-auto space-y-3">
              {trends.map((trend) => (
                <div key={trend.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(trend.trend)}
                      <div>
                        <h4 className="font-semibold text-sm">{trend.category}</h4>
                        <p className="text-xs text-muted-foreground">{trend.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn("text-lg font-bold", getTrendColor(trend.trend))}>
                        {trend.change > 0 ? '+' : ''}{trend.change}%
                      </div>
                      <div className="text-xs text-muted-foreground">{trend.timeframe}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Confiança</span>
                      <span className="font-medium">{trend.confidence}%</span>
                    </div>
                    <Progress value={trend.confidence} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-3">
            <div className="max-h-80 overflow-y-auto space-y-3">
              {competitors.map((competitor) => (
                <div key={competitor.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {competitor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{competitor.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {competitor.rating} • {competitor.marketShare}% mercado
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">
                        R$ {competitor.priceRange.min}-{competitor.priceRange.max}/h
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs font-medium text-green-700 mb-1">Forças</div>
                      <div className="space-y-1">
                        {competitor.strengths.slice(0, 2).map((strength, index) => (
                          <div key={index} className="text-xs bg-green-100 px-2 py-1 rounded">
                            {strength}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-red-700 mb-1">Fraquezas</div>
                      <div className="space-y-1">
                        {competitor.weaknesses.slice(0, 2).map((weakness, index) => (
                          <div key={index} className="text-xs bg-red-100 px-2 py-1 rounded">
                            {weakness}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium">Especialidades</div>
                    <div className="flex flex-wrap gap-1">
                      {competitor.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-300">
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3 text-blue-600" />
                      <span className="font-medium">Atividade Recente:</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {competitor.recentActivity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-3">
            <div className="max-h-80 overflow-y-auto space-y-3">
              {opportunities.map((opportunity) => (
                <div key={opportunity.id} className={cn(
                  "p-4 border rounded-lg border-l-4",
                  getImpactColor(opportunity.impact)
                )}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(opportunity.type)}
                      <div>
                        <h4 className="font-semibold text-sm">{opportunity.title}</h4>
                        <p className="text-xs text-muted-foreground">{opportunity.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        opportunity.impact === 'high' ? "border-red-300 text-red-800" :
                        opportunity.impact === 'medium' ? "border-yellow-300 text-yellow-800" :
                        "border-green-300 text-green-800"
                      )}>
                        {opportunity.impact === 'high' ? 'Alto' :
                         opportunity.impact === 'medium' ? 'Médio' : 'Baixo'} Impacto
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Janela: {opportunity.timeframe}
                    </div>
                    {opportunity.actionable && (
                      <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                        Acionável
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {opportunity.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {opportunity.actionable && (
                    <Button size="sm" className="w-full h-7">
                      <Lightbulb className="h-3 w-3 mr-1" />
                      Ver Estratégias
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-3">
            <div className="space-y-3">
              {metrics.map((metric) => {
                const IconComponent = metric.icon;
                
                return (
                  <div key={metric.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <IconComponent className={cn("h-5 w-5", metric.color)} />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{metric.label}</div>
                          <div className="text-xs text-muted-foreground">{metric.benchmark}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{metric.value}</div>
                        <div className="flex items-center gap-1 text-sm">
                          {getTrendIcon(metric.change.trend)}
                          <span className={cn(
                            "font-medium",
                            metric.change.trend === 'up' ? "text-green-600" :
                            metric.change.trend === 'down' ? "text-red-600" : "text-gray-600"
                          )}>
                            {metric.change.value}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* AI-Powered Insights */}
        <div className="pt-4 border-t border-border/50">
          <div className="bg-gradient-to-r from-galaxia-magenta/10 to-galaxia-neon/10 p-3 rounded-lg border border-galaxia-magenta/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-galaxia-neon" />
              <span className="text-sm font-semibold">Insights da IA</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span>Melhor momento para aumentar preços em 15%</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 text-blue-600" />
                <span>3 nichos com baixa competição disponíveis</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-3 w-3 text-purple-600" />
                <span>Sua expertise em IA está 40% acima da média</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}