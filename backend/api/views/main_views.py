from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import authenticate, login
from django.db.models import Count, Q, Sum
from django.shortcuts import get_object_or_404
import requests
# Note: allauth imports will be added later when needed

from ..models import (
    User, FreelancerProfile, Category, ServicePackage,
    Project, Proposal, ServiceOrder, Order, Review,
    Message, Subscription, PlanFeature, FeatureUsage,
    AddOn, Transaction
)
from ..serializers import (
    UserSerializer, LoginSerializer, FreelancerProfileSerializer,
    CategorySerializer, ServicePackageSerializer, ProjectSerializer,
    ProposalSerializer, ServiceOrderSerializer, OrderSerializer,
    ReviewSerializer, MessageSerializer, SubscriptionSerializer,
    PlanFeatureSerializer, FeatureUsageSerializer, AddOnSerializer,
    TransactionSerializer, SocialAuthSerializer, UserProfileDetailSerializer,
    EmailVerificationSerializer
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# Authentication Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Usuário criado com sucesso!'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Login realizado com sucesso!'
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logout realizado com sucesso!'})
    except:
        return Response({'error': 'Erro ao fazer logout'}, status=status.HTTP_400_BAD_REQUEST)


# User Views
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


# FreelancerProfile Views
class FreelancerProfileListCreateView(generics.ListCreateAPIView):
    queryset = FreelancerProfile.objects.select_related('user').all()
    serializer_class = FreelancerProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['skills', 'location', 'is_verified', 'availability']
    search_fields = ['title', 'bio', 'user__first_name', 'user__last_name']
    ordering_fields = ['average_rating', 'hourly_rate', 'created_at']
    ordering = ['-average_rating']
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FreelancerProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FreelancerProfile.objects.select_related('user').all()
    serializer_class = FreelancerProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


# Category Views
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['name']


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# ServicePackage Views
class ServicePackageListCreateView(generics.ListCreateAPIView):
    queryset = ServicePackage.objects.select_related('freelancer__user', 'category').all()
    serializer_class = ServicePackageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_active', 'delivery_time']
    search_fields = ['title', 'description', 'freelancer__user__first_name']
    ordering_fields = ['price', 'delivery_time', 'created_at']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        freelancer_profile = get_object_or_404(FreelancerProfile, user=self.request.user)
        serializer.save(freelancer=freelancer_profile)


class ServicePackageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ServicePackage.objects.select_related('freelancer__user', 'category').all()
    serializer_class = ServicePackageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# Project Views
class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = Project.objects.select_related('client', 'category').annotate(
        proposals_count=Count('proposals')
    ).all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'status', 'budget_type']
    search_fields = ['title', 'description']
    ordering_fields = ['budget_min', 'budget_max', 'created_at', 'proposals_count']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(client=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.select_related('client', 'category').annotate(
        proposals_count=Count('proposals')
    ).all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# Proposal Views
class ProposalListCreateView(generics.ListCreateAPIView):
    queryset = Proposal.objects.select_related('freelancer__user', 'project').all()
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'project']
    search_fields = ['cover_letter', 'project__title']
    ordering_fields = ['proposed_price', 'delivery_time', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'freelancer_profile'):
            # Freelancer vê suas próprias propostas
            return self.queryset.filter(freelancer__user=user)
        else:
            # Cliente vê propostas de seus projetos
            return self.queryset.filter(project__client=user)
    
    def perform_create(self, serializer):
        freelancer_profile = get_object_or_404(FreelancerProfile, user=self.request.user)
        serializer.save(freelancer=freelancer_profile)


class ProposalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Proposal.objects.select_related('freelancer__user', 'project').all()
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]


# ServiceOrder Views
class ServiceOrderListCreateView(generics.ListCreateAPIView):
    queryset = ServiceOrder.objects.select_related('client', 'service_package').all()
    serializer_class = ServiceOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'service_package']
    search_fields = ['service_package__title', 'special_instructions']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'freelancer_profile'):
            # Freelancer vê pedidos de seus serviços
            return self.queryset.filter(service_package__freelancer__user=user)
        else:
            # Cliente vê seus próprios pedidos
            return self.queryset.filter(client=user)
    
    def perform_create(self, serializer):
        serializer.save(client=self.request.user)


class ServiceOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ServiceOrder.objects.select_related('client', 'service_package').all()
    serializer_class = ServiceOrderSerializer
    permission_classes = [permissions.IsAuthenticated]


# Order Views  
class OrderListCreateView(generics.ListCreateAPIView):
    queryset = Order.objects.select_related('client', 'freelancer__user').all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'payment_status']
    search_fields = ['description']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'freelancer_profile'):
            return self.queryset.filter(freelancer__user=user)
        else:
            return self.queryset.filter(client=user)


class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.select_related('client', 'freelancer__user').all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]


# Review Views
class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.select_related('reviewer', 'reviewed').all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['rating', 'reviewed']
    search_fields = ['comment']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.select_related('reviewer', 'reviewed').all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]


