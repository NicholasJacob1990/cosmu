"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStore } from "@/store/dashboardStore";
import { useSalesPipeline } from "@/lib/api/hooks/useMetrics";

export function SalesPipeline() {
  const user = useDashboardStore((s) => s.user);
  const professionalId = user?.id || "professional-1";
  const { data } = useSalesPipeline(professionalId);

  const stages = data?.stages ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Vendas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((s: any) => (
          <div key={s.name} className="flex items-center justify-between border rounded p-3">
            <div className="text-sm font-medium">{s.name}</div>
            <div className="text-xs text-muted-foreground">
              {s.opportunities} oportunidades • R$ {s.amount.toLocaleString('pt-BR')} • Prob. {Math.round((s.probability || 0) * 100)}%
            </div>
          </div>
        ))}
        {stages.length === 0 && (
          <div className="text-sm text-muted-foreground">Sem dados de pipeline.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default SalesPipeline;




