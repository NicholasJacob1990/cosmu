import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';

const mockMessages = [
    { id: 1, text: "Olá João, tudo bem? Alguma novidade sobre os conceitos do logo?", sender: 'client', timestamp: '10:30 AM', avatar: 'https://i.pravatar.cc/80?u=client123' },
    { id: 2, text: "Olá Carlos! Tudo ótimo. Sim, estou finalizando os detalhes do primeiro rascunho. Devo te enviar ainda hoje até o final da tarde.", sender: 'professional', timestamp: '10:32 AM', avatar: 'https://i.pravatar.cc/80?u=prof1' },
    { id: 3, text: "Perfeito! Fico no aguardo. Ansioso para ver as ideias.", sender: 'client', timestamp: '10:33 AM', avatar: 'https://i.pravatar.cc/80?u=client123' },
    { id: 4, text: "Pode deixar! 🔥", sender: 'professional', timestamp: '10:35 AM', avatar: 'https://i.pravatar.cc/80?u=prof1' },
    { id: 5, text: "Carlos, acabei de subir a primeira versão na aba 'Entregas'. Dê uma olhada quando puder!", sender: 'professional', timestamp: '04:55 PM', avatar: 'https://i.pravatar.cc/80?u=prof1' },
    { id: 6, text: "Opa, já vou conferir! Obrigado, João!", sender: 'client', timestamp: '04:56 PM', avatar: 'https://i.pravatar.cc/80?u=client123' },
];

// Assumindo que o usuário logado é o cliente para fins de mock
const LOGGED_IN_USER_ID = 'client';

export function ChatManager() {
    const [messages, setMessages] = useState(mockMessages);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const message = {
            id: messages.length + 1,
            text: newMessage,
            sender: LOGGED_IN_USER_ID,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            avatar: 'https://i.pravatar.cc/80?u=client123'
        };

        setMessages([...messages, message]);
        setNewMessage('');
    };

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle>Chat do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-end gap-3 ${
                            msg.sender === LOGGED_IN_USER_ID ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        {msg.sender !== LOGGED_IN_USER_ID && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={msg.avatar} />
                                <AvatarFallback>{msg.sender.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${
                                msg.sender === LOGGED_IN_USER_ID
                                    ? 'bg-galaxia-blue text-white rounded-br-none'
                                    : 'bg-muted/60 rounded-bl-none'
                            }`}
                        >
                            <p className="text-sm">{msg.text}</p>
                            <p className={`text-xs mt-1 ${
                                msg.sender === LOGGED_IN_USER_ID ? 'text-blue-200' : 'text-muted-foreground'
                            }`}>
                                {msg.timestamp}
                            </p>
                        </div>
                        {msg.sender === LOGGED_IN_USER_ID && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={msg.avatar} />
                                <AvatarFallback>{msg.sender.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </Card>
    );
} 