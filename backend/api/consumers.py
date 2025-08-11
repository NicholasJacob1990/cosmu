"""
WebSocket consumers for real-time messaging and notifications.
"""

import json
import uuid
from datetime import datetime
from typing import Dict, Any
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from .models import Conversation, Message, Notification

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling real-time chat messages.
    """
    
    async def connect(self):
        """Accept WebSocket connection and join conversation group."""
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.conversation_group_name = f'chat_{self.conversation_id}'
        self.user = self.scope['user']
        
        # Authenticate user
        if not self.user.is_authenticated:
            await self.close()
            return
            
        # Verify user has access to this conversation
        has_access = await self.verify_conversation_access()
        if not has_access:
            await self.close()
            return
        
        # Join conversation group
        await self.channel_layer.group_add(
            self.conversation_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send user online status
        await self.channel_layer.group_send(
            self.conversation_group_name,
            {
                'type': 'user_status',
                'user_id': str(self.user.id),
                'status': 'online',
                'timestamp': datetime.now().isoformat()
            }
        )

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if hasattr(self, 'conversation_group_name'):
            # Send user offline status
            await self.channel_layer.group_send(
                self.conversation_group_name,
                {
                    'type': 'user_status',
                    'user_id': str(self.user.id),
                    'status': 'offline',
                    'timestamp': datetime.now().isoformat()
                }
            )
            
            # Leave conversation group
            await self.channel_layer.group_discard(
                self.conversation_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Process received WebSocket message."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'typing_start':
                await self.handle_typing_status(data, True)
            elif message_type == 'typing_stop':
                await self.handle_typing_status(data, False)
            elif message_type == 'mark_read':
                await self.handle_mark_read(data)
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Error processing message: {str(e)}'
            }))

    async def handle_chat_message(self, data: Dict[str, Any]):
        """Handle incoming chat message."""
        content = data.get('content', '').strip()
        if not content:
            return
            
        # Save message to database
        message = await self.save_message(content)
        if not message:
            return
            
        # Broadcast message to conversation group
        await self.channel_layer.group_send(
            self.conversation_group_name,
            {
                'type': 'chat_message_broadcast',
                'message': {
                    'id': str(message.id),
                    'content': message.content,
                    'sender': {
                        'id': str(message.sender.id),
                        'name': message.sender.get_full_name() or message.sender.username,
                        'avatar': getattr(message.sender, 'avatar_url', None)
                    },
                    'timestamp': message.created_at.isoformat(),
                    'message_type': message.message_type
                }
            }
        )

    async def handle_typing_status(self, data: Dict[str, Any], is_typing: bool):
        """Handle typing indicator status."""
        await self.channel_layer.group_send(
            self.conversation_group_name,
            {
                'type': 'typing_status',
                'user_id': str(self.user.id),
                'user_name': self.user.get_full_name() or self.user.username,
                'is_typing': is_typing,
                'timestamp': datetime.now().isoformat()
            }
        )

    async def handle_mark_read(self, data: Dict[str, Any]):
        """Mark messages as read."""
        message_ids = data.get('message_ids', [])
        if message_ids:
            await self.mark_messages_read(message_ids)

    # Event handlers for group messages
    async def chat_message_broadcast(self, event):
        """Send message to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'data': event['message']
        }))

    async def typing_status(self, event):
        """Send typing status to WebSocket."""
        if event['user_id'] != str(self.user.id):  # Don't send own typing status
            await self.send(text_data=json.dumps({
                'type': 'typing_status',
                'data': {
                    'user_id': event['user_id'],
                    'user_name': event['user_name'],
                    'is_typing': event['is_typing'],
                    'timestamp': event['timestamp']
                }
            }))

    async def user_status(self, event):
        """Send user online/offline status."""
        if event['user_id'] != str(self.user.id):  # Don't send own status
            await self.send(text_data=json.dumps({
                'type': 'user_status',
                'data': {
                    'user_id': event['user_id'],
                    'status': event['status'],
                    'timestamp': event['timestamp']
                }
            }))

    # Database operations
    @database_sync_to_async
    def verify_conversation_access(self) -> bool:
        """Verify user has access to the conversation."""
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            return self.user in conversation.participants.all()
        except (ObjectDoesNotExist, ValueError):
            return False

    @database_sync_to_async
    def save_message(self, content: str):
        """Save message to database."""
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            message = Message.objects.create(
                conversation=conversation,
                sender=self.user,
                content=content,
                message_type='text'
            )
            
            # Update conversation last_message_at
            conversation.last_message_at = datetime.now()
            conversation.save()
            
            return message
        except Exception:
            return None

    @database_sync_to_async
    def mark_messages_read(self, message_ids: list):
        """Mark multiple messages as read by current user."""
        try:
            messages = Message.objects.filter(
                id__in=message_ids,
                conversation_id=self.conversation_id
            )
            for message in messages:
                message.read_by[str(self.user.id)] = datetime.now().isoformat()
                message.save()
        except Exception:
            pass


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling real-time notifications.
    """
    
    async def connect(self):
        """Accept WebSocket connection for notifications."""
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.user = self.scope['user']
        
        # Authenticate user and verify they can access these notifications
        if not self.user.is_authenticated or str(self.user.id) != self.user_id:
            await self.close()
            return
            
        self.notification_group_name = f'notifications_{self.user_id}'
        
        # Join notification group
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if hasattr(self, 'notification_group_name'):
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Process received notification commands."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'mark_notification_read':
                await self.mark_notification_read(data.get('notification_id'))
                
        except json.JSONDecodeError:
            pass

    # Event handlers
    async def notification_broadcast(self, event):
        """Send notification to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': event['notification']
        }))

    @database_sync_to_async
    def mark_notification_read(self, notification_id: str):
        """Mark notification as read."""
        try:
            notification = Notification.objects.get(
                id=notification_id,
                user=self.user
            )
            notification.read = True
            notification.save()
        except ObjectDoesNotExist:
            pass


class UpdateConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling general system updates (project status, etc).
    """
    
    async def connect(self):
        """Accept WebSocket connection for updates."""
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.user = self.scope['user']
        
        # Authenticate user
        if not self.user.is_authenticated or str(self.user.id) != self.user_id:
            await self.close()
            return
            
        self.updates_group_name = f'updates_{self.user_id}'
        
        # Join updates group
        await self.channel_layer.group_add(
            self.updates_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if hasattr(self, 'updates_group_name'):
            await self.channel_layer.group_discard(
                self.updates_group_name,
                self.channel_name
            )

    # Event handlers
    async def project_update(self, event):
        """Send project update to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'project_update',
            'data': event['update']
        }))

    async def payment_update(self, event):
        """Send payment update to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'payment_update',
            'data': event['update']
        }))

    async def system_update(self, event):
        """Send system update to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'system_update',
            'data': event['update']
        }))


