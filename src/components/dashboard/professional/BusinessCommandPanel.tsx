import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const actions = [
  {
    type: 'delivery',
    title: 'Logo Startup Tech',
    deadline: 'em 18h',
  },
  {
    type: 'proposal',
    title: 'E-commerce Premium (R$ 15k)',
    status: 'Aguardando resposta',
  },
  {
    type: 'follow-up',
    title: 'Cliente VIP',
    lastContact: 'há 2 dias',
  }
];

const statusConfig = {
    delivery: { label: 'Entrega', color: 'text-red-500', icon: '🔴' },
    proposal: { label: 'Proposta', color: 'text-yellow-500', icon: '🟡' },
    'follow-up': { label: 'Follow-up', color: 'text-blue-500', icon: '🔵' },
}


export function BusinessCommandPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🎯 Central de Comando Business</CardTitle>
        <CardDescription>Próximas ações prioritárias para o seu negócio</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map(action => (
            <div key={action.title} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                    <span className={`text-xl ${statusConfig[action.type].color}`}>{statusConfig[action.type].icon}</span>
                    <div className="flex-1">
                        <p className="font-semibold">{action.title}</p>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{statusConfig[action.type].label}</span>
                            {action.deadline && <Badge variant="destructive">Prazo: {action.deadline}</Badge>}
                            {action.status && <Badge variant="secondary">{action.status}</Badge>}
                            {action.lastContact && <Badge variant="outline">Último contato: {action.lastContact}</Badge>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 self-end sm:self-center">
                    {action.type === 'delivery' && <Button>Enviar Entrega</Button>}
                    {action.type === 'proposal' && <Button variant="secondary">Ver Proposta</Button>}
                    {action.type === 'follow-up' && <Button variant="outline">Enviar Mensagem</Button>}
                </div>
            </div>
        ))}
        <Button variant="link" className="w-full">Ver pipeline completo</Button>
      </CardContent>
    </Card>
  );
} 