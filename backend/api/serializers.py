from rest_framework import serializers
from django.contrib.auth import authenticate
# TODO: Add allauth imports when fully configured
# from allauth.socialaccount.models import SocialAccount
# from allauth.account.models import EmailAddress
from .models import (
    User, FreelancerProfile, Category, ServicePackage, 
    Project, Proposal, ServiceOrder, Order, Review, 
    Message, Subscription, PlanFeature, FeatureUsage, 
    AddOn, Transaction, Availability, Booking, TimeSlot, 
    BookingChangeRequest, Dispute, DisputeEvidence, 
    DisputeMessage, DisputeResolution, PaymentMethod,
    StripeAccount, EscrowRelease, PaymentDispute,
    PaymentIntent, AutoReleaseRule, PayoutSchedule
)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'user_type',
            'professional_type', 'entity_type', 'onboarding_completed', 'onboarding_step',
            'profile_image_url', 'phone', 'phone_verified', 'email_verified',
            'two_factor_enabled', 'password', 'password_confirm'
        ]
        read_only_fields = ['id', 'phone_verified', 'email_verified', 'two_factor_enabled']
    
    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError("As senhas não coincidem.")
        
        # Validar tipos profissionais
        user_type = attrs.get('user_type')
        professional_type = attrs.get('professional_type')
        
        if user_type == 'freelancer' and not professional_type:
            # Para freelancers, sugerir tipo geral se não especificado
            attrs['professional_type'] = 'general'
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        
        # Mapear dados do frontend para backend se necessário
        professional_data = validated_data.pop('professional_data', {})
        
        # Usar o email como username para o create_user
        validated_data['username'] = validated_data['email']
        
        # Definir user_type baseado em professional_type se não especificado
        if validated_data.get('professional_type') and not validated_data.get('user_type'):
            validated_data['user_type'] = 'freelancer'
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Se for freelancer e tiver dados profissionais, criar/atualizar perfil
        if user.user_type == 'freelancer' and professional_data:
            self._create_or_update_freelancer_profile(user, professional_data)
        
        return user
    
    def _create_or_update_freelancer_profile(self, user, professional_data):
        """Cria ou atualiza perfil de freelancer com dados do onboarding"""
        try:
            from .models import FreelancerProfile
            
            profile, created = FreelancerProfile.objects.get_or_create(
                user=user,
                defaults={
                    'title': professional_data.get('title', f'{user.get_professional_type_display()}'),
                    'bio': professional_data.get('bio', ''),
                    'hourly_rate': professional_data.get('hourly_rate', 50.0),
                    'location': professional_data.get('location', ''),
                    'skills': professional_data.get('skills', []),
                    'experience_level': professional_data.get('experience_level', 'intermediate'),
                }
            )
            
            if not created:
                # Atualizar perfil existente com novos dados
                for field, value in professional_data.items():
                    if hasattr(profile, field):
                        setattr(profile, field, value)
                profile.save()
                
        except Exception as e:
            # Log error mas não falha o registro
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Erro ao criar/atualizar perfil freelancer: {e}")


