"""
Comando de gerenciamento para configurar o sistema de mensageria.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Conversation, MessageConversation, SystemNotification, NotificationPreferences

User = get_user_model()


class Command(BaseCommand):
    help = 'Configura dados iniciais para o sistema de mensageria'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-test-data',
            action='store_true',
            help='Cria dados de teste para demonstração',
        )
        parser.add_argument(
            '--setup-preferences',
            action='store_true',
            help='Cria preferências padrão para usuários existentes',
        )

    def handle(self, *args, **options):
        if options['create_test_data']:
            self.create_test_data()
        
        if options['setup_preferences']:
            self.setup_preferences()
        
        self.stdout.write(
            self.style.SUCCESS('Sistema de mensageria configurado com sucesso!')
        )

    def create_test_data(self):
        """Cria dados de teste para demonstração."""
        self.stdout.write('Criando dados de teste...')
        
        # Criar usuários de teste se não existirem
        client_user, created = User.objects.get_or_create(
            username='cliente_teste',
            defaults={
                'email': 'cliente@teste.com',
                'first_name': 'Carlos',
                'last_name': 'Cliente',
                'user_type': 'client'
            }
        )
        if created:
            client_user.set_password('senha123')
            client_user.save()
            self.stdout.write(f'Usuário cliente criado: {client_user.username}')
        
        freelancer_user, created = User.objects.get_or_create(
            username='freelancer_teste',
            defaults={
                'email': 'freelancer@teste.com',
                'first_name': 'João',
                'last_name': 'Freelancer',
                'user_type': 'freelancer'
            }
        )
        if created:
            freelancer_user.set_password('senha123')
            freelancer_user.save()
            self.stdout.write(f'Usuário freelancer criado: {freelancer_user.username}')
        
        # Criar conversa de teste
        conversation, created = Conversation.objects.get_or_create(
            title='Projeto de Logo - Empresa ABC',
            defaults={
                'conversation_type': 'project',
                'is_active': True
            }
        )
        if created:
            conversation.participants.add(client_user, freelancer_user)
            self.stdout.write(f'Conversa criada: {conversation.title}')
        
        # Criar mensagens de teste
        test_messages = [
            {
                'sender': client_user,
                'content': 'Olá João, tudo bem? Alguma novidade sobre os conceitos do logo?',
            },
            {
                'sender': freelancer_user,
                'content': 'Olá Carlos! Tudo ótimo. Sim, estou finalizando os detalhes do primeiro rascunho. Devo te enviar ainda hoje até o final da tarde.',
            },
            {
                'sender': client_user,
                'content': 'Perfeito! Fico no aguardo. Ansioso para ver as ideias.',
            },
            {
                'sender': freelancer_user,
                'content': 'Pode deixar! 🔥',
            },
            {
                'sender': freelancer_user,
                'content': 'Carlos, acabei de subir a primeira versão na aba "Entregas". Dê uma olhada quando puder!',
            },
            {
                'sender': client_user,
                'content': 'Opa, já vou conferir! Obrigado, João!',
            },
        ]
        
        for msg_data in test_messages:
            MessageConversation.objects.get_or_create(
                conversation=conversation,
                sender=msg_data['sender'],
                content=msg_data['content'],
                defaults={
                    'message_type': 'text'
                }
            )
        
        self.stdout.write(f'Mensagens de teste criadas para conversa: {conversation.title}')
        
        # Criar notificações de teste
        test_notifications = [
            {
                'user': client_user,
                'notification_type': 'message',
                'title': 'Nova mensagem de João Freelancer',
                'message': 'Carlos, acabei de subir a primeira versão na aba "Entregas"...',
                'priority': 'medium',
            },
            {
                'user': client_user,
                'notification_type': 'project_update',
                'title': 'Projeto atualizado',
                'message': 'O freelancer enviou uma nova versão do seu projeto.',
                'priority': 'high',
            },
            {
                'user': freelancer_user,
                'notification_type': 'payment_received',
                'title': 'Pagamento recebido',
                'message': 'Você recebeu R$ 2.500,00 referente ao projeto "Logo Empresa ABC".',
                'priority': 'high',
            }
        ]
        
        for notif_data in test_notifications:
            SystemNotification.objects.get_or_create(
                user=notif_data['user'],
                title=notif_data['title'],
                defaults=notif_data
            )
        
        self.stdout.write('Notificações de teste criadas')

    def setup_preferences(self):
        """Cria preferências padrão para usuários existentes."""
        self.stdout.write('Configurando preferências de notificação...')
        
        users_without_prefs = User.objects.filter(
            notification_preferences__isnull=True
        )
        
        created_count = 0
        for user in users_without_prefs:
            NotificationPreferences.objects.create(user=user)
            created_count += 1
        
        self.stdout.write(f'Preferências criadas para {created_count} usuários')
        
        # Estatísticas
        total_users = User.objects.count()
        total_conversations = Conversation.objects.count()
        total_messages = MessageConversation.objects.count()
        total_notifications = SystemNotification.objects.count()
        
        self.stdout.write('\n' + '='*50)
        self.stdout.write('ESTATÍSTICAS DO SISTEMA DE MENSAGERIA')
        self.stdout.write('='*50)
        self.stdout.write(f'Total de usuários: {total_users}')
        self.stdout.write(f'Total de conversas: {total_conversations}')
        self.stdout.write(f'Total de mensagens: {total_messages}')
        self.stdout.write(f'Total de notificações: {total_notifications}')
        self.stdout.write('='*50)


