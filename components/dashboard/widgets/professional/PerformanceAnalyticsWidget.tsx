import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  DollarSign,
  Clock,
  Star,
  Users,
  Award,
  Zap,
  Calendar,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus,
  Settings,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceMetric {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  change: {
    value: string;
    trend: 'up' | 'down' | 'stable';
    period: string;
  };
  target?: number;
  unit: string;
  category: 'financial' | 'productivity' | 'quality' | 'client';
  icon: any;
  color: string;
}

interface GoalProgress {
  id: string;
  title: string;
  category: string;
  current: number;
  target: number;
  unit: string;
  deadline: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  description: string;
}

interface ClientFeedback {
  id: string;
  client: {
    name: string;
    company: string;
    avatar?: string;
  };
  project: string;
  rating: number;
  feedback: string;
  date: string;
  category: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface ProductivityInsight {
  id: string;
  type: 'time' | 'efficiency' | 'bottleneck' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestion?: string;
}

export function PerformanceAnalyticsWidget() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [metrics] = useState<PerformanceMetric[]>([
    {
      id: 'revenue',
      label: 'Receita Mensal',
      value: 'R$ 32.5k',
      numericValue: 32500,
      change: { value: '+18%', trend: 'up', period: '30 dias' },
      target: 35000,
      unit: 'BRL',
      category: 'financial',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      id: 'projects_completed',
      label: 'Projetos Concluídos',
      value: '8',
      numericValue: 8,
      change: { value: '+2', trend: 'up', period: '30 dias' },
      target: 10,
      unit: 'projetos',
      category: 'productivity',
      icon: CheckCircle2,
      color: 'text-blue-600'
    },
    {
      id: 'client_satisfaction',
      label: 'Satisfação Média',
      value: '4.8',
      numericValue: 4.8,
      change: { value: '+0.3', trend: 'up', period: '30 dias' },
      target: 4.5,
      unit: '/5',
      category: 'quality',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      id: 'response_time',
      label: 'Tempo de Resposta',
      value: '2.1h',
      numericValue: 2.1,
      change: { value: '-0.5h', trend: 'up', period: '30 dias' },
      target: 3,
      unit: 'horas',
      category: 'client',
      icon: Clock,
      color: 'text-purple-600'
    },
    {
      id: 'repeat_clients',
      label: 'Clientes Recorrentes',
      value: '68%',
      numericValue: 68,
      change: { value: '+12%', trend: 'up', period: '30 dias' },
      target: 70,
      unit: '%',
      category: 'client',
      icon: Users,
      color: 'text-indigo-600'
    },
    {
      id: 'delivery_time',
      label: 'Pontualidade',
      value: '94%',
      numericValue: 94,
      change: { value: '+4%', trend: 'up', period: '30 dias' },
      target: 95,
      unit: '%',
      category: 'productivity',
      icon: Calendar,
      color: 'text-cyan-600'
    }
  ]);

  const [goals] = useState<GoalProgress[]>([
    {
      id: '1',
      title: 'Meta de Receita Trimestral',
      category: 'Financeiro',
      current: 87500,
      target: 100000,
      unit: 'BRL',
      deadline: '2024-03-31',
      status: 'on_track',
      description: 'Alcançar R$ 100k em receita no Q1'
    },
    {
      id: '2',
      title: 'Novos Clientes Premium',
      category: 'Crescimento',
      current: 6,
      target: 10,
      deadline: '2024-02-29',
      unit: 'clientes',
      status: 'at_risk',
      description: 'Conquistar 10 clientes premium até o fim do mês'
    },
    {
      id: '3',
      title: 'Certificação Técnica',
      category: 'Desenvolvimento',
      current: 75,
      target: 100,
      unit: '%',
      deadline: '2024-02-15',
      status: 'on_track',
      description: 'Completar curso de React Advanced'
    },
    {
      id: '4',
      title: 'Portfolio Diversificado',
      category: 'Marketing',
      current: 3,
      target: 5,
      unit: 'nichos',
      deadline: '2024-04-30',
      status: 'behind',
      description: 'Atuar em 5 nichos diferentes de mercado'
    }
  ]);

