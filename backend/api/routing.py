"""
WebSocket routing configuration for real-time messaging system.
"""

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Chat WebSocket - connects users to conversations
    re_path(r'ws/chat/(?P<conversation_id>[0-9a-f-]+)/$', consumers.ChatConsumer.as_asgi()),
    
    # Notifications WebSocket - broadcasts to specific users
    re_path(r'ws/notifications/(?P<user_id>[0-9a-f-]+)/$', consumers.NotificationConsumer.as_asgi()),
    
    # General updates WebSocket - project updates, status changes
    re_path(r'ws/updates/(?P<user_id>[0-9a-f-]+)/$', consumers.UpdateConsumer.as_asgi()),
]


