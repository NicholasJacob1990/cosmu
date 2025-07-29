import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Flame, 
  Zap, 
  Palette, 
  Star,
  MessageSquare,
  Eye,
  TrendingUp,
  Sparkles,
  Target
} from "lucide-react";

const trendingServices = [
  {
    category: 'Motion Design',
    icon: <Flame className="h-4 w-4" />,
    professionalCount: 3,
    startingPrice: 350,
    description: 'Para dar vida às suas apresentações',
    trend: '+23%',
    badge: 'trending'
  },
  {
    category: 'SEO Técnico',
    icon: <Zap className="h-4 w-4" />,
    professionalCount: 1,
    startingPrice: 0,
    description: 'Ana Costa • 8 anos exp. • Recém chegou',
    discount: '-20% no primeiro projeto',
    badge: 'new'
  },
  {
    category: 'Design de Infográficos',
    icon: <Palette className="h-4 w-4" />,
    professionalCount: 12,
    priceRange: { min: 180, max: 850 },
    description: 'Baseado em: "Design Gráfico" do seu histórico',
    badge: 'recommended'
  }
];

const badgeConfig = {
  trending: { 
    label: '🔥 Tendência', 
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' 
  },
  new: { 
    label: '⚡ Novo na plataforma', 
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
  },
  recommended: { 
    label: '🎨 Para você', 
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
  }
};

export function PersonalizedDiscovery() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-galaxia-magenta" />
          🎯 Talentos em Alta para Seus Projetos
        </CardTitle>
        <CardDescription>
          Descobertas personalizadas baseadas no seu histórico e tendências de mercado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {trendingServices.map((service, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-galaxia-magenta/10 text-galaxia-magenta">
                  {service.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{service.category}</h4>
                    <Badge className={badgeConfig[service.badge].className}>
                      {badgeConfig[service.badge].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {service.professionalCount > 1 ? (
                  <span>{service.professionalCount} prestadores especialistas</span>
                ) : (
                  <span>Especialista disponível</span>
                )}
                
                {service.priceRange ? (
                  <span>R$ {service.priceRange.min}-{service.priceRange.max}</span>
                ) : service.startingPrice > 0 ? (
                  <span>A partir de R$ {service.startingPrice}</span>
                ) : null}
                
                {service.discount && (
                  <Badge variant="secondary" className="text-green-600">
                    {service.discount}
                  </Badge>
                )}
                
                {service.trend && (
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>{service.trend}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {service.badge === 'new' ? (
                  <>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Perfil
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Conversar
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white">
                    {service.badge === 'trending' ? 'Explorar ' + service.category : 'Ver Especialistas'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t">
          <Button variant="ghost" className="w-full text-galaxia-magenta hover:text-galaxia-magenta/80">
            <Sparkles className="h-4 w-4 mr-2" />
            Descobrir mais talentos personalizados para você
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 