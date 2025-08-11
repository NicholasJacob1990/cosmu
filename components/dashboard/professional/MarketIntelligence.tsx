"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStore } from "@/store/dashboardStore";
import { useMarketIntelligence } from "@/lib/api/hooks/useMetrics";

export function MarketIntelligence() {
  const user = useDashboardStore((s) => s.user);
  const professionalId = user?.id || "professional-1";
  const { data } = useMarketIntelligence(professionalId);

  const opportunities = data?.opportunities ?? [];
  const trends = data?.trends ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inteligência de Mercado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-2">Oportunidades</div>
          <div className="grid gap-2">
            {opportunities.map((o: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between border rounded p-2">
                <div className="text-sm">{o.title}</div>
                <div className="text-xs text-muted-foreground">R$ {o.budget}</div>
              </div>
            ))}
            {opportunities.length === 0 && (
              <div className="text-xs text-muted-foreground">Sem oportunidades no momento.</div>
            )}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium mb-2">Tendências</div>
          <div className="grid gap-2">
            {trends.map((t: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between border rounded p-2">
                <div className="text-sm">{t.tag}</div>
                <div className="text-xs text-muted-foreground">{Math.round(t.delta * 100)}%</div>
              </div>
            ))}
            {trends.length === 0 && (
              <div className="text-xs text-muted-foreground">Sem tendências no momento.</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MarketIntelligence;




