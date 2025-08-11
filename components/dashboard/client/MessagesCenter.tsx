"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMessages } from "@/lib/api/hooks/useMessages";

export function MessagesCenter() {
  const { data } = useMessages();
  const messages = data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversas Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.slice(0, 3).map((m) => (
          <div key={m.id} className="flex items-center justify-between p-3 border rounded">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{m.content}</div>
              <div className="text-xs text-muted-foreground">Projeto: {m.projectId}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/project/${m.projectId}`}>Ver Projeto</Link>
              </Button>
              <Button size="sm" variant="default" asChild>
                <Link href={`/manage-proposals/${m.projectId}`}>Responder</Link>
              </Button>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground">Nenhuma mensagem recente.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default MessagesCenter;




