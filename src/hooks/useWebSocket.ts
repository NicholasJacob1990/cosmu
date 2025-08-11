"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

interface WebSocketMessage {
  type: 'auth' | 'project_update' | 'new_message' | 'notification' | 'metrics_update' | 'presence';
  data: any;
}

interface UseWebSocketOptions {
  userId: string;
  userType: 'client' | 'professional';
  enabled?: boolean;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';

export const useWebSocket = ({ userId, userType, enabled = true }: UseWebSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  
  const {
    setWsConnected,
    setWsError,
    updateProject,
    addMessage,
    addNotification,
    updateMetrics,
  } = useDashboardStore();

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'project_update':
          updateProject(message.data.projectId, message.data.updates);
          break;
          
        case 'new_message':
          addMessage(message.data);
          // Show notification if message is for current user
          if (message.data.receiverId === userId) {
            addNotification({
              id: `notif-msg-${Date.now()}`,
              userId,
              type: 'new_message',
              title: 'New Message',
              message: `You have a new message in project "${message.data.projectTitle}"`,
              read: false,
              actionUrl: `/projects/${message.data.projectId}/messages`,
              createdAt: new Date(),
            });
          }
          break;
          
        case 'notification':
          addNotification(message.data);
          break;
          
        case 'metrics_update':
          updateMetrics(message.data);
          break;
          
        case 'presence':
          // Handle user presence updates (online/offline status)
          console.log('Presence update:', message.data);
          break;
          
        default:
          console.warn('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, [userId, updateProject, addMessage, addNotification, updateMetrics]);

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(`${WS_URL}/dashboard`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
        reconnectAttempts.current = 0;
        
        // Authenticate
        ws.send(JSON.stringify({
          type: 'auth',
          data: { userId, userType }
        }));
      };
      
      ws.onmessage = handleMessage;
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsError('Connection error');
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
        wsRef.current = null;
        
        // Exponential backoff for reconnection
        if (reconnectAttempts.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        } else {
          setWsError('Failed to connect after multiple attempts');
        }
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setWsError('Failed to establish connection');
    }
  }, [enabled, userId, userType, handleMessage, setWsConnected, setWsError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setWsConnected(false);
  }, [setWsConnected]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Reconnect on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connect();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [connect]);

  // Heartbeat to keep connection alive
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    sendMessage,
    disconnect,
    reconnect: connect,
  };
};