# Message Views
class MessageListCreateView(generics.ListCreateAPIView):
    queryset = Message.objects.select_related('sender', 'receiver').all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['sender', 'receiver', 'is_read']
    search_fields = ['content']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        return self.queryset.filter(Q(sender=user) | Q(receiver=user))
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.select_related('sender', 'receiver').all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]


# Subscription Views
class SubscriptionListCreateView(generics.ListCreateAPIView):
    queryset = Subscription.objects.select_related('user').all()
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Transaction Views
class TransactionListView(generics.ListAPIView):
    queryset = Transaction.objects.select_related('user').all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['transaction_type', 'status', 'payment_method']
    search_fields = ['description']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


# Dashboard Views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats_view(request):
    user = request.user
    
    if hasattr(user, 'freelancer_profile'):
        # Stats para freelancer
        stats = {
            'total_orders': Order.objects.filter(freelancer__user=user).count(),
            'completed_orders': Order.objects.filter(freelancer__user=user, status='completed').count(),
            'pending_orders': Order.objects.filter(freelancer__user=user, status='pending').count(),
            'total_earnings': Transaction.objects.filter(
                user=user, 
                transaction_type='credit', 
                status='completed'
            ).aggregate(total=Sum('amount'))['total'] or 0,
            'average_rating': user.freelancer_profile.average_rating,
            'total_reviews': user.freelancer_profile.total_reviews,
            'active_proposals': Proposal.objects.filter(freelancer__user=user, status='pending').count(),
        }
    else:
        # Stats para cliente
        stats = {
            'total_projects': Project.objects.filter(client=user).count(),
            'active_projects': Project.objects.filter(client=user, status='active').count(),
            'completed_projects': Project.objects.filter(client=user, status='completed').count(),
            'total_spent': Transaction.objects.filter(
                user=user, 
                transaction_type='debit', 
                status='completed'
            ).aggregate(total=Sum('amount'))['total'] or 0,
            'total_orders': ServiceOrder.objects.filter(client=user).count(),
            'pending_orders': ServiceOrder.objects.filter(client=user, status='pending').count(),
        }
    
    return Response(stats)


