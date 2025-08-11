"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/store/dashboardStore";
import { api } from "@/lib/api";
import Link from "next/link";

interface DiscoveryItem {
  tag: string;
  specialists: number;
  priceFrom: number;
  blurb: string;
}

export function PersonalizedDiscovery() {
  const user = useDashboardStore((s) => s.user);
  const [items, setItems] = useState<DiscoveryItem[]>([]);

  useEffect(() => {
    const id = user?.id || "client-1";
    api.getPersonalizedDiscovery(id).then((res: any) => {
      setItems(res.items || []);
    }).catch(() => setItems([]));
  }, [user?.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Descoberta Personalizada</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.slice(0, 3).map((it) => (
          <div key={it.tag} className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="text-sm font-medium">{it.tag}</div>
              <div className="text-xs text-muted-foreground">
                {it.specialists} especialistas • A partir de R$ {it.priceFrom}
              </div>
              <div className="text-xs text-muted-foreground">{it.blurb}</div>
            </div>
            <Button size="sm" asChild>
              <Link href={`/search?tag=${encodeURIComponent(it.tag)}`}>Explorar</Link>
            </Button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground">Sem recomendações no momento.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default PersonalizedDiscovery;




