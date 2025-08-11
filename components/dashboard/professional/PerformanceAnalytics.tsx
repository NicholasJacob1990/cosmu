"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStore } from "@/store/dashboardStore";
import { useAnalytics } from "@/lib/api/hooks/useMetrics";

export function PerformanceAnalytics() {
  const user = useDashboardStore((s) => s.user);
  const userId = user?.id || "professional-1";
  const { data } = useAnalytics(userId, "performance");

  const series = data?.series ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Analytics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {series.map((s: any) => (
          <div key={s.label} className="border rounded p-3">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-lg font-semibold">{s.value}</div>
          </div>
        ))}
        {series.length === 0 && (
          <div className="text-sm text-muted-foreground">Sem dados analíticos.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default PerformanceAnalytics;




