"""
URLs para o sistema de mensageria e notificações.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_messaging import (
    ConversationViewSet,
    MessageConversationViewSet,
    SystemNotificationViewSet,
    NotificationPreferencesViewSet
)

# Router para ViewSets
router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'messages', MessageConversationViewSet, basename='message')
router.register(r'notifications', SystemNotificationViewSet, basename='notification')
router.register(r'notification-preferences', NotificationPreferencesViewSet, basename='notification-preferences')

app_name = 'messaging'

urlpatterns = [
    path('', include(router.urls)),
]


