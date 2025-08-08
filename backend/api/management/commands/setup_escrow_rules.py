"""
Comando Django para configurar regras padrão de auto-release do escrow
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from decimal import Decimal
from api.models import AutoReleaseRule


class Command(BaseCommand):
    help = 'Configura regras padrão de auto-release para o sistema de escrow'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Remove regras existentes antes de criar novas',
        )

    def handle(self, *args, **options):
        if options['reset']:
            AutoReleaseRule.objects.all().delete()
            self.stdout.write(
                self.style.WARNING('Regras existentes removidas.')
            )

        # Regras padrão conforme especificado no sprint
        rules_data = [
            {
                'name': 'Regra Padrão',
                'description': 'Regra padrão para todos os projetos - 7 dias',
                'priority': 1,
                'timeout_days': 7,
                'conditions': {
                    'project_completed': True,
                    'no_active_disputes': True,
                    'client_notified': True
                },
                'is_active': True
            },
            {
                'name': 'Design - Liberação Rápida',
                'description': 'Projetos de design têm liberação mais rápida - 5 dias',
                'priority': 5,
                'timeout_days': 5,
                'auto_approve_threshold': Decimal('1000.00'),
                'applies_to_categories': ['design', 'graphic-design', 'logo-design'],
                'conditions': {
                    'project_completed': True,
                    'no_active_disputes': True
                },
                'is_active': True
            },
            {
                'name': 'Desenvolvimento - Liberação Estendida',
                'description': 'Projetos de desenvolvimento têm prazo maior - 10 dias',
                'priority': 5,
                'timeout_days': 10,
                'applies_to_categories': ['development', 'web-development', 'mobile-development'],
                'conditions': {
                    'project_completed': True,
                    'no_active_disputes': True,
                    'milestone_based': True
                },
                'is_active': True
            },
            {
                'name': 'Consultoria - Liberação Imediata',
                'description': 'Consultorias têm liberação rápida - 3 dias',
                'priority': 4,
                'timeout_days': 3,
                'applies_to_categories': ['consulting', 'business-consulting'],
                'conditions': {
                    'project_completed': True,
                    'immediate_release': True
                },
                'is_active': True
            },
            {
                'name': 'Elite Freelancers - Liberação Expressa',
                'description': 'Freelancers elite têm liberação em 2 dias',
                'priority': 8,
                'timeout_days': 2,
                'auto_approve_threshold': Decimal('5000.00'),
                'applies_to_user_levels': ['elite', 'top-rated-plus'],
                'conditions': {
                    'project_completed': True,
                    'freelancer_level': 'elite'
                },
                'is_active': True
            },
            {
                'name': 'Freelancers Verificados - Liberação Acelerada',
                'description': 'Freelancers verificados têm liberação em 5 dias',
                'priority': 6,
                'timeout_days': 5,
                'applies_to_user_levels': ['verified', 'top-rated'],
                'conditions': {
                    'project_completed': True,
                    'freelancer_level': 'verified'
                },
                'is_active': True
            },
            {
                'name': 'Freelancers Básicos - Liberação Padrão',
                'description': 'Freelancers básicos têm liberação em 10 dias com revisão manual para valores altos',
                'priority': 3,
                'timeout_days': 10,
                'requires_manual_review': True,
                'applies_to_user_levels': ['basic', 'new'],
                'max_amount': Decimal('2000.00'),
                'conditions': {
                    'project_completed': True,
                    'manual_review_threshold': 2000
                },
                'is_active': True
            },
            {
                'name': 'Projetos Alto Valor - Revisão Manual',
                'description': 'Projetos acima de R$ 15.000 requerem revisão manual',
                'priority': 10,
                'timeout_days': 15,
                'requires_manual_review': True,
                'min_amount': Decimal('15000.00'),
                'conditions': {
                    'high_value_project': 15000,
                    'manual_review_required': True
                },
                'is_active': True
            },
            {
                'name': 'Clientes Novos - Prazo Estendido',
                'description': 'Clientes novos têm prazo estendido em 2 dias',
                'priority': 7,
                'timeout_days': 9,
                'conditions': {
                    'project_completed': True,
                    'new_client': True,
                    'extend_timeout': 2
                },
                'is_active': True
            },
            {
                'name': 'Histórico de Disputas - Revisão Obrigatória',
                'description': 'Usuários com histórico de disputas requerem revisão manual',
                'priority': 9,
                'timeout_days': 14,
                'requires_manual_review': True,
                'conditions': {
                    'dispute_history': True,
                    'manual_review_required': True
                },
                'is_active': True
            }
        ]

        created_count = 0
        with transaction.atomic():
            for rule_data in rules_data:
                rule, created = AutoReleaseRule.objects.get_or_create(
                    name=rule_data['name'],
                    defaults=rule_data
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Criada regra: {rule.name}')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'- Regra já existe: {rule.name}')
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Setup concluído! {created_count} novas regras criadas.'
            )
        )
        
        # Exibir resumo das regras
        self.stdout.write('\n📋 RESUMO DAS REGRAS ATIVAS:')
        active_rules = AutoReleaseRule.objects.filter(is_active=True).order_by('-priority')
        
        for rule in active_rules:
            timeout_info = f"{rule.timeout_days} dias"
            if rule.auto_approve_threshold:
                timeout_info += f" (auto-approve até R$ {rule.auto_approve_threshold})"
            if rule.requires_manual_review:
                timeout_info += " + revisão manual"
                
            self.stdout.write(
                f"  • {rule.name} (Prioridade {rule.priority}): {timeout_info}"
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Sistema de auto-release configurado com {active_rules.count()} regras ativas!'
            )
        )