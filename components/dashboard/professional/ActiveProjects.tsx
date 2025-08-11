"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/lib/api/hooks/useProjects";

export function ActiveProjects() {
  const { data } = useProjects();
  const projects = (data?.projects ?? []).filter((p) => ["active", "in_progress"].includes(p.status as any));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projetos Ativos</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {projects.slice(0, 4).map((p) => (
          <div key={p.id} className="border rounded p-3">
            <div className="text-sm font-medium">{p.title}</div>
            <div className="text-xs text-muted-foreground">{p.description}</div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="text-sm text-muted-foreground">Nenhum projeto em andamento.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default ActiveProjects;




