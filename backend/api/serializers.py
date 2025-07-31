from rest_framework import serializers
from django.contrib.auth import authenticate
# TODO: Add allauth imports when fully configured
# from allauth.socialaccount.models import SocialAccount
# from allauth.account.models import EmailAddress
from .models import (
    User, FreelancerProfile, Category, ServicePackage, 
    Project, Proposal, ServiceOrder, Order, Review, 
    Message, Subscription, PlanFeature, FeatureUsage, 
    AddOn, Transaction
)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'user_type',
            'profile_image_url', 'phone', 'phone_verified', 'email_verified',
            'two_factor_enabled', 'password', 'password_confirm'
        ]
        read_only_fields = ['id', 'phone_verified', 'email_verified', 'two_factor_enabled']
    
    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError("As senhas não coincidem.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        # Usar o email como username para o create_user
        validated_data['username'] = validated_data['email']
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


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