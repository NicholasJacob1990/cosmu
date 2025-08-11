"""
Views para o sistema de mensageria e notificações.
"""

from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Max, Prefetch
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

from .models import (
    Conversation, 
    MessageConversation, 
    SystemNotification, 
    NotificationPreferences
)
from .serializers_messaging import (
    ConversationSerializer,
    MessageConversationSerializer,
    MessageCreateSerializer,
    SystemNotificationSerializer,
    NotificationPreferencesSerializer,
    ConversationListSerializer
)


class MessagingPagination(PageNumberPagination):
    """Paginação otimizada para mensageria."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class ConversationViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar conversas."""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MessagingPagination
    
    def get_queryset(self):
        """Retorna apenas conversas do usuário atual."""
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related(
            'participants',
            Prefetch(
                'message_conversations',
                queryset=MessageConversation.objects.select_related('sender').order_by('-created_at')
            )
        ).annotate(
            last_message_time=Max('message_conversations__created_at')
        ).order_by('-last_message_time', '-created_at')
    
    def get_serializer_class(self):
        """Usa serializer otimizado para listagem."""
        if self.action == 'list':
            return ConversationListSerializer
        return ConversationSerializer
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Marca todas as mensagens da conversa como lidas."""
        conversation = self.get_object()
        
        # Buscar mensagens não lidas do usuário atual
        unread_messages = conversation.message_conversations.exclude(
            sender=request.user
        ).exclude(
            read_by__has_key=str(request.user.id)
        )
        
        # Marcar como lidas
        for message in unread_messages:
            message.mark_as_read_by(request.user)
        
        return Response({
            'status': 'success',
            'marked_count': unread_messages.count()
        })
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Retorna total de mensagens não lidas."""
        conversations = self.get_queryset()
        total_unread = 0
        
        for conversation in conversations:
            total_unread += conversation.get_unread_count_for_user(request.user)
        
        return Response({'unread_count': total_unread})


class MessageConversationViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar mensagens."""
    serializer_class = MessageConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MessagingPagination
    
    def get_queryset(self):
        """Retorna mensagens das conversas do usuário atual."""
        conversation_id = self.request.query_params.get('conversation')
        
        base_queryset = MessageConversation.objects.select_related(
            'sender', 'conversation', 'reply_to__sender'
        ).filter(
            conversation__participants=self.request.user
        )
        
        if conversation_id:
            base_queryset = base_queryset.filter(conversation_id=conversation_id)
        
        return base_queryset.order_by('created_at')
    
    def get_serializer_class(self):
        """Usa serializer específico para criação."""
        if self.action == 'create':
            return MessageCreateSerializer
        return MessageConversationSerializer
    
    def perform_create(self, serializer):
        """Cria mensagem e envia via WebSocket."""
        message = serializer.save(sender=self.request.user)
        
        # Atualizar last_message_at da conversa
        conversation = message.conversation
        conversation.last_message_at = timezone.now()
        conversation.save(update_fields=['last_message_at'])
        
        # Enviar via WebSocket
        self._send_websocket_message(message)
        
        # Criar notificação para outros participantes
        self._create_message_notifications(message)
    
    def _send_websocket_message(self, message):
        """Envia mensagem via WebSocket para todos os participantes."""
        channel_layer = get_channel_layer()
        conversation_group = f'chat_{message.conversation.id}'
        
        # Dados da mensagem para WebSocket
        message_data = {
            'type': 'chat_message_broadcast',
            'message': {
                'id': str(message.id),
                'content': message.content,
                'sender': {
                    'id': str(message.sender.id),
                    'name': message.sender.get_full_name() or message.sender.username,
                    'avatar': f"https://ui-avatars.com/api/?name={message.sender.get_full_name() or message.sender.username}&background=0066cc&color=fff"
                },
                'timestamp': message.created_at.isoformat(),
                'message_type': message.message_type,
                'conversation_id': str(message.conversation.id)
            }
        }
        
        async_to_sync(channel_layer.group_send)(conversation_group, message_data)
    
    def _create_message_notifications(self, message):
        """Cria notificações para outros participantes da conversa."""
        other_participants = message.conversation.participants.exclude(
            id=message.sender.id
        )
        
        for participant in other_participants:
            # Verificar preferências de notificação do usuário
            try:
                prefs = participant.notification_preferences
                if not prefs.messages_push:
                    continue
            except NotificationPreferences.DoesNotExist:
                pass  # Usar configurações padrão
            
            # Criar notificação
            notification = SystemNotification.objects.create(
                user=participant,
                notification_type='message',
                title=f'Nova mensagem de {message.sender.get_full_name()}',
                message=message.content[:100] + "..." if len(message.content) > 100 else message.content,
                priority='medium',
                related_conversation=message.conversation,
                related_message=message,
                data={
                    'conversation_id': str(message.conversation.id),
                    'sender_id': str(message.sender.id)
                }
            )
            
            # Enviar notificação via WebSocket
            self._send_websocket_notification(notification)
    
    def _send_websocket_notification(self, notification):
        """Envia notificação via WebSocket."""
        channel_layer = get_channel_layer()
        notification_group = f'notifications_{notification.user.id}'
        
        notification_data = {
            'type': 'notification_broadcast',
            'notification': {
                'id': str(notification.id),
                'type': notification.notification_type,
                'title': notification.title,
                'message': notification.message,
                'priority': notification.priority,
                'created_at': notification.created_at.isoformat(),
                'action_url': notification.action_url,
                'data': notification.data
            }
        }
        
        async_to_sync(channel_layer.group_send)(notification_group, notification_data)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Marca mensagem específica como lida."""
        message = self.get_object()
        
        # Verificar se o usuário tem acesso à mensagem
        if not message.conversation.participants.filter(id=request.user.id).exists():
            return Response(
                {'error': 'Você não tem acesso a esta mensagem'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.mark_as_read_by(request.user)
        
        return Response({'status': 'success'})


class SystemNotificationViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar notificações do sistema."""
    serializer_class = SystemNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MessagingPagination
    
    def get_queryset(self):
        """Retorna notificações do usuário atual."""
        queryset = SystemNotification.objects.filter(
            user=self.request.user
        ).select_related(
            'related_conversation',
            'related_project',
            'related_order',
            'related_message'
        ).order_by('-created_at')
        
        # Filtros opcionais
        read_status = self.request.query_params.get('read')
        if read_status is not None:
            queryset = queryset.filter(read=read_status.lower() == 'true')
        
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        """Não permite deletar notificações, apenas marcar como lida."""
        return Response(
            {'error': 'Notificações não podem ser deletadas, apenas marcadas como lidas'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Marca notificação como lida."""
        notification = self.get_object()
        notification.mark_as_read()
        
        return Response({'status': 'success'})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Marca todas as notificações como lidas."""
        updated_count = SystemNotification.objects.filter(
            user=request.user,
            read=False
        ).update(
            read=True,
            read_at=timezone.now()
        )
        
        return Response({
            'status': 'success',
            'updated_count': updated_count
        })
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Retorna quantidade de notificações não lidas."""
        unread_count = SystemNotification.objects.filter(
            user=request.user,
            read=False
        ).count()
        
        return Response({'unread_count': unread_count})


class NotificationPreferencesViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar preferências de notificação."""
    serializer_class = NotificationPreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Retorna apenas as preferências do usuário atual."""
        return NotificationPreferences.objects.filter(user=self.request.user)
    
    def get_object(self):
        """Retorna ou cria as preferências do usuário atual."""
        obj, created = NotificationPreferences.objects.get_or_create(
            user=self.request.user
        )
        return obj
    
    def list(self, request, *args, **kwargs):
        """Retorna as preferências do usuário atual."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Não permite criar, apenas atualizar."""
        return Response(
            {'error': 'Use PUT para atualizar as preferências'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def update(self, request, *args, **kwargs):
        """Atualiza as preferências do usuário."""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data)


