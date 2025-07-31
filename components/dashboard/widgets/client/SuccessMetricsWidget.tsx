import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2,
  Target,
  Award,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Zap,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricData {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: {
    value: number;
    period: string;
    trend: 'up' | 'down' | 'stable';
  };
  target?: number;
  category: 'financial' | 'quality' | 'efficiency' | 'satisfaction';
}

interface ProjectMetric {
  id: string;
  title: string;
  status: 'completed' | 'active' | 'cancelled';
  budget: number;
  spent: number;
  timeline: {
    planned: number;
    actual: number;
  };
  satisfaction: number;
  freelancer: string;
  completedDate?: string;
}

export function SuccessMetricsWidget() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [metrics] = useState<MetricData[]>([
    {
      id: 'roi',
      label: 'ROI Médio',
      value: 287,
      unit: '%',
      change: { value: 15, period: '30 dias', trend: 'up' },
      target: 250,
      category: 'financial'
    },
    {
      id: 'budget-efficiency',
      label: 'Eficiência Orçamentaria',
      value: 94,
      unit: '%',
      change: { value: 3, period: '30 dias', trend: 'up' },
      target: 90,
      category: 'financial'
    },
    {
      id: 'delivery-time',
      label: 'Entrega no Prazo',
      value: 96,
      unit: '%',
      change: { value: 2, period: '30 dias', trend: 'up' },
      target: 95,
      category: 'efficiency'
    },
    {
      id: 'quality-score',
      label: 'Score de Qualidade',
      value: 4.8,
      unit: '/5',
      change: { value: 0.2, period: '30 dias', trend: 'up' },
      target: 4.5,
      category: 'quality'
    },
    {
      id: 'client-satisfaction',
      label: 'Satisfação Geral',
      value: 94,
      unit: '%',
      change: { value: 1, period: '30 dias', trend: 'stable' },
      target: 90,
      category: 'satisfaction'
    },
    {
      id: 'time-to-hire',
      label: 'Tempo para Contratação',
      value: 2.3,
      unit: 'dias',
      change: { value: -0.5, period: '30 dias', trend: 'up' },
      target: 3,
      category: 'efficiency'
    }
  ]);

  const [recentProjects] = useState<ProjectMetric[]>([
    {
      id: '1',
      title: 'App Mobile E-commerce',
      status: 'completed',
      budget: 10000,
      spent: 9500,
      timeline: { planned: 60, actual: 58 },
      satisfaction: 5.0,
      freelancer: 'João Silva',
      completedDate: '2024-01-15'
    },
    {
      id: '2',
      title: 'Redesign Website',
      status: 'completed',
      budget: 5000,
      spent: 4800,
      timeline: { planned: 30, actual: 32 },
      satisfaction: 4.8,
      freelancer: 'Maria Santos',
      completedDate: '2024-01-20'
    },
    {
      id: '3',
      title: 'Sistema CRM',
      status: 'active',
      budget: 15000,
      spent: 8500,
      timeline: { planned: 90, actual: 45 },
      satisfaction: 4.9,
      freelancer: 'Carlos Oliveira'
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'quality':
        return <Award className="h-4 w-4 text-yellow-600" />;
      case 'efficiency':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'satisfaction':
        return <Star className="h-4 w-4 text-purple-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Concluído</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Ativo</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const calculateProjectROI = (project: ProjectMetric) => {
    // Fórmula simplificada: assumindo um valor de entrega baseado no orçamento
    const estimatedValue = project.budget * 1.5; // Valor estimado do projeto
    const roi = ((estimatedValue - project.spent) / project.spent) * 100;
    return Math.round(roi);
  };

  const overallStats = {
    totalProjects: recentProjects.length,
    completedProjects: recentProjects.filter(p => p.status === 'completed').length,
    totalInvested: recentProjects.reduce((sum, p) => sum + p.spent, 0),
    avgSatisfaction: recentProjects.reduce((sum, p) => sum + p.satisfaction, 0) / recentProjects.length,
    avgROI: recentProjects.filter(p => p.status === 'completed').reduce((sum, p) => sum + calculateProjectROI(p), 0) / recentProjects.filter(p => p.status === 'completed').length
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Métricas de Sucesso
          </CardTitle>
          <Button variant="ghost" size="sm">
            <PieChart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="projects">Projetos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Investimento Total</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  R$ {(overallStats.totalInvested / 1000).toFixed(1)}k
                </div>
                <div className="text-xs text-green-700">
                  ROI médio: {Math.round(overallStats.avgROI)}%
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">Taxa de Sucesso</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((overallStats.completedProjects / overallStats.totalProjects) * 100)}%
                </div>
                <div className="text-xs text-blue-700">
                  {overallStats.completedProjects} de {overallStats.totalProjects} projetos
                </div>
              </div>
            </div>

            {/* Satisfaction Score */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-800">Satisfação Geral</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {overallStats.avgSatisfaction.toFixed(1)}/5
                </div>
              </div>
              <Progress value={overallStats.avgSatisfaction * 20} className="h-2" />
              <div className="text-xs text-purple-700 mt-2">
                Baseado em {overallStats.totalProjects} projetos avaliados
              </div>
            </div>

            {/* Quick Insights */}
            <div className="bg-gradient-to-r from-galaxia-magenta/10 to-galaxia-neon/10 p-4 rounded-lg border border-galaxia-magenta/20">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-galaxia-neon" />
                <span className="text-sm font-semibold">Insights Inteligentes</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span>Eficiência orçamentária subiu 15% este mês</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-blue-600" />
                  <span>Você está 24% acima da média do mercado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-3 w-3 text-yellow-600" />
                  <span>Top 10% em satisfação de clientes</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {metrics.map((metric) => (
                <div key={metric.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(metric.category)}
                      <span className="font-medium text-sm">{metric.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {metric.value}{metric.unit}
                      </div>
                      <div className={cn("flex items-center gap-1 text-xs", getTrendColor(metric.change.trend))}>
                        {getTrendIcon(metric.change.trend)}
                        {Math.abs(metric.change.value)}{metric.unit} ({metric.change.period})
                      </div>
                    </div>
                  </div>

                  {metric.target && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Meta: {metric.target}{metric.unit}</span>
                        <span className={cn(
                          "font-medium",
                          metric.value >= metric.target ? "text-green-600" : "text-orange-600"
                        )}>
                          {metric.value >= metric.target ? "✓ Atingida" : "Em progresso"}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((metric.value / metric.target) * 100, 100)} 
                        className="h-2" 
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentProjects.map((project) => {
                const budgetEfficiency = Math.round((1 - (project.spent / project.budget)) * 100);
                const roi = calculateProjectROI(project);
                const timeEfficiency = project.status === 'completed' 
                  ? Math.round((1 - (project.timeline.actual / project.timeline.planned)) * 100)
                  : Math.round((project.timeline.actual / project.timeline.planned) * 100);

                return (
                  <div key={project.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-sm">{project.title}</h4>
                        <div className="text-xs text-muted-foreground">
                          {project.freelancer}
                          {project.completedDate && (
                            <span> • Concluído em {new Date(project.completedDate).toLocaleDateString('pt-BR')}</span>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="text-sm font-bold">
                          R$ {project.spent.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          de R$ {project.budget.toLocaleString()}
                        </div>
                        <div className={cn(
                          "text-xs font-medium",
                          budgetEfficiency >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {budgetEfficiency >= 0 ? '+' : ''}{budgetEfficiency}% eficiência
                        </div>
                      </div>

                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="text-sm font-bold flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {project.satisfaction}
                        </div>
                        <div className="text-xs text-muted-foreground">Satisfação</div>
                        {project.status === 'completed' && (
                          <div className="text-xs font-medium text-purple-600">
                            ROI: {roi}%
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Cronograma</span>
                        <span className={cn(
                          "font-medium",
                          project.status === 'completed' 
                            ? timeEfficiency >= 0 ? "text-green-600" : "text-red-600"
                            : "text-blue-600"
                        )}>
                          {project.status === 'completed' 
                            ? `${timeEfficiency >= 0 ? 'Adiantado' : 'Atrasado'} ${Math.abs(timeEfficiency)}%`
                            : `${project.timeline.actual} de ${project.timeline.planned} dias`
                          }
                        </span>
                      </div>
                      <Progress 
                        value={project.status === 'completed' 
                          ? 100 
                          : (project.timeline.actual / project.timeline.planned) * 100
                        } 
                        className="h-2" 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}