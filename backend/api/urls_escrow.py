"""
URLs para Sistema de Escrow Avançado - Sprint 3-4
Endpoints para gestão completa de escrow, aprovações e disputas
"""
from django.urls import path
from .views.escrow_views import (
    create_escrow_payment,
    approve_delivery,
    open_dispute,
    escrow_status,
    ClientEscrowDashboardView,
    FreelancerEscrowDashboardView,
    DisputeListView,
    add_dispute_evidence,
    escrow_metrics
)

app_name = 'escrow'

urlpatterns = [
    # ========================================================================
    # Endpoints principais de Escrow
    # ========================================================================
    
    # Criar pagamento em escrow
    path('create/', create_escrow_payment, name='create-escrow'),
    
    # Aprovar entrega e liberar fundos
    path('approve/<uuid:transaction_id>/', approve_delivery, name='approve-delivery'),
    
    # Status detalhado do escrow
    path('status/<uuid:transaction_id>/', escrow_status, name='escrow-status'),
    
    # Métricas pessoais do usuário
    path('metrics/', escrow_metrics, name='escrow-metrics'),
    
    # ========================================================================
    # Sistema de Disputas
    # ========================================================================
    
    # Abrir disputa
    path('dispute/<uuid:transaction_id>/', open_dispute, name='open-dispute'),
    
    # Listar disputas do usuário
    path('disputes/', DisputeListView.as_view(), name='list-disputes'),
    
    # Adicionar evidência a disputa
    path('disputes/<uuid:dispute_id>/evidence/', add_dispute_evidence, name='add-evidence'),
    
    # ========================================================================
    # Dashboards
    # ========================================================================
    
    # Dashboard do cliente
    path('dashboard/client/', ClientEscrowDashboardView.as_view(), name='client-dashboard'),
    
    # Dashboard do freelancer
    path('dashboard/freelancer/', FreelancerEscrowDashboardView.as_view(), name='freelancer-dashboard'),
]