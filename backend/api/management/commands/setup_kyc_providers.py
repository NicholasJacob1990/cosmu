"""
Comando de gerenciamento para configurar provedores KYC iniciais
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from api.models import VerificationProvider


class Command(BaseCommand):
    help = 'Configura provedores KYC iniciais no banco de dados'

    def add_arguments(self, parser):
        parser.add_argument(
            '--update',
            action='store_true',
            help='Atualiza provedores existentes',
        )

    def handle(self, *args, **options):
        self.stdout.write('Configurando provedores KYC...')
        
        providers_config = [
            {
                'name': 'Idwall',
                'slug': 'idwall',
                'api_endpoint': 'https://api.idwall.co/v2/',
                'api_key_field': 'Authorization',
                'supports_documents': True,
                'supports_biometric': False,
                'supports_address': True,
                'supports_brazil': True,
                'cost_per_verification': 2.50,
                'monthly_limit': 10000,
                'settings': {
                    'document_types': ['rg', 'cnh', 'cpf', 'cnpj'],
                    'response_format': 'json',
                    'webhook_events': ['verification.completed', 'verification.failed']
                }
            },
            {
                'name': 'Unico',
                'slug': 'unico',
                'api_endpoint': 'https://api.unico.io/v1/',
                'api_key_field': 'X-API-Key',
                'supports_documents': True,
                'supports_biometric': True,
                'supports_address': False,
                'supports_brazil': True,
                'cost_per_verification': 3.00,
                'monthly_limit': 5000,
                'settings': {
                    'document_types': ['rg', 'cnh', 'passport'],
                    'biometric_types': ['selfie', 'liveness'],
                    'confidence_threshold': 0.85
                }
            },
            {
                'name': 'Stripe Identity',
                'slug': 'stripe',
                'api_endpoint': 'https://api.stripe.com/v1/',
                'api_key_field': 'Authorization',
                'supports_documents': True,
                'supports_biometric': True,
                'supports_address': True,
                'supports_brazil': True,
                'cost_per_verification': 1.50,  # USD
                'monthly_limit': None,
                'settings': {
                    'document_types': ['passport', 'driving_license', 'id_card'],
                    'countries_supported': 120,
                    'webhook_events': [
                        'identity.verification_session.verified',
                        'identity.verification_session.requires_input'
                    ]
                }
            }
        ]

        created_count = 0
        updated_count = 0

        for provider_data in providers_config:
            # Verificar se provedor está habilitado na configuração
            provider_settings = settings.KYC_PROVIDERS.get(provider_data['slug'], {})
            is_enabled = provider_settings.get('enabled', False)
            
            provider, created = VerificationProvider.objects.get_or_create(
                slug=provider_data['slug'],
                defaults={
                    **provider_data,
                    'is_active': is_enabled
                }
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Provedor {provider.name} criado (ativo: {provider.is_active})'
                    )
                )
            elif options['update']:
                # Atualizar provedor existente
                for key, value in provider_data.items():
                    if key != 'slug':  # Não atualizar o slug
                        setattr(provider, key, value)
                
                provider.is_active = is_enabled
                provider.save()
                updated_count += 1
                
                self.stdout.write(
                    self.style.WARNING(
                        f'↻ Provedor {provider.name} atualizado (ativo: {provider.is_active})'
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f'- Provedor {provider.name} já existe (use --update para atualizar)'
                    )
                )

        # Verificar configuração de API keys
        self.stdout.write('\n' + '='*50)
        self.stdout.write('Verificando configuração de API keys:')
        
        for provider in VerificationProvider.objects.all():
            provider_settings = settings.KYC_PROVIDERS.get(provider.slug, {})
            has_api_key = bool(provider_settings.get('api_key', ''))
            has_webhook_secret = bool(provider_settings.get('webhook_secret', ''))
            
            status_icon = '✓' if (has_api_key and provider.is_active) else '✗'
            webhook_icon = '✓' if has_webhook_secret else '✗'
            
            self.stdout.write(
                f'{status_icon} {provider.name}: '
                f'API Key: {"✓" if has_api_key else "✗"} | '
                f'Webhook: {webhook_icon} | '
                f'Ativo: {"✓" if provider.is_active else "✗"}'
            )

        # Resumo
        self.stdout.write('\n' + '='*50)
        self.stdout.write(f'Provedores criados: {created_count}')
        self.stdout.write(f'Provedores atualizados: {updated_count}')
        
        active_providers = VerificationProvider.objects.filter(is_active=True).count()
        self.stdout.write(f'Provedores ativos: {active_providers}')
        
        if active_providers == 0:
            self.stdout.write(
                self.style.ERROR(
                    '\n⚠️  ATENÇÃO: Nenhum provedor está ativo! '
                    'Configure as API keys no arquivo .env e execute novamente.'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n🎉 Setup concluído! {active_providers} provedor(es) ativo(s).'
                )
            )

        # Instruções adicionais
        self.stdout.write('\n' + '='*50)
        self.stdout.write('Próximos passos:')
        self.stdout.write('1. Configure as API keys no arquivo .env')
        self.stdout.write('2. Execute: python manage.py migrate')
        self.stdout.write('3. Inicie o worker Celery: celery -A galax_ia_project worker --loglevel=info')
        self.stdout.write('4. Inicie o scheduler: celery -A galax_ia_project beat --loglevel=info')
        self.stdout.write('5. Teste os webhooks: /api/kyc/webhooks/health/')
        
        self.stdout.write(
            self.style.SUCCESS('\nSistema KYC pronto para uso! 🚀')
        )