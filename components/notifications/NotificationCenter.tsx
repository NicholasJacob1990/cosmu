/**
 * Centro de Notificações da GalaxIA
 * Componente integrado com WebSocket para notificações em tempo real
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  MessageSquare, 
  CreditCard, 
  FileText, 
  Settings,
  Check,
  CheckCheck,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  userId?: string;
  className?: string;
}

export function NotificationCenter({ userId, className }: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const {
    notifications,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    connectWebSocket
  } = useMessaging(userId);

  useEffect(() => {
    loadNotifications();
    connectWebSocket();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'payment_received':
      case 'payment_sent':
        return <CreditCard className="h-4 w-4" />;
      case 'project_update':
        return <FileText className="h-4 w-4" />;
      case 'proposal_received':
      case 'proposal_accepted':
      case 'proposal_rejected':
        return <FileText className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
    
    // Redirecionar para URL de ação se disponível
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Notificações</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-2 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
              className="text-xs"
            >
              {filter === 'all' ? 'Não lidas' : 'Todas'}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar todas
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={cn(
                      'flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors',
                      !notification.read && 'bg-blue-50/50',
                      getPriorityColor(notification.priority)
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={cn(
                      'flex-shrink-0 p-2 rounded-full',
                      getPriorityColor(notification.priority)
                    )}>
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                          'text-sm font-medium',
                          !notification.read && 'font-semibold'
                        )}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {notification.priority === 'urgent' && (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          )}
                          {!notification.read ? (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          ) : (
                            <Check className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        
                        {notification.priority !== 'low' && (
                          <Badge 
                            variant={notification.priority === 'urgent' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {notification.priority === 'urgent' && 'Urgente'}
                            {notification.priority === 'high' && 'Alta'}
                            {notification.priority === 'medium' && 'Média'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {index < filteredNotifications.length - 1 && (
                    <Separator className="mx-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <div className="p-4 border-t">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <a href="/settings/notifications">
            <Settings className="h-4 w-4 mr-2" />
            Configurar Notificações
          </a>
        </Button>
      </div>
    </Card>
  );
}


