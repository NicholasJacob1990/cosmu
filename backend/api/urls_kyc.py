"""
URLs para Sistema KYC (Know Your Customer) - GalaxIA Marketplace
"""

from django.urls import path
from . import views_kyc
from .views.kyc_integration import (
    kyc_recommend_provider, stripe_create_session, idwall_widget_config,
    unico_capture_config, process_sdk_result, kyc_status
)
# from .views.webhook_views import (
#     IdwallWebhookView, UnicoWebhookView, stripe_identity_webhook,
#     webhook_health_check, WebhookMetricsView, test_webhook_endpoint
# )
from django.conf import settings

app_name = 'kyc'

urlpatterns = [
    # User endpoints
    path('upload/document/', views_kyc.upload_document, name='upload_document'),
    path('upload/biometric/', views_kyc.upload_biometric, name='upload_biometric'),
    path('status/', views_kyc.verification_status, name='verification_status'),
    path('documents/', views_kyc.user_documents, name='user_documents'),
    path('levels/', views_kyc.verification_levels, name='verification_levels'),
    path('retry/<uuid:document_id>/', views_kyc.retry_verification, name='retry_verification'),
    
    # Admin endpoints
    path('admin/pending/', views_kyc.pending_verifications, name='pending_verifications'),
    path('admin/approve/<uuid:document_id>/', views_kyc.manual_approve_document, name='manual_approve_document'),
    
    # SDK Integration endpoints
    path('recommend/', kyc_recommend_provider, name='recommend_provider'),
    path('stripe/session/', stripe_create_session, name='stripe_session'),
    path('idwall/config/', idwall_widget_config, name='idwall_config'),
    path('unico/config/', unico_capture_config, name='unico_config'),
    path('sdk/result/', process_sdk_result, name='sdk_result'),
    path('user/status/', kyc_status, name='user_status'),
    
    # Webhook endpoints (temporariamente comentados)
    # path('webhooks/idwall/', IdwallWebhookView.as_view(), name='idwall_webhook'),
    # path('webhooks/unico/', UnicoWebhookView.as_view(), name='unico_webhook'),
    # path('webhooks/stripe-identity/', stripe_identity_webhook, name='stripe_identity_webhook'),
    # path('webhooks/health/', webhook_health_check, name='webhook_health'),
    # path('webhooks/metrics/', WebhookMetricsView.as_view(), name='webhook_metrics'),
]

# Test endpoint apenas em desenvolvimento
# if settings.DEBUG:
#     urlpatterns.append(
#         path('webhooks/test/', test_webhook_endpoint, name='test_webhook')
#     )