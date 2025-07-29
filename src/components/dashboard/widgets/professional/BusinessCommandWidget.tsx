import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Briefcase, 
  Star, 
  DollarSign, 
  Calendar, 
  Clock,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Award,
  Settings,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessTask {
  id: string;
  type: 'proposal' | 'project' | 'client' | 'finance' | 'marketing';
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  deadline?: string;
  client?: string;
  value?: number;
  progress?: number;
  description: string;
}

interface BusinessMetric {
  id: string;
  label: string;
  value: string;
  change: {
    value: string;
    trend: 'up' | 'down' | 'stable';
  };
  icon: any;
  color: string;
}

export function BusinessCommandWidget() {
  const [activeTab, setActiveTab] = useState('tasks');
  
  const [tasks] = useState<BusinessTask[]>([
    {
      id: '1',
      type: 'proposal',
      title: 'Proposta para Sistema CRM',
      priority: 'high',
      status: 'pending',
      deadline: '2024-01-30',
      client: 'TechCorp',
      value: 25000,
      description: 'Preparar proposta detalhada com cronograma e orçamento'
    },
    {
      id: '2',
      type: 'project',
      title: 'Desenvolvimento App Mobile',
      priority: 'high',
      status: 'in_progress',
      deadline: '2024-02-15',
      client: 'StartupXYZ',
      value: 15000,
      progress: 65,
      description: 'Finalizar módulo de pagamentos e testes'
    },
    {
      id: '3',
      type: 'client',
      title: 'Reunião com Cliente Premium',
      priority: 'medium',
      status: 'pending',
      deadline: '2024-01-28',
      client: 'MegaCorp',
      description: 'Discutir expansão do projeto atual'
    },
    {
      id: '4',
      type: 'finance',
      title: 'Faturamento Janeiro',
      priority: 'medium',
      status: 'completed',
      value: 18500,
      description: 'Emitir notas fiscais e organizar documentação'
    },
    {
      id: '5',
      type: 'marketing',
      title: 'Atualizar Portfolio',
      priority: 'low',
      status: 'pending',
      description: 'Adicionar 3 projetos recentes concluídos'
    }
  ]);

  const [metrics] = useState<BusinessMetric[]>([
    {
      id: 'revenue',
      label: 'Receita Mensal',
      value: 'R$ 28.5k',
      change: { value: '+12%', trend: 'up' },
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      id: 'proposals',
      label: 'Propostas Ativas',
      value: '7',
      change: { value: '+3', trend: 'up' },
      icon: Target,
      color: 'text-blue-600'
    },
    {
      id: 'satisfaction',
      label: 'Satisfação Média',
      value: '4.9/5',
      change: { value: '+0.2', trend: 'up' },
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      id: 'efficiency',
      label: 'Taxa de Conversão',
      value: '68%',
      change: { value: '+5%', trend: 'up' },
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'proposal':
        return <Target className="h-4 w-4 text-blue-600" />;
      case 'project':
        return <Briefcase className="h-4 w-4 text-green-600" />;
      case 'client':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case 'finance':
        return <DollarSign className="h-4 w-4 text-orange-600" />;
      case 'marketing':
        return <Award className="h-4 w-4 text-pink-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Concluído</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Em Andamento</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Atrasado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
      default:
        return <div className="h-3 w-3" />;
    }
  };

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const urgentTasks = tasks.filter(task => {
    const days = getDaysUntilDeadline(task.deadline);
    return days !== null && days <= 3 && task.status !== 'completed';
  });

  const completedToday = tasks.filter(task => task.status === 'completed').length;
  const totalRevenue = tasks
    .filter(task => task.status === 'completed' && task.value)
    .reduce((sum, task) => sum + (task.value || 0), 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            Central de Comando dos Negócios
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick Overview */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg border border-orange-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-orange-600">{urgentTasks.length}</div>
              <div className="text-xs text-muted-foreground">Urgentes</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{completedToday}</div>
              <div className="text-xs text-muted-foreground">Concluídas</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                R$ {(totalRevenue / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-muted-foreground">Faturado</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b">
          <Button 
            variant={activeTab === 'tasks' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('tasks')}
            className="h-8"
          >
            Tarefas
          </Button>
          <Button 
            variant={activeTab === 'metrics' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('metrics')}
            className="h-8"
          >
            Métricas
          </Button>
        </div>

        {activeTab === 'tasks' && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {tasks.map((task) => {
              const daysLeft = getDaysUntilDeadline(task.deadline);
              
              return (
                <div
                  key={task.id}
                  className={cn(
                    "p-4 border rounded-lg border-l-4 hover:bg-muted/30 transition-colors cursor-pointer",
                    getPriorityColor(task.priority)
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(task.type)}
                      <div>
                        <h4 className="font-semibold text-sm">{task.title}</h4>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                    {getStatusBadge(task.status)}
                  </div>

                  {/* Progress Bar (for projects) */}
                  {task.progress !== undefined && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progresso</span>
                        <span className="font-medium">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      {task.client && (
                        <div className="flex items-center gap-1 mb-1">
                          <MessageSquare className="h-3 w-3 text-blue-600" />
                          <span className="font-medium">{task.client}</span>
                        </div>
                      )}
                      {task.value && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-green-600" />
                          <span className="font-medium">R$ {task.value.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {task.deadline && (
                        <div className="flex items-center justify-end gap-1">
                          <Calendar className="h-3 w-3 text-gray-600" />
                          <span className={cn(
                            "font-medium",
                            daysLeft !== null && daysLeft <= 3 ? "text-red-600" :
                            daysLeft !== null && daysLeft <= 7 ? "text-yellow-600" : "text-green-600"
                          )}>
                            {daysLeft !== null ? (
                              daysLeft > 0 ? `${daysLeft} dias` : 'Vencido'
                            ) : 'Sem prazo'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-3 border-t border-border/50">
                    {task.status === 'pending' && (
                      <Button size="sm" variant="outline" className="h-7 px-2">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Iniciar
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <Button size="sm" variant="outline" className="h-7 px-2">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Concluir
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 px-2">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-3">
            {metrics.map((metric) => {
              const IconComponent = metric.icon;
              
              return (
                <div key={metric.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg bg-muted/50")}>
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
                          metric.change.trend === 'up' ? "text-green-600" :
                          metric.change.trend === 'down' ? "text-red-600" : "text-gray-600"
                        )}>
                          {metric.change.value}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">vs mês anterior</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Smart Suggestions */}
        <div className="pt-4 border-t border-border/50">
          <div className="bg-gradient-to-r from-galaxia-magenta/10 to-galaxia-neon/10 p-3 rounded-lg border border-galaxia-magenta/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-galaxia-neon" />
              <span className="text-sm font-semibold">Sugestões Inteligentes</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-orange-600" />
                <span>3 tarefas vencem esta semana</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span>Proposta TechCorp tem 85% chance de aprovação</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-3 w-3 text-yellow-600" />
                <span>Cliente MegaCorp pode expandir projeto</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}