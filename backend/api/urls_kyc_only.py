from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'api'

urlpatterns = [
    # Basic working endpoints only
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    
    # KYC system
    path('kyc/', include('api.urls_kyc')),
    
    # Badges and gamification
    path('badges/', include('api.urls_badges')),
    
    # Escrow system
    path('escrow/', include('api.urls_escrow')),
    
    # Stripe Connect system
    path('stripe/', include('api.urls_stripe')),
    
    # KYC Dashboard (simplified for now)
    # path('kyc/dashboard/', include([
    #     path('overview/', views.kyc_dashboard.kyc_provider_dashboard, name='kyc-dashboard'),
    #     path('analytics/', views.kyc_dashboard.kyc_routing_analytics, name='kyc-analytics'),
    #     path('settings/', views.kyc_dashboard.adjust_kyc_settings, name='kyc-settings'),
    # ])),
]