  const [feedbacks] = useState<ClientFeedback[]>([
    {
      id: '1',
      client: {
        name: 'João Santos',
        company: 'TechCorp',
        avatar: ''
      },
      project: 'Sistema ERP',
      rating: 5,
      feedback: 'Excelente trabalho! Superou todas as expectativas e entregou antes do prazo.',
      date: '2024-01-25',
      category: 'Desenvolvimento',
      sentiment: 'positive'
    },
    {
      id: '2',
      client: {
        name: 'Maria Costa',
        company: 'Fashion Store',
        avatar: ''
      },
      project: 'App Mobile',
      rating: 4.8,
      feedback: 'Muito satisfeita com o resultado. App ficou exatamente como imaginava.',
      date: '2024-01-23',
      category: 'Mobile',
      sentiment: 'positive'
    },
    {
      id: '3',
      client: {
        name: 'Carlos Silva',
        company: 'StartupXYZ',
        avatar: ''
      },
      project: 'Website',
      rating: 4.2,
      feedback: 'Bom trabalho, mas teve alguns atrasos na comunicação inicial.',
      date: '2024-01-20',
      category: 'Web',
      sentiment: 'neutral'
    }
  ]);

  const [insights] = useState<ProductivityInsight[]>([
    {
      id: '1',
      type: 'efficiency',
      title: 'Pico de Produtividade',
      description: 'Você é 40% mais produtivo entre 9h-11h da manhã',
      impact: 'medium',
      actionable: true,
      suggestion: 'Agende tarefas complexas neste horário'
    },
    {
      id: '2',
      type: 'bottleneck',
      title: 'Gargalo em Revisões',
      description: 'Tempo médio de revisão de código está 25% acima do ideal',
      impact: 'high',
      actionable: true,
      suggestion: 'Considere usar ferramentas de análise automatizada'
    },
    {
      id: '3',
      type: 'opportunity',
      title: 'Oportunidade de Upsell',
      description: '3 clientes demonstraram interesse em serviços adicionais',
      impact: 'high',
      actionable: true,
      suggestion: 'Prepare propostas de expansão dos projetos'
    },
    {
      id: '4',
      type: 'time',
      title: 'Otimização de Reuniões',
      description: 'Reuniões consomem 18% do seu tempo produtivo',
      impact: 'medium',  
      actionable: true,
      suggestion: 'Implemente agenda mais estruturada'
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

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'on_track':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'behind':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getGoalStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'on_track':
        return 'No Prazo';
      case 'at_risk':
        return 'Em Risco';
      case 'behind':
        return 'Atrasada';
      default:
        return 'Desconhecido';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-l-green-500';
      case 'neutral':
        return 'border-l-yellow-500';
      case 'negative':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'efficiency':
        return <Zap className="h-4 w-4 text-blue-600" />;
      case 'bottleneck':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'opportunity':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'time':
        return <Clock className="h-4 w-4 text-purple-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const overallScore = Math.round(
    metrics.reduce((sum, metric) => {
      const targetPercent = metric.target ? 
        Math.min((metric.numericValue / metric.target) * 100, 100) : 100;
      return sum + targetPercent;
    }, 0) / metrics.length
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            Analytics de Performance
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Overall Performance Score */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-orange-600">{overallScore}</div>
              <div className="text-xs text-muted-foreground">Score Geral</div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">+8 pontos</span>
              </div>
              <div className="text-xs text-muted-foreground">vs mês anterior</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="goals">Metas</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3">
            <div className="max-h-80 overflow-y-auto space-y-3">
              {metrics.map((metric) => {
                const IconComponent = metric.icon;
                const progressPercent = metric.target ? 
                  Math.min((metric.numericValue / metric.target) * 100, 100) : 100;
                
                return (
                  <div key={metric.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <IconComponent className={cn("h-5 w-5", metric.color)} />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{metric.label}</div>
                          <div className="text-lg font-bold">{metric.value}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                          {getTrendIcon(metric.change.trend)}
                          <span className={cn(
                            "font-medium",
                            getTrendColor(metric.change.trend)
                          )}>
                            {metric.change.value}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {metric.change.period}
                        </div>
                      </div>
                    </div>

                    {metric.target && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Meta: {metric.target}{metric.unit === 'BRL' ? '' : metric.unit}</span>
                          <span className={cn(
                            "font-medium",
                            progressPercent >= 100 ? "text-green-600" : 
                            progressPercent >= 80 ? "text-yellow-600" : "text-red-600"
                          )}>
                            {Math.round(progressPercent)}%
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-3">
            <div className="max-h-80 overflow-y-auto space-y-3">
              {goals.map((goal) => {
                const progressPercent = (goal.current / goal.target) * 100;
                const daysLeft = getDaysUntilDeadline(goal.deadline);
                
                return (
                  <div key={goal.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-sm">{goal.title}</h4>
                        <p className="text-xs text-muted-foreground">{goal.description}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          Categoria: {goal.category}
                        </div>
                      </div>
                      <Badge variant="outline" className={getGoalStatusColor(goal.status)}>
                        {getGoalStatusLabel(goal.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span className="font-medium">
                          {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                        </span>
                      </div>
                      <Progress value={Math.min(progressPercent, 100)} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round(progressPercent)}% concluído</span>
                        <span>
                          {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Prazo vencido'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 h-7">
                        <Target className="h-3 w-3 mr-1" />
                        Atualizar
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-3">
            <div className="max-h-80 overflow-y-auto space-y-3">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className={cn(
                  "p-4 border rounded-lg border-l-4",
                  getSentimentColor(feedback.sentiment)
                )}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {feedback.client.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{feedback.client.name}</h4>
                        <div className="text-xs text-muted-foreground">
                          {feedback.client.company} • {feedback.project}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold">{feedback.rating}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(feedback.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg mb-2">
                    <p className="text-sm text-muted-foreground italic">
                      "{feedback.feedback}"
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="text-xs">
                      {feedback.category}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Sentimento: {
                        feedback.sentiment === 'positive' ? '😊 Positivo' :
                        feedback.sentiment === 'neutral' ? '😐 Neutro' : '😞 Negativo'
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-3">
            <div className="max-h-80 overflow-y-auto space-y-3">
              {insights.map((insight) => (
                <div key={insight.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getInsightTypeIcon(insight.type)}
                      <div>
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <p className="text-xs text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      insight.impact === 'high' ? "border-red-300 text-red-800" :
                      insight.impact === 'medium' ? "border-yellow-300 text-yellow-800" :
                      "border-green-300 text-green-800"
                    )}>
                      {insight.impact === 'high' ? 'Alto' :
                       insight.impact === 'medium' ? 'Médio' : 'Baixo'} Impacto
                    </Badge>
                  </div>

                  {insight.suggestion && (
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-300 mb-3">
                      <div className="flex items-center gap-1 text-xs font-medium text-blue-800 mb-1">
                        <Zap className="h-3 w-3" />
                        Sugestão
                      </div>
                      <p className="text-sm text-blue-700">{insight.suggestion}</p>
                    </div>
                  )}

                  {insight.actionable && (
                    <Button size="sm" className="w-full h-7">
                      <Target className="h-3 w-3 mr-1" />
                      Implementar Ação
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* AI Performance Summary */}
        <div className="pt-4 border-t border-border/50">
          <div className="bg-gradient-to-r from-galaxia-magenta/10 to-galaxia-neon/10 p-3 rounded-lg border border-galaxia-magenta/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-galaxia-neon" />
              <span className="text-sm font-semibold">Resumo Inteligente</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Award className="h-3 w-3 text-green-600" />
                <span>Performance 15% acima da média do mercado</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-blue-600" />
                <span>Tendência de crescimento consistente detectada</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 text-purple-600" />
                <span>3 oportunidades de melhoria identificadas</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}