import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  RotateCcw, 
  Star, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle2,
  MessageSquare,
  Zap,
  Award,
  Target,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RehireRecommendation {
  id: string;
  freelancer: {
    name: string;
    avatar?: string;
    rating: number;
    completedProjects: number;
    specialty: string;
  };
  pastProject: {
    title: string;
    completedDate: string;
    rating: number;
    budget: number;
  };
  compatibility: {
    score: number;
    reasons: string[];
  };
  availability: {
    status: 'available' | 'busy' | 'booked';
    nextAvailable?: string;
  };
  suggestedProject: {
    type: string;
    estimatedBudget: number;
    timeline: string;
  };
  aiInsight: string;
  priority: 'high' | 'medium' | 'low';
}

export function SmartRehireWidget() {
  const [recommendations] = useState<RehireRecommendation[]>([
    {
      id: '1',
      freelancer: {
        name: 'João Silva',
        avatar: '',
        rating: 4.9,
        completedProjects: 47,
        specialty: 'Desenvolvimento Mobile'
      },
      pastProject: {
        title: 'App Mobile E-commerce',
        completedDate: '2024-01-15',
        rating: 5.0,
        budget: 10000
      },
      compatibility: {
        score: 98,
        reasons: [
          'Entregou projeto similar no prazo',
          'Excelente comunicação',
          'Conhece suas necessidades técnicas'
        ]
      },
      availability: {
        status: 'available'
      },
      suggestedProject: {
        type: 'Aplicativo iOS/Android',
        estimatedBudget: 12000,
        timeline: '8-10 semanas'
      },
      aiInsight: 'Baseado no sucesso do projeto anterior, João seria perfeito para expandir seu app com novas funcionalidades.',
      priority: 'high'
    },
    {
      id: '2',
      freelancer: {
        name: 'Maria Santos',
        avatar: '',
        rating: 4.8,
        completedProjects: 32,
        specialty: 'UI/UX Design'
      },
      pastProject: {
        title: 'Redesign Website Institucional',
        completedDate: '2024-01-20',
        rating: 4.8,
        budget: 5000
      },
      compatibility: {
        score: 94,
        reasons: [
          'Criou design system consistente',
          'Entende sua identidade visual',
          'Feedback sempre positivo'
        ]
      },
      availability: {
        status: 'busy',
        nextAvailable: '2024-02-15'
      },
      suggestedProject: {
        type: 'Landing Page Otimizada',
        estimatedBudget: 3500,
        timeline: '3-4 semanas'
      },
      aiInsight: 'Maria conhece profundamente sua marca. Seria ideal para criar novas páginas mantendo a consistência visual.',
      priority: 'medium'
    },
    {
      id: '3',
      freelancer: {
        name: 'Carlos Oliveira',
        avatar: '',
        rating: 4.7,
        completedProjects: 28,
        specialty: 'Desenvolvimento Full Stack'
      },
      pastProject: {
        title: 'Sistema de Gestão Interna',
        completedDate: '2023-12-10',
        rating: 4.7,
        budget: 15000
      },
      compatibility: {
        score: 89,
        reasons: [
          'Conhece sua arquitetura de dados',
          'Desenvolveu integrações complexas',
          'Código bem documentado'
        ]
      },
      availability: {
        status: 'available'
      },
      suggestedProject: {
        type: 'Módulo de Relatórios',
        estimatedBudget: 8000,
        timeline: '6-8 semanas'
      },
      aiInsight: 'Carlos já está familiarizado com seu sistema. Pode expandir funcionalidades rapidamente.',
      priority: 'medium'
    }
  ];

  const getAvailabilityBadge = (availability: any) => {
    switch (availability.status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Disponível</Badge>;
      case 'busy':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Ocupado</Badge>;
      case 'booked':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Reservado</Badge>;
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

  const getCompatibilityColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const totalSavings = recommendations.reduce((sum, rec) => sum + (rec.pastProject.budget * 0.15), 0);
  const avgCompatibility = Math.round(recommendations.reduce((sum, rec) => sum + rec.compatibility.score, 0) / recommendations.length);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-purple-600" />
            Recontratação Inteligente
            <Sparkles className="h-4 w-4 text-galaxia-neon" />
          </CardTitle>
        </div>
        
        {/* AI Insights Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold">IA detectou oportunidades</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-purple-600">{recommendations.length}</div>
              <div className="text-xs text-muted-foreground">Recomendações</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{avgCompatibility}%</div>
              <div className="text-xs text-muted-foreground">Compatibilidade</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {Math.round(totalSavings / 1000)}k
              </div>
              <div className="text-xs text-muted-foreground">Economia</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Recommendations List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={cn(
                "p-4 border rounded-lg border-l-4 hover:bg-muted/30 transition-colors",
                getPriorityColor(rec.priority)
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={rec.freelancer.avatar} />
                    <AvatarFallback>
                      {rec.freelancer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{rec.freelancer.name}</h4>
                    <div className="text-sm text-muted-foreground">{rec.freelancer.specialty}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {rec.freelancer.rating} • {rec.freelancer.completedProjects} projetos
                    </div>
                  </div>
                </div>
                {getAvailabilityBadge(rec.availability)}
              </div>

              {/* Compatibility Score */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Compatibilidade com seus projetos</span>
                  <span className={cn("font-bold", getCompatibilityColor(rec.compatibility.score))}>
                    {rec.compatibility.score}%
                  </span>
                </div>
                <Progress value={rec.compatibility.score} className="h-2" />
              </div>

              {/* Past Project Reference */}
              <div className="bg-muted/50 p-3 rounded-lg mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Projeto Anterior</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm font-medium">{rec.pastProject.rating}</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {rec.pastProject.title} • R$ {rec.pastProject.budget.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Concluído em {new Date(rec.pastProject.completedDate).toLocaleDateString('pt-BR')}
                </div>
              </div>

              {/* AI Insight */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg mb-3 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-800">Insight da IA</span>
                </div>
                <p className="text-sm text-blue-700">{rec.aiInsight}</p>
              </div>

              {/* Compatibility Reasons */}
              <div className="mb-3">
                <div className="text-sm font-medium mb-2">Por que recomendamos:</div>
                <div className="space-y-1">
                  {rec.compatibility.reasons.map((reason, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Project */}
              <div className="bg-green-50 p-3 rounded-lg mb-3 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Projeto Sugerido</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">{rec.suggestedProject.type}</div>
                    <div className="text-muted-foreground">Orçamento: R$ {rec.suggestedProject.estimatedBudget.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{rec.suggestedProject.timeline}</span>
                    </div>
                    {rec.availability.status === 'busy' && rec.availability.nextAvailable && (
                      <div className="text-xs text-muted-foreground">
                        Disponível em {new Date(rec.availability.nextAvailable).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Conversar
                </Button>
                <Button size="sm" variant="outline">
                  <Award className="h-4 w-4 mr-2" />
                  Contratar
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border/50">
          <div className="bg-gradient-to-r from-galaxia-magenta/10 to-galaxia-neon/10 p-3 rounded-lg border border-galaxia-magenta/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-galaxia-neon" />
              <span className="text-sm font-semibold">Economia Inteligente</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Recontratar profissionais conhecidos pode economizar até 15% em negociação e onboarding.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Economia estimada</span>
              <span className="font-bold text-green-600">R$ {totalSavings.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}