# Novo serializer específico para onboarding profissional
class ProfessionalRegistrationSerializer(UserSerializer):
    """Serializer especializado para registro de profissionais com onboarding"""
    
    # Campos específicos do onboarding
    company_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    cpf_cnpj = serializers.CharField(max_length=20, required=False, allow_blank=True)
    specialty = serializers.CharField(max_length=100, required=False, allow_blank=True)
    experience_years = serializers.IntegerField(required=False, min_value=0)
    hourly_rate = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    service_description = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + [
            'company_name', 'cpf_cnpj', 'specialty', 'experience_years', 
            'hourly_rate', 'service_description'
        ]
    
    def create(self, validated_data):
        # Extrair dados específicos do onboarding
        onboarding_fields = [
            'company_name', 'cpf_cnpj', 'specialty', 'experience_years',
            'hourly_rate', 'service_description'
        ]
        
        professional_data = {}
        for field in onboarding_fields:
            if field in validated_data:
                professional_data[field] = validated_data.pop(field)
        
        # Definir como freelancer e marcar onboarding como iniciado
        validated_data['user_type'] = 'freelancer'
        validated_data['onboarding_step'] = 1
        validated_data['professional_data'] = professional_data
        
        return super().create(validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Credenciais inválidas.')
            if not user.is_active:
                raise serializers.ValidationError('Conta desativada.')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Email e senha são obrigatórios.')


class FreelancerProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    class Meta:
        model = FreelancerProfile
        fields = '__all__'
        read_only_fields = ['id', 'user', 'average_rating', 'total_reviews', 
                          'completed_projects', 'profile_views', 'success_rate']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ServicePackageSerializer(serializers.ModelSerializer):
    freelancer_name = serializers.CharField(source='freelancer.user.first_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = ServicePackage
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.first_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    proposals_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['id', 'client', 'created_at', 'updated_at']


class ProposalSerializer(serializers.ModelSerializer):
    freelancer_name = serializers.CharField(source='freelancer.user.first_name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    
    class Meta:
        model = Proposal
        fields = '__all__'
        read_only_fields = ['id', 'freelancer', 'created_at', 'updated_at']


class ServiceOrderSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.first_name', read_only=True)
    service_title = serializers.CharField(source='service_package.title', read_only=True)
    
    class Meta:
        model = ServiceOrder
        fields = '__all__'
        read_only_fields = ['id', 'client', 'created_at', 'updated_at']


class OrderSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.first_name', read_only=True)
    freelancer_name = serializers.CharField(source='freelancer.user.first_name', read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.first_name', read_only=True)
    reviewed_name = serializers.CharField(source='reviewed.first_name', read_only=True)
    
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['id', 'reviewer', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.first_name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.first_name', read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['id', 'sender', 'created_at']


class SubscriptionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    
    class Meta:
        model = Subscription
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class PlanFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanFeature
        fields = '__all__'


class FeatureUsageSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    feature_name = serializers.CharField(source='feature.name', read_only=True)
    
    class Meta:
        model = FeatureUsage
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class AddOnSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddOn
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class SocialAuthSerializer(serializers.Serializer):
    """Serializer para autenticação social (Google, Facebook)"""
    provider = serializers.CharField(help_text="Provedor social: 'google' ou 'facebook'")
    access_token = serializers.CharField(help_text="Token de acesso do provedor social")
    user_type = serializers.ChoiceField(choices=[('client', 'Client'), ('freelancer', 'Freelancer')], required=False)
    
    def validate_provider(self, value):
        if value not in ['google', 'facebook']:
            raise serializers.ValidationError("Provedor deve ser 'google' ou 'facebook'")
        return value


class UserProfileDetailSerializer(serializers.ModelSerializer):
    """Serializer estendido do usuário com informações sociais"""
    social_accounts = serializers.SerializerMethodField()
    email_verified = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'user_type',
            'profile_image_url', 'phone', 'phone_verified', 'email_verified',
            'two_factor_enabled', 'social_accounts', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def get_social_accounts(self, obj):
        """Retorna as contas sociais conectadas do usuário"""
        # TODO: Implementar quando allauth estiver configurado
        return []
    
    def get_email_verified(self, obj):
        """Verifica se o email foi verificado"""
        return obj.email_verified


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer para verificação de email"""
    email = serializers.EmailField()
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Usuário com este email não encontrado.")
        return value


# Serializers para Sistema de Agendamento

class AvailabilitySerializer(serializers.ModelSerializer):
    day_of_week_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = Availability
        fields = ['id', 'day_of_week', 'day_of_week_display', 'start_time', 'end_time', 
                 'is_available', 'buffer_time', 'created_at', 'updated_at']


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['id', 'date', 'start_time', 'end_time', 'is_available', 'booking']


class BookingSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    freelancer_name = serializers.CharField(source='freelancer.user.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    duration_hours = serializers.ReadOnlyField()
    can_cancel = serializers.ReadOnlyField()
    
    class Meta:
        model = Booking
        fields = ['id', 'order', 'freelancer', 'client', 'client_name', 'freelancer_name',
                 'scheduled_start', 'scheduled_end', 'actual_start', 'actual_end',
                 'status', 'status_display', 'meeting_link', 'notes', 'freelancer_notes',
                 'duration_hours', 'can_cancel', 'reminder_sent', 'confirmation_sent',
                 'created_at', 'confirmed_at', 'cancelled_at', 'updated_at']
        read_only_fields = ['reminder_sent', 'confirmation_sent', 'confirmed_at', 'cancelled_at']


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de agendamentos"""
    
    class Meta:
        model = Booking
        fields = ['order', 'freelancer', 'scheduled_start', 'scheduled_end', 
                 'meeting_link', 'notes']
    
    def validate(self, attrs):
        # Verificar se o horário está disponível
        freelancer = attrs['freelancer']
        start = attrs['scheduled_start']
        end = attrs['scheduled_end']
        
        # Verificar conflitos de agendamento
        conflicting_bookings = Booking.objects.filter(
            freelancer=freelancer,
            scheduled_start__lt=end,
            scheduled_end__gt=start,
            status__in=['scheduled', 'confirmed', 'in_progress']
        )
        
        if conflicting_bookings.exists():
            raise serializers.ValidationError(
                "Já existe um agendamento nesse horário para este freelancer."
            )
        
        # Verificar se está dentro da disponibilidade do freelancer
        weekday = start.weekday()
        availability = Availability.objects.filter(
            freelancer=freelancer,
            day_of_week=weekday,
            is_available=True,
            start_time__lte=start.time(),
            end_time__gte=end.time()
        ).first()
        
        if not availability:
            raise serializers.ValidationError(
                "Freelancer não está disponível neste horário."
            )
        
        return attrs
    
    def create(self, validated_data):
        # Adicionar o cliente baseado no request user
        validated_data['client'] = self.context['request'].user
        return super().create(validated_data)


class BookingChangeRequestSerializer(serializers.ModelSerializer):
    request_type_display = serializers.CharField(source='get_request_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    
    class Meta:
        model = BookingChangeRequest
        fields = ['id', 'booking', 'requested_by', 'requested_by_name', 'request_type', 
                 'request_type_display', 'status', 'status_display', 'new_start', 'new_end',
                 'reason', 'response', 'created_at', 'responded_at']
        read_only_fields = ['requested_by', 'responded_at']
    
    def create(self, validated_data):
        validated_data['requested_by'] = self.context['request'].user
        return super().create(validated_data)


class AvailableTimeSlotsSerializer(serializers.Serializer):
    """Serializer para buscar horários disponíveis"""
    freelancer_id = serializers.UUIDField()
    date = serializers.DateField()
    duration_hours = serializers.DecimalField(max_digits=3, decimal_places=1, default=1.0)
    
    def validate_date(self, value):
        from datetime import date
        if value < date.today():
            raise serializers.ValidationError("Não é possível agendar para datas passadas.")
        return value


# Serializers para Sistema de Disputas

class DisputeSerializer(serializers.ModelSerializer):
    opened_by_name = serializers.CharField(source='opened_by.get_full_name', read_only=True)
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    freelancer_name = serializers.CharField(source='freelancer.user.get_full_name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    can_auto_resolve = serializers.ReadOnlyField()
    
    class Meta:
        model = Dispute
        fields = [
            'id', 'dispute_number', 'order', 'booking', 'client', 'client_name',
            'freelancer', 'freelancer_name', 'opened_by', 'opened_by_name',
            'category', 'category_display', 'title', 'description', 'status',
            'status_display', 'priority', 'priority_display', 'disputed_amount',
            'original_amount', 'resolution_type', 'resolution_amount',
            'resolution_notes', 'mediator', 'auto_resolution_deadline',
            'mediation_deadline', 'is_overdue', 'can_auto_resolve',
            'created_at', 'responded_at', 'mediation_started_at', 'resolved_at',
            'updated_at'
        ]
        read_only_fields = [
            'dispute_number', 'opened_by', 'auto_resolution_deadline',
            'mediation_deadline', 'responded_at', 'mediation_started_at',
            'resolved_at'
        ]


class DisputeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dispute
        fields = [
            'order', 'booking', 'client', 'freelancer', 'category',
            'title', 'description', 'disputed_amount', 'original_amount',
            'priority'
        ]
    
    def validate(self, attrs):
        # Verificar se já existe disputa ativa para este order/booking
        order = attrs.get('order')
        booking = attrs.get('booking')
        
        if order:
            existing_dispute = Dispute.objects.filter(
                order=order,
                status__in=['open', 'in_review', 'in_mediation']
            ).exists()
            if existing_dispute:
                raise serializers.ValidationError(
                    "Já existe uma disputa ativa para este pedido."
                )
        
        if booking:
            existing_dispute = Dispute.objects.filter(
                booking=booking,
                status__in=['open', 'in_review', 'in_mediation']
            ).exists()
            if existing_dispute:
                raise serializers.ValidationError(
                    "Já existe uma disputa ativa para este agendamento."
                )
        
        # Verificar valores
        disputed = attrs.get('disputed_amount', 0)
        original = attrs.get('original_amount', 0)
        
        if disputed > original:
            raise serializers.ValidationError(
                "Valor disputado não pode ser maior que o valor original."
            )
        
        return attrs
    
    def create(self, validated_data):
        validated_data['opened_by'] = self.context['request'].user
        return super().create(validated_data)


class DisputeEvidenceSerializer(serializers.ModelSerializer):
    submitted_by_name = serializers.CharField(source='submitted_by.get_full_name', read_only=True)
    evidence_type_display = serializers.CharField(source='get_evidence_type_display', read_only=True)
    
    class Meta:
        model = DisputeEvidence
        fields = [
            'id', 'dispute', 'submitted_by', 'submitted_by_name',
            'evidence_type', 'evidence_type_display', 'title',
            'description', 'file', 'file_url', 'created_at'
        ]
        read_only_fields = ['submitted_by']
    
    def create(self, validated_data):
        validated_data['submitted_by'] = self.context['request'].user
        return super().create(validated_data)


class DisputeMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    message_type_display = serializers.CharField(source='get_message_type_display', read_only=True)
    
    class Meta:
        model = DisputeMessage
        fields = [
            'id', 'dispute', 'sender', 'sender_name', 'message_type',
            'message_type_display', 'content', 'is_internal', 'created_at'
        ]
        read_only_fields = ['sender']
    
    def create(self, validated_data):
        # Determinar o tipo de mensagem baseado no usuário
        user = self.context['request'].user
        dispute = validated_data['dispute']
        
        if user == dispute.client:
            validated_data['message_type'] = 'client'
        elif hasattr(user, 'freelancer_profile') and user.freelancer_profile == dispute.freelancer:
            validated_data['message_type'] = 'freelancer'
        elif user.is_staff:
            validated_data['message_type'] = 'mediator'
        else:
            validated_data['message_type'] = 'system'
            
        validated_data['sender'] = user
        return super().create(validated_data)


class DisputeResolutionSerializer(serializers.ModelSerializer):
    outcome_display = serializers.CharField(source='get_outcome_display', read_only=True)
    is_agreed_by_both = serializers.ReadOnlyField()
    
    class Meta:
        model = DisputeResolution
        fields = [
            'id', 'dispute', 'outcome', 'outcome_display', 'reasoning',
            'refund_amount', 'freelancer_payment', 'platform_fee_waived',
            'freelancer_penalty', 'client_penalty', 'additional_actions',
            'agreed_by_client', 'agreed_by_freelancer', 'client_agreement_at',
            'freelancer_agreement_at', 'is_agreed_by_both', 'executed',
            'executed_at', 'executed_by', 'created_at'
        ]
        read_only_fields = [
            'client_agreement_at', 'freelancer_agreement_at',
            'executed_at', 'executed_by'
        ]


class DisputeDetailSerializer(DisputeSerializer):
    """Serializer detalhado para disputa incluindo evidências e mensagens"""
    evidence = DisputeEvidenceSerializer(many=True, read_only=True)
    messages = DisputeMessageSerializer(many=True, read_only=True)
    resolution = DisputeResolutionSerializer(read_only=True)
    
    class Meta(DisputeSerializer.Meta):
        fields = DisputeSerializer.Meta.fields + ['evidence', 'messages', 'resolution']


class DisputeResponseSerializer(serializers.Serializer):
    """Serializer para responder a uma disputa"""
    response_message = serializers.CharField(max_length=2000)
    accept_resolution = serializers.BooleanField(default=False)
    proposed_resolution = serializers.ChoiceField(
        choices=Dispute.RESOLUTION_TYPES,
        required=False
    )
    proposed_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )


# ============================================================================
# Serializers para Sistema de Pagamentos - Sprint 3-4
# ============================================================================

class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer para métodos de pagamento"""
    display_name = serializers.ReadOnlyField()
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'provider', 'method_type', 'metadata', 'is_default',
            'is_active', 'created_at', 'display_name', 'expires_at'
        ]
        read_only_fields = ['id', 'created_at', 'display_name']


class StripeAccountSerializer(serializers.ModelSerializer):
    """Serializer para contas Stripe Connect"""
    can_receive_payments = serializers.ReadOnlyField()
    
    class Meta:
        model = StripeAccount
        fields = [
            'id', 'stripe_account_id', 'account_type', 'status',
            'capabilities', 'requirements', 'onboarding_completed',
            'onboarding_completed_at', 'can_receive_payments', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'can_receive_payments']


class EscrowReleaseSerializer(serializers.ModelSerializer):
    """Serializer para liberações de escrow"""
    transaction_id = serializers.CharField(source='transaction.id', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = EscrowRelease
        fields = [
            'id', 'transaction_id', 'release_type', 'amount', 'fees',
            'net_amount', 'status', 'scheduled_at', 'released_at',
            'approved_by', 'approved_by_name', 'approval_reason',
            'reason', 'created_at'
        ]
        read_only_fields = [
            'id', 'net_amount', 'released_at', 'approved_by_name', 'created_at'
        ]


class PaymentDisputeSerializer(serializers.ModelSerializer):
    """Serializer para disputas de pagamento"""
    transaction_id = serializers.CharField(source='transaction.id', read_only=True)
    initiated_by_name = serializers.CharField(source='initiated_by.get_full_name', read_only=True)
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    freelancer_name = serializers.CharField(source='freelancer.get_full_name', read_only=True)
    mediator_name = serializers.CharField(source='mediator.get_full_name', read_only=True)
    days_open = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = PaymentDispute
        fields = [
            'id', 'transaction_id', 'initiated_by', 'initiated_by_name',
            'client', 'client_name', 'freelancer', 'freelancer_name',
            'category', 'title', 'description', 'status', 'resolution_type',
            'resolution_notes', 'evidence_urls', 'client_evidence',
            'freelancer_evidence', 'mediator', 'mediator_name',
            'mediation_notes', 'priority', 'amount_disputed',
            'days_open', 'is_overdue', 'created_at', 'resolved_at'
        ]
        read_only_fields = [
            'id', 'initiated_by_name', 'client_name', 'freelancer_name',
            'mediator_name', 'days_open', 'is_overdue', 'created_at', 'resolved_at'
        ]


class PaymentDisputeCreateSerializer(serializers.Serializer):
    """Serializer para criação de disputas"""
    category = serializers.ChoiceField(choices=PaymentDispute.CATEGORY_CHOICES)
    title = serializers.CharField(max_length=200)
    description = serializers.CharField()
    evidence_urls = serializers.ListField(
        child=serializers.URLField(),
        required=False,
        allow_empty=True
    )


class PaymentIntentSerializer(serializers.ModelSerializer):
    """Serializer para Payment Intents"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    transaction_id = serializers.CharField(source='transaction.id', read_only=True)
    
    class Meta:
        model = PaymentIntent
        fields = [
            'id', 'stripe_payment_intent_id', 'user', 'user_name',
            'transaction_id', 'amount', 'currency', 'status',
            'client_secret', 'application_fee_amount', 'created_at',
            'confirmed_at'
        ]
        read_only_fields = [
            'id', 'user_name', 'transaction_id', 'created_at', 'confirmed_at'
        ]


class AutoReleaseRuleSerializer(serializers.ModelSerializer):
    """Serializer para regras de auto-release"""
    
    class Meta:
        model = AutoReleaseRule
        fields = [
            'id', 'name', 'description', 'is_active', 'priority',
            'conditions', 'timeout_days', 'auto_approve_threshold',
            'requires_manual_review', 'applies_to_categories',
            'applies_to_user_levels', 'min_amount', 'max_amount',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EscrowApprovalSerializer(serializers.Serializer):
    """Serializer para aprovação de entregas"""
    rating = serializers.IntegerField(min_value=1, max_value=5, required=False)
    comment = serializers.CharField(required=False, allow_blank=True)


class EscrowStatusSerializer(serializers.Serializer):
    """Serializer para status detalhado do escrow"""
    transaction = TransactionSerializer(read_only=True)
    order_status = serializers.CharField(read_only=True)
    escrow_status = serializers.CharField(read_only=True)
    releases = EscrowReleaseSerializer(many=True, read_only=True)
    disputes = PaymentDisputeSerializer(many=True, read_only=True)
    can_approve = serializers.BooleanField(read_only=True)
    can_dispute = serializers.BooleanField(read_only=True)


class EscrowMetricsSerializer(serializers.Serializer):
    """Serializer para métricas de escrow"""
    as_client = serializers.DictField(read_only=True)
    as_freelancer = serializers.DictField(read_only=True)


class PayoutScheduleSerializer(serializers.ModelSerializer):
    """Serializer para cronograma de pagamentos"""
    
    class Meta:
        model = PayoutSchedule
        fields = [
            'id', 'interval', 'delay_days', 'minimum_amount',
            'auto_payout_enabled', 'max_daily_amount', 'created_at',
            'updated_at', 'last_payout_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_payout_at']