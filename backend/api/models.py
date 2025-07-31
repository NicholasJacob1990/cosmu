
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify
from django.utils import timezone

# É uma boa prática usar um modelo de usuário customizado em projetos Django.
# Isso nos dá flexibilidade para adicionar campos como 'userType' futuramente.
class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('client', 'Client'),
        ('freelancer', 'Freelancer'),
    )
    # Removemos a necessidade de 'username' e usamos 'email' como identificador principal.
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='client')
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

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.email

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
