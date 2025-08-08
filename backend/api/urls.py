from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'api'

urlpatterns = [
    # Messaging System URLs
    path('messaging/', include('api.urls_messaging')),
    
    # Authentication endpoints
    path('auth/register/', views.register_view, name='register'),
    # path('auth/register-professional/', views.register_professional_view, name='register-professional'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/social/', views.social_auth_view, name='social-auth'),
    
    # Email verification endpoints
    path('auth/verify-email/', views.request_email_verification, name='request-email-verification'),
    path('auth/resend-verification/', views.resend_email_verification, name='resend-email-verification'),
    
    # User profile
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    
    # Dashboard
    path('dashboard/stats/', views.dashboard_stats_view, name='dashboard-stats'),
    
    # FreelancerProfile endpoints
    path('freelancers/', views.FreelancerProfileListCreateView.as_view(), name='freelancer-list-create'),
    path('freelancers/<uuid:pk>/', views.FreelancerProfileDetailView.as_view(), name='freelancer-detail'),
    
    # Category endpoints
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    # path('categories/<int:category_id>/services/', views.category_services_view, name='category-services'),
    
    # ServicePackage endpoints (expandido)
    path('services/', views.ServicePackageListCreateView.as_view(), name='service-list-create'),
    # path('services/search/', views.services_search_view, name='services-search'),
    # path('services/featured/', views.services_featured_view, name='services-featured'),
    path('services/<uuid:pk>/', views.ServicePackageDetailView.as_view(), name='service-detail'),
    # path('services/<uuid:pk>/duplicate/', views.service_duplicate_view, name='service-duplicate'),
    # path('services/<uuid:pk>/status/', views.service_status_view, name='service-status'),
    # path('services/<uuid:pk>/pricing/', views.service_pricing_view, name='service-pricing'),
    # path('services/<uuid:pk>/analytics/', views.service_analytics_view, name='service-analytics'),
    
    # Project endpoints
    path('projects/', views.ProjectListCreateView.as_view(), name='project-list-create'),
    path('projects/<uuid:pk>/', views.ProjectDetailView.as_view(), name='project-detail'),
    
    # Proposal endpoints
    path('proposals/', views.ProposalListCreateView.as_view(), name='proposal-list-create'),
    path('proposals/<uuid:pk>/', views.ProposalDetailView.as_view(), name='proposal-detail'),
    
    # ServiceOrder endpoints
    path('service-orders/', views.ServiceOrderListCreateView.as_view(), name='service-order-list-create'),
    path('service-orders/<uuid:pk>/', views.ServiceOrderDetailView.as_view(), name='service-order-detail'),
    
    # Order endpoints
    path('orders/', views.OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<uuid:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    
    # Review endpoints
    path('reviews/', views.ReviewListCreateView.as_view(), name='review-list-create'),
    path('reviews/<uuid:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),
    
    # Message endpoints
    path('messages/', views.MessageListCreateView.as_view(), name='message-list-create'),
    path('messages/<uuid:pk>/', views.MessageDetailView.as_view(), name='message-detail'),
    
    # Subscription endpoints
    path('subscriptions/', views.SubscriptionListCreateView.as_view(), name='subscription-list-create'),
    
    # Transaction endpoints
    path('transactions/', views.TransactionListView.as_view(), name='transaction-list'),
    
    # Booking System endpoints
    path('availability/', views.availability_view, name='availability'),
    path('availability/<uuid:availability_id>/', views.availability_detail_view, name='availability-detail'),
    path('time-slots/available/', views.available_time_slots_view, name='available-time-slots'),
    path('bookings/', views.booking_view, name='booking'),
    path('bookings/<uuid:booking_id>/', views.booking_detail_view, name='booking-detail'),
    path('booking-change-requests/', views.booking_change_request_view, name='booking-change-request'),
    path('booking-change-requests/<uuid:request_id>/respond/', views.booking_change_request_respond_view, name='booking-change-request-respond'),
    
    # Payment System endpoints
    path('stripe/create-account/', views.stripe_create_account_view, name='stripe-create-account'),
    path('stripe/onboarding-link/', views.stripe_onboarding_link_view, name='stripe-onboarding-link'),
    path('stripe/account-status/', views.stripe_account_status_view, name='stripe-account-status'),
    path('stripe/balance/', views.stripe_balance_view, name='stripe-balance'),
    path('stripe/payout/', views.stripe_payout_view, name='stripe-payout'),
    path('payments/create-intent/', views.create_payment_intent_view, name='create-payment-intent'),
    path('payments/release-escrow/', views.release_escrow_view, name='release-escrow'),
    path('payments/refund-escrow/', views.refund_escrow_view, name='refund-escrow'),
    path('stripe/webhook/', views.stripe_webhook_view, name='stripe-webhook'),
    
    # Dispute System endpoints
    path('disputes/', views.dispute_view, name='dispute-list-create'),
    path('disputes/<uuid:dispute_id>/', views.dispute_detail_view, name='dispute-detail'),
    path('disputes/<uuid:dispute_id>/respond/', views.dispute_respond_view, name='dispute-respond'),
    path('disputes/<uuid:dispute_id>/evidence/', views.dispute_evidence_view, name='dispute-evidence'),
    path('disputes/<uuid:dispute_id>/messages/', views.dispute_message_view, name='dispute-messages'),
    path('disputes/<uuid:dispute_id>/resolve/', views.dispute_resolve_view, name='dispute-resolve'),
    path('disputes/<uuid:dispute_id>/agreement/', views.dispute_agreement_view, name='dispute-agreement'),
    
    # Intelligent Search System endpoints
    path('search/intelligent/', views.intelligent_search_view, name='intelligent-search'),
    path('search/suggestions/', views.search_suggestions_view, name='search-suggestions'),
    path('search/filters/', views.search_filters_view, name='search-filters'),
    path('ai/sync/', views.sync_ai_data_view, name='sync-ai-data'),
    
    # Elasticsearch Traditional Search endpoints
    path('search/elasticsearch/services/', views.elasticsearch_search_services_view, name='elasticsearch-search-services'),
    path('search/elasticsearch/freelancers/', views.elasticsearch_search_freelancers_view, name='elasticsearch-search-freelancers'),
    path('search/elasticsearch/unified/', views.elasticsearch_unified_search_view, name='elasticsearch-unified-search'),
    path('search/elasticsearch/aggregations/', views.elasticsearch_aggregations_view, name='elasticsearch-aggregations'),
    
    # Query Classification for Smart Mode Selection
    path('search/classify/', views.query_classification_view, name='query-classification'),
    
    # KYC (Know Your Customer) endpoints
    path('kyc/', include('api.urls_kyc')),
]