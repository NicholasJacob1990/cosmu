"""
Comando para configurar sistema multi-provider KYC inteligente
Cria configurações baseadas na estratégia de custo-benefício otimizada
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from api.models import KYCProviderStats, KYCProviderConfig
from decimal import Decimal


class Command(BaseCommand):
    help = 'Configura sistema multi-provider KYC com roteamento inteligente'

    def add_arguments(self, parser):
        parser.add_argument(
            '--phase',
            choices=['mvp', 'growth', 'scale'],
            default='mvp',
            help='Fase do marketplace (mvp, growth, scale)'
        )
        parser.add_argument(
            '--monthly-budget',
            type=int,
            default=5000,
            help='Orçamento mensal total para KYC (BRL)'
        )

    def handle(self, *args, **options):
        phase = options['phase']
        monthly_budget = options['monthly_budget']
        
        self.stdout.write(f'Configurando sistema multi-provider KYC para fase: {phase}')
        
        # Configurações por fase
        phase_configs = {
            'mvp': {
                'stripe': {'budget': monthly_budget * 0.4, 'priority': 80, 'free_tier': 50},
                'idwall': {'budget': monthly_budget * 0.4, 'priority': 70, 'free_tier': 0},
                'unico': {'budget': monthly_budget * 0.1, 'priority': 60, 'free_tier': 0},
                'datavalid': {'budget': monthly_budget * 0.1, 'priority': 50, 'free_tier': 0}
            },
            'growth': {
                'idwall': {'budget': monthly_budget * 0.5, 'priority': 80, 'free_tier': 0},
                'stripe': {'budget': monthly_budget * 0.2, 'priority': 70, 'free_tier': 50},
                'unico': {'budget': monthly_budget * 0.2, 'priority': 60, 'free_tier': 0},
                'datavalid': {'budget': monthly_budget * 0.1, 'priority': 50, 'free_tier': 0}
            },
            'scale': {
                'unico': {'budget': monthly_budget * 0.4, 'priority': 80, 'free_tier': 0},
                'datavalid': {'budget': monthly_budget * 0.3, 'priority': 70, 'free_tier': 0},
                'idwall': {'budget': monthly_budget * 0.2, 'priority': 60, 'free_tier': 0},
                'stripe': {'budget': monthly_budget * 0.1, 'priority': 50, 'free_tier': 50}
            }
        }
        
        configs = phase_configs[phase]
        
        # Criar/atualizar configurações de provedores
        self.create_provider_configs()
        
        # Criar/atualizar estatísticas de provedores
        created_count = 0
        updated_count = 0
        
        for provider_name, config in configs.items():
            stats, created = KYCProviderStats.objects.get_or_create(
                name=provider_name,
                defaults={
                    'monthly_budget': Decimal(str(config['budget'])),
                    'free_tier_limit': config['free_tier'],
                    'is_active': True
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Criado {provider_name}: orçamento R$ {config["budget"]:.0f}, '
                        f'free tier: {config["free_tier"]}'
                    )
                )
            else:
                # Atualizar orçamento
                stats.monthly_budget = Decimal(str(config['budget']))
                stats.free_tier_limit = config['free_tier']
                stats.save()
                updated_count += 1
                
                self.stdout.write(
                    self.style.WARNING(
                        f'↻ Atualizado {provider_name}: orçamento R$ {config["budget"]:.0f}'
                    )
                )
        
        # Configurar prioridades nas configurações
        for provider_name, config in configs.items():
            try:
                provider_config = KYCProviderConfig.objects.get(name=provider_name)
                provider_config.priority = config['priority']
                provider_config.save()
            except KYCProviderConfig.DoesNotExist:
                pass
        
        # Resumo final
        self.stdout.write('\n' + '='*60)
        self.stdout.write(f'✅ Setup concluído para fase: {phase.upper()}')
        self.stdout.write(f'📊 Provedores criados: {created_count}')
        self.stdout.write(f'📊 Provedores atualizados: {updated_count}')
        self.stdout.write(f'💰 Orçamento total mensal: R$ {monthly_budget:.0f}')
        
        # Mostrar estratégia recomendada
        self.show_strategy_recommendations(phase)
        
        # Comandos para executar
        self.stdout.write('\n' + '='*60)
        self.stdout.write('🚀 Próximos passos:')
        self.stdout.write('1. Configure as API keys no settings/env:')
        for provider in configs.keys():
            if provider == 'stripe':
                self.stdout.write(f'   STRIPE_SECRET_KEY=sk_...')
            elif provider == 'idwall':
                self.stdout.write(f'   IDWALL_API_KEY=...')
            elif provider == 'unico':
                self.stdout.write(f'   UNICO_API_KEY=...')
            elif provider == 'datavalid':
                self.stdout.write(f'   SERPRO_CLIENT_ID=... SERPRO_CLIENT_SECRET=...')
        
        self.stdout.write('\n2. Execute as migrações:')
        self.stdout.write('   python manage.py makemigrations --name multi_kyc')
        self.stdout.write('   python manage.py migrate')
        
        self.stdout.write('\n3. Inicie os workers Celery:')
        self.stdout.write('   celery -A galax_ia_project worker -Q kyc_smart,kyc_optimization,health_checks')
        self.stdout.write('   celery -A galax_ia_project beat')
        
        self.stdout.write('\n4. Monitore o dashboard:')
        self.stdout.write('   /admin/api/kycproviderstats/')
        self.stdout.write('   /api/kyc/metrics/')
        
    def create_provider_configs(self):
        """Cria configurações base dos provedores"""
        
        providers_data = [
            {
                'name': 'stripe',
                'display_name': 'Stripe Identity',
                'supports_documents': True,
                'supports_biometric': True,
                'supports_pep': False,
                'supports_brazil': True,
                'cost_per_document': Decimal('7.50'),  # ~US$ 1.50 * 5.0
                'cost_per_biometric': Decimal('0.00'),  # Incluído
                'enabled': True,
                'max_daily_volume': 1000,
                'timeout_seconds': 30,
                'settings': {
                    'free_tier_monthly': 50,
                    'currency': 'USD',
                    'exchange_rate': 5.0,
                    'document_types': ['passport', 'driving_license', 'id_card']
                }
            },
            {
                'name': 'idwall',
                'display_name': 'Idwall',
                'supports_documents': True,
                'supports_biometric': True,
                'supports_pep': True,
                'supports_brazil': True,
                'cost_per_document': Decimal('2.40'),
                'cost_per_biometric': Decimal('0.50'),
                'enabled': True,
                'max_daily_volume': 10000,
                'timeout_seconds': 30,
                'settings': {
                    'includes_pep': True,
                    'includes_sanctions': True,
                    'includes_background': True,
                    'document_types': ['rg', 'cnh', 'cpf', 'cnpj', 'passport']
                }
            },
            {
                'name': 'unico',
                'display_name': 'Unico Check',
                'supports_documents': True,
                'supports_biometric': True,
                'supports_pep': False,
                'supports_brazil': True,
                'cost_per_document': Decimal('1.90'),
                'cost_per_biometric': Decimal('0.00'),  # Incluído no preço
                'enabled': True,
                'max_daily_volume': 50000,
                'timeout_seconds': 25,
                'settings': {
                    'biometric_accuracy': 0.99,
                    'liveness_3d': True,
                    'document_types': ['rg', 'cnh', 'passport', 'crnm'],
                    'mobile_sdk': True
                }
            },
            {
                'name': 'datavalid',
                'display_name': 'SERPRO Datavalid',
                'supports_documents': True,
                'supports_biometric': True,
                'supports_pep': False,
                'supports_brazil': True,
                'cost_per_document': Decimal('0.08'),
                'cost_per_biometric': Decimal('0.07'),
                'enabled': False,  # Requer convênio SERPRO
                'max_daily_volume': 100000,
                'timeout_seconds': 35,
                'settings': {
                    'official_source': True,
                    'requires_serpro_contract': True,
                    'document_types': ['cpf', 'cnh'],
                    'oauth2_required': True
                }
            }
        ]
        
        for provider_data in providers_data:
            config, created = KYCProviderConfig.objects.get_or_create(
                name=provider_data['name'],
                defaults=provider_data
            )
            
            if created:
                self.stdout.write(f'✓ Configuração criada: {config.display_name}')
            else:
                # Atualizar custos
                config.cost_per_document = provider_data['cost_per_document']
                config.cost_per_biometric = provider_data['cost_per_biometric']
                config.save()
    
    def show_strategy_recommendations(self, phase: str):
        """Mostra recomendações estratégicas por fase"""
        
        recommendations = {
            'mvp': [
                "🎯 FASE MVP - Foco em validação rápida com custos baixos",
                "• Stripe Identity: Free tier (50/mês) + simplicidade de integração",
                "• Idwall: Backup para documentos BR + PEP incluído",
                "• Volume esperado: < 1.000 verificações/mês",
                "• Custo médio: R$ 2-5 por verificação aprovada"
            ],
            'growth': [
                "🚀 FASE GROWTH - Otimização de custo-benefício",
                "• Idwall: Provedor principal (melhor custo all-in-one)",
                "• Stripe: Documentos internacionais + free tier",
                "• Volume esperado: 1k-10k verificações/mês", 
                "• Custo médio: R$ 2-3 por verificação aprovada"
            ],
            'scale': [
                "⚡ FASE SCALE - Máxima eficiência e acurácia",
                "• Unico: Biometria premium + volume alto",
                "• Datavalid: Documentos oficiais direto SERPRO",
                "• Idwall: PEP/AML especializado",
                "• Volume esperado: > 10k verificações/mês",
                "• Custo médio: R$ 1-2 por verificação aprovada"
            ]
        }
        
        self.stdout.write('\n📋 ESTRATÉGIA RECOMENDADA:')
        for line in recommendations[phase]:
            if line.startswith('🎯') or line.startswith('🚀') or line.startswith('⚡'):
                self.stdout.write(self.style.SUCCESS(line))
            else:
                self.stdout.write(f'   {line}')