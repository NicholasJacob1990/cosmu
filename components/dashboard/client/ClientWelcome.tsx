"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ClientWelcome() {
  const user = useDashboardStore((s) => s.user);
  const metrics = useDashboardStore((s) => s.metrics);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Olá{user?.name ? `, ${user.name}` : ""}! 👋
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm text-muted-foreground">
          Bem-vindo ao seu painel. Acompanhe projetos, mensagens e resultados.
        </div>
        {metrics && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Projetos ativos: {metrics.activeProjects}</Badge>
            <Badge variant="secondary">Concluídos: {metrics.completedProjects}</Badge>
            <Badge variant="secondary">Satisfação: {metrics.averageRating.toFixed(2)}★</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ClientWelcome;




