/**
 * Hook personalizado para gerenciar conexões WebSocket
 * para o sistema de mensageria em tempo real da GalaxIA
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onOpen?: (event: Event) => void;
  onMessage?: (data: any) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
}

export interface WebSocketReturn {
  socket: WebSocket | null;
  isConnected: boolean;
  error: string | null;
  sendMessage: (data: any) => void;
  connect: () => void;
  disconnect: () => void;
  lastMessage: any;
}

export const useWebSocket = (config: WebSocketConfig): WebSocketReturn => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  
  const reconnectCount = useRef(0);
  const maxReconnectAttempts = config.reconnectAttempts || 5;
  const reconnectInterval = config.reconnectInterval || 5000;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  
  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(config.url, config.protocols);
      
      ws.onopen = (event) => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectCount.current = 0;
        config.onOpen?.(event);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          config.onMessage?.(data);
        } catch (parseError) {
          console.error('Failed to parse WebSocket message:', parseError);
        }
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setSocket(null);
        config.onClose?.(event);
        
        // Auto-reconnect se não foi fechamento intencional
        if (event.code !== 1000 && reconnectCount.current < maxReconnectAttempts) {
          reconnectCount.current++;
          console.log(`Tentando reconectar... (${reconnectCount.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Erro de conexão WebSocket');
        config.onError?.(error);
      };
      
      setSocket(ws);
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Falha ao criar conexão WebSocket');
    }
  }, [config, maxReconnectAttempts, reconnectInterval]);
  
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close(1000, 'Disconnected by user');
    }
    
    setSocket(null);
    setIsConnected(false);
    reconnectCount.current = 0;
  }, [socket]);
  
  const sendMessage = useCallback((data: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(data));
      } catch (err) {
        console.error('Failed to send WebSocket message:', err);
        setError('Falha ao enviar mensagem');
      }
    } else {
      console.warn('WebSocket não está conectado');
    }
  }, [socket]);
  
  // Cleanup na desmontagem do componente
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  return {
    socket,
    isConnected,
    error,
    sendMessage,
    connect,
    disconnect,
    lastMessage
  };
};


