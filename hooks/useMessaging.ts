/**
 * Hook para gerenciar o sistema de mensageria da GalaxIA
 * Integra WebSocket, API REST e state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';

// Tipos TypeScript para o sistema de mensageria
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url: string;
}

export interface Conversation {
  id: string;
  conversation_type: 'project' | 'support' | 'general';
  participants: User[];
  project?: string;
  order?: string;
  title: string;
  is_active: boolean;
  last_message_at: string;
  unread_count: number;
  other_participant?: User;
}

export interface Message {
  id: string;
  conversation: string;
  sender: User;
  content: string;
  message_type: 'text' | 'file' | 'image' | 'system';
  attachment?: string;
  attachment_name?: string;
  reply_to?: string;
  created_at: string;
  is_read_by_current_user: boolean;
}

export interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  created_at: string;
  action_url?: string;
  data?: Record<string, any>;
}

export interface MessagingState {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // conversationId -> messages
  notifications: Notification[];
  activeConversation: string | null;
  isLoading: boolean;
  error: string | null;
  onlineUsers: Set<string>;
  typingUsers: Record<string, string[]>; // conversationId -> userIds typing
}

export interface MessagingActions {
  // Conversas
  loadConversations: () => Promise<void>;
  createConversation: (participantIds: string[], title?: string) => Promise<Conversation>;
  setActiveConversation: (conversationId: string | null) => void;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  
  // Mensagens
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, replyTo?: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  
  // Notificações
  loadNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  
  // WebSocket
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  
  // Typing indicators
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export const useMessaging = (userId?: string): MessagingState & MessagingActions => {
  const [state, setState] = useState<MessagingState>({
    conversations: [],
    messages: {},
    notifications: [],
    activeConversation: null,
    isLoading: false,
    error: null,
    onlineUsers: new Set(),
    typingUsers: {}
  });
  
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Configuração do WebSocket
  const wsConfig = {
    url: `${WS_BASE_URL}/ws/chat/general/`, // URL será alterada dinamicamente
    onMessage: handleWebSocketMessage,
    onOpen: () => console.log('Conectado ao WebSocket de mensageria'),
    onClose: () => console.log('Desconectado do WebSocket de mensageria'),
    onError: (error: Event) => console.error('Erro no WebSocket:', error)
  };
  
  const { isConnected, sendMessage: sendWebSocketMessage, connect, disconnect } = useWebSocket(wsConfig);
  
  // Função para fazer requisições à API
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken'); // Ajustar conforme seu sistema de auth
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  };
  
  // Handler para mensagens WebSocket
  function handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'new_message':
        handleNewMessage(data.data);
        break;
      case 'typing_status':
        handleTypingStatus(data.data);
        break;
      case 'user_status':
        handleUserStatus(data.data);
        break;
      case 'notification':
        handleNewNotification(data.data);
        break;
      default:
        console.log('Mensagem WebSocket desconhecida:', data);
    }
  }
  
  const handleNewMessage = (message: Message) => {
    setState(prev => ({
      ...prev,
      messages: {
        ...prev.messages,
        [message.conversation]: [
          ...(prev.messages[message.conversation] || []),
          message
        ]
      }
    }));
    
    // Atualizar última mensagem na conversa
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv =>
        conv.id === message.conversation
          ? { ...conv, last_message_at: message.created_at }
          : conv
      )
    }));
  };
  
  const handleTypingStatus = (data: { user_id: string; conversation_id: string; is_typing: boolean; user_name: string }) => {
    setState(prev => {
      const currentTyping = prev.typingUsers[data.conversation_id] || [];
      let newTyping: string[];
      
      if (data.is_typing) {
        newTyping = currentTyping.includes(data.user_id) 
          ? currentTyping 
          : [...currentTyping, data.user_id];
      } else {
        newTyping = currentTyping.filter(id => id !== data.user_id);
      }
      
      return {
        ...prev,
        typingUsers: {
          ...prev.typingUsers,
          [data.conversation_id]: newTyping
        }
      };
    });
  };
  
  const handleUserStatus = (data: { user_id: string; status: 'online' | 'offline' }) => {
    setState(prev => {
      const newOnlineUsers = new Set(prev.onlineUsers);
      
      if (data.status === 'online') {
        newOnlineUsers.add(data.user_id);
      } else {
        newOnlineUsers.delete(data.user_id);
      }
      
      return {
        ...prev,
        onlineUsers: newOnlineUsers
      };
    });
  };
  
  const handleNewNotification = (notification: Notification) => {
    setState(prev => ({
      ...prev,
      notifications: [notification, ...prev.notifications]
    }));
  };
  
  // Actions
  const loadConversations = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const data = await apiRequest('/messaging/conversations/');
      setState(prev => ({ ...prev, conversations: data.results || data, isLoading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Erro ao carregar conversas', isLoading: false }));
    }
  };
  
  const createConversation = async (participantIds: string[], title?: string): Promise<Conversation> => {
    try {
      const data = await apiRequest('/messaging/conversations/', {
        method: 'POST',
        body: JSON.stringify({
          participant_ids: participantIds,
          title: title || ''
        })
      });
      
      setState(prev => ({
        ...prev,
        conversations: [data, ...prev.conversations]
      }));
      
      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao criar conversa');
    }
  };
  
  const setActiveConversation = (conversationId: string | null) => {
    setState(prev => ({ ...prev, activeConversation: conversationId }));
  };
  
  const markConversationAsRead = async (conversationId: string) => {
    try {
      await apiRequest(`/messaging/conversations/${conversationId}/mark_as_read/`, {
        method: 'POST'
      });
      
      // Atualizar estado local
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv =>
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        )
      }));
    } catch (error) {
      console.error('Erro ao marcar conversa como lida:', error);
    }
  };
  
  const loadMessages = async (conversationId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const data = await apiRequest(`/messaging/messages/?conversation=${conversationId}`);
      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [conversationId]: data.results || data
        },
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Erro ao carregar mensagens', isLoading: false }));
    }
  };
  
  const sendMessage = async (conversationId: string, content: string, replyTo?: string) => {
    try {
      const messageData = {
        conversation: conversationId,
        content,
        message_type: 'text',
        ...(replyTo && { reply_to: replyTo })
      };
      
      // Enviar via API REST
      const message = await apiRequest('/messaging/messages/', {
        method: 'POST',
        body: JSON.stringify(messageData)
      });
      
      // A mensagem será adicionada via WebSocket quando o servidor confirmar
      
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao enviar mensagem');
    }
  };
  
  const markMessageAsRead = async (messageId: string) => {
    try {
      await apiRequest(`/messaging/messages/${messageId}/mark_as_read/`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  };
  
  const loadNotifications = async () => {
    try {
      const data = await apiRequest('/messaging/notifications/');
      setState(prev => ({ ...prev, notifications: data.results || data }));
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };
  
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await apiRequest(`/messaging/notifications/${notificationId}/mark_as_read/`, {
        method: 'POST'
      });
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      }));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };
  
  const markAllNotificationsAsRead = async () => {
    try {
      await apiRequest('/messaging/notifications/mark_all_as_read/', {
        method: 'POST'
      });
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif => ({ ...notif, read: true }))
      }));
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };
  
  const connectWebSocket = () => {
    connect();
  };
  
  const disconnectWebSocket = () => {
    disconnect();
  };
  
  const startTyping = (conversationId: string) => {
    sendWebSocketMessage({
      type: 'typing_start',
      conversation_id: conversationId
    });
  };
  
  const stopTyping = (conversationId: string) => {
    sendWebSocketMessage({
      type: 'typing_stop',
      conversation_id: conversationId
    });
  };
  
  return {
    ...state,
    loadConversations,
    createConversation,
    setActiveConversation,
    markConversationAsRead,
    loadMessages,
    sendMessage,
    markMessageAsRead,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    connectWebSocket,
    disconnectWebSocket,
    startTyping,
    stopTyping
  };
};


