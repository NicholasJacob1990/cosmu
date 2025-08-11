"""
Views para o Sistema de Escrow Avançado - Sprint 3-4
Endpoints para gestão de escrow, aprovações e disputas
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from decimal import Decimal
import logging

from ..models import (
    Transaction, Order, EscrowRelease, PaymentDispute,
    PaymentMethod, PaymentIntent
)
from ..serializers import (
    TransactionSerializer, EscrowReleaseSerializer,
    PaymentDisputeSerializer
)
from ..services.escrow_service import AdvancedEscrowService

logger = logging.getLogger(__name__)


# ============================================================================
# Views de Escrow Management
# ============================================================================

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_escrow_payment(request):
    """
    Cria um pagamento em escrow para um pedido
    
    POST /api/escrow/create/
    {
        "order_id": "uuid",
        "amount": "100.00",
        "payment_method_id": "pm_xxx",
        "description": "Pagamento para desenvolvimento do site"
    }
    """
    try:
        data = request.data
        order_id = data.get('order_id')
        amount = Decimal(str(data.get('amount', 0)))
        payment_method_id = data.get('payment_method_id')
        description = data.get('description', '')
        
        # Validações
        if not order_id or not amount or not payment_method_id:
            return Response({
                'error': 'order_id, amount e payment_method_id são obrigatórios'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Buscar pedido
        order = get_object_or_404(Order, id=order_id, client=request.user)
        
        # Verificar se já existe escrow
        existing_escrow = Transaction.objects.filter(
            order=order,
            type='payment',
            status__in=['pending', 'completed']
        ).first()
        
        if existing_escrow:
            return Response({
                'error': 'Já existe um pagamento para este pedido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Criar escrow
        result = AdvancedEscrowService.create_escrow_transaction(
            order=order,
            amount=amount,
            payment_method_id=payment_method_id,
            description=description
        )
        
        if result['success']:
            return Response({
                'success': True,
                'transaction_id': str(result['transaction'].id),
                'client_secret': result['client_secret'],
                'auto_release_date': result['auto_release_date'],
                'message': f'Escrow criado. Fundos serão liberados automaticamente em {result["auto_release_date"].strftime("%d/%m/%Y")}'
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Erro ao criar escrow: {str(e)}")
        return Response({
            'error': 'Erro interno do servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_delivery(request, transaction_id):
    """
    Cliente aprova entrega e libera fundos
    
    POST /api/escrow/approve/{transaction_id}/
    {
        "rating": 5,
        "comment": "Excelente trabalho!"
    }
    """
    try:
        data = request.data
        rating = data.get('rating')
        comment = data.get('comment', '')
        
        # Validar rating
        if rating is not None:
            rating = int(rating)
            if not 1 <= rating <= 5:
                return Response({
                    'error': 'Rating deve estar entre 1 e 5'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Aprovar entrega
        result = AdvancedEscrowService.approve_delivery(
            transaction_id=transaction_id,
            approver=request.user,
            feedback_rating=rating,
            feedback_comment=comment
        )
        
        if result['success']:
            return Response({
                'success': True,
                'amount_released': result.get('amount_released'),
                'platform_fee': result.get('platform_fee'),
                'message': 'Entrega aprovada e fundos liberados com sucesso!'
            })
        else:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except ValueError:
        return Response({
            'error': 'Rating deve ser um número inteiro'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Erro ao aprovar entrega: {str(e)}")
        return Response({
            'error': 'Erro interno do servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def open_dispute(request, transaction_id):
    """
    Abre uma disputa sobre um pagamento
    
    POST /api/escrow/dispute/{transaction_id}/
    {
        "category": "quality",
        "title": "Trabalho não atende aos requisitos",
        "description": "O freelancer entregou um trabalho que não atende...",
        "evidence_urls": ["https://example.com/evidence1.pdf"]
    }
    """
    try:
        data = request.data
        category = data.get('category')
        title = data.get('title')
        description = data.get('description')
        evidence_urls = data.get('evidence_urls', [])
        
        # Validações
        if not all([category, title, description]):
            return Response({
                'error': 'category, title e description são obrigatórios'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar categoria
        valid_categories = [choice[0] for choice in PaymentDispute.CATEGORY_CHOICES]
        if category not in valid_categories:
            return Response({
                'error': f'Categoria inválida. Opções: {valid_categories}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Abrir disputa
        result = AdvancedEscrowService.open_dispute(
            transaction_id=transaction_id,
            initiated_by=request.user,
            category=category,
            title=title,
            description=description,
            evidence_urls=evidence_urls
        )
        
        if result['success']:
            return Response({
                'success': True,
                'dispute_id': str(result['dispute'].id),
                'message': result['message']
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Erro ao abrir disputa: {str(e)}")
        return Response({
            'error': 'Erro interno do servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def escrow_status(request, transaction_id):
    """
    Consulta status detalhado de um escrow
    
    GET /api/escrow/status/{transaction_id}/
    """
    try:
        # Buscar transação
        transaction = get_object_or_404(
            Transaction,
            id=transaction_id,
            type='payment'
        )
        
        # Verificar permissão
        order = transaction.order
        if request.user not in [order.client, order.freelancer]:
            return Response({
                'error': 'Sem permissão para acessar esta transação'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Buscar releases
        releases = EscrowRelease.objects.filter(
            transaction=transaction
        ).order_by('-created_at')
        
        # Buscar disputas
        disputes = PaymentDispute.objects.filter(
            transaction=transaction
        ).order_by('-created_at')
        
        # Montar resposta
        response_data = {
            'transaction': TransactionSerializer(transaction).data,
            'order_status': order.status,
            'escrow_status': order.escrow_status,
            'releases': EscrowReleaseSerializer(releases, many=True).data,
            'disputes': PaymentDisputeSerializer(disputes, many=True).data,
            'can_approve': (
                request.user == order.client and 
                order.escrow_status == 'held' and
                order.status in ['delivered', 'pending_review']
            ),
            'can_dispute': (
                order.escrow_status in ['held'] and
                not disputes.filter(status__in=['open', 'investigating', 'mediation']).exists()
            )
        }
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Erro ao consultar status escrow: {str(e)}")
        return Response({
            'error': 'Erro interno do servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Views para Dashboard Cliente
# ============================================================================

class ClientEscrowDashboardView(generics.ListAPIView):
    """
    Dashboard do cliente mostrando todos os escrows ativos
    
    GET /api/escrow/dashboard/client/
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TransactionSerializer
    
    def get_queryset(self):
        return Transaction.objects.filter(
            order__client=self.request.user,
            type='payment',
            order__escrow_status__in=['held', 'disputed']
        ).select_related('order').prefetch_related('escrow_releases', 'payment_disputes')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Estatísticas do dashboard
        stats = {
            'total_held': queryset.filter(order__escrow_status='held').count(),
            'total_disputed': queryset.filter(order__escrow_status='disputed').count(),
            'pending_approval': queryset.filter(
                order__status__in=['delivered', 'pending_review'],
                order__escrow_status='held'
            ).count(),
            'total_amount_held': sum([t.amount for t in queryset])
        }
        
        return Response({
            'transactions': serializer.data,
            'stats': stats
        })


