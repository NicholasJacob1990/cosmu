"""
Dashboard Admin Financeiro - Sprint 3-4
Interface administrativa completa para gestão financeira do marketplace
"""
from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum, Count
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.utils import timezone
from decimal import Decimal

from .models import (
    StripeAccount, PaymentMethod, EscrowRelease, PaymentDispute, 
    PayoutSchedule, PaymentIntent, AutoReleaseRule, Transaction
)


# ============================================================================
# Stripe Connect Administration
# ============================================================================

@admin.register(StripeAccount)
class StripeAccountAdmin(admin.ModelAdmin):
    """
    Administração de contas Stripe Connect
    """
    list_display = [
        'user', 'stripe_account_id', 'account_type', 'status_badge', 
        'onboarding_completed', 'can_receive_payments_display', 'created_at'
    ]
    list_filter = [
        'account_type', 'status', 'onboarding_completed', 
        'created_at'
    ]
    search_fields = ['user__email', 'stripe_account_id', 'user__first_name', 'user__last_name']
    readonly_fields = [
        'stripe_account_id', 'capabilities', 'requirements', 'settings',
        'onboarding_completed_at', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('user', 'stripe_account_id', 'account_type', 'status')
        }),
        ('Status da Conta', {
            'fields': ('onboarding_completed', 'onboarding_completed_at', 'can_receive_payments')
        }),
        ('Dados Técnicos', {
            'fields': ('capabilities', 'requirements', 'settings'),
            'classes': ('collapse',)
        }),
        ('Links', {
            'fields': ('onboarding_link',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def status_badge(self, obj):
        """Exibe status com cores"""
        colors = {
            'pending': '#fbbf24',
            'verified': '#10b981', 
            'restricted': '#f59e0b',
            'rejected': '#ef4444'
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def can_receive_payments_display(self, obj):
        """Exibe status de recebimento de pagamentos"""
        return obj.can_receive_payments
    can_receive_payments_display.boolean = True
    can_receive_payments_display.short_description = 'Pode receber pagamentos'

    actions = ['update_account_status']

    def update_account_status(self, request, queryset):
        """Ação para atualizar status das contas via API Stripe"""
        from .services.stripe_connect import StripeConnectService
        
        updated = 0
        for account in queryset:
            result = StripeConnectService.update_account_status(account.stripe_account_id)
            if result['success']:
                updated += 1
        
        self.message_user(request, f'{updated} contas atualizadas com sucesso.')
    update_account_status.short_description = 'Atualizar status via Stripe'


# ============================================================================
# Payment Intents Administration
# ============================================================================

@admin.register(PaymentIntent)
class PaymentIntentAdmin(admin.ModelAdmin):
    """
    Administração de Payment Intents
    """
    list_display = [
        'stripe_payment_intent_id', 'transaction_link', 'amount_display', 
        'status_badge', 'created_at', 'confirmed_at'
    ]
    list_filter = ['status', 'created_at', 'confirmed_at']
    search_fields = ['stripe_payment_intent_id', 'transaction__id']
    readonly_fields = ['stripe_payment_intent_id', 'created_at', 'confirmed_at']
    
    def amount_display(self, obj):
        """Exibe valor formatado"""
        if obj.transaction:
            return f'R$ {obj.transaction.amount:,.2f}'
        return '-'
    amount_display.short_description = 'Valor'

    def status_badge(self, obj):
        """Status com cores"""
        colors = {
            'requires_payment_method': '#f59e0b',
            'requires_confirmation': '#3b82f6',
            'requires_action': '#8b5cf6',
            'processing': '#06b6d4',
            'succeeded': '#10b981',
            'canceled': '#6b7280'
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.status.replace('_', ' ').title()
        )
    status_badge.short_description = 'Status'

    def transaction_link(self, obj):
        """Link para a transação relacionada"""
        if obj.transaction:
            url = reverse('admin:api_transaction_change', args=[obj.transaction.id])
            return format_html('<a href="{}">{}</a>', url, f'Transação #{obj.transaction.id}')
        return '-'
    transaction_link.short_description = 'Transação'


# ============================================================================
# Escrow Administration
# ============================================================================

@admin.register(EscrowRelease)
class EscrowReleaseAdmin(admin.ModelAdmin):
    """
    Administração de liberações de escrow
    """
    list_display = [
        'transaction_link', 'amount_display', 'release_type', 
        'status_badge', 'scheduled_at', 'released_at'
    ]
    list_filter = ['release_type', 'status', 'scheduled_at', 'released_at']
    search_fields = ['transaction__id', 'reason']
    readonly_fields = ['released_at', 'approved_by']

    def amount_display(self, obj):
        return f'R$ {obj.amount:,.2f}'
    amount_display.short_description = 'Valor'

    def status_badge(self, obj):
        colors = {
            'pending': '#f59e0b',
            'completed': '#10b981',
            'failed': '#ef4444',
            'cancelled': '#6b7280'
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def transaction_link(self, obj):
        url = reverse('admin:api_transaction_change', args=[obj.transaction.id])
        return format_html('<a href="{}">{}</a>', url, f'Transação #{obj.transaction.id}')
    transaction_link.short_description = 'Transação'

    actions = ['process_manual_release']

    def process_manual_release(self, request, queryset):
        """Ação para processar liberação manual"""
        from .services.escrow_service import AdvancedEscrowService
        
        processed = 0
        for release in queryset.filter(status='pending'):
            try:
                result = AdvancedEscrowService.release_escrow(
                    transaction_id=release.transaction.id,
                    release_type='manual',
                    notes=f'Liberação manual via admin por {request.user.email}'
                )
                if result['success']:
                    processed += 1
            except Exception as e:
                self.message_user(request, f'Erro ao processar {release}: {str(e)}', level='ERROR')
        
        if processed > 0:
            self.message_user(request, f'{processed} liberações processadas com sucesso.')
    process_manual_release.short_description = 'Processar liberação manual'


# ============================================================================
# Disputes Administration
# ============================================================================

@admin.register(PaymentDispute)
class PaymentDisputeAdmin(admin.ModelAdmin):
    """
    Administração de disputas de pagamento
    """
    list_display = [
        'transaction_link', 'category', 'status_badge', 
        'initiated_by', 'created_at', 'resolved_at'
    ]
    list_filter = ['category', 'status', 'created_at', 'resolved_at']
    search_fields = ['transaction__id', 'title', 'description', 'resolution_notes']
    readonly_fields = ['created_at', 'resolved_at']

    fieldsets = (
        ('Informações da Disputa', {
            'fields': ('transaction', 'category', 'title', 'description', 'initiated_by')
        }),
        ('Partes Envolvidas', {
            'fields': ('client', 'freelancer')
        }),
        ('Status e Resolução', {
            'fields': ('status', 'resolution_type', 'resolution_notes', 'resolved_at')
        }),
        ('Evidências', {
            'fields': ('evidence_urls',),
            'classes': ('collapse',)
        })
    )

    def status_badge(self, obj):
        colors = {
            'open': '#f59e0b',
            'under_review': '#3b82f6',
            'resolved': '#10b981',
            'closed': '#6b7280'
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def transaction_link(self, obj):
        url = reverse('admin:api_transaction_change', args=[obj.transaction.id])
        return format_html('<a href="{}">{}</a>', url, f'Transação #{obj.transaction.id}')
    transaction_link.short_description = 'Transação'


# ============================================================================
# Auto Release Rules Administration
# ============================================================================

@admin.register(AutoReleaseRule)
class AutoReleaseRuleAdmin(admin.ModelAdmin):
    """
    Administração de regras de liberação automática
    """
    list_display = [
        'name', 'priority', 'condition_display', 'timeout_days', 
        'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['priority']

    def condition_display(self, obj):
        """Exibe condições de forma legível"""
        conditions = obj.conditions
        if isinstance(conditions, dict):
            return ', '.join([f'{k}: {v}' for k, v in conditions.items()])
        return str(conditions)
    condition_display.short_description = 'Condições'


# ============================================================================
# Payment Methods & Payout Schedule
# ============================================================================

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['user', 'method_type', 'is_default', 'is_active', 'created_at']
    list_filter = ['method_type', 'is_default', 'is_active']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']


@admin.register(PayoutSchedule)
class PayoutScheduleAdmin(admin.ModelAdmin):
    list_display = ['stripe_account', 'interval', 'delay_days', 'minimum_amount', 'auto_payout_enabled']
    list_filter = ['interval', 'auto_payout_enabled']
    search_fields = ['stripe_account__user__email']


# ============================================================================
# Configurações do Admin
# ============================================================================

# Customizar título do admin
admin.site.site_header = 'GalaxIA - Dashboard Financeiro'
admin.site.site_title = 'GalaxIA Admin'
admin.site.index_title = 'Gestão Financeira do Marketplace'