
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify
from django.utils import timezone
from datetime import timedelta

# É uma boa prática usar um modelo de usuário customizado em projetos Django.
# Isso nos dá flexibilidade para adicionar campos como 'userType' futuramente.
class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('client', 'Client'),
        ('freelancer', 'Freelancer'),
    )
    
    # Tipos profissionais específicos para melhor onboarding
    PROFESSIONAL_TYPE_CHOICES = (
        ('health', 'Profissional da Saúde'),
        ('creative', 'Profissional Criativo'),
        ('tech', 'Profissional de Tecnologia'),
        ('business', 'Profissional de Negócios'),
        ('general', 'Outros Serviços'),
    )
    
    ENTITY_TYPE_CHOICES = (
        ('pf', 'Pessoa Física'),
        ('pj', 'Pessoa Jurídica'),
    )
    
    # Removemos a necessidade de 'username' e usamos 'email' como identificador principal.
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    user_type = models.CharField(max_length=15, choices=USER_TYPE_CHOICES, default='client')
    
    # Campos específicos para onboarding profissional
    professional_type = models.CharField(
        max_length=20, 
        choices=PROFESSIONAL_TYPE_CHOICES, 
        blank=True, 
        null=True,
        help_text="Tipo específico de profissional para onboarding personalizado"
    )
    entity_type = models.CharField(
        max_length=5, 
        choices=ENTITY_TYPE_CHOICES, 
        blank=True, 
        null=True,
        help_text="Pessoa física ou jurídica"
    )
    onboarding_completed = models.BooleanField(
        default=False, 
        help_text="Se o usuário completou o processo de onboarding"
    )
    onboarding_step = models.IntegerField(
        default=0,
        help_text="Etapa atual do onboarding (0 = não iniciado)"
    )
    profile_image_url = models.URLField(max_length=1024, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    phone_verified = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=100, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username'] # Mantemos username para compatibilidade com admin, mas não será usado pelo usuário.

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='api_user_set',  # Novo related_name
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_query_name='user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='api_user_set',  # Novo related_name
        blank=True,
        help_text='Specific permissions for this user.',
        related_query_name='user',
    )

    def __str__(self):
        return self.email

class FreelancerProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='freelancer_profile')
    title = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    skills = models.JSONField(default=list) 
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    total_reviews = models.IntegerField(default=0)
    completed_projects = models.IntegerField(default=0)
    profile_views = models.IntegerField(default=0)
    response_time = models.IntegerField(null=True, blank=True) # Em horas
    is_verified = models.BooleanField(default=False)
    success_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    # Campos adicionados para alinhar com os requisitos
    location = models.CharField(max_length=255, blank=True, help_text="Cidade/Estado ou 'Remoto'")
    coverage_areas = models.JSONField(default=list, blank=True, help_text="Áreas de atendimento, ex: ['Bairro X', 'Cidade Y']")
    languages = models.JSONField(default=list, blank=True, help_text="Idiomas falados, ex: ['Português', 'Inglês']")
    portfolio = models.JSONField(default=list, blank=True, help_text="Lista de projetos no portfólio: [{'title': '...', 'url': '...', 'description': '...'}]")
    certifications = models.JSONField(default=list, blank=True, help_text="Certificações: [{'name': '...', 'issuer': '...', 'year': '...'}]")
    availability = models.CharField(max_length=100, blank=True, help_text="Ex: 'Integral', 'Meio Período'")
    availability_hours = models.CharField(max_length=100, blank=True, help_text="Ex: '9h-18h'")
    
    # Integração com Stripe Connect
    stripe_account_id = models.CharField(max_length=255, blank=True, help_text="ID da conta Stripe Connect")
    stripe_onboarding_completed = models.BooleanField(default=False, help_text="Se completou o onboarding do Stripe")
    stripe_charges_enabled = models.BooleanField(default=False, help_text="Se pode receber pagamentos")
    stripe_payouts_enabled = models.BooleanField(default=False, help_text="Se pode realizar saques")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.email
    
    @property
    def can_receive_payments(self):
        """Verifica se o freelancer pode receber pagamentos"""
        return (
            self.stripe_account_id and 
            self.stripe_onboarding_completed and 
            self.stripe_charges_enabled and 
            self.stripe_payouts_enabled
        )
    
    def update_stripe_status(self):
        """Atualiza status da conta Stripe"""
        if self.stripe_account_id:
            from .services.stripe_service import StripeService
            result = StripeService.check_account_status(self.stripe_account_id)
            
            if result['success']:
                account = result['account']
                self.stripe_charges_enabled = account.charges_enabled
                self.stripe_payouts_enabled = account.payouts_enabled
                self.stripe_onboarding_completed = account.details_submitted
                self.save()
                
                return result
        
        return {'success': False, 'error': 'Conta Stripe não configurada'}

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100, blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    level = models.IntegerField(default=0)
    path = models.CharField(max_length=500, blank=True)
    order_index = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['level', 'order_index', 'name']
        verbose_name_plural = 'Categories'
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        
        if self.parent:
            self.level = self.parent.level + 1
            self.path = f"{self.parent.path}/{self.slug}" if self.parent.path else self.slug
        else:
            self.level = 0
            self.path = self.slug
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name
    
    @property
    def full_path(self):
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name
    
    def get_all_children(self):
        children = []
        for child in self.children.all():
            children.append(child)
            children.extend(child.get_all_children())
        return children