class FreelancerEscrowDashboardView(generics.ListAPIView):
    """
    Dashboard do freelancer mostrando todos os escrows
    
    GET /api/escrow/dashboard/freelancer/
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TransactionSerializer
    
    def get_queryset(self):
        return Transaction.objects.filter(
            order__freelancer=self.request.user,
            type='payment'
        ).select_related('order').prefetch_related('escrow_releases', 'payment_disputes')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Estatísticas do dashboard
        stats = {
            'total_pending_release': queryset.filter(order__escrow_status='held').count(),
            'total_released': queryset.filter(order__escrow_status='released').count(),
            'total_disputed': queryset.filter(order__escrow_status='disputed').count(),
            'earnings_pending': sum([
                t.amount for t in queryset.filter(order__escrow_status='held')
            ]),
            'earnings_released': sum([
                release.net_amount for release in EscrowRelease.objects.filter(
                    transaction__in=queryset,
                    status='completed'
                )
            ])
        }
        
        return Response({
            'transactions': serializer.data,
            'stats': stats
        })


# ============================================================================
# Views de Disputas
# ============================================================================

class DisputeListView(generics.ListAPIView):
    """
    Lista disputas do usuário
    
    GET /api/escrow/disputes/
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PaymentDisputeSerializer
    
    def get_queryset(self):
        user = self.request.user
        return PaymentDispute.objects.filter(
            Q(client=user) | Q(freelancer=user)
        ).order_by('-created_at')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_dispute_evidence(request, dispute_id):
    """
    Adiciona evidência a uma disputa
    
    POST /api/escrow/disputes/{dispute_id}/evidence/
    {
        "evidence_urls": ["https://example.com/evidence.pdf"],
        "description": "Evidência adicional mostrando..."
    }
    """
    try:
        dispute = get_object_or_404(PaymentDispute, id=dispute_id)
        
        # Verificar permissão
        if request.user not in [dispute.client, dispute.freelancer]:
            return Response({
                'error': 'Sem permissão para adicionar evidência'
            }, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        evidence_urls = data.get('evidence_urls', [])
        description = data.get('description', '')
        
        # Adicionar evidência
        if request.user == dispute.client:
            dispute.client_evidence.update({
                'urls': evidence_urls,
                'description': description,
                'added_at': timezone.now().isoformat()
            })
        else:
            dispute.freelancer_evidence.update({
                'urls': evidence_urls,
                'description': description,
                'added_at': timezone.now().isoformat()
            })
        
        dispute.save()
        
        return Response({
            'success': True,
            'message': 'Evidência adicionada com sucesso'
        })
        
    except Exception as e:
        logger.error(f"Erro ao adicionar evidência: {str(e)}")
        return Response({
            'error': 'Erro interno do servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Views para Métricas e Monitoramento
# ============================================================================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def escrow_metrics(request):
    """
    Métricas pessoais de escrow do usuário
    
    GET /api/escrow/metrics/
    """
    try:
        user = request.user
        
        # Métricas como cliente
        client_transactions = Transaction.objects.filter(
            order__client=user,
            type='payment'
        )
        
        client_metrics = {
            'total_transactions': client_transactions.count(),
            'total_amount_paid': sum([t.amount for t in client_transactions]),
            'avg_release_time': None,  # TODO: Calcular tempo médio de liberação
            'disputes_opened': PaymentDispute.objects.filter(
                client=user,
                initiated_by=user
            ).count()
        }
        
        # Métricas como freelancer
        freelancer_transactions = Transaction.objects.filter(
            order__freelancer=user,
            type='payment'
        )
        
        freelancer_metrics = {
            'total_received': sum([
                release.net_amount for release in EscrowRelease.objects.filter(
                    transaction__in=freelancer_transactions,
                    status='completed'
                )
            ]),
            'avg_rating': None,  # TODO: Calcular rating médio
            'disputes_received': PaymentDispute.objects.filter(
                freelancer=user
            ).count(),
            'success_rate': None  # TODO: Calcular taxa de sucesso
        }
        
        return Response({
            'as_client': client_metrics,
            'as_freelancer': freelancer_metrics
        })
        
    except Exception as e:
        logger.error(f"Erro ao buscar métricas: {str(e)}")
        return Response({
            'error': 'Erro interno do servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)