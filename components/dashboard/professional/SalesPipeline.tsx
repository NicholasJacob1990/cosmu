import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const hotLeads = [
  {
    title: 'E-commerce Completo',
    client: 'Startup Food',
    value: 15000,
    status: 'Reunião agendada: Amanhã 14h',
    statusType: 'meeting'
  },
  {
    title: 'Rebranding Corporativo',
    client: 'Empresa Tech',
    value: 8500,
    status: 'Aguardando aprovação',
    statusType: 'pending'
  },
];

const warmLeads = [
    {
        title: 'Logo + Identidade',
        client: 'Clínica',
        value: 2800,
    },
    {
        title: 'Website Responsivo',
        client: 'Consultoria',
        value: 4200,
    },
];

export function SalesPipeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>💰 Pipeline de Vendas Avançado</CardTitle>
        <CardDescription>Funil de vendas e oportunidades</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-red-500">🔥</span>
                QUENTES
                <Badge variant="destructive">R$ 28.000 (Prob. 85%)</Badge>
            </h3>
            <div className="space-y-3">
                {hotLeads.map(lead => (
                    <div key={lead.title} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{lead.title} <span className="font-normal text-muted-foreground">• {lead.client}</span></p>
                                <p className="text-sm text-primary font-medium">R$ {lead.value.toLocaleString()}</p>
                            </div>
                            <Button size="sm" variant="secondary">Detalhes</Button>
                        </div>
                        <p className={`text-xs mt-1 ${lead.statusType === 'meeting' ? 'text-green-600' : 'text-yellow-600'}`}>{lead.status}</p>
                    </div>
                ))}
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-yellow-500">🟡</span>
                MORNOS
                <Badge variant="secondary">R$ 17.500 (Prob. 45%)</Badge>
            </h3>
            <div className="space-y-3">
                {warmLeads.map(lead => (
                    <div key={lead.title} className="p-3 border rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{lead.title} <span className="font-normal text-muted-foreground">• {lead.client}</span></p>
                            <p className="text-sm text-primary font-medium">R$ {lead.value.toLocaleString()}</p>
                        </div>
                        <Button size="sm" variant="outline">Ver</Button>
                    </div>
                ))}
            </div>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            Taxa Conversão Média: 67% • Tempo Médio Fechamento: 4.2d
        </div>
      </CardContent>
    </Card>
  );
} 