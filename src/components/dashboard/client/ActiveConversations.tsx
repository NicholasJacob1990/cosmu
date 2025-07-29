import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const conversations = [
  {
    freelancer: 'Ana Designer',
    message: 'Enviei 3 opções de logo para...',
    project: 'Identidade Visual Completa',
    isNew: true,
    time: 'há 15min',
    attachment: false,
  },
  {
    freelancer: 'Carlos Dev',
    message: 'Link do site em homologação pronto',
    project: 'Landing Page E-commerce',
    isNew: false,
    time: 'há 1h',
    attachment: true,
  },
];

export function ActiveConversations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>💬 Centro de Mensagens Ativas</CardTitle>
        <CardDescription>Conversas recentes que podem precisar de sua atenção</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {conversations.map(convo => (
            <div key={convo.freelancer} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${convo.freelancer}`} />
                    <AvatarFallback>{convo.freelancer.substring(0,2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold">{convo.freelancer}</p>
                        <span className="text-xs text-muted-foreground">{convo.time}</span>
                    </div>
                    <p className={`text-sm ${convo.isNew ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {convo.isNew && '🔴 '}
                        {convo.attachment && '📎 '}
                        {convo.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Projeto: {convo.project}
                    </p>
                </div>
                <Button variant="outline" size="sm">Responder</Button>
            </div>
        ))}
        <Button variant="link" className="w-full">Abrir caixa de entrada completa (8 conversas)</Button>
      </CardContent>
    </Card>
  );
} 