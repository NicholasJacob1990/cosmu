import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Star, Users, TrendingUp, TrendingDown } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfessionalWelcome() {
  const metrics = useDashboardStore((state) => state.metrics);
  const projects = useDashboardStore((state) => state.projects);
  
  // Calculate active projects from store
  const activeProjects = projects.filter(p => 
    ['active', 'in_progress'].includes(p.status)
  ).length;
  
  if (!metrics) {
    return <ProfessionalWelcomeSkeleton />;
  }
  
  const getTrendIcon = (growth: number) => {
    return growth > 0 ? (
      <TrendingUp className="h-3 w-3 text-green-500" />
    ) : (
      <TrendingDown className="h-3 w-3 text-red-500" />
    );
  };
  
  const getNPSCategory = (score: number) => {
    if (score >= 70) return "Promotor";
    if (score >= 0) return "Neutro";
    return "Detrator";
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Faturamento (30d)</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {metrics.totalRevenue.toLocaleString('pt-BR')}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getTrendIcon(metrics.revenueGrowth)}
            <span className={metrics.revenueGrowth > 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(metrics.revenueGrowth)}%
            </span>
            <span>vs mês anterior</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeProjects || metrics.activeProjects}</div>
          <p className="text-xs text-muted-foreground">
            R$ {Math.round(metrics.totalRevenue / metrics.responseTime)} RPH
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sua Avaliação</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.averageRating.toFixed(2)}/5</div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(metrics.averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.npsScore} ({getNPSCategory(metrics.npsScore)})
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.conversionRate}% de taxa de conversão
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfessionalWelcomeSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 