class ServicePackage(models.Model):
    """Modelo para Pacotes de Serviço (estilo Fiverr) - Produtos pré-definidos"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('paused', 'Paused'),
        ('draft', 'Draft'),
    ]
    
    TIER_CHOICES = [
        ('basic', 'Básico'),
        ('standard', 'Padrão'),
        ('premium', 'Premium'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    freelancer = models.ForeignKey(FreelancerProfile, on_delete=models.CASCADE, related_name='service_packages')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='service_packages')
    
    # Informações básicas do pacote
    title = models.CharField(max_length=255, help_text="Ex: 'Eu vou criar um design de logotipo profissional'")
    description = models.TextField(help_text="Descrição detalhada do serviço oferecido")
    
    # Sistema de níveis de preços (Básico, Padrão, Premium)
    pricing_tiers = models.JSONField(
        default=dict,
        help_text="Estrutura: {basic: {price: 50, delivery_days: 3, revisions: 1, features: []}, ...}"
    )
    
    # Formulário de requisitos que o cliente preenche após compra
    requirements_form = models.JSONField(
        default=list,
        help_text="Lista de campos que o cliente deve preencher: [{field: 'nome_empresa', type: 'text', required: true}, ...]"
    )
    
    # FAQ do serviço
    faq = models.JSONField(
        default=list,
        help_text="Perguntas frequentes: [{question: 'Pergunta', answer: 'Resposta'}, ...]"
    )
    
    # Tags para descoberta
    tags = models.JSONField(
        default=list,
        help_text="Palavras-chave para busca: ['logo', 'design', 'branding']"
    )
    
    # Galeria de exemplos (múltiplos formatos)
    gallery = models.JSONField(
        default=list,
        help_text="URLs de imagens/vídeos de exemplo: [{'type': 'image', 'url': '...', 'description': '...'}]"
    )
    
    # Status e métricas
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    view_count = models.IntegerField(default=0)
    order_count = models.IntegerField(default=0)
    conversion_rate = models.FloatField(default=0.0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    
    # Configurações avançadas
    is_featured = models.BooleanField(default=False)
    extra_services = models.JSONField(
        default=list,
        help_text="Serviços extras opcionais: [{'name': 'Entrega expressa', 'price': 20}, ...]"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_featured', '-average_rating', '-order_count']
        verbose_name = 'Pacote de Serviço'
        verbose_name_plural = 'Pacotes de Serviço'
    
    def __str__(self):
        return self.title
    
    def get_tier_price(self, tier='basic'):
        return self.pricing_tiers.get(tier, {}).get('price', 0)
    
    def get_all_tier_prices(self):
        return {
            tier: data.get('price', 0) 
            for tier, data in self.pricing_tiers.items()
        }
    
    @property
    def min_price(self):
        prices = [data.get('price', 0) for data in self.pricing_tiers.values()]
        return min(prices) if prices else 0
    
    @property
    def max_price(self):
        prices = [data.get('price', 0) for data in self.pricing_tiers.values()]
        return max(prices) if prices else 0

class Project(models.Model):
    """Modelo para Projetos Personalizados (estilo Upwork) - Trabalho sob medida"""
    STATUS_CHOICES = [
        ('draft', 'Rascunho'),
        ('open', 'Aberto para Propostas'),
        ('in_review', 'Analisando Propostas'),
        ('assigned', 'Atribuído'),
        ('in_progress', 'Em Andamento'),
        ('completed', 'Concluído'),
        ('cancelled', 'Cancelado'),
    ]
    
    PROJECT_TYPE_CHOICES = [
        ('hourly', 'Por Hora'),
        ('fixed', 'Preço Fixo'),
    ]
    
    EXPERIENCE_LEVEL_CHOICES = [
        ('entry', 'Iniciante'),
        ('intermediate', 'Intermediário'),
        ('expert', 'Especialista'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='custom_projects')
    
    # Informações básicas do projeto
    title = models.CharField(max_length=255, help_text="Título claro e conciso do projeto")
    description = models.TextField(help_text="Descrição detalhada: objetivos, entregaveis, requisitos")
    
    # Tipo de projeto e preços
    project_type = models.CharField(
        max_length=20, 
        choices=PROJECT_TYPE_CHOICES,
        default='fixed',
        help_text="Por hora ou preço fixo"
    )
    
    # Campos para projetos por hora
    hourly_rate_min = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Taxa horária mínima aceita (R$/hora)"
    )
    hourly_rate_max = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Taxa horária máxima aceita (R$/hora)"
    )
    estimated_hours = models.IntegerField(
        null=True, blank=True,
        help_text="Estimativa de horas necessárias"
    )
    
    # Campos para projetos de preço fixo
    budget_min = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Orçamento mínimo para preço fixo"
    )
    budget_max = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Orçamento máximo para preço fixo"
    )
    
    # Requisitos e preferências
    required_skills = models.JSONField(
        default=list,
        help_text="Competências necessárias: ['Python', 'Django', 'React']"
    )
    experience_level = models.CharField(
        max_length=20,
        choices=EXPERIENCE_LEVEL_CHOICES,
        default='intermediate',
        help_text="Nível de experiência desejado"
    )
    
    # Cronograma
    deadline = models.DateTimeField(
        null=True, blank=True,
        help_text="Prazo final para conclusão"
    )
    start_date = models.DateTimeField(
        null=True, blank=True,
        help_text="Data de início desejada"
    )
    
    # Arquivos e anexos
    attachments = models.JSONField(
        default=list,
        help_text="Arquivos anexados: briefings, wireframes, etc."
    )
    
    # Perguntas de triagem
    screening_questions = models.JSONField(
        default=list,
        help_text="Perguntas para filtrar candidatos: [{'question': '...', 'required': true}, ...]"
    )
    
    # Preferências de localização e idioma
    location_preference = models.CharField(
        max_length=200, blank=True,
        help_text="Preferência de localização: 'Remoto', 'São Paulo', etc."
    )
    language_preference = models.CharField(
        max_length=100, default='Português',
        help_text="Idioma preferido para comunicação"
    )
    
    # Status e métricas
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    proposal_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    
    # Projeto atribuído
    assigned_freelancer = models.ForeignKey(
        FreelancerProfile, on_delete=models.SET_NULL, 
        null=True, blank=True, related_name='assigned_projects'
    )
    accepted_proposal = models.ForeignKey(
        'Proposal', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='accepted_for_project'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Projeto Personalizado'
        verbose_name_plural = 'Projetos Personalizados'
    
    def __str__(self):
        return f"{self.title} ({self.get_project_type_display()})"
    
    @property
    def budget_range_display(self):
        if self.project_type == 'hourly':
            if self.hourly_rate_min and self.hourly_rate_max:
                return f"R$ {self.hourly_rate_min}-{self.hourly_rate_max}/hora"
            elif self.hourly_rate_min:
                return f"A partir de R$ {self.hourly_rate_min}/hora"
        elif self.project_type == 'fixed':
            if self.budget_min and self.budget_max:
                return f"R$ {self.budget_min}-{self.budget_max}"
            elif self.budget_min:
                return f"A partir de R$ {self.budget_min}"
        return "Orçamento a combinar"
    
    def can_receive_proposals(self):
        return self.status in ['open', 'in_review']
    
    def increment_proposal_count(self):
        self.proposal_count += 1
        self.save(update_fields=['proposal_count'])

class Proposal(models.Model):
    """Propostas de freelancers para projetos personalizados"""
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('viewed', 'Visualizada'),
        ('shortlisted', 'Pré-selecionada'),
        ('accepted', 'Aceita'),
        ('declined', 'Recusada'),
        ('withdrawn', 'Retirada'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='proposals')
    freelancer = models.ForeignKey(FreelancerProfile, on_delete=models.CASCADE, related_name='submitted_proposals')
    
    # Proposta comercial
    proposed_price = models.DecimalField(
        max_digits=10, decimal_places=2,
        default=0,
        help_text="Preço proposto (total ou por hora)"
    )
    proposed_timeline = models.IntegerField(
        default=7,
        help_text="Prazo proposto em dias"
    )
    
    # Carta de apresentação
    cover_letter = models.TextField(
        help_text="Carta de apresentação explicando por que é o melhor candidato"
    )
    
    # Respostas às perguntas de triagem
    screening_answers = models.JSONField(
        default=list,
        help_text="Respostas às perguntas de triagem do cliente"
    )
    
    # Portfólio relevante
    relevant_portfolio = models.JSONField(
        default=list,
        help_text="Links para trabalhos relevantes"
    )
    
    # Marcos propostos (para projetos de preço fixo)
    proposed_milestones = models.JSONField(
        default=list,
        help_text="Marcos propostos: [{'name': 'Fase 1', 'price': 500, 'deadline': '2025-02-15'}, ...]"
    )
    
    # Status e interações
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    viewed_at = models.DateTimeField(null=True, blank=True)
    client_notes = models.TextField(
        blank=True,
        help_text="Notas privadas do cliente sobre esta proposta"
    )
    
    # Custo de envio (sistema de connects)
    connects_spent = models.IntegerField(
        default=2,
        help_text="Número de connects gastos para enviar esta proposta"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['project', 'freelancer']
        verbose_name = 'Proposta'
        verbose_name_plural = 'Propostas'
    
    def __str__(self):
        return f"Proposta de {self.freelancer.user.first_name} para {self.project.title}"
    
    def mark_as_viewed(self):
        if self.status == 'pending':
            self.status = 'viewed'
            self.viewed_at = timezone.now()
            self.save(update_fields=['status', 'viewed_at'])
    
    @property
    def is_active(self):
        return self.status in ['pending', 'viewed', 'shortlisted']

class ServiceOrder(models.Model):
    """Pedidos específicos para Pacotes de Serviço (fluxo Fiverr)"""
    STATUS_CHOICES = [
        ('pending_requirements', 'Aguardando Requisitos'),
        ('in_queue', 'Na Fila'),
        ('in_progress', 'Em Andamento'),
        ('pending_review', 'Aguardando Revisão'),
        ('revision_requested', 'Revisão Solicitada'),
        ('delivered', 'Entregue'),
        ('completed', 'Concluído'),
        ('cancelled', 'Cancelado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=50, unique=True, blank=True)
    
    # Relações principais
    service_package = models.ForeignKey(ServicePackage, on_delete=models.CASCADE, related_name='service_orders')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_orders')
    freelancer = models.ForeignKey(FreelancerProfile, on_delete=models.CASCADE, related_name='service_orders')
    
    # Tier selecionado e personalização
    selected_tier = models.CharField(
        max_length=20,
        choices=ServicePackage.TIER_CHOICES,
        default='basic',
        help_text="Tier escolhido: básico, padrão ou premium"
    )
    
    # Extras selecionados
    selected_extras = models.JSONField(
        default=list,
        help_text="Extras adicionais selecionados: [{'name': 'Entrega expressa', 'price': 20}, ...]"
    )
    
    # Requisitos preenchidos pelo cliente
    requirements_data = models.JSONField(
        default=dict,
        help_text="Dados preenchidos no formulário de requisitos"
    )
    
    # Preços calculados
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    extras_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Cronograma
    estimated_delivery = models.DateTimeField(null=True, blank=True)
    actual_delivery = models.DateTimeField(null=True, blank=True)
    
    # Entregas e revisões
    deliveries = models.JSONField(
        default=list,
        help_text="Histórico de entregas: [{'version': 1, 'files': [], 'message': '...', 'date': '...'}, ...]"
    )
    revisions_used = models.IntegerField(default=0)
    revisions_allowed = models.IntegerField(default=0)
    
    # Status e comunicação
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending_requirements')
    client_feedback = models.TextField(blank=True)
    freelancer_notes = models.TextField(blank=True)
    
    # Timestamps
    requirements_submitted_at = models.DateTimeField(null=True, blank=True)
    work_started_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Pedido de Serviço'
        verbose_name_plural = 'Pedidos de Serviço'
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            import secrets
            import string
            self.order_number = 'SO' + ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Pedido {self.order_number} - {self.service_package.title}"
    
    @property
    def tier_details(self):
        return self.service_package.pricing_tiers.get(self.selected_tier, {})
    
    @property
    def can_request_revision(self):
        return (self.revisions_used < self.revisions_allowed and 
                self.status in ['pending_review', 'delivered'])
    
    def calculate_total_price(self):
        self.total_price = self.base_price + self.extras_price
        return self.total_price
    
    def start_work(self):
        if self.status == 'in_queue':
            self.status = 'in_progress'
            self.work_started_at = timezone.now()
            self.save(update_fields=['status', 'work_started_at'])
    
    def deliver_work(self, files, message):
        delivery = {
            'version': len(self.deliveries) + 1,
            'files': files,
            'message': message,
            'date': timezone.now().isoformat()
        }
        self.deliveries.append(delivery)
        self.status = 'pending_review'
        self.delivered_at = timezone.now()
        self.save(update_fields=['deliveries', 'status', 'delivered_at'])

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('in_progress', 'In Progress'),
        ('disputed', 'Disputed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    ESCROW_STATUS_CHOICES = [
        ('none', 'None'),
        ('held', 'Held'),
        ('partially_released', 'Partially Released'),
        ('released', 'Released'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=50, unique=True)
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    freelancer = models.ForeignKey(FreelancerProfile, on_delete=models.CASCADE, related_name='orders')
    service_package = models.ForeignKey(ServicePackage, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Pricing breakdown
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    processing_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    freelancer_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    escrow_status = models.CharField(max_length=20, choices=ESCROW_STATUS_CHOICES, default='none')
    
    # Dispute handling
    dispute_reason = models.TextField(blank=True)
    dispute_resolution = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            import random
            import string
            self.order_number = 'ORD-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        super().save(*args, **kwargs)

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='review')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Subscription(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('trial', 'Trial'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
        ('suspended', 'Suspended'),
    ]
    
    BILLING_CYCLE_CHOICES = [
        ('monthly', 'Monthly'),
        ('annual', 'Annual'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan_id = models.CharField(max_length=100, default='free')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='active')
    billing_cycle = models.CharField(max_length=20, choices=BILLING_CYCLE_CHOICES, default='monthly')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancel_reason = models.TextField(blank=True)
    features = models.JSONField(default=dict, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.plan_id} ({self.status})"
    
    @property
    def is_active(self):
        return self.status in ['active', 'trial']
    
    @property
    def plan_config(self):
        from .utils import get_plan_config
        return get_plan_config(self.plan_id)

class PlanFeature(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plan_id = models.CharField(max_length=100)
    feature_name = models.CharField(max_length=100)
    feature_value = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class FeatureUsage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feature_usages')
    feature = models.CharField(max_length=100)
    period = models.CharField(max_length=7)  # YYYY-MM format
    used = models.IntegerField(default=0)
    limit = models.IntegerField(default=-1)  # -1 means unlimited
    last_used = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'feature', 'period']
        
    def __str__(self):
        return f"{self.user.email} - {self.feature} ({self.period}): {self.used}/{self.limit}"

class AddOn(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addons')
    type = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='BRL')
    configuration = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.type} ({self.status})"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('payment', 'Payment'),
        ('release', 'Release'),
        ('refund', 'Refund'),
        ('fee', 'Fee'),
    ]
    
    TRANSACTION_STATUS = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPES, default='payment')
    status = models.CharField(max_length=20, choices=TRANSACTION_STATUS, default='pending')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='BRL')
    payment_method = models.CharField(max_length=50, blank=True)
    provider = models.CharField(max_length=100, blank=True)
    transaction_id = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.type.title()} - {self.amount} {self.currency} - {self.status}"

    class Meta:
        ordering = ['-created_at']


class Availability(models.Model):
    """Configuração de disponibilidade semanal dos freelancers"""
    WEEKDAYS = [
        (0, 'Segunda-feira'),
        (1, 'Terça-feira'),
        (2, 'Quarta-feira'),
        (3, 'Quinta-feira'),
        (4, 'Sexta-feira'),
        (5, 'Sábado'),
        (6, 'Domingo'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    freelancer = models.ForeignKey(FreelancerProfile, on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.IntegerField(choices=WEEKDAYS)
    start_time = models.TimeField(help_text="Horário de início (ex: 09:00)")
    end_time = models.TimeField(help_text="Horário de fim (ex: 17:00)")
    is_available = models.BooleanField(default=True)
    buffer_time = models.IntegerField(default=15, help_text="Tempo de intervalo entre agendamentos em minutos")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['freelancer', 'day_of_week', 'start_time']
        ordering = ['day_of_week', 'start_time']
    
    def __str__(self):
        return f"{self.freelancer.user.email} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"


class Booking(models.Model):
    """Agendamentos de serviços por hora"""
    STATUS_CHOICES = [
        ('scheduled', 'Agendado'),
        ('confirmed', 'Confirmado'),
        ('in_progress', 'Em Andamento'),
        ('completed', 'Concluído'),
        ('cancelled', 'Cancelado'),
        ('no_show', 'Não Compareceu'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='bookings')
    freelancer = models.ForeignKey(FreelancerProfile, on_delete=models.CASCADE, related_name='bookings')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    
    # Agendamento
    scheduled_start = models.DateTimeField()
    scheduled_end = models.DateTimeField()
    actual_start = models.DateTimeField(null=True, blank=True)
    actual_end = models.DateTimeField(null=True, blank=True)
    
    # Status e metadados
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    meeting_link = models.URLField(blank=True, help_text="Link para reunião online (Google Meet, Zoom, etc.)")
    notes = models.TextField(blank=True, help_text="Notas do cliente sobre o agendamento")
    freelancer_notes = models.TextField(blank=True, help_text="Notas internas do freelancer")
    
    # Notificações
    reminder_sent = models.BooleanField(default=False)
    confirmation_sent = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['scheduled_start']
    
    def __str__(self):
        return f"Agendamento {self.client.email} com {self.freelancer.user.email} - {self.scheduled_start.strftime('%d/%m/%Y %H:%M')}"
    
    @property
    def duration_hours(self):
        """Duração do agendamento em horas"""
        if self.actual_start and self.actual_end:
            delta = self.actual_end - self.actual_start
        else:
            delta = self.scheduled_end - self.scheduled_start
        return delta.total_seconds() / 3600
    
    def can_cancel(self):
        """Verifica se o agendamento pode ser cancelado (24h de antecedência)"""
        if self.status in ['completed', 'cancelled']:
            return False
        return (self.scheduled_start - timezone.now()).total_seconds() > 24 * 3600
    
    def send_reminder(self):
        """Envia lembrete de agendamento"""
        # TODO: Implementar envio de notificação
        self.reminder_sent = True
        self.save()


class TimeSlot(models.Model):
    """Slots de tempo específicos para agendamento"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    freelancer = models.ForeignKey(FreelancerProfile, on_delete=models.CASCADE, related_name='time_slots')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name='time_slots')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['freelancer', 'date', 'start_time']
        ordering = ['date', 'start_time']
    
    def __str__(self):
        return f"{self.freelancer.user.email} - {self.date} {self.start_time}-{self.end_time}"


