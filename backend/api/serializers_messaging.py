"""
Serializers para o sistema de mensageria e notificações.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Conversation, 
    MessageConversation, 
    SystemNotification, 
    NotificationPreferences
)

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer básico para informações do usuário."""
    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'avatar_url']
        read_only_fields = ['id', 'username', 'email']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username
    
    def get_avatar_url(self, obj):
        # TODO: Implementar sistema de avatar
        return f"https://ui-avatars.com/api/?name={obj.get_full_name() or obj.username}&background=0066cc&color=fff"


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer para conversas."""
    participants = UserBasicSerializer(many=True, read_only=True)
    participant_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    unread_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'conversation_type', 'participants', 'participant_ids',
            'project', 'order', 'service_order', 'title', 'is_active',
            'last_message_at', 'created_at', 'updated_at', 'unread_count',
            'last_message', 'other_participant'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_message_at']
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_unread_count_for_user(request.user)
        return 0
    
    def get_last_message(self, obj):
        last_message = obj.message_conversations.first()
        if last_message:
            return {
                'id': str(last_message.id),
                'content': last_message.content,
                'sender': last_message.sender.get_full_name() or last_message.sender.username,
                'sender_id': str(last_message.sender.id),
                'message_type': last_message.message_type,
                'created_at': last_message.created_at.isoformat()
            }
        return None
    
    def get_other_participant(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other = obj.get_other_participant(request.user)
            if other:
                return UserBasicSerializer(other).data
        return None
    
    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids', [])
        conversation = Conversation.objects.create(**validated_data)
        
        # Adicionar participantes
        if participant_ids:
            participants = User.objects.filter(id__in=participant_ids)
            conversation.participants.set(participants)
        
        # Adicionar o usuário atual como participante se não estiver na lista
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            conversation.participants.add(request.user)
        
        return conversation


class MessageConversationSerializer(serializers.ModelSerializer):
    """Serializer para mensagens."""
    sender = UserBasicSerializer(read_only=True)
    is_read_by_current_user = serializers.SerializerMethodField()
    reply_to_message = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()
    
    class Meta:
        model = MessageConversation
        fields = [
            'id', 'conversation', 'sender', 'content', 'message_type',
            'attachment', 'attachment_name', 'attachment_size', 'attachment_url',
            'read_by', 'reply_to', 'reply_to_message', 'edited_at',
            'created_at', 'updated_at', 'is_read_by_current_user'
        ]
        read_only_fields = ['id', 'sender', 'read_by', 'created_at', 'updated_at']
    
    def get_is_read_by_current_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_read_by(request.user)
        return False
    
    def get_reply_to_message(self, obj):
        if obj.reply_to:
            return {
                'id': str(obj.reply_to.id),
                'content': obj.reply_to.content[:100] + "..." if len(obj.reply_to.content) > 100 else obj.reply_to.content,
                'sender': obj.reply_to.sender.get_full_name() or obj.reply_to.sender.username
            }
        return None
    
    def get_attachment_url(self, obj):
        if obj.attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachment.url)
        return None
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['sender'] = request.user
        return super().create(validated_data)


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer específico para criação de mensagens."""
    
    class Meta:
        model = MessageConversation
        fields = [
            'conversation', 'content', 'message_type', 
            'attachment', 'attachment_name', 'reply_to'
        ]
    
    def validate_conversation(self, value):
        """Valida se o usuário tem acesso à conversa."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if not value.participants.filter(id=request.user.id).exists():
                raise serializers.ValidationError("Você não tem acesso a esta conversa.")
        return value
    
    def validate_reply_to(self, value):
        """Valida se a mensagem de resposta pertence à mesma conversa."""
        conversation = self.initial_data.get('conversation')
        if value and conversation and str(value.conversation.id) != str(conversation):
            raise serializers.ValidationError("A mensagem de resposta deve pertencer à mesma conversa.")
        return value


class SystemNotificationSerializer(serializers.ModelSerializer):
    """Serializer para notificações do sistema."""
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemNotification
        fields = [
            'id', 'notification_type', 'title', 'message', 'priority',
            'data', 'action_url', 'read', 'read_at', 'created_at',
            'time_ago', 'related_conversation', 'related_project', 
            'related_order', 'related_message'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']
    
    def get_time_ago(self, obj):
        from django.utils.timesince import timesince
        return f"{timesince(obj.created_at)} atrás"


class NotificationPreferencesSerializer(serializers.ModelSerializer):
    """Serializer para preferências de notificação."""
    
    class Meta:
        model = NotificationPreferences
        fields = [
            'messages_email', 'messages_push', 'messages_sms',
            'project_updates_email', 'project_updates_push', 'project_updates_sms',
            'payments_email', 'payments_push', 'payments_sms',
            'proposals_email', 'proposals_push', 'proposals_sms',
            'system_email', 'system_push', 'system_sms',
            'do_not_disturb_start', 'do_not_disturb_end', 'timezone',
            'email_frequency', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ConversationListSerializer(serializers.ModelSerializer):
    """Serializer otimizado para listagem de conversas."""
    other_participant = UserBasicSerializer(read_only=True)
    unread_count = serializers.IntegerField()
    last_message_preview = serializers.CharField()
    last_message_time = serializers.DateTimeField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'conversation_type', 'title', 'other_participant',
            'unread_count', 'last_message_preview', 'last_message_time',
            'is_active'
        ]


