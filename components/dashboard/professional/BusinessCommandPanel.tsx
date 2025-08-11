"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function BusinessCommandPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Central de Comando</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/create-project">Criar Proposta Rápida</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/services">Configurar Serviços</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/compare">Buscar Projetos</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default BusinessCommandPanel;




