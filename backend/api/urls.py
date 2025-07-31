from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'api'

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.register_view, name='register'),
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
    
    # ServicePackage endpoints
    path('services/', views.ServicePackageListCreateView.as_view(), name='service-list-create'),
    path('services/<uuid:pk>/', views.ServicePackageDetailView.as_view(), name='service-detail'),
    
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
]