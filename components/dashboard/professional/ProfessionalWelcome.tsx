"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProfessionalWelcome() {
  const user = useDashboardStore((s) => s.user);
  const metrics = useDashboardStore((s) => s.metrics);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bem-vindo ao GalaxIA Pro{user?.name ? `, ${user.name}` : ""} 🚀</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm text-muted-foreground">
          Acompanhe seu negócio: receita, pipeline e oportunidades.
        </div>
        {metrics && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Receita: R$ {metrics.totalRevenue.toLocaleString('pt-BR')}</Badge>
            <Badge variant="secondary">Ativos: {metrics.activeProjects}</Badge>
            <Badge variant="secondary">Avaliação: {metrics.averageRating.toFixed(2)}★</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProfessionalWelcome;




