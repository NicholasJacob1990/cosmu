import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Video, 
  MoreHorizontal,
  Search,
  Pin,
  Archive,
  Star,
  Clock,
  CheckCheck,
  Paperclip,
  Smile
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageThread {
  id: string;
  participant: {
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'away';
    profession: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    sender: 'me' | 'them';
    type: 'text' | 'file' | 'image';
  };
  unreadCount: number;
  isPinned: boolean;
  projectTitle: string;
  priority: 'high' | 'medium' | 'low';
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'me' | 'them';
  type: 'text' | 'file' | 'image';
  status?: 'sent' | 'delivered' | 'read';
}

export function MessagesWidget() {
  const [selectedThread, setSelectedThread] = useState<string | null>('1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [threads] = useState<MessageThread[]>([
    {
      id: '1',
      participant: {
        name: 'João Silva',
        avatar: '',
        status: 'online',
        profession: 'Desenvolvedor Mobile'
      },
      lastMessage: {
        content: 'Acabei de enviar a primeira versão do app para sua análise. Quando puder dar uma olhada?',
        timestamp: '14:32',
        sender: 'them',
        type: 'text'
      },
      unreadCount: 3,
      isPinned: true,
      projectTitle: 'App Mobile E-commerce',
      priority: 'high'
    },
    {
      id: '2',
      participant: {
        name: 'Maria Santos',
        avatar: '',
        status: 'away',
        profession: 'Designer UI/UX'
      },
      lastMessage: {
        content: 'Você: Perfeito! Aprovado para implementação',
        timestamp: '13:15',
        sender: 'me',
        type: 'text'
      },
      unreadCount: 0,
      isPinned: false,
      projectTitle: 'Redesign Website',
      priority: 'medium'
    },
    {
      id: '3',
      participant: {
        name: 'Carlos Oliveira',
        avatar: '',
        status: 'offline',
        profession: 'Desenvolvedor Full Stack'
      },
      lastMessage: {
        content: 'Arquivo: documentacao-api.pdf',
        timestamp: '10:45',
        sender: 'them',
        type: 'file'
      },
      unreadCount: 1,
      isPinned: false,
      projectTitle: 'Sistema de Gestão',
      priority: 'low'
    }
  ]);

  const [messages] = useState<Message[]>([
    {
      id: '1',
      content: 'Oi! Como está o andamento do projeto?',
      timestamp: '14:20',
      sender: 'me',
      type: 'text',
      status: 'read'
    },
    {
      id: '2',
      content: 'Está indo muito bem! Consegui implementar 80% das funcionalidades já.',
      timestamp: '14:25',
      sender: 'them',
      type: 'text'
    },
    {
      id: '3',
      content: 'Acabei de enviar a primeira versão do app para sua análise. Quando puder dar uma olhada?',
      timestamp: '14:32',
      sender: 'them',
      type: 'text'
    }
  ]);

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const filteredThreads = threads.filter(thread =>
    searchQuery === '' || 
    thread.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedThreadData = threads.find(t => t.id === selectedThread);
  const unreadTotal = threads.reduce((sum, thread) => sum + thread.unreadCount, 0);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Aqui enviaria a mensagem via WebSocket
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Centro de Mensagens Ativas
            {unreadTotal > 0 && (
              <Badge variant="destructive" className="h-5 px-2 text-xs">
                {unreadTotal}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex h-96">
          {/* Threads List */}
          <div className="w-1/2 border-r border-border/50">
            {/* Search */}
            <div className="p-3 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8"
                />
              </div>
            </div>

            {/* Thread List */}
            <div className="overflow-y-auto h-full">
              {filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  className={cn(
                    "p-3 border-b border-border/30 cursor-pointer hover:bg-muted/30 transition-colors border-l-4",
                    selectedThread === thread.id ? "bg-muted/50" : "",
                    getPriorityColor(thread.priority)
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={thread.participant.avatar} />
                        <AvatarFallback className="text-sm">
                          {thread.participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                        getStatusDot(thread.participant.status)
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm truncate">
                            {thread.participant.name}
                          </h4>
                          {thread.isPinned && (
                            <Pin className="h-3 w-3 text-blue-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            {thread.lastMessage.timestamp}
                          </span>
                          {thread.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-4 w-4 p-0 text-xs">
                              {thread.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground mb-1">
                        {thread.participant.profession} • {thread.projectTitle}
                      </div>

                      <div className="flex items-center gap-1">
                        {thread.lastMessage.type === 'file' && (
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                        )}
                        <p className="text-sm text-muted-foreground truncate">
                          {thread.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedThreadData ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b border-border/50 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={selectedThreadData.participant.avatar} />
                          <AvatarFallback className="text-xs">
                            {selectedThreadData.participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-background",
                          getStatusDot(selectedThreadData.participant.status)
                        )} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">
                          {selectedThreadData.participant.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {selectedThreadData.projectTitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender === 'me' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] p-3 rounded-lg text-sm",
                          message.sender === 'me'
                            ? "bg-blue-600 text-white"
                            : "bg-muted"
                        )}
                      >
                        <div className="mb-1">{message.content}</div>
                        <div className="flex items-center justify-between text-xs opacity-70">
                          <span>{message.timestamp}</span>
                          {message.sender === 'me' && message.status && (
                            <div className="flex items-center gap-1">
                              {message.status === 'read' && (
                                <CheckCheck className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Digite sua mensagem..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="pr-10"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione uma conversa para começar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}