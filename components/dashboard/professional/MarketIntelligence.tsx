import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  Trophy,
  Heart,
  Eye,
  MessageSquare,
  FileText,
  Clock,
  Users,
  DollarSign,
  BarChart3,
  Lightbulb,
  Star
} from "lucide-react";

const perfectMatches = [
  {
    title: 'Rebranding Completo',
    budget: 12000,
    timePosted: '2h',
    description: 'Procuro designer com exp. em startups tech',
    aiScore: 95,
    status: 'hot'
  },
  {
    title: 'UI/UX App Fitness',
    budget: 8500,
    proposalCount: 3,
    description: 'Cliente já contratou você antes (2022)',
    aiScore: 98,
    status: 'returning'
  }
];

const marketTrends = [
  {
    category: 'Logo Design',
    trend: 'up',
    percentage: 23,
    description: 'demanda (vs mês anterior)',
    type: 'demand'
  },
  {
    category: 'Sua categoria',
    trend: 'up',
    percentage: 8,
    description: 'R$ 2.800 preço médio',
    type: 'price'
  },
  {
    category: 'Motion Graphics',
    trend: 'up',
    percentage: 45,
    description: 'buscas',
    type: 'search',
    suggestion: 'Adicione "Animação" às suas skills'
  }
];

const competitors = [
  {
    name: 'Ana Designer',
    rating: 4.8,
    averagePrice: 2200,
    projectsPerMonth: 12,
    avatar: '/placeholder-avatar-1.jpg'
  },
  {
    name: 'Carlos Creative',
    rating: 4.9,
    averagePrice: 3100,
    projectsPerMonth: 8,
    avatar: '/placeholder-avatar-2.jpg'
  }
];

export function MarketIntelligence() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-galaxia-magenta" />
          📈 Oportunidades e Market Intelligence
        </CardTitle>
        <CardDescription>
          Insights estratégicos para maximizar seu crescimento e competitividade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Matches Perfeitos */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-galaxia-magenta" />
            🎯 MATCHES PERFEITOS PARA VOCÊ (Score IA: 95%+)
          </h4>
          
          {perfectMatches.map((match, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">{match.title}</h5>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Score IA: {match.aiScore}%
                    </Badge>
                    {match.status === 'returning' && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Cliente Recorrente
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>R$ {match.budget.toLocaleString()}</span>
                    {match.timePosted && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Publicado há {match.timePosted}
                      </span>
                    )}
                    {match.proposalCount && (
                      <span>{match.proposalCount} propostas</span>
                    )}
                  </div>
                  
                  <p className="text-sm italic">"{match.description}"</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {match.status === 'returning' ? (
                  <>
                    <Button size="sm" className="bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Conversar Diretamente
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Histórico
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" className="bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white">
                      <FileText className="h-4 w-4 mr-1" />
                      Enviar Proposta
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-1" />
                      Salvar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Market Trends */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-galaxia-magenta" />
            📊 MARKET TRENDS PARA VOCÊ:
          </h4>
          
          <div className="grid grid-cols-1 gap-3">
            {marketTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded ${trend.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {trend.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <span className="font-medium">{trend.category}: </span>
                    <span className={trend.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {trend.trend === 'up' ? '+' : '-'}{trend.percentage}% {trend.description}
                    </span>
                  </div>
                </div>
                
                {trend.suggestion && (
                  <div className="flex items-center gap-1 text-sm">
                    <Lightbulb className="h-3 w-3 text-yellow-500" />
                    <span className="text-muted-foreground">Sugestão: {trend.suggestion}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Concorrentes */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-galaxia-magenta" />
            🏆 SEUS CONCORRENTES:
          </h4>
          
          <div className="space-y-2">
            {competitors.map((competitor, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={competitor.avatar} />
                    <AvatarFallback>{competitor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">{competitor.name}: </span>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {competitor.rating}★
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        R$ {competitor.averagePrice.toLocaleString()} médio
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {competitor.projectsPerMonth} proj/mês
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="ghost" className="w-full text-galaxia-magenta hover:text-galaxia-magenta/80">
              <BarChart3 className="h-4 w-4 mr-2" />
              📊 Ver análise completa da concorrência
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 