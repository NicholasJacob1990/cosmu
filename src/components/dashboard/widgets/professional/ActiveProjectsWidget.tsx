import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  Calendar,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Users,
  Zap,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActiveProject {
  id: string;
  title: string;
  client: {
    name: string;
    avatar?: string;
    company: string;
  };
  status: 'active' | 'paused' | 'review' | 'delivery' | 'completed';
  progress: number;
  budget: {
    total: number;
    used: number;
  };
  timeline: {
    startDate: string;
    deadline: string;
    totalDays: number;
    elapsedDays: number;
  };
  team: {
    name: string;
    role: string;
    avatar?: string;
  }[];
  priority: 'high' | 'medium' | 'low';
  unreadMessages: number;
  lastUpdate: string;
  nextMilestone: {
    title: string;
    date: string;
    description: string;
  };
  risks: string[];
  tags: string[];
}

export function ActiveProjectsWidget() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [projects] = useState<ActiveProject[]>([
    {
      id: '1',
      title: 'Sistema ERP Empresarial',
      client: {
        name: 'João Santos',
        avatar: '',
        company: 'TechCorp Solutions'
      },
      status: 'active',
      progress: 78,
      budget: {
        total: 45000,
        used: 32000
      },
      timeline: {
        startDate: '2024-01-01',
        deadline: '2024-03-15',
        totalDays: 74,
        elapsedDays: 27
      },
      team: [
        { name: 'Ana Silva', role: 'Frontend Dev', avatar: '' },
        { name: 'Carlos Lima', role: 'Backend Dev', avatar: '' }
      ],
      priority: 'high',
      unreadMessages: 5,
      lastUpdate: '2024-01-26',
      nextMilestone: {
        title: 'Módulo de Relatórios',
        date: '2024-02-05',
        description: 'Conclusão do sistema de relatórios gerenciais'
      },
      risks: ['Integração com API legada pode atrasar'],
      tags: ['ERP', 'Enterprise', 'React', 'Node.js']
    },
    {
      id: '2',
      title: 'App Mobile E-commerce',
      client: {
        name: 'Maria Costa',
        avatar: '',
        company: 'Fashion Store'
      },
      status: 'review',
      progress: 95,
      budget: {
        total: 25000,
        used: 23500
      },
      timeline: {
        startDate: '2023-12-01',
        deadline: '2024-01-30',
        totalDays: 60,
        elapsedDays: 57
      },
      team: [
        { name: 'Pedro Alves', role: 'Mobile Dev', avatar: '' }
      ],
      priority: 'high',
      unreadMessages: 2,
      lastUpdate: '2024-01-25',
      nextMilestone: {
        title: 'Entrega Final',
        date: '2024-01-30',
        description: 'Deploy na App Store e Google Play'
      },
      risks: [],
      tags: ['Mobile', 'React Native', 'E-commerce']
    },
    {
      id: '3',
      title: 'Website Institucional',
      client: {
        name: 'Carlos Oliveira',
        avatar: '',
        company: 'Consultoria ABC'
      },
      status: 'active',
      progress: 45,
      budget: {
        total: 12000,
        used: 5400
      },
      timeline: {
        startDate: '2024-01-15',
        deadline: '2024-02-28',
        totalDays: 44,
        elapsedDays: 12
      },
      team: [
        { name: 'Lucia Santos', role: 'Designer', avatar: '' }
      ],
      priority: 'medium',
      unreadMessages: 1,
      lastUpdate: '2024-01-24',
      nextMilestone: {
        title: 'Aprovação do Design',
        date: '2024-02-01',
        description: 'Apresentação dos layouts para aprovação'
      },
      risks: ['Cliente solicitou mudanças no escopo'],
      tags: ['Website', 'WordPress', 'Corporate']
    },
    {
      id: '4',
      title: 'Dashboard Analytics',
      client: {
        name: 'Ana Ferreira',
        avatar: '',
        company: 'DataTech'
      },
      status: 'paused',
      progress: 30,
      budget: {
        total: 18000,
        used: 5400
      },
      timeline: {
        startDate: '2024-01-08',
        deadline: '2024-03-01',
        totalDays: 53,
        elapsedDays: 19
      },
      team: [
        { name: 'Roberto Silva', role: 'Data Engineer', avatar: '' }
      ],
      priority: 'low',
      unreadMessages: 0,
      lastUpdate: '2024-01-20',
      nextMilestone: {
        title: 'Retomada do Projeto',
        date: '2024-02-01',
        description: 'Definir nova estratégia com o cliente'
      },
      risks: ['Dependência de dados externos não disponíveis'],
      tags: ['Analytics', 'Dashboard', 'Python', 'BI']
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Ativo</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pausado</Badge>;
      case 'review':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Revisão</Badge>;
      case 'delivery':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">Entrega</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Concluído</Badge>;
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

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getHealthStatus = (project: ActiveProject) => {
    const daysLeft = getDaysUntilDeadline(project.timeline.deadline);
    const budgetPercent = (project.budget.used / project.budget.total) * 100;
    const timePercent = (project.timeline.elapsedDays / project.timeline.totalDays) * 100;
    
    if (project.risks.length > 0 || daysLeft < 0) return 'critical';
    if (budgetPercent > 90 || timePercent > project.progress) return 'warning';
    return 'healthy';
  };

  const filteredProjects = projects.filter(project => 
    statusFilter === 'all' || project.status === statusFilter
  );

  const statusFilters = [
    { id: 'all', label: 'Todos', count: projects.length },
    { id: 'active', label: 'Ativos', count: projects.filter(p => p.status === 'active').length },
    { id: 'review', label: 'Revisão', count: projects.filter(p => p.status === 'review').length },
    { id: 'paused', label: 'Pausados', count: projects.filter(p => p.status === 'paused').length }
  ];

  const totalBudget = projects.reduce((sum, p) => sum + p.budget.total, 0);
  const usedBudget = projects.reduce((sum, p) => sum + p.budget.used, 0);
  const avgProgress = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-green-600" />
            Projetos Ativos
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">{projects.length}</div>
              <div className="text-xs text-muted-foreground">Projetos</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{avgProgress}%</div>
              <div className="text-xs text-muted-foreground">Progresso Médio</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                R$ {(usedBudget / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-muted-foreground">Faturado</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <Button
              key={filter.id}
              variant={statusFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(filter.id)}
              className={cn(
                "h-8 text-xs",
                statusFilter === filter.id && "bg-green-600 text-white"
              )}
            >
              <Filter className="h-3 w-3 mr-1" />
              {filter.label}
              <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                {filter.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Projects List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {filteredProjects.map((project) => {
            const daysLeft = getDaysUntilDeadline(project.timeline.deadline);
            const budgetPercent = (project.budget.used / project.budget.total) * 100;
            const healthStatus = getHealthStatus(project);
            
            return (
              <div
                key={project.id}
                className={cn(
                  "p-4 border rounded-lg border-l-4 hover:bg-muted/30 transition-colors cursor-pointer",
                  getPriorityColor(project.priority)
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={project.client.avatar} />
                      <AvatarFallback className="text-sm">
                        {project.client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-sm">{project.title}</h4>
                      <div className="text-xs text-muted-foreground">
                        {project.client.name} • {project.client.company}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(project.status)}
                    {project.unreadMessages > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                        {project.unreadMessages}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progresso do Projeto</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {/* Health Status */}
                {healthStatus !== 'healthy' && (
                  <div className={cn(
                    "mb-3 p-2 rounded-lg border-l-4",
                    healthStatus === 'critical' ? "bg-red-50 border-red-500" : "bg-yellow-50 border-yellow-500"
                  )}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn(
                        "h-4 w-4",
                        healthStatus === 'critical' ? "text-red-600" : "text-yellow-600"
                      )} />
                      <span className="text-sm font-medium">
                        {healthStatus === 'critical' ? 'Atenção Crítica' : 'Atenção'}
                      </span>
                    </div>
                    {project.risks.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {project.risks[0]}
                      </div>
                    )}
                  </div>
                )}

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-xs">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span className="font-medium">
                        R$ {project.budget.used.toLocaleString()} / R$ {project.budget.total.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={budgetPercent} className="h-1" />
                    <div className="text-xs text-muted-foreground">
                      {Math.round(budgetPercent)}% do orçamento usado
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3 text-blue-600" />
                      <span className={cn(
                        "font-medium",
                        daysLeft < 7 ? "text-red-600" : 
                        daysLeft < 14 ? "text-yellow-600" : "text-green-600"
                      )}>
                        {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Prazo vencido'}
                      </span>
                    </div>
                    <Progress 
                      value={(project.timeline.elapsedDays / project.timeline.totalDays) * 100} 
                      className="h-1" 
                    />
                    <div className="text-xs text-muted-foreground">
                      {Math.round((project.timeline.elapsedDays / project.timeline.totalDays) * 100)}% do tempo decorrido
                    </div>
                  </div>
                </div>

                {/* Next Milestone */}
                <div className="bg-muted/50 p-3 rounded-lg mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Próximo Marco</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="font-medium">{project.nextMilestone.title}</div>
                    <div>{project.nextMilestone.description}</div>
                    <div className="text-xs mt-1">
                      Prazo: {new Date(project.nextMilestone.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                {/* Team */}
                <div className="mb-3">
                  <div className="text-sm font-medium mb-2">Equipe</div>
                  <div className="flex items-center gap-2">
                    {project.team.map((member, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-xs">
                          <div className="font-medium">{member.name}</div>
                          <div className="text-muted-foreground">{member.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 4).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.tags.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-border/50">
                  <Button size="sm" className="flex-1">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Chat
                  </Button>
                  <Button size="sm" variant="outline">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Detalhes
                  </Button>
                  {project.status === 'active' && (
                    <Button size="sm" variant="ghost" className="text-yellow-600">
                      <Pause className="h-3 w-3 mr-1" />
                      Pausar
                    </Button>
                  )}
                  {project.status === 'paused' && (
                    <Button size="sm" variant="ghost" className="text-green-600">
                      <Play className="h-3 w-3 mr-1" />
                      Retomar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Insights */}
        <div className="pt-4 border-t border-border/50">
          <div className="bg-gradient-to-r from-galaxia-magenta/10 to-galaxia-neon/10 p-3 rounded-lg border border-galaxia-magenta/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-galaxia-neon" />
              <span className="text-sm font-semibold">Insights dos Projetos</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-orange-600" />
                <span>2 projetos precisam de atenção urgente</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span>Progresso geral 8% acima da média</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-blue-600" />
                <span>Equipe trabalhando com 95% de capacidade</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}