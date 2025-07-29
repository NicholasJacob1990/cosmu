import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare,
  Paperclip,
  Clock,
  User,
  ExternalLink,
  Eye,
  Inbox
} from "lucide-react";

const conversations = [
  {
    id: 1,
    freelancer: {
      name: 'Ana Designer',
      avatar: '/placeholder-avatar-1.jpg'
    },
    lastMessage: {
      text: 'Enviei 3 opções de logo para...',
      time: '15min',
      type: 'text',
      unread: true
    },
    project: 'Identidade Visual Completa',
    status: 'new'
  },
  {
    id: 2,
    freelancer: {
      name: 'Carlos Dev',
      avatar: '/placeholder-avatar-2.jpg'
    },
    lastMessage: {
      text: 'Link do site em homologação pronto',
      time: '1h',
      type: 'attachment',
      unread: false
    },
    project: 'Landing Page E-commerce',
    status: 'attachment'
  }
];

const statusConfig = {
  new: { 
    icon: <MessageSquare className="h-3 w-3" />, 
    color: 'text-red-500',
    badge: '🔴 Nova mensagem'
  },
  attachment: { 
    icon: <Paperclip className="h-3 w-3" />, 
    color: 'text-blue-500',
    badge: '📎 Anexo'
  }
};

export function MessagesCenter() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-galaxia-magenta" />
          💬 Conversas Recentes
        </CardTitle>
        <CardDescription>
          Acompanhe as comunicações dos seus projetos ativos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {conversations.map((conversation) => (
          <div 
            key={conversation.id} 
            className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversation.freelancer.avatar} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{conversation.freelancer.name}</h4>
                    <Badge 
                      className={`${statusConfig[conversation.status].color} bg-transparent border-0 p-0 text-xs`}
                    >
                      {statusConfig[conversation.status].badge}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    há {conversation.lastMessage.time}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  "{conversation.lastMessage.text}"
                </p>
                
                <p className="text-xs text-muted-foreground">
                  Projeto: {conversation.project}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white">
                Responder
              </Button>
              {conversation.status === 'attachment' ? (
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  {conversation.lastMessage.type === 'attachment' ? 'Ver Anexo' : 'Testar Site'}
                </Button>
              ) : (
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Projeto
                </Button>
              )}
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t">
          <Button variant="ghost" className="w-full text-galaxia-magenta hover:text-galaxia-magenta/80">
            <Inbox className="h-4 w-4 mr-2" />
            💬 Abrir caixa de entrada completa (8 conversas)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 