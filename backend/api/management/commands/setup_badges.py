"""
Comando para criar badges e conquistas padrão do sistema
"""

from django.core.management.base import BaseCommand
from api.models import BadgeType, Achievement
from django.utils.text import slugify


class Command(BaseCommand):
    help = 'Cria badges e conquistas padrão do sistema'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Remove todos os badges existentes antes de criar novos'
        )

    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write('Removendo badges existentes...')
            BadgeType.objects.all().delete()
            Achievement.objects.all().delete()

        self.stdout.write('Criando badges padrão...')
        
        # Badges de Verificação
        verification_badges = [
            {
                'name': 'Email Verificado',
                'description': 'Verificou seu endereço de email',
                'category': 'verification',
                'rarity': 'common',
                'icon': '📧',
                'color': '#10b981',
                'xp_reward': 10,
                'requirements': {'email_verified': True}
            },
            {
                'name': 'Identidade Verificada',
                'description': 'Passou pela verificação KYC com sucesso',
                'category': 'verification',
                'rarity': 'uncommon',
                'icon': '🆔',
                'color': '#3b82f6',
                'xp_reward': 50,
                'requirements': {'kyc_verified': True}
            },
            {
                'name': 'Profissional Verificado',
                'description': 'Verificou suas credenciais profissionais',
                'category': 'verification',
                'rarity': 'rare',
                'icon': '👔',
                'color': '#8b5cf6',
                'xp_reward': 100,
                'requirements': {'professional_verified': True}
            },
        ]
        
        # Badges de Performance
        performance_badges = [
            {
                'name': 'Primeira Venda',
                'description': 'Concluiu seu primeiro projeto com sucesso',
                'category': 'performance',
                'rarity': 'common',
                'icon': '🎯',
                'color': '#f59e0b',
                'xp_reward': 25,
                'requirements': {'min_projects': 1}
            },
            {
                'name': 'Vendedor Experiente',
                'description': 'Concluiu 10 projetos com sucesso',
                'category': 'performance',
                'rarity': 'uncommon',
                'icon': '🏆',
                'color': '#f59e0b',
                'xp_reward': 100,
                'requirements': {'min_projects': 10}
            },
            {
                'name': 'Expert',
                'description': 'Concluiu 50 projetos com excelência',
                'category': 'performance',
                'rarity': 'rare',
                'icon': '⭐',
                'color': '#fbbf24',
                'xp_reward': 250,
                'requirements': {'min_projects': 50, 'min_rating': 4.5}
            },
            {
                'name': 'Mestre',
                'description': 'Concluiu 100 projetos mantendo alta qualidade',
                'category': 'performance',
                'rarity': 'epic',
                'icon': '👑',
                'color': '#a855f7',
                'xp_reward': 500,
                'requirements': {'min_projects': 100, 'min_rating': 4.7}
            },
            {
                'name': 'Lenda',
                'description': 'Concluiu 500 projetos com excelência absoluta',
                'category': 'performance',
                'rarity': 'legendary',
                'icon': '🌟',
                'color': '#f97316',
                'xp_reward': 1000,
                'requirements': {'min_projects': 500, 'min_rating': 4.8}
            },
        ]
        
        # Badges de Qualidade
        quality_badges = [
            {
                'name': 'Pontualidade',
                'description': 'Entrega projetos sempre no prazo',
                'category': 'performance',
                'rarity': 'uncommon',
                'icon': '⏰',
                'color': '#06b6d4',
                'xp_reward': 75,
                'requirements': {'min_completion_rate': 0.95, 'min_projects': 5}
            },
            {
                'name': 'Avaliação 5 Estrelas',
                'description': 'Mantém avaliação média superior a 4.8',
                'category': 'performance',
                'rarity': 'rare',
                'icon': '⭐',
                'color': '#fbbf24',
                'xp_reward': 150,
                'requirements': {'min_rating': 4.8, 'min_projects': 10}
            },
            {
                'name': 'Resposta Rápida',
                'description': 'Responde clientes em menos de 2 horas',
                'category': 'engagement',
                'rarity': 'uncommon',
                'icon': '⚡',
                'color': '#eab308',
                'xp_reward': 50,
                'requirements': {'max_response_time_hours': 2}
            },
        ]
        
        # Badges de Engajamento
        engagement_badges = [
            {
                'name': 'Streak 7 Dias',
                'description': 'Ativo na plataforma por 7 dias consecutivos',
                'category': 'engagement',
                'rarity': 'common',
                'icon': '🔥',
                'color': '#ef4444',
                'xp_reward': 35,
                'requirements': {'min_streak': 7},
                'is_stackable': True,
                'max_count': 10
            },
            {
                'name': 'Streak 30 Dias',
                'description': 'Ativo na plataforma por 30 dias consecutivos',
                'category': 'engagement',
                'rarity': 'rare',
                'icon': '🔥',
                'color': '#dc2626',
                'xp_reward': 200,
                'requirements': {'min_streak': 30},
                'is_stackable': True,
                'max_count': 5
            },
            {
                'name': 'Early Adopter',
                'description': 'Entre os primeiros 1000 usuários da plataforma',
                'category': 'special',
                'rarity': 'epic',
                'icon': '🚀',
                'color': '#7c3aed',
                'xp_reward': 100,
                'requirements': {'within_days': 30}  # Primeiros 30 dias
            },
        ]
        
        # Badges de Nível
        level_badges = [
            {
                'name': 'Cadastro Básico',
                'description': 'Bem-vindo à GalaxIA!',
                'category': 'milestone',
                'rarity': 'common',
                'icon': '🌱',
                'color': '#22c55e',
                'xp_reward': 0,
                'requirements': {'min_level': 'basic'}
            },
            {
                'name': 'Identidade Verificada',
                'description': 'Sua identidade foi verificada com sucesso',
                'category': 'milestone',
                'rarity': 'uncommon',
                'icon': '🛡️',
                'color': '#3b82f6',
                'xp_reward': 50,
                'requirements': {'min_level': 'verified'}
            },
            {
                'name': 'Profissional Verificado',
                'description': 'Profissional com credenciais validadas',
                'category': 'milestone',
                'rarity': 'rare',
                'icon': '💼',
                'color': '#8b5cf6',
                'xp_reward': 100,
                'requirements': {'min_level': 'professional'}
            },
            {
                'name': 'Especialista',
                'description': 'Reconhecido como especialista na área',
                'category': 'milestone',
                'rarity': 'epic',
                'icon': '🎓',
                'color': '#a855f7',
                'xp_reward': 200,
                'requirements': {'min_level': 'expert'}
            },
            {
                'name': 'GalaxIA Elite',
                'description': 'Membro da elite da GalaxIA',
                'category': 'milestone',
                'rarity': 'legendary',
                'icon': '👑',
                'color': '#f97316',
                'xp_reward': 500,
                'requirements': {'min_level': 'elite'}
            },
            {
                'name': 'Lenda Viva',
                'description': 'Status lendário alcançado',
                'category': 'milestone',
                'rarity': 'legendary',
                'icon': '🌟',
                'color': '#fbbf24',
                'xp_reward': 1000,
                'requirements': {'min_level': 'legend'}
            },
        ]
        
        # Badges Sazonais/Especiais
        seasonal_badges = [
            {
                'name': 'Lançamento 2025',
                'description': 'Participou do lançamento oficial em 2025',
                'category': 'seasonal',
                'rarity': 'epic',
                'icon': '🎉',
                'color': '#ec4899',
                'xp_reward': 200,
                'requirements': {'within_days': 90}  # Primeiros 3 meses
            },
            {
                'name': 'Beta Tester',
                'description': 'Ajudou a testar a plataforma na fase beta',
                'category': 'special',
                'rarity': 'rare',
                'icon': '🧪',
                'color': '#06b6d4',
                'xp_reward': 150,
                'requirements': {}  # Concedido manualmente
            },
        ]
        
        # Criar todos os badges
        all_badges = (
            verification_badges + 
            performance_badges + 
            quality_badges + 
            engagement_badges + 
            level_badges + 
            seasonal_badges
        )
        
        created_count = 0
        for badge_data in all_badges:
            slug = slugify(badge_data['name'])
            badge, created = BadgeType.objects.get_or_create(
                slug=slug,
                defaults={
                    **badge_data,
                    'slug': slug
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Badge criado: {badge.icon} {badge.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'↻ Badge já existe: {badge.icon} {badge.name}')
                )
        
        # Criar conquistas especiais
        achievements_data = [
            {
                'name': 'Primeiro Milhão',
                'description': 'Ganhou R$ 1.000.000 na plataforma',
                'achievement_type': 'milestone',
                'icon': '💰',
                'xp_reward': 5000,
                'requirements': {'min_earnings': 1000000}
            },
            {
                'name': 'Cliente Fiel',
                'description': 'Ativo na plataforma por mais de 1 ano',
                'achievement_type': 'milestone',
                'icon': '🏅',
                'xp_reward': 1000,
                'requirements': {'min_days_active': 365}
            },
            {
                'name': 'Mentor',
                'description': 'Ajudou outros profissionais a crescer',
                'achievement_type': 'special',
                'icon': '🎯',
                'xp_reward': 500,
                'requirements': {'referrals_count': 10}
            },
        ]
        
        achievements_created = 0
        for achievement_data in achievements_data:
            achievement, created = Achievement.objects.get_or_create(
                name=achievement_data['name'],
                defaults=achievement_data
            )
            
            if created:
                achievements_created += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Conquista criada: {achievement.icon} {achievement.name}')
                )
        
        # Resumo
        self.stdout.write('\n' + '='*60)
        self.stdout.write(f'✅ Setup de badges concluído!')
        self.stdout.write(f'📊 Badges criados: {created_count}')
        self.stdout.write(f'🏆 Conquistas criadas: {achievements_created}')
        self.stdout.write(f'📈 Total de badges no sistema: {BadgeType.objects.count()}')
        
        # Estatísticas por categoria
        self.stdout.write('\n📋 Badges por categoria:')
        for category, display_name in BadgeType.BADGE_CATEGORIES:
            count = BadgeType.objects.filter(category=category).count()
            if count > 0:
                self.stdout.write(f'   {display_name}: {count}')
        
        # Estatísticas por raridade
        self.stdout.write('\n✨ Badges por raridade:')
        for rarity, display_name in BadgeType.BADGE_RARITIES:
            count = BadgeType.objects.filter(rarity=rarity).count()
            if count > 0:
                self.stdout.write(f'   {display_name}: {count}')
        
        self.stdout.write('\n🚀 Próximos passos:')
        self.stdout.write('1. Execute as migrações: python manage.py migrate')
        self.stdout.write('2. Teste o sistema: python manage.py shell')
        self.stdout.write('3. Configure tarefas Celery para verificação automática')
        self.stdout.write('4. Monitore badges no Django Admin')