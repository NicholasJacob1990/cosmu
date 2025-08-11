"""
URLs para Stripe Connect - Sprint 3-4
Onboarding, gestão de contas e webhooks
"""
from django.urls import path
from .views.stripe_views import (
    create_stripe_account,
    create_onboarding_link,
    account_status,
    account_balance,
    create_payout,
    PayoutScheduleView,
    stripe_webhook,
    stripe_dashboard,
    create_payment_intent
)

app_name = 'stripe'

urlpatterns = [
    # ========================================================================
    # Onboarding e Gestão de Contas
    # ========================================================================
    
    # Criar conta Stripe Connect
    path('accounts/create/', create_stripe_account, name='create-account'),
    
    # Criar link de onboarding
    path('onboarding/', create_onboarding_link, name='create-onboarding'),
    
    # Status da conta
    path('status/', account_status, name='account-status'),
    
    # Dashboard completo
    path('dashboard/', stripe_dashboard, name='dashboard'),
    
    # ========================================================================
    # Pagamentos (Checkout)
    # ========================================================================
    
    # Criar Payment Intent para o checkout
    path('create-payment-intent/', create_payment_intent, name='create-payment-intent'),

    # ========================================================================
    # Gestão Financeira
    # ========================================================================
    
    # Consultar saldo
    path('balance/', account_balance, name='account-balance'),
    
    # Criar saque
    path('payout/', create_payout, name='create-payout'),
    
    # Configurações de payout
    path('payout-schedule/', PayoutScheduleView.as_view(), name='payout-schedule'),
    
    # ========================================================================
    # Webhooks
    # ========================================================================
    
    # Webhook do Stripe
    path('webhooks/', stripe_webhook, name='webhooks'),
]