import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  MessageSquare,
  Users,
  Calendar,
  Zap,
  TrendingUp,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectItem {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'completed' | 'attention';
  progress: number;
  budget: {
    used: number;
    total: number;
  };
  freelancer: {
    name: string;
    avatar?: string;
    rating: number;
  };
  deadline: string;
  unreadMessages: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export function ProjectCommandWidget() {
  const [projects] = useState<ProjectItem[]>([
    {
      id: '1',
      title: 'App Mobile E-commerce',
      status: 'active',
      progress: 75,
      budget: { used: 7500, total: 10000 },
      freelancer: {
        name: 'João Silva',
        avatar: '',
        rating: 4.9
      },
      deadline: '2024-02-15',
      unreadMessages: 3,
      priority: 'high',
      category: 'Desenvolvimento'
    },
    {
      id: '2',
      title: 'Redesign Website Institucional',
      status: 'attention',
      progress: 45,
      budget: { used: 2250, total: 5000 },
      freelancer: {
        name: 'Maria Santos',
        avatar: '',
        rating: 4.8
      },
      deadline: '2024-02-20',
      unreadMessages: 1,
      priority: 'medium',
      category: 'Design'
    },
    {
      id: '3',
      title: 'Sistema de Gestão Interna',
      status: 'paused',
      progress: 30,
      budget: { used: 4500, total: 15000 },
      freelancer: {
        name: 'Carlos Oliveira',
        avatar: '',
        rating: 4.7
      },
      deadline: '2024-03-01',
      unreadMessages: 0,
      priority: 'low',
      category: 'Desenvolvimento'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      case 'attention':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'attention':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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

  const totalBudget = projects.reduce((sum, p) => sum + p.budget.total, 0);
  const usedBudget = projects.reduce((sum, p) => sum + p.budget.used, 0);
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const attentionProjects = projects.filter(p => p.status === 'attention').length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Painel de Comando de Projetos
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{activeProjects}</div>
            <div className="text-xs text-muted-foreground">Ativos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((usedBudget / totalBudget) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Orçamento</div>
          </div>
          <div className="text-center">
            <div className={cn(
              "text-2xl font-bold",
              attentionProjects > 0 ? "text-red-600" : "text-green-600"
            )}>
              {attentionProjects}
            </div>
            <div className="text-xs text-muted-foreground">Atenção</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Project List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {projects.map((project) => {
            const daysLeft = getDaysUntilDeadline(project.deadline);
            const budgetPercent = (project.budget.used / project.budget.total) * 100;
            
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{project.title}</h4>
                      <Badge variant="outline" className={getStatusColor(project.status)}>
                        {getStatusIcon(project.status)}
                        {project.status === 'active' ? 'Ativo' :
                         project.status === 'paused' ? 'Pausado' :
                         project.status === 'completed' ? 'Concluído' : 'Atenção'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{project.category}</div>
                  </div>
                  {project.unreadMessages > 0 && (
                    <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                      {project.unreadMessages}
                    </Badge>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progresso</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {/* Freelancer */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={project.freelancer.avatar} />
                      <AvatarFallback className="text-xs">
                        {project.freelancer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{project.freelancer.name}</div>
                      <div className="text-muted-foreground">⭐ {project.freelancer.rating}</div>
                    </div>
                  </div>

                  {/* Budget & Deadline */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span className="font-medium">
                        R$ {project.budget.used.toLocaleString()} / R$ {project.budget.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-blue-600" />
                      <span className={cn(
                        "font-medium",
                        daysLeft < 7 ? "text-red-600" : 
                        daysLeft < 14 ? "text-yellow-600" : "text-green-600"
                      )}>
                        {daysLeft > 0 ? `${daysLeft} dias` : 'Atrasado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="h-7 px-2">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Chat
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Detalhes
                    </Button>
                  </div>
                  
                  {project.status === 'active' && (
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-yellow-600">
                      <Pause className="h-3 w-3 mr-1" />
                      Pausar
                    </Button>
                  )}
                  
                  {project.status === 'paused' && (
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-green-600">
                      <Play className="h-3 w-3 mr-1" />
                      Retomar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex gap-2">
            <Button className="flex-1" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Ver Todos Projetos
            </Button>
            <Button variant="outline" size="sm">
              + Novo Projeto
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}