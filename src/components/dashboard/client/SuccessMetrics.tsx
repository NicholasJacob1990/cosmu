import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  Star,
  RotateCcw,
  BarChart3,
  Download,
  Calendar
} from "lucide-react";

const monthlyMetrics = {
  investment: {
    current: 4750,
    change: 23,
    trend: 'up'
  },
  projectsCompleted: {
    current: 5,
    comparison: 'vs mês anterior'
  },
  avgSatisfaction: {
    current: 4.8,
    total: 5,
    reviews: 12
  },
  avgResponseTime: {
    current: 1.2,
    unit: 'h',
    description: 'tempo resp. médio'
  },
  rehiredFreelancers: {
    current: 3,
    description: 'prestadores recontratados'
  }
};

const MetricCard = ({ 
  icon, 
  label, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  color = "text-galaxia-magenta" 
}: {
  icon: any;
  label: string;
  value: string;
  subtitle: string;
  trend?: 'up' | 'down';
  trendValue?: number;
  color?: string;
}) => (
  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
    <div className={`p-2 rounded-lg bg-galaxia-magenta/10 ${color}`}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">{value}</span>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-3 w-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
            <span>{trend === 'up' ? '+' : '-'}{trendValue}%</span>
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

export function SuccessMetrics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-galaxia-magenta" />
          📊 Seus Números
        </CardTitle>
        <CardDescription>
          Métricas de desempenho e crescimento dos seus investimentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Título do Período */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <Calendar className="h-4 w-4 text-galaxia-magenta" />
          Este mês:
        </div>

        {/* Grid de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            icon={<DollarSign className="h-4 w-4" />}
            label="R$ 4.750 investidos"
            value="💰"
            subtitle={`+${monthlyMetrics.investment.change}% vs mês anterior`}
            trend="up"
            trendValue={monthlyMetrics.investment.change}
          />
          
          <MetricCard
            icon={<Target className="h-4 w-4" />}
            label="5 projetos concluídos"
            value="🎯"
            subtitle="Performance consistente"
          />
          
          <MetricCard
            icon={<Star className="h-4 w-4" />}
            label="4.8/5 satisfação média"
            value="⭐"
            subtitle={`Baseado em ${monthlyMetrics.avgSatisfaction.reviews} avaliações`}
          />
          
          <MetricCard
            icon={<Clock className="h-4 w-4" />}
            label="1.2h tempo resp. médio"
            value="⚡"
            subtitle="Comunicação eficiente"
          />
        </div>

        {/* Métricas Secundárias */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-galaxia-magenta/10 to-galaxia-neon/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200">
                <RotateCcw className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold">3 prestadores recontratados</span>
                <p className="text-xs text-muted-foreground">Indicador de qualidade e confiança</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Excelente
            </Badge>
          </div>
        </div>

        {/* Comparações e Insights */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">📈 Crescimento e Tendências</h4>
          
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center justify-between p-2 rounded bg-muted/30">
              <span>Taxa de conclusão de projetos</span>
              <div className="flex items-center gap-1 text-green-600">
                <span className="font-medium">100%</span>
                <Badge variant="outline" className="text-xs">No prazo</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2 rounded bg-muted/30">
              <span>Economia vs contratação direta</span>
              <div className="flex items-center gap-1 text-blue-600">
                <span className="font-medium">~35%</span>
                <Badge variant="outline" className="text-xs">Eficiência</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2 rounded bg-muted/30">
              <span>Qualidade média entregue</span>
              <div className="flex items-center gap-1 text-yellow-600">
                <Star className="h-3 w-3 fill-current" />
                <span className="font-medium">Acima do mercado</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button className="flex-1 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            📊 Ver relatório completo
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            📤 Exportar dados
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 