# Social Authentication Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def social_auth_view(request):
    """
    Endpoint para autenticação social via Google ou Facebook
    """
    serializer = SocialAuthSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    provider = serializer.validated_data['provider']
    access_token = serializer.validated_data['access_token']
    user_type = serializer.validated_data.get('user_type', 'client')
    
    try:
        # Validar token com o provedor
        user_info = None
        if provider == 'google':
            user_info = verify_google_token(access_token)
        elif provider == 'facebook':
            user_info = verify_facebook_token(access_token)
        
        if not user_info:
            return Response(
                {'error': 'Token inválido ou expirado'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        email = user_info.get('email')
        if not email:
            return Response(
                {'error': 'Email não fornecido pelo provedor social'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Buscar ou criar usuário
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': user_info.get('given_name', ''),
                'last_name': user_info.get('family_name', ''),
                'user_type': user_type,
                'email_verified': True,  # Contas sociais são verificadas
                'profile_image_url': user_info.get('picture', ''),
            }
        )
        
        # TODO: Integrar com allauth quando estiver configurado
        # Por enquanto, apenas marcar como verificado
        if created:
            user.email_verified = True
            user.save()
        
        # Gerar token para autenticação
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserProfileDetailSerializer(user).data,
            'token': token.key,
            'message': 'Login social realizado com sucesso!' if not created else 'Conta criada com sucesso via login social!'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Erro na autenticação social: {str(e)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


def verify_google_token(access_token):
    """Verifica token do Google e retorna informações do usuário"""
    try:
        response = requests.get(
            f'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return None


def verify_facebook_token(access_token):
    """Verifica token do Facebook e retorna informações do usuário"""
    try:
        response = requests.get(
            f'https://graph.facebook.com/me',
            params={
                'access_token': access_token,
                'fields': 'id,first_name,last_name,email,picture'
            }
        )
        if response.status_code == 200:
            data = response.json()
            # Normalizar formato para compatibilidade com Google
            return {
                'id': data.get('id'),
                'email': data.get('email'),
                'given_name': data.get('first_name', ''),
                'family_name': data.get('last_name', ''),
                'picture': data.get('picture', {}).get('data', {}).get('url', ''),
                'name': f"{data.get('first_name', '')} {data.get('last_name', '')}".strip()
            }
    except:
        pass
    return None


# Email Verification Views
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def request_email_verification(request):
    """Solicita verificação de email para o usuário logado"""
    user = request.user
    
    # Por enquanto, implementação simples sem allauth
    if user.email_verified:
        return Response(
            {'message': 'Email já está verificado'}, 
            status=status.HTTP_200_OK
        )
    
    # TODO: Implementar envio real de email
    return Response(
        {'message': 'Funcionalidade de verificação de email será implementada'}, 
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def resend_email_verification(request):
    """Reenvia email de verificação para um email específico"""
    serializer = EmailVerificationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    
    try:
        user = User.objects.get(email=email)
        
        if user.email_verified:
            return Response(
                {'message': 'Email já está verificado'}, 
                status=status.HTTP_200_OK
            )
        
        # TODO: Implementar envio real de email
        return Response(
            {'message': 'Funcionalidade de reenvio de email será implementada'}, 
            status=status.HTTP_200_OK
        )
        
    except User.DoesNotExist:
        return Response(
            {'error': 'Usuário não encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# ========================= ELASTICSEARCH SEARCH VIEWS =========================

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def elasticsearch_search_services_view(request):
    """
    Busca tradicional de serviços usando Elasticsearch
    """
    try:
        from .services.elasticsearch_service import ElasticsearchService
        
        # Parâmetros de busca
        query = request.GET.get('q', '')
        category = request.GET.get('category')
        price_min = request.GET.get('price_min')
        price_max = request.GET.get('price_max')
        delivery_max_days = request.GET.get('delivery_max_days')
        min_rating = request.GET.get('min_rating')
        location = request.GET.get('location')
        tags = request.GET.getlist('tags')
        sort_by = request.GET.get('sort_by', 'relevance')
        limit = int(request.GET.get('limit', 30))
        offset = int(request.GET.get('offset', 0))
        
        # Converter parâmetros numéricos
        price_min = float(price_min) if price_min else None
        price_max = float(price_max) if price_max else None
        delivery_max_days = int(delivery_max_days) if delivery_max_days else None
        min_rating = float(min_rating) if min_rating else None
        
        # Executar busca
        results = ElasticsearchService.search_services(
            query=query,
            category=category,
            price_min=price_min,
            price_max=price_max,
            delivery_max_days=delivery_max_days,
            min_rating=min_rating,
            location=location,
            tags=tags,
            sort_by=sort_by,
            limit=limit,
            offset=offset
        )
        
        return Response(results, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Erro na busca Elasticsearch: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def elasticsearch_search_freelancers_view(request):
    """
    Busca tradicional de freelancers usando Elasticsearch
    """
    try:
        from .services.elasticsearch_service import ElasticsearchService
        
        # Parâmetros de busca
        query = request.GET.get('q', '')
        skills = request.GET.getlist('skills')
        hourly_rate_min = request.GET.get('hourly_rate_min')
        hourly_rate_max = request.GET.get('hourly_rate_max')
        min_rating = request.GET.get('min_rating')
        min_experience = request.GET.get('min_experience')
        location = request.GET.get('location')
        is_available = request.GET.get('is_available')
        is_verified = request.GET.get('is_verified')
        can_receive_payments = request.GET.get('can_receive_payments')
        sort_by = request.GET.get('sort_by', 'relevance')
        limit = int(request.GET.get('limit', 30))
        offset = int(request.GET.get('offset', 0))
        
        # Converter parâmetros numéricos e booleanos
        hourly_rate_min = float(hourly_rate_min) if hourly_rate_min else None
        hourly_rate_max = float(hourly_rate_max) if hourly_rate_max else None
        min_rating = float(min_rating) if min_rating else None
        min_experience = int(min_experience) if min_experience else None
        is_available = is_available.lower() == 'true' if is_available else None
        is_verified = is_verified.lower() == 'true' if is_verified else None
        can_receive_payments = can_receive_payments.lower() == 'true' if can_receive_payments else None
        
        # Executar busca
        results = ElasticsearchService.search_freelancers(
            query=query,
            skills=skills,
            hourly_rate_min=hourly_rate_min,
            hourly_rate_max=hourly_rate_max,
            min_rating=min_rating,
            min_experience=min_experience,
            location=location,
            is_available=is_available,
            is_verified=is_verified,
            can_receive_payments=can_receive_payments,
            sort_by=sort_by,
            limit=limit,
            offset=offset
        )
        
        return Response(results, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Erro na busca Elasticsearch: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def elasticsearch_unified_search_view(request):
    """
    Busca unificada usando Elasticsearch (serviços + freelancers)
    """
    try:
        from .services.elasticsearch_service import ElasticsearchService
        
        # Parâmetros de busca
        query = request.GET.get('q', '')
        content_types = request.GET.getlist('types')
        limit = int(request.GET.get('limit', 30))
        offset = int(request.GET.get('offset', 0))
        
        # Validar tipos de conteúdo
        if content_types:
            valid_types = ['service', 'freelancer']
            content_types = [t for t in content_types if t in valid_types]
        
        # Executar busca
        results = ElasticsearchService.unified_search(
            query=query,
            content_types=content_types,
            limit=limit,
            offset=offset
        )
        
        return Response(results, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Erro na busca unificada: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def elasticsearch_aggregations_view(request):
    """
    Retorna agregações Elasticsearch para construir filtros dinâmicos
    """
    try:
        from .services.elasticsearch_service import ElasticsearchService
        
        # Parâmetros
        query = request.GET.get('q', '')
        document_type = request.GET.get('type', 'service')  # 'service' ou 'freelancer'
        
        # Validar tipo
        if document_type not in ['service', 'freelancer']:
            document_type = 'service'
        
        # Executar agregações
        results = ElasticsearchService.get_aggregations(
            query=query,
            document_type=document_type
        )
        
        return Response(results, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Erro nas agregações: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