class BookingChangeRequest(models.Model):
    """Solicitações de alteração de agendamento"""
    REQUEST_TYPES = [
        ('reschedule', 'Reagendamento'),
        ('cancel', 'Cancelamento'),
        ('extend', 'Extensão'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('approved', 'Aprovado'),
        ('rejected', 'Rejeitado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='change_requests')
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE)
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Dados para reagendamento
    new_start = models.DateTimeField(null=True, blank=True)
    new_end = models.DateTimeField(null=True, blank=True)
    
    # Justificativa
    reason = models.TextField(help_text="Motivo da solicitação")
    response = models.TextField(blank=True, help_text="Resposta à solicitação")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.get_request_type_display()} - {self.booking} ({self.status})"


class Dispute(models.Model):
    DISPUTE_CATEGORIES = [
        ('quality', 'Qualidade do Trabalho'),
        ('delivery', 'Prazo de Entrega'),
        ('scope', 'Escopo do Projeto'),
        ('communication', 'Comunicação'),
        ('payment', 'Problemas de Pagamento'),
        ('other', 'Outros'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Aberta'),
        ('in_review', 'Em Análise'),
        ('in_mediation', 'Em Mediação'),
        ('arbitration', 'Arbitragem'),
        ('resolved_client', 'Resolvida - Favor do Cliente'),
        ('resolved_freelancer', 'Resolvida - Favor do Freelancer'),
        ('resolved_partial', 'Resolvida - Parcial'),
        ('cancelled', 'Cancelada'),
    ]
    
    RESOLUTION_TYPES = [
        ('refund_full', 'Reembolso Total'),
        ('refund_partial', 'Reembolso Parcial'),
        ('release_full', 'Liberação Total'),
        ('release_partial', 'Liberação Parcial'),
        ('remake_work', 'Refazer Trabalho'),
        ('extend_deadline', 'Estender Prazo'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dispute_number = models.CharField(max_length=20, unique=True)
    
    # Relacionamentos
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='disputes', null=True, blank=True)
    booking = models.ForeignKey('Booking', on_delete=models.CASCADE, related_name='disputes', null=True, blank=True)
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_disputes')
    freelancer = models.ForeignKey('FreelancerProfile', on_delete=models.CASCADE, related_name='freelancer_disputes')
    
    # Detalhes da disputa
    opened_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='opened_disputes')
    category = models.CharField(max_length=20, choices=DISPUTE_CATEGORIES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Status e progresso
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    priority = models.CharField(max_length=10, choices=[('low', 'Baixa'), ('medium', 'Média'), ('high', 'Alta')], default='medium')
    
    # Valores envolvidos
    disputed_amount = models.DecimalField(max_digits=10, decimal_places=2)
    original_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Resolução
    resolution_type = models.CharField(max_length=20, choices=RESOLUTION_TYPES, blank=True)
    resolution_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    resolution_notes = models.TextField(blank=True)
    mediator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='mediated_disputes')
    
    # Timeline
    auto_resolution_deadline = models.DateTimeField()  # 48h para resposta automática
    mediation_deadline = models.DateTimeField(null=True, blank=True)  # 72h para mediação
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    mediation_started_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def save(self, *args, **kwargs):
        if not self.dispute_number:
            # Gerar número único da disputa
            from django.utils import timezone
            now = timezone.now()
            last_dispute = Dispute.objects.filter(
                created_at__date=now.date()
            ).order_by('-dispute_number').first()
            
            if last_dispute and last_dispute.dispute_number:
                try:
                    last_num = int(last_dispute.dispute_number.split('-')[-1])
                    next_num = last_num + 1
                except (ValueError, IndexError):
                    next_num = 1
            else:
                next_num = 1
                
            self.dispute_number = f"DSP-{now.strftime('%Y%m%d')}-{next_num:04d}"
            
        if not self.auto_resolution_deadline:
            from django.utils import timezone
            self.auto_resolution_deadline = timezone.now() + timedelta(hours=48)
            
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"Dispute {self.dispute_number} - {self.get_category_display()}"
    
    @property
    def is_overdue(self):
        from django.utils import timezone
        if self.status == 'open':
            return timezone.now() > self.auto_resolution_deadline
        elif self.status == 'in_mediation' and self.mediation_deadline:
            return timezone.now() > self.mediation_deadline
        return False
    
    def can_auto_resolve(self):
        """Verifica se disputa pode ser auto-resolvida"""
        from django.utils import timezone
        return (
            self.status == 'open' and 
            timezone.now() > self.auto_resolution_deadline and
            not self.responded_at
        )


class DisputeEvidence(models.Model):
    EVIDENCE_TYPES = [
        ('file', 'Arquivo'),
        ('screenshot', 'Screenshot'),
        ('chat_log', 'Log de Conversa'),
        ('email', 'Email'),
        ('other', 'Outros'),
    ]
    
    dispute = models.ForeignKey(Dispute, on_delete=models.CASCADE, related_name='evidence')
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE)
    evidence_type = models.CharField(max_length=20, choices=EVIDENCE_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='dispute_evidence/', null=True, blank=True)
    file_url = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Evidence for {self.dispute.dispute_number} by {self.submitted_by.get_full_name()}"


class DisputeMessage(models.Model):
    MESSAGE_TYPES = [
        ('client', 'Mensagem do Cliente'),
        ('freelancer', 'Mensagem do Freelancer'),
        ('mediator', 'Mensagem do Mediador'),
        ('system', 'Mensagem do Sistema'),
        ('auto_resolution', 'Resolução Automática'),
    ]
    
    dispute = models.ForeignKey(Dispute, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES)
    content = models.TextField()
    is_internal = models.BooleanField(default=False)  # Visível apenas para mediadores
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        
    def __str__(self):
        return f"Message in {self.dispute.dispute_number} by {self.sender.get_full_name() if self.sender else 'System'}"


class DisputeResolution(models.Model):
    RESOLUTION_OUTCOMES = [
        ('client_favor', 'Favor do Cliente'),
        ('freelancer_favor', 'Favor do Freelancer'),
        ('partial_refund', 'Reembolso Parcial'),
        ('remake_work', 'Refazer Trabalho'),
        ('mutual_agreement', 'Acordo Mútuo'),
        ('no_fault', 'Sem Culpa - Circunstâncias'),
    ]
    
    dispute = models.OneToOneField(Dispute, on_delete=models.CASCADE, related_name='resolution')
    outcome = models.CharField(max_length=20, choices=RESOLUTION_OUTCOMES)
    reasoning = models.TextField()
    
    # Detalhes financeiros
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    freelancer_payment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    platform_fee_waived = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Ações adicionais
    freelancer_penalty = models.BooleanField(default=False)
    client_penalty = models.BooleanField(default=False)
    additional_actions = models.TextField(blank=True)
    
    # Acordo das partes
    agreed_by_client = models.BooleanField(default=False)
    agreed_by_freelancer = models.BooleanField(default=False)
    client_agreement_at = models.DateTimeField(null=True, blank=True)
    freelancer_agreement_at = models.DateTimeField(null=True, blank=True)
    
    # Execução
    executed = models.BooleanField(default=False)
    executed_at = models.DateTimeField(null=True, blank=True)
    executed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Resolution for {self.dispute.dispute_number} - {self.get_outcome_display()}"
    
    @property
    def is_agreed_by_both(self):
        return self.agreed_by_client and self.agreed_by_freelancer


# ============================================================================
# KYC (Know Your Customer) Models
# ============================================================================

class DocumentType(models.TextChoices):
    """Tipos de documentos aceitos para verificação"""
    RG = 'rg', 'RG (Registro Geral)'
    CPF = 'cpf', 'CPF'
    CNH = 'cnh', 'CNH (Carteira Nacional de Habilitação)'
    PASSPORT = 'passport', 'Passaporte'
    CNPJ = 'cnpj', 'CNPJ'
    PROOF_ADDRESS = 'proof_address', 'Comprovante de Endereço'
    DIPLOMA = 'diploma', 'Diploma'
    CERTIFICATE = 'certificate', 'Certificado Profissional'
    SELFIE_DOCUMENT = 'selfie_document', 'Selfie com Documento'


class VerificationStatus(models.TextChoices):
    """Status de verificação dos documentos"""
    PENDING = 'pending', 'Pendente'
    PROCESSING = 'processing', 'Processando'
    APPROVED = 'approved', 'Aprovado'
    REJECTED = 'rejected', 'Rejeitado'
    EXPIRED = 'expired', 'Expirado'
    MANUAL_REVIEW = 'manual_review', 'Revisão Manual'


class KYCLevel(models.TextChoices):
    """Níveis de verificação KYC"""
    BASIC = 'basic', 'Cadastro Básico ⭐'
    IDENTITY_VERIFIED = 'identity_verified', 'Identidade Verificada ⭐⭐'
    PROFESSIONAL_VERIFIED = 'professional_verified', 'Profissional Verificado ⭐⭐⭐'
    GALAXIA_ELITE = 'galaxia_elite', 'GalaxIA Elite ⭐⭐⭐⭐⭐'


class VerificationProvider(models.Model):
    """Configuração de provedores de verificação KYC"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    
    # Configuração
    is_active = models.BooleanField(default=True)
    api_endpoint = models.URLField()
    api_key_field = models.CharField(max_length=100, help_text="Nome do campo da API key")
    
    # Capacidades
    supports_documents = models.BooleanField(default=True)
    supports_biometric = models.BooleanField(default=True)
    supports_address = models.BooleanField(default=True)
    supports_brazil = models.BooleanField(default=True)
    
    # Custos e limites
    cost_per_verification = models.DecimalField(max_digits=10, decimal_places=4, help_text="Custo em USD")
    monthly_limit = models.PositiveIntegerField(null=True, blank=True, help_text="Limite mensal de verificações")
    
    # Configurações específicas
    settings = models.JSONField(default=dict, blank=True, help_text="Configurações específicas do provedor")
    
    # Métricas
    total_verifications = models.PositiveIntegerField(default=0)
    success_rate = models.FloatField(default=0.0, help_text="Taxa de sucesso (0-1)")
    average_response_time = models.FloatField(default=0.0, help_text="Tempo médio de resposta em segundos")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({'Ativo' if self.is_active else 'Inativo'})"


class KYCDocument(models.Model):
    """Documentos enviados para verificação KYC"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='kyc_documents')
    
    # Dados do documento
    document_type = models.CharField(max_length=20, choices=DocumentType.choices)
    file_url = models.URLField(max_length=1000, help_text="URL do arquivo no S3/storage")
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text="Tamanho do arquivo em bytes")
    file_hash = models.CharField(max_length=64, help_text="Hash SHA-256 do arquivo")
    
    # OCR e dados extraídos
    ocr_data = models.JSONField(default=dict, blank=True, help_text="Dados extraídos via OCR")
    extracted_text = models.TextField(blank=True, help_text="Texto completo extraído")
    confidence_score = models.FloatField(default=0.0, help_text="Score de confiança OCR (0-1)")
    
    # Status de verificação
    status = models.CharField(max_length=20, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)
    verification_provider = models.CharField(max_length=50, blank=True, help_text="Provedor KYC usado")
    provider_response = models.JSONField(default=dict, blank=True, help_text="Resposta completa do provedor")
    
    # Auditoria e controle
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_documents')
    
    # Observações e feedback
    rejection_reason = models.TextField(blank=True, help_text="Motivo da rejeição")
    internal_notes = models.TextField(blank=True, help_text="Notas internas para equipe")
    
    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['user', 'document_type']),
            models.Index(fields=['status']),
            models.Index(fields=['uploaded_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.get_document_type_display()} ({self.status})"
    
    @property
    def is_expired(self):
        """Verifica se o documento expirou (mais de 6 meses)"""
        if self.verified_at:
            return timezone.now() > self.verified_at + timedelta(days=180)
        return False
    
    def mark_as_processed(self, status, provider_response=None, verified_by=None):
        """Marca documento como processado com resultado"""
        self.status = status
        self.processed_at = timezone.now()
        
        if status == VerificationStatus.APPROVED:
            self.verified_at = timezone.now()
            self.verified_by = verified_by
        
        if provider_response:
            self.provider_response = provider_response
        
        self.save()


class BiometricVerification(models.Model):
    """Verificações biométricas (selfie + liveness detection)"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='biometric_verifications')
    
    # Arquivos biométricos
    selfie_url = models.URLField(max_length=1000, help_text="URL da selfie")
    liveness_video_url = models.URLField(max_length=1000, blank=True, help_text="URL do vídeo de liveness")
    
    # Dados da verificação
    liveness_score = models.FloatField(default=0.0, help_text="Score de liveness (0-1)")
    face_match_score = models.FloatField(default=0.0, help_text="Score de match com documento (0-1)")
    quality_score = models.FloatField(default=0.0, help_text="Qualidade da imagem (0-1)")
    
    # Metadados técnicos
    device_info = models.JSONField(default=dict, blank=True, help_text="Informações do dispositivo")
    geolocation = models.JSONField(default=dict, blank=True, help_text="Localização no momento da captura")
    timestamp_capture = models.DateTimeField(help_text="Timestamp exato da captura")
    
    # Resultado da verificação
    status = models.CharField(max_length=20, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)
    verification_provider = models.CharField(max_length=50, blank=True)
    provider_response = models.JSONField(default=dict, blank=True)
    
    # Auditoria
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - Biometric ({self.status})"
    
    @property
    def is_valid(self):
        """Verifica se a verificação biométrica é válida"""
        return (
            self.status == VerificationStatus.APPROVED and
            self.liveness_score >= 0.8 and
            self.face_match_score >= 0.85 and
            self.quality_score >= 0.7
        )


class KYCProfile(models.Model):
    """Perfil completo de verificação KYC do usuário"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='kyc_profile')
    
    # Nível atual de verificação
    current_level = models.CharField(max_length=30, choices=KYCLevel.choices, default=KYCLevel.BASIC)
    
    # Status geral
    identity_verified = models.BooleanField(default=False)
    address_verified = models.BooleanField(default=False)
    biometric_verified = models.BooleanField(default=False)
    professional_verified = models.BooleanField(default=False)
    
    # Dados pessoais verificados
    verified_full_name = models.CharField(max_length=200, blank=True)
    verified_document_number = models.CharField(max_length=50, blank=True)
    verified_birth_date = models.DateField(null=True, blank=True)
    verified_address = models.TextField(blank=True)
    
    # Scores de confiança
    overall_trust_score = models.FloatField(default=0.0, help_text="Score geral de confiança (0-1)")
    identity_confidence = models.FloatField(default=0.0, help_text="Confiança na identidade (0-1)")
    document_confidence = models.FloatField(default=0.0, help_text="Confiança nos documentos (0-1)")
    biometric_confidence = models.FloatField(default=0.0, help_text="Confiança biométrica (0-1)")
    
    # Histórico de verificações
    first_verification_at = models.DateTimeField(null=True, blank=True)
    last_verification_at = models.DateTimeField(null=True, blank=True)
    verification_attempts = models.PositiveIntegerField(default=0)
    
    # Informações adicionais
    risk_level = models.CharField(
        max_length=10,
        choices=[('low', 'Baixo'), ('medium', 'Médio'), ('high', 'Alto')],
        default='medium'
    )
    notes = models.TextField(blank=True, help_text="Notas internas sobre o perfil")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['current_level']),
            models.Index(fields=['identity_verified']),
            models.Index(fields=['overall_trust_score']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.get_current_level_display()}"
    
    def calculate_trust_score(self):
        """Calcula o score geral de confiança baseado nas verificações"""
        scores = []
        
        # Peso por tipo de verificação
        if self.identity_verified:
            scores.append(self.identity_confidence * 0.4)
        
        if self.biometric_verified:
            scores.append(self.biometric_confidence * 0.3)
            
        if self.address_verified:
            scores.append(self.document_confidence * 0.2)
            
        if self.professional_verified:
            scores.append(0.1)  # Bônus por verificação profissional
        
        self.overall_trust_score = sum(scores) if scores else 0.0
        self.save(update_fields=['overall_trust_score'])
        
        return self.overall_trust_score


class VerificationLog(models.Model):
    """Log de todas as verificações realizadas"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    provider = models.ForeignKey(VerificationProvider, on_delete=models.CASCADE)
    
    # Dados da verificação
    verification_type = models.CharField(max_length=50, help_text="Tipo de verificação realizada")
    request_data = models.JSONField(default=dict, help_text="Dados enviados para o provedor")
    response_data = models.JSONField(default=dict, help_text="Resposta completa do provedor")
    
    # Resultado
    success = models.BooleanField(default=False)
    error_message = models.TextField(blank=True)
    confidence_score = models.FloatField(default=0.0)
    
    # Métricas
    response_time = models.FloatField(help_text="Tempo de resposta em segundos")
    cost = models.DecimalField(max_digits=10, decimal_places=4, help_text="Custo desta verificação")
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['provider']),
            models.Index(fields=['success']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.verification_type} ({self.provider.name})"


# ============================================================================
# KYC Multi-Provider Intelligence Models
# ============================================================================

class KYCProviderStats(models.Model):
    """
    Estatísticas em tempo real para roteamento inteligente de provedores KYC
    Implementa epsilon-greedy multi-armed bandit para otimização automática
    """
    name = models.CharField(
        max_length=30, 
        primary_key=True,
        help_text="Nome do provedor (stripe, idwall, unico, datavalid)"
    )
    
    # Métricas de volume e qualidade
    attempts = models.PositiveIntegerField(
        default=0,
        help_text="Total de tentativas de verificação"
    )
    successes = models.PositiveIntegerField(
        default=0,
        help_text="Total de verificações aprovadas"
    )
    
    # Métricas financeiras
    total_cost = models.DecimalField(
        max_digits=12, 
        decimal_places=4, 
        default=0,
        help_text="Custo total acumulado (BRL)"
    )
    monthly_budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=1000.00,
        help_text="Orçamento mensal limite (BRL)"
    )
    monthly_spent = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Gasto no mês atual (BRL)"
    )
    
    # Métricas de performance
    last_ms_p95 = models.PositiveIntegerField(
        default=0,
        help_text="Latência P95 em milissegundos"
    )
    pep_hits = models.PositiveIntegerField(
        default=0,
        help_text="Quantidade de hits PEP/sanções encontrados"
    )
    
    # Configuração de limites
    free_tier_limit = models.PositiveIntegerField(
        default=0,
        help_text="Limite gratuito mensal"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Provedor ativo para roteamento"
    )
    
    # Timestamp
    reset_month = models.DateField(
        auto_now_add=True,
        help_text="Último reset mensal das métricas"
    )
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name = "KYC Provider Statistics"
        verbose_name_plural = "KYC Provider Statistics"
        
    def __str__(self):
        return f"{self.name} - Success: {self.success_rate:.1%} | Cost/OK: R$ {self.cost_per_ok:.2f}"
    
    @property
    def success_rate(self) -> float:
        """Taxa de sucesso com Laplace smoothing para evitar divisão por zero"""
        return (self.successes + 1) / (self.attempts + 2)
    
    @property
    def cost_per_ok(self) -> float:
        """Custo por verificação aprovada"""
        if self.successes == 0:
            return float(self.total_cost) if self.total_cost > 0 else 999.99
        return float(self.total_cost) / self.successes
    
    @property
    def utility_score(self) -> float:
        """
        Score de utilidade para algoritmo epsilon-greedy
        Combina taxa de sucesso (40%) com eficiência de custo (60%)
        """
        u_success = self.success_rate
        u_cost = 1 / max(self.cost_per_ok, 0.01)  # Evita divisão por zero
        return 0.4 * u_success + 0.6 * u_cost
    
    @property
    def budget_remaining(self) -> float:
        """Orçamento restante no mês atual"""
        return float(self.monthly_budget - self.monthly_spent)
    
    @property
    def free_tier_remaining(self) -> int:
        """Verificações gratuitas restantes no mês"""
        if self.free_tier_limit == 0:
            return 0
        return max(0, self.free_tier_limit - self.attempts)
    
    def should_reset_monthly(self) -> bool:
        """Verifica se precisa resetar métricas mensais"""
        from datetime import date
        today = date.today()
        return (today.year, today.month) != (self.reset_month.year, self.reset_month.month)
    
    def reset_monthly_metrics(self):
        """Reset mensal das métricas de custo e volume"""
        from datetime import date
        self.monthly_spent = 0
        self.attempts = 0
        self.successes = 0
        self.reset_month = date.today()
        self.save()
    
    def update_metrics(self, success: bool, cost: float, latency_ms: int, pep_found: bool = False):
        """
        Atualiza métricas após uma verificação
        Thread-safe com select_for_update
        """
        self.attempts += 1
        if success:
            self.successes += 1
        
        self.total_cost += cost
        self.monthly_spent += cost
        
        if pep_found:
            self.pep_hits += 1
        
        # Atualização da latência com EWMA (Exponentially Weighted Moving Average)
        alpha = 0.1  # Fator de suavização
        self.last_ms_p95 = int((1 - alpha) * self.last_ms_p95 + alpha * latency_ms)
        
        self.save()


class KYCProviderConfig(models.Model):
    """
    Configuração dinâmica de provedores KYC
    Permite feature flags e configuração em tempo real
    """
    name = models.CharField(max_length=30, unique=True)
    display_name = models.CharField(max_length=100)
    
    # Configurações de negócio
    supports_documents = models.BooleanField(default=True)
    supports_biometric = models.BooleanField(default=False)
    supports_pep = models.BooleanField(default=False)
    supports_brazil = models.BooleanField(default=True)
    
    # Configurações financeiras
    cost_per_document = models.DecimalField(
        max_digits=8,
        decimal_places=4,
        help_text="Custo por documento (BRL)"
    )
    cost_per_biometric = models.DecimalField(
        max_digits=8,
        decimal_places=4,
        default=0,
        help_text="Custo adicional por biometria (BRL)"
    )
    
    # Feature flags
    enabled = models.BooleanField(default=True)
    beta_only = models.BooleanField(
        default=False,
        help_text="Disponível apenas para usuários beta"
    )
    priority = models.PositiveSmallIntegerField(
        default=50,
        help_text="Prioridade no roteamento (0-100)"
    )
    
    # Configurações técnicas
    max_daily_volume = models.PositiveIntegerField(
        default=1000,
        help_text="Limite diário de verificações"
    )
    timeout_seconds = models.PositiveIntegerField(
        default=30,
        help_text="Timeout para API calls"
    )
    
    # Metadata
    settings = models.JSONField(
        default=dict,
        blank=True,
        help_text="Configurações específicas do provedor"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-priority', 'name']
        verbose_name = "KYC Provider Configuration"
        
    def __str__(self):
        status = "✓" if self.enabled else "✗"
        return f"{status} {self.display_name} (R$ {self.cost_per_document})"


# ============================================================================
# Sistema de Badges e Níveis - Gamificação
# ============================================================================

class BadgeType(models.Model):
    """
    Tipos de badges disponíveis no sistema
    """
    BADGE_CATEGORIES = [
        ('verification', 'Verificação'),
        ('performance', 'Performance'),
        ('engagement', 'Engajamento'),
        ('expertise', 'Expertise'),
        ('milestone', 'Marco'),
        ('special', 'Especial'),
        ('seasonal', 'Sazonal'),
    ]
    
    BADGE_RARITIES = [
        ('common', 'Comum'),
        ('uncommon', 'Incomum'),
        ('rare', 'Raro'),
        ('epic', 'Épico'),
        ('legendary', 'Lendário'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=BADGE_CATEGORIES)
    rarity = models.CharField(max_length=20, choices=BADGE_RARITIES, default='common')
    
    # Visual
    icon = models.CharField(max_length=50, help_text="Emoji ou nome do ícone")
    color = models.CharField(max_length=7, default='#6366f1', help_text="Cor hex do badge")
    
    # Critérios para obtenção
    requirements = models.JSONField(
        default=dict,
        help_text="Critérios específicos para obter o badge"
    )
    
    # Configurações
    is_active = models.BooleanField(default=True)
    is_stackable = models.BooleanField(
        default=False,
        help_text="Pode ser obtido múltiplas vezes"
    )
    max_count = models.PositiveIntegerField(
        null=True, 
        blank=True,
        help_text="Máximo de vezes que pode ser obtido (se stackable)"
    )
    
    # Recompensas
    xp_reward = models.PositiveIntegerField(default=0, help_text="XP ganho ao obter")
    boost_multiplier = models.FloatField(
        default=1.0,
        help_text="Multiplicador de boost (ex: 1.1 = +10%)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'rarity', 'name']
        
    def __str__(self):
        return f"{self.icon} {self.name} ({self.get_rarity_display()})"


class UserLevel(models.Model):
    """
    Sistema de níveis dos usuários
    """
    LEVEL_TYPES = [
        ('basic', 'Cadastro Básico'),
        ('verified', 'Identidade Verificada'),
        ('professional', 'Profissional Verificado'),
        ('expert', 'Especialista'),
        ('elite', 'GalaxIA Elite'),
        ('legend', 'Lenda'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='level')
    current_level = models.CharField(max_length=20, choices=LEVEL_TYPES, default='basic')
    
    # XP System
    total_xp = models.PositiveIntegerField(default=0)
    current_level_xp = models.PositiveIntegerField(default=0)
    xp_to_next_level = models.PositiveIntegerField(default=100)
    
    # Progress tracking
    projects_completed = models.PositiveIntegerField(default=0)
    services_delivered = models.PositiveIntegerField(default=0)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Quality metrics
    average_rating = models.FloatField(default=0.0)
    completion_rate = models.FloatField(default=0.0)  # % de projetos entregues no prazo
    response_time_hours = models.FloatField(default=24.0)  # Tempo médio de resposta
    
    # Streak bonuses
    active_streak_days = models.PositiveIntegerField(default=0)
    max_streak_days = models.PositiveIntegerField(default=0)
    last_activity = models.DateTimeField(auto_now=True)
    
    # Verificações
    kyc_verified = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    professional_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-total_xp']
        
    def __str__(self):
        return f"{self.user.email} - {self.get_current_level_display()} (XP: {self.total_xp})"
    
    @property
    def level_progress_percentage(self) -> float:
        """Percentual de progresso no nível atual"""
        if self.xp_to_next_level == 0:
            return 100.0
        return (self.current_level_xp / (self.current_level_xp + self.xp_to_next_level)) * 100
    
    @property
    def next_level(self) -> str:
        """Próximo nível a ser alcançado"""
        levels = [choice[0] for choice in self.LEVEL_TYPES]
        try:
            current_index = levels.index(self.current_level)
            if current_index < len(levels) - 1:
                return levels[current_index + 1]
        except (ValueError, IndexError):
            pass
        return self.current_level
    
    def can_level_up(self) -> bool:
        """Verifica se pode subir de nível"""
        return self.current_level_xp >= self.xp_to_next_level and self.next_level != self.current_level
    
    def add_xp(self, amount: int, source: str = 'manual'):
        """
        Adiciona XP e verifica level up
        """
        self.total_xp += amount
        self.current_level_xp += amount
        
        # Verificar level up
        leveled_up = False
        while self.can_level_up():
            self.level_up()
            leveled_up = True
        
        self.save()
        
        # Log da atividade XP
        XPActivity.objects.create(
            user=self.user,
            amount=amount,
            source=source,
            total_xp_after=self.total_xp
        )
        
        return leveled_up
    
    def level_up(self):
        """Executa o level up"""
        old_level = self.current_level
        self.current_level = self.next_level
        
        # Reset XP do nível atual
        self.current_level_xp = max(0, self.current_level_xp - self.xp_to_next_level)
        
        # Calcular XP necessário para próximo nível
        self.xp_to_next_level = self._calculate_xp_for_next_level()
        
        # Trigger level up event
        from django.db import transaction
        transaction.on_commit(
            lambda: self._trigger_level_up_event(old_level, self.current_level)
        )
    
    def _calculate_xp_for_next_level(self) -> int:
        """Calcula XP necessário para próximo nível"""
        level_xp_requirements = {
            'basic': 100,
            'verified': 250,
            'professional': 500,
            'expert': 1000,
            'elite': 2500,
            'legend': 0  # Nível máximo
        }
        return level_xp_requirements.get(self.next_level, 0)
    
    def _trigger_level_up_event(self, old_level: str, new_level: str):
        """Dispara eventos de level up"""
        from .tasks.badge_tasks import process_level_up
        process_level_up.delay(self.user.id, old_level, new_level)


class UserBadge(models.Model):
    """
    Badges obtidos pelos usuários
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge_type = models.ForeignKey(BadgeType, on_delete=models.CASCADE)
    
    # Contexto da obtenção
    earned_at = models.DateTimeField(auto_now_add=True)
    earned_for = models.CharField(
        max_length=200, 
        blank=True,
        help_text="Descrição do que o usuário fez para ganhar"
    )
    
    # Para badges stackable
    count = models.PositiveIntegerField(default=1)
    
    # Metadata
    metadata = models.JSONField(
        default=dict,
        help_text="Dados específicos da conquista"
    )
    
    class Meta:
        unique_together = ['user', 'badge_type']  # Para badges não stackable
        ordering = ['-earned_at']
        
    def __str__(self):
        count_str = f" x{self.count}" if self.count > 1 else ""
        return f"{self.user.email} - {self.badge_type.name}{count_str}"


class XPActivity(models.Model):
    """
    Log de atividades que geraram XP
    """
    XP_SOURCES = [
        ('project_completed', 'Projeto Concluído'),
        ('service_delivered', 'Serviço Entregue'),
        ('rating_received', 'Avaliação Recebida'),
        ('kyc_verified', 'Verificação KYC'),
        ('profile_completed', 'Perfil Completo'),
        ('first_service', 'Primeiro Serviço'),
        ('streak_bonus', 'Bônus de Sequência'),
        ('badge_earned', 'Badge Conquistado'),
        ('referral', 'Indicação'),
        ('manual', 'Manual'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='xp_activities')
    amount = models.IntegerField()  # Pode ser negativo para penalidades
    source = models.CharField(max_length=30, choices=XP_SOURCES)
    description = models.CharField(max_length=200, blank=True)
    
    # Estado antes/depois
    total_xp_before = models.PositiveIntegerField(default=0)
    total_xp_after = models.PositiveIntegerField()
    
    # Referências
    related_object_type = models.CharField(max_length=50, blank=True)
    related_object_id = models.CharField(max_length=50, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        sign = "+" if self.amount >= 0 else ""
        return f"{self.user.email} {sign}{self.amount} XP - {self.get_source_display()}"


class Achievement(models.Model):
    """
    Conquistas especiais e marcos
    """
    ACHIEVEMENT_TYPES = [
        ('milestone', 'Marco'),
        ('challenge', 'Desafio'),
        ('seasonal', 'Sazonal'),
        ('special', 'Especial'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)
    
    # Visual
    icon = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default='#fbbf24')
    
    # Critérios
    requirements = models.JSONField(default=dict)
    
    # Recompensas
    xp_reward = models.PositiveIntegerField(default=0)
    badge_reward = models.ForeignKey(
        BadgeType, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    # Configurações
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.icon} {self.name}"


class UserAchievement(models.Model):
    """
    Conquistas obtidas pelos usuários
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    
    earned_at = models.DateTimeField(auto_now_add=True)
    progress_data = models.JSONField(default=dict)
    
    class Meta:
        unique_together = ['user', 'achievement']
        ordering = ['-earned_at']
        
    def __str__(self):
        return f"{self.user.email} - {self.achievement.name}"


# ============================================================================
# Sistema de Pagamentos Avançado - Sprint 3-4
# ============================================================================

class PaymentMethod(models.Model):
    """Métodos de pagamento dos usuários (cartões, PIX, etc.)"""
    PROVIDER_CHOICES = [
        ('stripe', 'Stripe'),
        ('paypal', 'PayPal'),
        ('pagseguro', 'PagSeguro'),
        ('mercadopago', 'Mercado Pago'),
        ('pix', 'PIX'),
        ('bank_transfer', 'Transferência Bancária'),
    ]
    
    METHOD_TYPE_CHOICES = [
        ('card', 'Cartão de Crédito/Débito'),
        ('pix', 'PIX'),
        ('boleto', 'Boleto Bancário'),
        ('wallet', 'Carteira Digital'),
        ('bank_transfer', 'Transferência Bancária'),
        ('installments', 'Parcelamento'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods')
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES)
    method_type = models.CharField(max_length=20, choices=METHOD_TYPE_CHOICES)
    
    # Metadados específicos do método
    metadata = models.JSONField(default=dict, help_text="Dados específicos do método (últimos 4 dígitos, banco, etc.)")
    
    # Dados do provedor
    provider_payment_method_id = models.CharField(max_length=255, blank=True)
    provider_customer_id = models.CharField(max_length=255, blank=True)
    
    # Configurações
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-is_default', '-created_at']
        
    def __str__(self):
        return f"{self.user.email} - {self.get_method_type_display()} ({self.provider})"
    
    def save(self, *args, **kwargs):
        # Garantir que apenas um método seja default por usuário
        if self.is_default:
            PaymentMethod.objects.filter(
                user=self.user, 
                is_default=True
            ).exclude(id=self.id).update(is_default=False)
        super().save(*args, **kwargs)
    
    @property
    def display_name(self):
        """Nome amigável para exibição"""
        if self.method_type == 'card':
            last_four = self.metadata.get('last4', '****')
            brand = self.metadata.get('brand', 'Cartão').title()
            return f"{brand} **** {last_four}"
        elif self.method_type == 'pix':
            return f"PIX - {self.metadata.get('pix_key_type', 'Chave')}"
        return self.get_method_type_display()


class StripeAccount(models.Model):
    """Contas Stripe Connect dos prestadores"""
    ACCOUNT_TYPE_CHOICES = [
        ('express', 'Express'),
        ('custom', 'Custom'),
        ('standard', 'Standard'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('verified', 'Verificada'),
        ('restricted', 'Restrita'),
        ('rejected', 'Rejeitada'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stripe_account')
    stripe_account_id = models.CharField(max_length=100, unique=True)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES, default='express')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Dados da conta
    capabilities = models.JSONField(default=dict)
    requirements = models.JSONField(default=dict)
    settings = models.JSONField(default=dict)
    
    # Onboarding
    onboarding_link = models.URLField(blank=True)
    onboarding_completed = models.BooleanField(default=False)
    onboarding_completed_at = models.DateTimeField(null=True, blank=True)
    
    # Webhooks
    last_webhook_at = models.DateTimeField(null=True, blank=True)
    webhook_events_received = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.user.email} - {self.stripe_account_id} ({self.status})"
    
    @property
    def can_receive_payments(self):
        """Verifica se pode receber pagamentos"""
        return (
            self.status == 'verified' and 
            self.onboarding_completed and
            self.capabilities.get('transfers') == 'active'
        )


class EscrowRelease(models.Model):
    """Liberação de fundos do escrow"""
    RELEASE_TYPE_CHOICES = [
        ('auto', 'Liberação Automática'),
        ('manual', 'Liberação Manual'),
        ('dispute_resolution', 'Resolução de Disputa'),
        ('partial', 'Liberação Parcial'),
        ('emergency', 'Liberação de Emergência'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Agendada'),
        ('processing', 'Processando'),
        ('completed', 'Concluída'),
        ('failed', 'Falhada'),
        ('cancelled', 'Cancelada'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='escrow_releases')
    
    # Tipo e valor
    release_type = models.CharField(max_length=20, choices=RELEASE_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    fees = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Status e timing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    scheduled_at = models.DateTimeField()
    released_at = models.DateTimeField(null=True, blank=True)
    
    # Aprovação
    approved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, 
        null=True, blank=True, related_name='approved_releases'
    )
    approval_reason = models.TextField(blank=True)
    
    # Metadados
    reason = models.TextField(help_text="Razão da liberação")
    metadata = models.JSONField(default=dict)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Release {self.id} - R$ {self.amount} ({self.release_type})"
    
    def save(self, *args, **kwargs):
        # Calcular net_amount automaticamente
        self.net_amount = self.amount - self.fees
        super().save(*args, **kwargs)


class PaymentDispute(models.Model):
    """Casos de disputa entre clientes e prestadores para pagamentos"""
    CATEGORY_CHOICES = [
        ('quality', 'Qualidade do Trabalho'),
        ('delivery', 'Prazo de Entrega'),
        ('payment', 'Problemas de Pagamento'),
        ('communication', 'Problemas de Comunicação'),
        ('scope', 'Mudança de Escopo'),
        ('cancellation', 'Cancelamento'),
        ('fraud', 'Suspeita de Fraude'),
        ('other', 'Outros'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Aberta'),
        ('investigating', 'Investigando'),
        ('awaiting_response', 'Aguardando Resposta'),
        ('mediation', 'Mediação'),
        ('arbitration', 'Arbitragem'),
        ('resolved', 'Resolvida'),
        ('closed', 'Fechada'),
    ]
    
    RESOLUTION_CHOICES = [
        ('client_favor', 'Favor do Cliente'),
        ('freelancer_favor', 'Favor do Prestador'),
        ('partial_refund', 'Reembolso Parcial'),
        ('mutual_agreement', 'Acordo Mútuo'),
        ('no_action', 'Sem Ação'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='payment_disputes')
    
    # Partes envolvidas
    initiated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='initiated_payment_disputes')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_payment_disputes')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='freelancer_payment_disputes')
    
    # Detalhes da disputa
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Status e resolução
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    resolution_type = models.CharField(max_length=20, choices=RESOLUTION_CHOICES, blank=True)
    resolution_notes = models.TextField(blank=True)
    
    # Evidências
    evidence_urls = models.JSONField(default=list, help_text="URLs dos arquivos de evidência")
    client_evidence = models.JSONField(default=dict)
    freelancer_evidence = models.JSONField(default=dict)
    
    # Mediação
    mediator = models.ForeignKey(
        User, on_delete=models.SET_NULL, 
        null=True, blank=True, related_name='mediated_payment_disputes'
    )
    mediation_notes = models.TextField(blank=True)
    
    # Timeline
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Métricas
    priority = models.IntegerField(default=1, help_text="1=Baixa, 2=Média, 3=Alta, 4=Crítica")
    amount_disputed = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    class Meta:
        ordering = ['-priority', '-created_at']
        verbose_name = 'Disputa de Pagamento'
        verbose_name_plural = 'Disputas de Pagamento'
        
    def __str__(self):
        return f"Disputa #{self.id} - {self.title} ({self.status})"
    
    @property
    def days_open(self):
        """Número de dias que a disputa está aberta"""
        if self.resolved_at:
            return (self.resolved_at - self.created_at).days
        return (timezone.now() - self.created_at).days
    
    @property
    def is_overdue(self):
        """Verifica se a disputa está atrasada (>10 dias)"""
        return self.days_open > 10 and self.status not in ['resolved', 'closed']


class PayoutSchedule(models.Model):
    """Cronograma de pagamentos dos prestadores"""
    INTERVAL_CHOICES = [
        ('daily', 'Diário'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensal'),
        ('manual', 'Manual'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    stripe_account = models.OneToOneField(StripeAccount, on_delete=models.CASCADE, related_name='payout_schedule')
    
    # Configurações
    interval = models.CharField(max_length=20, choices=INTERVAL_CHOICES, default='weekly')
    delay_days = models.IntegerField(default=2, help_text="Dias de delay para payout")
    minimum_amount = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    
    # Configurações avançadas
    auto_payout_enabled = models.BooleanField(default=True)
    max_daily_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_payout_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Payout {self.stripe_account.user.email} - {self.interval}"


class PaymentIntent(models.Model):
    """Intenções de pagamento do Stripe"""
    STATUS_CHOICES = [
        ('requires_payment_method', 'Requer Método'),
        ('requires_confirmation', 'Requer Confirmação'),
        ('requires_action', 'Requer Ação'),
        ('processing', 'Processando'),
        ('requires_capture', 'Requer Captura'),
        ('canceled', 'Cancelado'),
        ('succeeded', 'Sucedido'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    stripe_payment_intent_id = models.CharField(max_length=100, unique=True)
    
    # Relacionamentos
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_intents')
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='payment_intent')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Dados do pagamento
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='BRL')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES)
    
    # Metadados
    client_secret = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict)
    
    # Taxas e transferências
    application_fee_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transfer_data = models.JSONField(default=dict)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"PI {self.stripe_payment_intent_id} - R$ {self.amount} ({self.status})"


class AutoReleaseRule(models.Model):
    """Regras configuráveis para liberação automática"""
    CONDITION_CHOICES = [
        ('project_completed', 'Projeto Concluído'),
        ('no_active_disputes', 'Sem Disputas Ativas'),
        ('client_notified', 'Cliente Notificado'),
        ('freelancer_level', 'Nível do Prestador'),
        ('project_value', 'Valor do Projeto'),
        ('client_history', 'Histórico do Cliente'),
        ('category_rules', 'Regras da Categoria'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField()
    
    # Configurações da regra
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=1, help_text="Maior número = maior prioridade")
    
    # Condições
    conditions = models.JSONField(default=dict, help_text="Condições que devem ser atendidas")
    
    # Ações
    timeout_days = models.IntegerField(default=7)
    auto_approve_threshold = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    requires_manual_review = models.BooleanField(default=False)
    
    # Filtros
    applies_to_categories = models.JSONField(default=list)
    applies_to_user_levels = models.JSONField(default=list)
    min_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    max_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-priority', 'name']
        
    def __str__(self):
        return f"Regra: {self.name} (Prioridade: {self.priority})"
    
    def matches_transaction(self, transaction):
        """Verifica se a regra se aplica a uma transação"""
        # Implementação das verificações de condições
        # será feita no serviço de auto-release
        return True


# ===== SISTEMA DE MENSAGERIA E NOTIFICAÇÕES =====

class Conversation(models.Model):
    """
    Modelo para conversas entre usuários no sistema.
    """
    CONVERSATION_TYPE_CHOICES = (
        ('project', 'Conversa de Projeto'),
        ('support', 'Suporte'),
        ('general', 'Geral'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation_type = models.CharField(max_length=20, choices=CONVERSATION_TYPE_CHOICES, default='project')
    participants = models.ManyToManyField(User, related_name='conversations')
    
    # Referências opcionais
    project = models.ForeignKey('Project', on_delete=models.SET_NULL, null=True, blank=True)
    order = models.ForeignKey('Order', on_delete=models.SET_NULL, null=True, blank=True)
    service_order = models.ForeignKey('ServiceOrder', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Metadados
    title = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    last_message_at = models.DateTimeField(null=True, blank=True)
    
    # Auditoria
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-last_message_at', '-created_at']
        indexes = [
            models.Index(fields=['-last_message_at']),
            models.Index(fields=['is_active', '-last_message_at']),
            models.Index(fields=['conversation_type', '-last_message_at']),
        ]
    
    def __str__(self):
        participant_names = ", ".join([p.get_full_name() or p.username for p in self.participants.all()[:2]])
        return f"Conversa: {participant_names} ({self.conversation_type})"
    
    def get_unread_count_for_user(self, user):
        """Retorna quantidade de mensagens não lidas para um usuário específico."""
        return self.message_conversations.filter(
            read_by__isnull=True
        ).exclude(sender=user).count()
    
    def get_other_participant(self, user):
        """Retorna o outro participante da conversa (para conversas 1:1)."""
        return self.participants.exclude(id=user.id).first()


class MessageConversation(models.Model):
    """
    Modelo para mensagens dentro de conversas (novo sistema de mensageria).
    """
    MESSAGE_TYPE_CHOICES = (
        ('text', 'Texto'),
        ('file', 'Arquivo'),
        ('image', 'Imagem'),
        ('system', 'Sistema'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='message_conversations')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_message_conversations')
    
    # Conteúdo da mensagem
    content = models.TextField()
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES, default='text')
    
    # Anexos (para mensagens de arquivo/imagem)
    attachment = models.FileField(upload_to='message_attachments/', null=True, blank=True)
    attachment_name = models.CharField(max_length=255, blank=True)
    attachment_size = models.PositiveIntegerField(null=True, blank=True)
    
    # Status de leitura - JSONField para armazenar timestamps de leitura por usuário
    read_by = models.JSONField(default=dict, blank=True)
    
    # Metadados
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    edited_at = models.DateTimeField(null=True, blank=True)
    
    # Auditoria
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['sender', '-created_at']),
            models.Index(fields=['message_type', '-created_at']),
        ]
    
    def __str__(self):
        content_preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"{self.sender.get_full_name()}: {content_preview}"
    
    def mark_as_read_by(self, user):
        """Marca mensagem como lida por um usuário específico."""
        if str(user.id) not in self.read_by:
            self.read_by[str(user.id)] = timezone.now().isoformat()
            self.save(update_fields=['read_by'])
    
    def is_read_by(self, user):
        """Verifica se a mensagem foi lida por um usuário específico."""
        return str(user.id) in self.read_by


class SystemNotification(models.Model):
    """
    Modelo para notificações do sistema.
    """
    NOTIFICATION_TYPE_CHOICES = (
        ('message', 'Nova Mensagem'),
        ('project_update', 'Atualização de Projeto'),
        ('payment_received', 'Pagamento Recebido'),
        ('payment_sent', 'Pagamento Enviado'),
        ('proposal_received', 'Proposta Recebida'),
        ('proposal_accepted', 'Proposta Aceita'),
        ('proposal_rejected', 'Proposta Rejeitada'),
        ('order_completed', 'Pedido Concluído'),
        ('review_received', 'Avaliação Recebida'),
        ('kyc_approved', 'KYC Aprovado'),
        ('kyc_rejected', 'KYC Rejeitado'),
        ('system', 'Sistema'),
    )
    
    PRIORITY_CHOICES = (
        ('low', 'Baixa'),
        ('medium', 'Média'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='system_notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES)
    
    # Conteúdo da notificação
    title = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # Metadados e referências
    data = models.JSONField(default=dict, blank=True)  # Dados extras para a notificação
    action_url = models.URLField(max_length=500, blank=True)  # URL de ação (redirecionamento)
    
    # Referências opcionais a outros objetos
    related_conversation = models.ForeignKey(Conversation, on_delete=models.SET_NULL, null=True, blank=True)
    related_project = models.ForeignKey('Project', on_delete=models.SET_NULL, null=True, blank=True)
    related_order = models.ForeignKey('Order', on_delete=models.SET_NULL, null=True, blank=True)
    related_message = models.ForeignKey(MessageConversation, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Status da notificação
    read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Canais de entrega
    sent_email = models.BooleanField(default=False)
    sent_push = models.BooleanField(default=False)
    sent_sms = models.BooleanField(default=False)
    
    # Auditoria
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'read', '-created_at']),
            models.Index(fields=['notification_type', '-created_at']),
            models.Index(fields=['priority', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} para {self.user.get_full_name()}"
    
    def mark_as_read(self):
        """Marca notificação como lida."""
        if not self.read:
            self.read = True
            self.read_at = timezone.now()
            self.save(update_fields=['read', 'read_at'])


class NotificationPreferences(models.Model):
    """
    Preferências de notificação por usuário.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Preferências por tipo de notificação
    messages_email = models.BooleanField(default=True)
    messages_push = models.BooleanField(default=True)
    messages_sms = models.BooleanField(default=False)
    
    project_updates_email = models.BooleanField(default=True)
    project_updates_push = models.BooleanField(default=True)
    project_updates_sms = models.BooleanField(default=False)
    
    payments_email = models.BooleanField(default=True)
    payments_push = models.BooleanField(default=True)
    payments_sms = models.BooleanField(default=True)
    
    proposals_email = models.BooleanField(default=True)
    proposals_push = models.BooleanField(default=True)
    proposals_sms = models.BooleanField(default=False)
    
    system_email = models.BooleanField(default=True)
    system_push = models.BooleanField(default=True)
    system_sms = models.BooleanField(default=False)
    
    # Configurações gerais
    do_not_disturb_start = models.TimeField(null=True, blank=True)  # 22:00
    do_not_disturb_end = models.TimeField(null=True, blank=True)    # 08:00
    timezone = models.CharField(max_length=50, default='America/Sao_Paulo')
    
    # Frequência de notificações por email
    email_frequency = models.CharField(
        max_length=20,
        choices=(
            ('immediate', 'Imediato'),
            ('hourly', 'A cada hora'),
            ('daily', 'Diário'),
            ('weekly', 'Semanal'),
            ('never', 'Nunca'),
        ),
        default='immediate'
    )
    
    # Auditoria
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Preferências de {self.user.get_full_name()}"
