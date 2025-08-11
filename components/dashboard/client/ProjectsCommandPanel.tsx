"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useProjects } from "@/lib/api/hooks/useProjects";

export function ProjectsCommandPanel() {
  const { data } = useProjects();
  const total = data?.total ?? 0;
  const projects = data?.projects ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projetos que precisam da sua atenção</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.slice(0, 3).map((p) => (
          <div key={p.id} className="flex items-center justify-between border rounded p-3">
            <div>
              <div className="font-medium text-sm">{p.title}</div>
              <div className="text-xs text-muted-foreground">Status: {p.status}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/project/${p.id}`}>Ver Progresso</Link>
              </Button>
              <Button size="sm" variant="default" asChild>
                <Link href={`/manage-proposals/${p.id}`}>Ver Propostas</Link>
              </Button>
            </div>
          </div>
        ))}
        <div className="text-xs text-muted-foreground">Ver todos os projetos ({total})</div>
      </CardContent>
    </Card>
  );
}

export default ProjectsCommandPanel;




