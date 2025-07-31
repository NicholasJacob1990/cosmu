import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Star, Users } from "lucide-react";

const overviewData = {
    totalSpent: 4750,
    activeProjects: 5,
    uniqueFreelancers: 3,
    averageSatisfaction: 4.8,
    totalReviews: 12,
};

export function ClientWelcome() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {overviewData.totalSpent.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">+23% vs mês anterior</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overviewData.activeProjects}</div>
          <p className="text-xs text-muted-foreground">{overviewData.totalReviews} concluídos no total</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Freelancers Contratados</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overviewData.uniqueFreelancers}</div>
          <p className="text-xs text-muted-foreground">3 recontratados</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Satisfação Média</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overviewData.averageSatisfaction}/5</div>
          <p className="text-xs text-muted-foreground">Baseado em {overviewData.totalReviews} avaliações</p>
        </CardContent>
      </Card>
    </div>
  );
} 