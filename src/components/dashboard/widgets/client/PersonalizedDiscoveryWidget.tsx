import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Target, 
  TrendingUp, 
  Star, 
  DollarSign, 
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Sparkles,
  Filter,
  RefreshCw,
  Zap,
  Award,
  MapPin,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonalizedRecommendation {
  id: string;
  type: 'trending' | 'match' | 'budget-friendly' | 'premium' | 'new-talent';
  professional: {
    name: string;
    avatar?: string;
    rating: number;
    reviewCount: number;
    specialty: string;
    location: string;
    responseTime: string;
  };
  matchScore: number;
  matchReasons: string[];
  portfolio: {
    featuredWork: string;
    completedProjects: number;
    successRate: number;
  };
  pricing: {
    hourlyRate?: number;
    projectRate?: number;
    currency: string;
  };
  availability: 'available' | 'busy' | 'booked';
  tags: string[];
  aiInsight: string;
  trendingReason?: string;
}

export function PersonalizedDiscoveryWidget() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [recommendations] = useState<PersonalizedRecommendation[]>([
    {
      id: '1',
      type: 'trending',
      professional: {
        name: 'Ana Costa',
        avatar: '',
        rating: 4.9,
        reviewCount: 127,
        specialty: 'UX/UI Design',
        location: 'São Paulo, SP',
        responseTime: '2h'
      },
      matchScore: 94,
      matchReasons: [
        'Especialista em e-commerce',
        'Experiência com suas ferramentas',
        'Horário compatível'
      ],
      portfolio: {
        featuredWork: 'App de Delivery Premiado',
        completedProjects: 89,
        successRate: 98
      },
      pricing: {
        hourlyRate: 120,
        currency: 'BRL'
      },
      availability: 'available',
      tags: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      aiInsight: 'Ana tem expertise em projetos similares ao seu histórico. Seu estilo de design alinha perfeitamente com sua marca.',
      trendingReason: 'Subiu 12 posições esta semana'
    },
    {
      id: '2',
      type: 'match',
      professional: {
        name: 'Pedro Ferreira',
        avatar: '',
        rating: 4.8,
        reviewCount: 84,
        specialty: 'Desenvolvedor React',
        location: 'Belo Horizonte, MG',
        responseTime: '1h'
      },
      matchScore: 91,
      matchReasons: [
        'Tech stack idêntica',
        'Projetos de mesmo porte',
        'Metodologia ágil'
      ],
      portfolio: {
        featuredWork: 'Dashboard Analytics',
        completedProjects: 67,
        successRate: 95
      },
      pricing: {
        hourlyRate: 85,
        currency: 'BRL'
      },
      availability: 'available',
      tags: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      aiInsight: 'Pedro domina exatamente as tecnologias que você mais usa. Histórico consistente de entregas no prazo.'
    },
    {
      id: '3',
      type: 'budget-friendly',
      professional: {
        name: 'Lucas Martins',
        avatar: '',
        rating: 4.6,
        reviewCount: 52,
        specialty: 'Marketing Digital',
        location: 'Recife, PE',
        responseTime: '3h'
      },
      matchScore: 87,
      matchReasons: [
        'Foco em ROI',
        'Experiência com SaaS',
        'Orçamento compatível'
      ],
      portfolio: {
        featuredWork: 'Campanha 300% ROI',
        completedProjects: 45,
        successRate: 92
      },
      pricing: {
        projectRate: 2500,
        currency: 'BRL'
      },
      availability: 'busy',
      tags: ['Google Ads', 'Facebook Ads', 'Analytics', 'SEO'],
      aiInsight: 'Lucas oferece excelente custo-benefício. Especialista em gerar resultados mensuráveis dentro do orçamento.'
    },
    {
      id: '4',
      type: 'new-talent',
      professional: {
        name: 'Camila Silva',
        avatar: '',
        rating: 4.7,
        reviewCount: 23,
        specialty: 'Ilustradora Digital',
        location: 'Porto Alegre, RS',
        responseTime: '30min'
      },
      matchScore: 89,
      matchReasons: [
        'Estilo único',
        'Altamente responsiva',
        'Preço competitivo'
      ],
      portfolio: {
        featuredWork: 'Branding Startup Inovadora',
        completedProjects: 23,
        successRate: 100
      },
      pricing: {
        hourlyRate: 65,
        currency: 'BRL'
      },
      availability: 'available',
      tags: ['Ilustração', 'Branding', 'Adobe Illustrator', 'Procreate'],
      aiInsight: 'Camila é um talento emergente com potencial excepcional. Perfeita para projetos que precisam de criatividade inovadora.'
    }
  ]);

  const filters = [
    { id: 'all', label: 'Todas', count: recommendations.length },
    { id: 'trending', label: 'Em Alta', count: recommendations.filter(r => r.type === 'trending').length },
    { id: 'match', label: 'Alta Compatibilidade', count: recommendations.filter(r => r.matchScore >= 90).length },
    { id: 'available', label: 'Disponível Agora', count: recommendations.filter(r => r.availability === 'available').length },
    { id: 'budget-friendly', label: 'Bom Custo', count: recommendations.filter(r => r.type === 'budget-friendly').length }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'match':
        return <Target className="h-4 w-4 text-blue-600" />;
      case 'budget-friendly':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'premium':
        return <Award className="h-4 w-4 text-purple-600" />;
      case 'new-talent':
        return <Sparkles className="h-4 w-4 text-galaxia-neon" />;
      default:
        return <Star className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getTypeBadge = (type: string, trendingReason?: string) => {
    const baseClasses = "text-xs font-medium";
    switch (type) {
      case 'trending':
        return (
          <Badge className={cn(baseClasses, "bg-red-100 text-red-800 border-red-300")}>
            {getTypeIcon(type)}
            <span className="ml-1">Em Alta</span>
            {trendingReason && <span className="ml-1">• {trendingReason}</span>}
          </Badge>
        );
      case 'match':
        return (
          <Badge className={cn(baseClasses, "bg-blue-100 text-blue-800 border-blue-300")}>
            {getTypeIcon(type)}
            <span className="ml-1">Match Perfeito</span>
          </Badge>
        );
      case 'budget-friendly':
        return (
          <Badge className={cn(baseClasses, "bg-green-100 text-green-800 border-green-300")}>
            {getTypeIcon(type)}
            <span className="ml-1">Bom Custo</span>
          </Badge>
        );
      case 'new-talent':
        return (
          <Badge className={cn(baseClasses, "bg-purple-100 text-purple-800 border-purple-300")}>
            {getTypeIcon(type)}
            <span className="ml-1">Novo Talento</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  const getAvailabilityDot = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'booked':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    switch (activeFilter) {
      case 'trending':
        return rec.type === 'trending';
      case 'match':
        return rec.matchScore >= 90;
      case 'available':
        return rec.availability === 'available';
      case 'budget-friendly':
        return rec.type === 'budget-friendly';
      default:
        return true;
    }
  });

  const avgMatchScore = Math.round(
    recommendations.reduce((sum, rec) => sum + rec.matchScore, 0) / recommendations.length
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Descoberta Personalizada
            <Sparkles className="h-4 w-4 text-galaxia-neon" />
          </CardTitle>
          <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {/* AI Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold">IA personalizou para você</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{avgMatchScore}%</div>
              <div className="text-xs text-muted-foreground">Match Médio</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {recommendations.filter(r => r.availability === 'available').length}
              </div>
              <div className="text-xs text-muted-foreground">Disponíveis</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "h-8 text-xs",
                activeFilter === filter.id && "bg-blue-600 text-white"
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

        {/* Recommendations List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={rec.professional.avatar} />
                      <AvatarFallback>
                        {rec.professional.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                      getAvailabilityDot(rec.availability)
                    )} />
                  </div>
                  <div>
                    <h4 className="font-semibold">{rec.professional.name}</h4>
                    <div className="text-sm text-muted-foreground">{rec.professional.specialty}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {rec.professional.rating} ({rec.professional.reviewCount})
                      <MapPin className="h-3 w-3" />
                      {rec.professional.location}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {getTypeBadge(rec.type, rec.trendingReason)}
                  <div className="text-sm font-bold mt-1">
                    {rec.pricing.hourlyRate ? 
                      `R$ ${rec.pricing.hourlyRate}/h` : 
                      `R$ ${rec.pricing.projectRate}`
                    }
                  </div>
                </div>
              </div>

              {/* Match Score */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Compatibilidade</span>
                  <span className="font-bold text-blue-600">{rec.matchScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all" 
                    style={{ width: `${rec.matchScore}%` }}
                  />
                </div>
              </div>

              {/* Portfolio Highlight */}
              <div className="bg-muted/50 p-3 rounded-lg mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Trabalho em Destaque</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Award className="h-3 w-3" />
                    {rec.portfolio.successRate}% sucesso
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {rec.portfolio.featuredWork} • {rec.portfolio.completedProjects} projetos
                </div>
              </div>

              {/* AI Insight */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg mb-3 border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-3 w-3 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-800">Por que recomendamos</span>
                </div>
                <p className="text-sm text-purple-700">{rec.aiInsight}</p>
              </div>

              {/* Match Reasons */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {rec.matchReasons.map((reason, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {rec.tags.slice(0, 4).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {rec.tags.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{rec.tags.length - 4}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground mb-3">
                <div>
                  <Clock className="h-3 w-3 mx-auto mb-1" />
                  <div>Responde em {rec.professional.responseTime}</div>
                </div>
                <div>
                  <Calendar className="h-3 w-3 mx-auto mb-1" />
                  <div>{rec.availability === 'available' ? 'Disponível' : 'Ocupado'}</div>
                </div>
                <div>
                  <TrendingUp className="h-3 w-3 mx-auto mb-1" />
                  <div>{rec.portfolio.successRate}% sucesso</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Perfil
                </Button>
                <Button size="sm" variant="outline">
                  <Heart className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              IA encontrou {recommendations.length} profissionais compatíveis
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}