"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStore } from "@/store/dashboardStore";

export function SuccessMetrics() {
  const metrics = useDashboardStore((s) => s.metrics);

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seus Números</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Carregando métricas…</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seus Números</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Metric label="Faturamento" value={`R$ ${metrics.totalRevenue.toLocaleString('pt-BR')}`} sub={`+${metrics.revenueGrowth}%`} />
          <Metric label="Projetos Ativos" value={String(metrics.activeProjects)} />
          <Metric label="Concluídos" value={String(metrics.completedProjects)} />
          <Metric label="Avaliação Média" value={`${metrics.averageRating.toFixed(2)}★`} />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border rounded p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export default SuccessMetrics;




