import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp,
  DollarSign,
  Star,
  Target,
  Clock,
  Eye,
  MessageSquare,
  BarChart3,
  Download,
  Calendar,
  Users,
  CheckCircle,
  Award,
  Zap
} from "lucide-react";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { PerformanceRadar } from "@/components/charts/PerformanceRadar";
import { useState } from "react";
import { useDashboardStore } from "@/store/dashboardStore";

const performanceData = {
  financial: {
    revenue: 23400,
    growth: 31,
    rph: 185,
    rphGrowth: 12,
    completedProjects: 11,
    avgTicket: 2127,
    nextMonthProjection: 28600,
    confidence: 82
  },
  quality: {
    npsScore: 91,
    avgRating: 4.89,
    rehireRate: 73,
    referrals: 8,
    avgDeliveryTime: 0.8,
    disputes: 0,
    firstTryApproval: 100
  },
  conversion: {
    proposalsSent: 18,
    conversionRate: 67,
    avgResponseTime: 1.2,
    responseRate: 98,
    profileViews: 1247,
    profileGrowth: 23,
    viewToContact: 12
  }
};

const MetricSection = ({ title, icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h4 className="font-semibold flex items-center gap-2 text-sm">
      {icon}
      {title}
    </h4>
    {children}
  </div>
);

const MetricRow = ({ 
  label, 
  value, 
  subtitle, 
  trend, 
  badge 
}: { 
  label: string; 
  value: string | number; 
  subtitle?: string; 
  trend?: { direction: 'up' | 'down'; value: number }; 
  badge?: { text: string; variant: 'default' | 'outline' | 'secondary' };
}) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
    <div className="flex-1">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold">{value}</span>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-3 w-3 ${trend.direction === 'down' ? 'rotate-180' : ''}`} />
            <span>{trend.direction === 'up' ? '+' : '-'}{trend.value}%</span>
          </div>
        )}
        {badge && (
          <Badge variant={badge.variant} className="text-xs">
            {badge.text}
          </Badge>
        )}
      </div>
      <p className="text-sm font-medium">{label}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  </div>
);

export function PerformanceAnalytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const metrics = useDashboardStore((state) => state.metrics);
  
  // Use metrics from store or fallback to static data
  const data = metrics ? {
    financial: {
      revenue: metrics.totalRevenue,
      growth: metrics.revenueGrowth,
      rph: Math.round(metrics.totalRevenue / (metrics.activeProjects * 8)), // Estimated
      rphGrowth: 12,
      completedProjects: metrics.completedProjects,
      avgTicket: Math.round(metrics.totalRevenue / metrics.completedProjects),
      nextMonthProjection: Math.round(metrics.totalRevenue * 1.2),
      confidence: 82
    },
    quality: {
      npsScore: metrics.npsScore,
      avgRating: metrics.averageRating,
      rehireRate: 73,
      referrals: 8,
      avgDeliveryTime: 0.8,
      disputes: 0,
      firstTryApproval: 100
    },
    conversion: {
      proposalsSent: 18,
      conversionRate: metrics.conversionRate,
      avgResponseTime: metrics.responseTime,
      responseRate: 98,
      profileViews: 1247,
      profileGrowth: 23,
      viewToContact: 12
    }
  } : performanceData;
  
  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <RevenueChart 
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
      
      {/* Performance Analytics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-galaxia-magenta" />
            📊 Analytics do Seu Negócio
          </CardTitle>
          <CardDescription>
            Métricas completas de performance, qualidade e crescimento profissional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
        {/* Período */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <Calendar className="h-4 w-4 text-galaxia-magenta" />
          Últimos 30 dias:
        </div>

        {/* Financeiro */}
        <MetricSection 
          title="💰 FINANCEIRO:" 
          icon={<DollarSign className="h-4 w-4 text-galaxia-magenta" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MetricRow
              label="Faturamento"
              value={`R$ ${data.financial.revenue.toLocaleString()}`}
              trend={{ direction: 'up', value: data.financial.growth }}
              subtitle="vs mês anterior"
            />
            <MetricRow
              label="RPH (Revenue per Hour)"
              value={`R$ ${data.financial.rph}`}
              trend={{ direction: 'up', value: data.financial.rphGrowth }}
            />
            <MetricRow
              label="Projetos concluídos"
              value={data.financial.completedProjects}
              subtitle={`Ticket médio: R$ ${data.financial.avgTicket.toLocaleString()}`}
            />
            <MetricRow
              label="Projeção próximo mês"
              value={`R$ ${data.financial.nextMonthProjection.toLocaleString()}`}
              subtitle={`Confiança: ${data.financial.confidence}%`}
              badge={{ text: 'Crescimento', variant: 'default' }}
            />
          </div>
        </MetricSection>

        {/* Qualidade & Satisfação */}
        <MetricSection 
          title="⭐ QUALIDADE & SATISFAÇÃO:" 
          icon={<Star className="h-4 w-4 text-galaxia-magenta" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MetricRow
              label="NPS Score"
              value={performanceData.quality.npsScore}
              badge={{ text: 'Promotor', variant: 'default' }}
              subtitle={`Avaliação média: ${performanceData.quality.avgRating}/5`}
            />
            <MetricRow
              label="Taxa recontratação"
              value={`${performanceData.quality.rehireRate}%`}
              subtitle={`${performanceData.quality.referrals} referências geradas`}
            />
            <MetricRow
              label="Tempo médio entrega"
              value={`${performanceData.quality.avgDeliveryTime} dias`}
              subtitle="antes do prazo"
              badge={{ text: 'Pontual', variant: 'outline' }}
            />
            <MetricRow
              label="Zero disputas"
              value={`${performanceData.quality.firstTryApproval}%`}
              subtitle="projetos aprovados na 1ª tentativa"
              badge={{ text: 'Excelente', variant: 'default' }}
            />
          </div>
        </MetricSection>

        {/* Conversão & Vendas */}
        <MetricSection 
          title="🎯 CONVERSÃO & VENDAS:" 
          icon={<Target className="h-4 w-4 text-galaxia-magenta" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MetricRow
              label="Propostas enviadas"
              value={performanceData.conversion.proposalsSent}
              subtitle={`Taxa conversão: ${performanceData.conversion.conversionRate}%`}
            />
            <MetricRow
              label="Tempo médio resposta"
              value={`${performanceData.conversion.avgResponseTime}h`}
              subtitle={`Taxa resposta: ${performanceData.conversion.responseRate}%`}
            />
            <MetricRow
              label="Profile views"
              value={performanceData.conversion.profileViews.toLocaleString()}
              trend={{ direction: 'up', value: performanceData.conversion.profileGrowth }}
              subtitle={`Conversion view→contact: ${performanceData.conversion.viewToContact}%`}
            />
          </div>
        </MetricSection>

        {/* Highlights de Performance */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-galaxia-magenta" />
            🏆 Destaques de Performance
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 border border-green-200 dark:border-green-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Top 5% da categoria</span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-200 mt-1">Performance excepcional</p>
            </div>
            
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Resposta rápida</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">Acima da média da plataforma</p>
            </div>
            
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900 dark:to-purple-800 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Cliente fidelizado</span>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-200 mt-1">Alta taxa de recontratação</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button className="flex-1 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            📈 Ver relatório detalhado
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            📤 Exportar dados
          </Button>
        </div>
        </CardContent>
      </Card>
      
      {/* Performance Radar */}
      <PerformanceRadar />
    </div>
  );
} 