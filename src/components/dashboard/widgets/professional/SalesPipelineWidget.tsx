import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Clock,
  MessageSquare,
  Calendar,
  Zap,
  Star,
  Award,
  Eye,
  Edit,
  MoreHorizontal,
  ChevronRight,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipelineStage {
  id: string;
  name: string;
  count: number;
  value: number;
  probability: number;
  color: string;
}

interface PipelineOpportunity {
  id: string;
  title: string;
  client: {
    name: string;
    avatar?: string;
    company: string;
  };
  stage: string;
  value: number;
  probability: number;
  lastContact: string;
  nextAction: {
    type: string;
    date: string;
    description: string;
  };
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  notes: string;
}

export function SalesPipelineWidget() {
  const [selectedStage, setSelectedStage] = useState<string>('all');
  
  const [stages] = useState<PipelineStage[]>([
    {
      id: 'leads',
      name: 'Leads',
      count: 12,
      value: 145000,
      probability: 10,
      color: 'bg-gray-500'
    },
    {
      id: 'qualified',
      name: 'Qualificados',
      count: 8,
      value: 120000,
      probability: 25,
      color: 'bg-blue-500'
    },
    {
      id: 'proposal',
      name: 'Proposta',
      count: 5,
      value: 85000,
      probability: 60,
      color: 'bg-yellow-500'
    },
    {
      id: 'negotiation',
      name: 'Negociação',
      count: 3,
      value: 45000,
      probability: 80,
      color: 'bg-orange-500'
    },
    {
      id: 'closed',
      name: 'Fechados',
      count: 2,
      value: 28000,
      probability: 100,
      color: 'bg-green-500'
    }
  ]);

  const [opportunities] = useState<PipelineOpportunity[]>([
    {
      id: '1',
      title: 'Sistema ERP Completo',
      client: {
        name: 'João Santos',
        avatar: '',
        company: 'TechCorp Solutions'
      },
      stage: 'negotiation',
      value: 25000,
      probability: 85,
      lastContact: '2024-01-26',
      nextAction: {
        type: 'meeting',
        date: '2024-01-29',
        description: 'Reunião final para fechamento do contrato'
      },
      priority: 'high',
      tags: ['ERP', 'Enterprise', 'Long-term'],
      notes: 'Cliente muito interessado, apenas ajustando detalhes do cronograma'
    },
    {
      id: '2',
      title: 'App Mobile E-commerce',
      client: {
        name: 'Maria Silva',
        avatar: '',
        company: 'Fashion Store'
      },
      stage: 'proposal',
      value: 18000,
      probability: 70,
      lastContact: '2024-01-25',
      nextAction: {
        type: 'proposal',
        date: '2024-01-28',
        description: 'Apresentar proposta técnica e comercial'
      },
      priority: 'high',
      tags: ['Mobile', 'E-commerce', 'React Native'],
      notes: 'Concorrendo com mais 2 fornecedores, mas temos vantagem técnica'
    },
    {
      id: '3',
      title: 'Website Institucional',
      client: {
        name: 'Carlos Oliveira',
        avatar: '',
        company: 'Consultoria ABC'
      },
      stage: 'qualified',
      value: 8000,
      probability: 40,
      lastContact: '2024-01-24',
      nextAction: {
        type: 'call',
        date: '2024-01-27',
        description: 'Ligação para entender melhor os requisitos'
      },
      priority: 'medium',
      tags: ['Website', 'Corporate', 'CMS'],
      notes: 'Cliente tem orçamento limitado, focando em funcionalidades essenciais'
    },
    {
      id: '4',
      title: 'Dashboard Analytics',
      client: {
        name: 'Ana Costa',
        avatar: '',
        company: 'DataTech'
      },
      stage: 'leads',
      value: 12000,
      probability: 20,
      lastContact: '2024-01-23',
      nextAction: {
        type: 'email',
        date: '2024-01-26',
        description: 'Enviar materiais sobre cases similares'
      },
      priority: 'low',
      tags: ['Analytics', 'Dashboard', 'BI'],
      notes: 'Lead frio, precisa de mais aquecimento'
    },
    {
      id: '5',
      title: 'API Integration',
      client: {
        name: 'Pedro Ferreira',
        avatar: '',
        company: 'FinTech Plus'
      },
      stage: 'closed',
      value: 15000,
      probability: 100,
      lastContact: '2024-01-22',
      nextAction: {
        type: 'project_start',
        date: '2024-02-01',
        description: 'Iniciar desenvolvimento do projeto'
      },
      priority: 'high',
      tags: ['API', 'Integration', 'FinTech'],
      notes: 'Projeto fechado! Começar na próxima semana'
    }
  ]);

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

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Calendar className="h-3 w-3 text-blue-600" />;
      case 'call':
        return <MessageSquare className="h-3 w-3 text-green-600" />;
      case 'proposal':
        return <Target className="h-3 w-3 text-purple-600" />;
      case 'email':
        return <MessageSquare className="h-3 w-3 text-orange-600" />;
      case 'project_start':
        return <Star className="h-3 w-3 text-yellow-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  const getDaysUntilAction = (date: string) => {
    const today = new Date();
    const actionDate = new Date(date);
    const diffTime = actionDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredOpportunities = opportunities.filter(opp => 
    selectedStage === 'all' || opp.stage === selectedStage
  );

  const totalPipelineValue = stages.reduce((sum, stage) => sum + stage.value, 0);
  const weightedValue = opportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
  const conversionRate = Math.round((stages.find(s => s.id === 'closed')?.count || 0) / (stages.reduce((sum, s) => sum + s.count, 0)) * 100);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Pipeline de Vendas
          </CardTitle>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Pipeline Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                R$ {(totalPipelineValue / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-muted-foreground">Pipeline Total</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                R$ {(weightedValue / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-muted-foreground">Valor Ponderado</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">{conversionRate}%</div>
              <div className="text-xs text-muted-foreground">Taxa Conversão</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pipeline Stages */}
        <div className="space-y-2">
          <div className="text-sm font-semibold">Funil de Vendas</div>
          <div className="grid grid-cols-5 gap-1">
            {stages.map((stage, index) => (
              <div key={stage.id} className="relative">
                <Button
                  variant={selectedStage === stage.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStage(stage.id)}
                  className={cn(
                    "w-full h-12 flex-col gap-1 text-xs p-1",
                    selectedStage === stage.id && "bg-blue-600 text-white"
                  )}
                >
                  <div className="font-medium">{stage.count}</div>
                  <div className="text-xs truncate">{stage.name}</div>
                </Button>
                {index < stages.length - 1 && (
                  <ChevronRight className="absolute -right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                )}
              </div>
            ))}
          </div>
          <Button
            variant={selectedStage === 'all' ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedStage('all')}
            className="w-full h-8"
          >
            <Filter className="h-3 w-3 mr-1" />
            Ver Todas ({opportunities.length})
          </Button>
        </div>

        {/* Opportunities List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {filteredOpportunities.map((opp) => {
            const daysUntilAction = getDaysUntilAction(opp.nextAction.date);
            const currentStage = stages.find(s => s.id === opp.stage);
            
            return (
              <div
                key={opp.id}
                className={cn(
                  "p-4 border rounded-lg border-l-4 hover:bg-muted/30 transition-colors cursor-pointer",
                  getPriorityColor(opp.priority)
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={opp.client.avatar} />
                      <AvatarFallback className="text-sm">
                        {opp.client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-sm">{opp.title}</h4>
                      <div className="text-xs text-muted-foreground">
                        {opp.client.name} • {opp.client.company}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      R$ {opp.value.toLocaleString()}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {opp.probability}% prob.
                    </Badge>
                  </div>
                </div>

                {/* Stage & Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Estágio: {currentStage?.name}</span>
                    <span className="font-medium">{opp.probability}%</span>
                  </div>
                  <Progress value={opp.probability} className="h-2" />
                </div>

                {/* Next Action */}
                <div className="bg-muted/50 p-3 rounded-lg mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    {getActionIcon(opp.nextAction.type)}
                    <span className="text-sm font-medium">Próxima Ação</span>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      daysUntilAction <= 1 ? "bg-red-100 text-red-800" :
                      daysUntilAction <= 3 ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    )}>
                      {daysUntilAction === 0 ? 'Hoje' :
                       daysUntilAction === 1 ? 'Amanhã' :
                       daysUntilAction < 0 ? 'Atrasado' :
                       `${daysUntilAction} dias`}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {opp.nextAction.description}
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {opp.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="text-sm text-muted-foreground mb-3 bg-blue-50 p-2 rounded border-l-4 border-blue-300">
                  {opp.notes}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Contatar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
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
              <span className="text-sm font-semibold">Insights do Pipeline</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 text-blue-600" />
                <span>TechCorp tem 85% chance de fechar esta semana</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-orange-600" />
                <span>3 oportunidades precisam de follow-up urgente</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-3 w-3 text-green-600" />
                <span>Pipeline 23% acima da meta mensal</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}