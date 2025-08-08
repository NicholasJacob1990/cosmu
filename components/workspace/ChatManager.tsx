import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2 } from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';

interface ChatManagerProps {
  conversationId?: string;
  userId?: string;
}

export function ChatManager({ conversationId, userId }: ChatManagerProps) {
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    const {
        messages,
        conversations,
        activeConversation,
        isLoading,
        error,
        onlineUsers,
        typingUsers,
        sendMessage,
        loadMessages,
        setActiveConversation,
        startTyping,
        stopTyping,
        connectWebSocket,
        markConversationAsRead
    } = useMessaging(userId);

    const currentConversationId = conversationId || activeConversation;
    const currentMessages = currentConversationId ? messages[currentConversationId] || [] : [];
    const currentConversation = conversations.find(c => c.id === currentConversationId);
    const typingInCurrent = currentConversationId ? typingUsers[currentConversationId] || [] : [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [currentMessages]);

    // Conectar WebSocket e carregar mensagens quando componente monta
    useEffect(() => {
        connectWebSocket();
        if (currentConversationId) {
            loadMessages(currentConversationId);
            setActiveConversation(currentConversationId);
            markConversationAsRead(currentConversationId);
        }
    }, [currentConversationId]);

    // Gerenciar typing indicators
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewMessage(value);

        if (currentConversationId) {
            if (!isTyping && value.length > 0) {
                setIsTyping(true);
                startTyping(currentConversationId);
            }

            // Reset typing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                if (isTyping) {
                    setIsTyping(false);
                    stopTyping(currentConversationId);
                }
            }, 1000);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !currentConversationId) return;

        try {
            await sendMessage(currentConversationId, newMessage.trim());
            setNewMessage('');
            
            // Parar typing indicator
            if (isTyping) {
                setIsTyping(false);
                stopTyping(currentConversationId);
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const isUserOnline = (userId: string) => {
        return onlineUsers.has(userId);
    };

    // Se não há conversa ativa, mostrar estado vazio
    if (!currentConversationId) {
        return (
            <Card className="h-[600px] flex flex-col">
                <CardHeader>
                    <CardTitle>Chat</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <p>Selecione uma conversa para começar</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <CardTitle>
                        {currentConversation?.title || 'Chat do Projeto'}
                    </CardTitle>
                    {currentConversation?.other_participant && (
                        <div className="flex items-center gap-2">
                            <Badge 
                                variant={isUserOnline(currentConversation.other_participant.id) ? "default" : "secondary"}
                                className="text-xs"
                            >
                                {isUserOnline(currentConversation.other_participant.id) ? 'Online' : 'Offline'}
                            </Badge>
                        </div>
                    )}
                </div>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                        {error}
                    </div>
                )}
                
                {currentMessages.map((msg) => {
                    const isCurrentUser = msg.sender.id === userId;
                    return (
                        <div
                            key={msg.id}
                            className={`flex items-end gap-3 ${
                                isCurrentUser ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            {!isCurrentUser && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={msg.sender.avatar_url} />
                                    <AvatarFallback>
                                        {msg.sender.full_name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${
                                    isCurrentUser
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-muted/60 rounded-bl-none'
                                }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <p className={`text-xs ${
                                        isCurrentUser ? 'text-blue-200' : 'text-muted-foreground'
                                    }`}>
                                        {formatTimestamp(msg.created_at)}
                                    </p>
                                    {msg.is_read_by_current_user && isCurrentUser && (
                                        <Badge variant="secondary" className="text-xs">
                                            Lida
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            {isCurrentUser && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={msg.sender.avatar_url} />
                                    <AvatarFallback>
                                        {msg.sender.full_name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    );
                })}
                
                {/* Typing indicator */}
                {typingInCurrent.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span>Alguém está digitando...</span>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </CardContent>
            
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <Input
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Digite sua mensagem..."
                        autoComplete="off"
                        disabled={isLoading}
                    />
                    <Button 
                        type="submit" 
                        size="icon"
                        disabled={isLoading || newMessage.trim() === ''}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </div>
        </Card>
    );
} 