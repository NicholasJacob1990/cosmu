"""
Tarefas Celery para processamento assíncrono de KYC
Seguindo as melhores práticas de webhook processing com retry e logging
"""

import logging
from celery import shared_task
from celery.exceptions import Retry
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from typing import Optional, Dict, Any

from ..models import KYCDocument, BiometricVerification, KYCProfile, VerificationProvider, KYCProviderStats
from ..services.kyc_service import kyc_service
from ..services.kyc_router import kyc_router, get_kyc_provider

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_document_verification(self, document_id: str, provider_name: Optional[str] = None):
    """
    Processa verificação de documento de forma assíncrona
    
    Args:
        document_id: UUID do documento a ser verificado
        provider_name: Nome do provedor KYC (opcional)
    
    Returns:
        Dict com resultado da verificação
    """
    try:
        with transaction.atomic():
            # Buscar documento
            try:
                document = KYCDocument.objects.select_for_update().get(id=document_id)
            except KYCDocument.DoesNotExist:
                logger.error(f"Document {document_id} not found")
                return {'success': False, 'error': 'Document not found'}
            
            # Verificar se já está sendo processado
            if document.status == 'processing':
                logger.warning(f"Document {document_id} already being processed")
                return {'success': False, 'error': 'Already processing'}
            
            # Marcar como processando
            document.status = 'processing'
            document.save(update_fields=['status'])
            
            logger.info(f"Starting verification for document {document_id}")
            
            # Verificar documento via KYC service
            verification_result = kyc_service.verify_document(document, provider_name)
            
            if verification_result:
                logger.info(f"Document {document_id} verified successfully")
                
                # Trigger next steps se necessário
                if document.status == 'approved':
                    trigger_profile_update.delay(document.user.id)
                
                return {
                    'success': True,
                    'document_id': str(document.id),
                    'status': document.status,
                    'confidence_score': document.confidence_score
                }
            else:
                logger.warning(f"Document {document_id} verification failed")
                return {
                    'success': False,
                    'document_id': str(document.id),
                    'error': 'Verification failed'
                }
                
    except Exception as exc:
        logger.error(f"Error processing document {document_id}: {str(exc)}")
        
        # Retry com backoff exponencial
        if self.request.retries < self.max_retries:
            # Reset status se falhou
            try:
                doc = KYCDocument.objects.get(id=document_id)
                if doc.status == 'processing':
                    doc.status = 'pending'
                    doc.save(update_fields=['status'])
            except:
                pass
            
            retry_delay = 60 * (2 ** self.request.retries)  # Exponential backoff
            logger.info(f"Retrying document {document_id} in {retry_delay} seconds")
            raise self.retry(countdown=retry_delay, exc=exc)
        
        # Max retries exceeded
        logger.error(f"Max retries exceeded for document {document_id}")
        try:
            doc = KYCDocument.objects.get(id=document_id)
            doc.status = 'rejected'
            doc.rejection_reason = f"System error after {self.max_retries} retries: {str(exc)}"
            doc.save()
        except:
            pass
        
        return {
            'success': False,
            'document_id': str(document_id),
            'error': f'Max retries exceeded: {str(exc)}'
        }


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_biometric_verification(self, biometric_id: str, provider_name: Optional[str] = None):
    """
    Processa verificação biométrica de forma assíncrona
    
    Args:
        biometric_id: UUID da verificação biométrica
        provider_name: Nome do provedor KYC (opcional)
    
    Returns:
        Dict com resultado da verificação
    """
    try:
        with transaction.atomic():
            # Buscar verificação biométrica
            try:
                biometric = BiometricVerification.objects.select_for_update().get(id=biometric_id)
            except BiometricVerification.DoesNotExist:
                logger.error(f"Biometric verification {biometric_id} not found")
                return {'success': False, 'error': 'Biometric verification not found'}
            
            # Verificar se já está sendo processado
            if biometric.status == 'processing':
                logger.warning(f"Biometric {biometric_id} already being processed")
                return {'success': False, 'error': 'Already processing'}
            
            # Marcar como processando
            biometric.status = 'processing'
            biometric.save(update_fields=['status'])
            
            logger.info(f"Starting biometric verification for {biometric_id}")
            
            # Processar via KYC service
            processed_biometric = kyc_service.verify_biometric(
                user=biometric.user,
                selfie_file=None,  # Já foi feito upload
                liveness_video_file=None,  # Já foi feito upload
                device_info=biometric.device_info
            )
            
            if processed_biometric.status == 'approved':
                logger.info(f"Biometric {biometric_id} verified successfully")
                
                # Trigger profile update
                trigger_profile_update.delay(biometric.user.id)
                
                return {
                    'success': True,
                    'biometric_id': str(biometric.id),
                    'status': biometric.status,
                    'liveness_score': biometric.liveness_score
                }
            else:
                logger.warning(f"Biometric {biometric_id} verification failed")
                return {
                    'success': False,
                    'biometric_id': str(biometric.id),
                    'error': 'Biometric verification failed'
                }
                
    except Exception as exc:
        logger.error(f"Error processing biometric {biometric_id}: {str(exc)}")
        
        # Retry logic similar to document verification
        if self.request.retries < self.max_retries:
            try:
                bio = BiometricVerification.objects.get(id=biometric_id)
                if bio.status == 'processing':
                    bio.status = 'pending'
                    bio.save(update_fields=['status'])
            except:
                pass
            
            retry_delay = 60 * (2 ** self.request.retries)
            logger.info(f"Retrying biometric {biometric_id} in {retry_delay} seconds")
            raise self.retry(countdown=retry_delay, exc=exc)
        
        # Max retries exceeded
        logger.error(f"Max retries exceeded for biometric {biometric_id}")
        try:
            bio = BiometricVerification.objects.get(id=biometric_id)
            bio.status = 'rejected'
            bio.save()
        except:
            pass
        
        return {
            'success': False,
            'biometric_id': str(biometric_id),
            'error': f'Max retries exceeded: {str(exc)}'
        }


@shared_task(bind=True, max_retries=2, default_retry_delay=30)
def trigger_profile_update(self, user_id: int):
    """
    Atualiza perfil KYC após verificação bem-sucedida
    
    Args:
        user_id: ID do usuário
    """
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found for profile update")
            return {'success': False, 'error': 'User not found'}
        
        # Buscar ou criar perfil KYC
        profile, created = KYCProfile.objects.get_or_create(user=user)
        
        # Recalcular trust score
        old_score = profile.overall_trust_score
        new_score = profile.calculate_trust_score()
        
        # Verificar upgrade de nível
        old_level = profile.current_level
        new_level = profile.upgrade_level()
        
        logger.info(f"Profile updated for user {user_id}: score {old_score:.2f} -> {new_score:.2f}, level {old_level} -> {new_level}")
        
        # Trigger re-indexing no sistema de busca IA se disponível
        try:
            from marketplace_ai.apps.search.tasks import index_professional
            if hasattr(user, 'freelancer_profile'):
                index_professional.delay(user.freelancer_profile.id)
                logger.info(f"Triggered search re-indexing for user {user_id}")
        except ImportError:
            logger.debug("Search indexing not available")
        
        # Enviar notificação se houve upgrade de nível
        if new_level != old_level:
            send_level_upgrade_notification.delay(user_id, old_level, new_level)
        
        return {
            'success': True,
            'user_id': user_id,
            'old_score': old_score,
            'new_score': new_score,
            'old_level': old_level,
            'new_level': new_level
        }
        
    except Exception as exc:
        logger.error(f"Error updating profile for user {user_id}: {str(exc)}")
        
        if self.request.retries < self.max_retries:
            retry_delay = 30 * (2 ** self.request.retries)
            logger.info(f"Retrying profile update for user {user_id} in {retry_delay} seconds")
            raise self.retry(countdown=retry_delay, exc=exc)
        
        return {
            'success': False,
            'user_id': user_id,
            'error': f'Profile update failed: {str(exc)}'
        }


@shared_task
def send_level_upgrade_notification(user_id: int, old_level: str, new_level: str):
    """
    Envia notificação de upgrade de nível KYC
    
    Args:
        user_id: ID do usuário
        old_level: Nível anterior
        new_level: Novo nível
    """
    try:
        from django.contrib.auth import get_user_model
        from django.core.mail import send_mail
        User = get_user_model()
        
        user = User.objects.get(id=user_id)
        
        level_names = {
            'basic': 'Cadastro Básico ⭐',
            'identity_verified': 'Identidade Verificada ⭐⭐',
            'professional_verified': 'Profissional Verificado ⭐⭐⭐',
            'galaxia_elite': 'GalaxIA Elite ⭐⭐⭐⭐⭐'
        }
        
        subject = f"🎉 Parabéns! Você foi promovido para {level_names.get(new_level, new_level)}"
        
        message = f"""
        Olá {user.first_name}!
        
        Temos uma ótima notícia! Sua conta foi promovida de "{level_names.get(old_level, old_level)}" 
        para "{level_names.get(new_level, new_level)}".
        
        Com esse upgrade, você agora tem acesso a:
        - Projetos de maior valor
        - Mais propostas por dia
        - Comissão reduzida
        - Maior visibilidade na plataforma
        
        Continue construindo sua reputação na GalaxIA!
        
        Equipe GalaxIA
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True
        )
        
        logger.info(f"Level upgrade notification sent to user {user_id}")
        
        return {'success': True, 'user_id': user_id}
        
    except Exception as exc:
        logger.error(f"Error sending level upgrade notification to user {user_id}: {str(exc)}")
        return {'success': False, 'error': str(exc)}


@shared_task(bind=True, max_retries=5, default_retry_delay=300)
def process_kyc_webhook(self, webhook_data: Dict[str, Any], provider: str):
    """
    Processa webhook de provedor KYC de forma assíncrona
    
    Args:
        webhook_data: Dados recebidos do webhook
        provider: Nome do provedor (idwall, stripe, unico)
    
    Returns:
        Dict com resultado do processamento
    """
    try:
        logger.info(f"Processing {provider} webhook: {webhook_data.get('type', 'unknown')}")
        
        if provider == 'idwall':
            return process_idwall_webhook(webhook_data)
        elif provider == 'stripe':
            return process_stripe_webhook(webhook_data)
        elif provider == 'unico':
            return process_unico_webhook(webhook_data)
        else:
            logger.error(f"Unknown webhook provider: {provider}")
            return {'success': False, 'error': f'Unknown provider: {provider}'}
            
    except Exception as exc:
        logger.error(f"Error processing {provider} webhook: {str(exc)}")
        
        # Retry for webhook processing
        if self.request.retries < self.max_retries:
            retry_delay = 300 * (2 ** self.request.retries)  # 5min, 10min, 20min, 40min, 80min
            logger.info(f"Retrying {provider} webhook in {retry_delay} seconds")
            raise self.retry(countdown=retry_delay, exc=exc)
        
        return {'success': False, 'error': f'Webhook processing failed: {str(exc)}'}


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def smart_kyc_verification(self, user_id: int, document_id: str, payload: Dict[str, Any]):
    """
    Verificação KYC inteligente com roteamento automático
    Seleciona o melhor provedor baseado em custo-benefício em tempo real
    """
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Buscar usuário e documento
        user = User.objects.get(id=user_id)
        document = KYCDocument.objects.get(id=document_id)
        
        # Analisar requisitos
        needs_biometric = bool(payload.get('selfie'))
        needs_pep = payload.get('check_pep', True)
        
        # Selecionar provedor inteligentemente
        chosen_provider = kyc_router.choose_provider(
            user=user,
            needs_biometric=needs_biometric,
            needs_pep=needs_pep
        )
        
        logger.info(f"Smart KYC: Selected provider {chosen_provider} for user {user_id}")
        
        # Instanciar provedor
        provider = get_kyc_provider(chosen_provider)
        
        # Executar verificação
        start_time = time.time()
        result = provider.verify(user_id, payload)
        
        # Atualizar métricas do roteador
        kyc_router.update_provider_performance(
            provider_name=chosen_provider,
            success=result['success'],
            cost=result['cost'],
            latency_ms=result['latency_ms'],
            pep_found=result.get('pep_match', False)
        )
        
        # Atualizar documento com resultado
        document.status = 'approved' if result['success'] else 'rejected'
        document.confidence_score = result['confidence_score']
        document.verification_provider = chosen_provider
        document.provider_response = result['details']
        document.processed_at = timezone.now()
        
        if not result['success']:
            document.rejection_reason = result['details'].get('error', 'Verification failed')
        
        document.save()
        
        # Trigger profile update se aprovado
        if result['success']:
            trigger_profile_update.delay(user_id)
        
        return {
            'success': result['success'],
            'provider': chosen_provider,
            'confidence_score': result['confidence_score'],
            'cost': result['cost'],
            'latency_ms': result['latency_ms'],
            'document_id': str(document.id)
        }
        
    except Exception as exc:
        logger.error(f"Smart KYC verification failed: {str(exc)}")
        
        if self.request.retries < self.max_retries:
            retry_delay = 60 * (2 ** self.request.retries)
            logger.info(f"Retrying smart KYC in {retry_delay} seconds")
            raise self.retry(countdown=retry_delay, exc=exc)
        
        # Max retries - marcar documento como erro
        try:
            document = KYCDocument.objects.get(id=document_id)
            document.status = 'rejected'
            document.rejection_reason = f"System error: {str(exc)}"
            document.save()
        except:
            pass
        
        return {
            'success': False,
            'error': str(exc),
            'document_id': document_id
        }


@shared_task
def optimize_kyc_routing():
    """
    Otimização periódica do roteamento KYC
    Ajusta epsilon e analisa performance dos provedores
    """
    try:
        logger.info("Starting KYC routing optimization")
        
        # Reset mensal se necessário
        reset_monthly_kyc_metrics.delay()
        
        # Analisar volatilidade do mercado (simplificado)
        market_volatility = calculate_market_volatility()
        
        # Ajustar epsilon baseado na volatilidade
        kyc_router.adjust_epsilon(market_volatility)
        
        # Gerar recomendações para dashboard
        recommendations = kyc_router.get_provider_recommendations()
        
        # Cache das recomendações por 1 hora
        from django.core.cache import cache
        cache.set('kyc_provider_recommendations', recommendations, 3600)
        
        # Log das métricas atuais
        for rec in recommendations:
            logger.info(
                f"KYC Provider {rec['name']}: "
                f"utility={rec['utility_score']:.3f}, "
                f"success_rate={rec['success_rate']:.1%}, "
                f"cost/ok=R${rec['cost_per_ok']:.2f}"
            )
        
        return {
            'success': True,
            'epsilon': kyc_router.epsilon,
            'market_volatility': market_volatility,
            'providers_analyzed': len(recommendations)
        }
        
    except Exception as exc:
        logger.error(f"KYC routing optimization failed: {str(exc)}")
        return {'success': False, 'error': str(exc)}


@shared_task
def reset_monthly_kyc_metrics():
    """
    Reset mensal das métricas KYC (executar no dia 1 de cada mês)
    """
    try:
        from datetime import date
        
        reset_count = 0
        for stats in KYCProviderStats.objects.all():
            if stats.should_reset_monthly():
                stats.reset_monthly_metrics()
                reset_count += 1
                logger.info(f"Reset monthly metrics for {stats.name}")
        
        return {'success': True, 'providers_reset': reset_count}
        
    except Exception as exc:
        logger.error(f"Monthly KYC reset failed: {str(exc)}")
        return {'success': False, 'error': str(exc)}


@shared_task
def kyc_provider_health_check():
    """
    Health check de todos os provedores KYC
    Desativa automaticamente provedores com problemas
    """
    try:
        from ..services.providers import (
            StripeKYCProvider, IdwallKYCProvider, 
            UnicoKYCProvider, DatavalidKYCProvider
        )
        
        providers = {
            'stripe': StripeKYCProvider(),
            'idwall': IdwallKYCProvider(),
            'unico': UnicoKYCProvider(),
            'datavalid': DatavalidKYCProvider()
        }
        
        health_results = {}
        
        for name, provider in providers.items():
            try:
                if hasattr(provider, 'health_check'):
                    health = provider.health_check()
                    health_results[name] = health
                    
                    # Desativar se unhealthy
                    if health.get('status') == 'unhealthy':
                        stats = KYCProviderStats.objects.get(name=name)
                        stats.is_active = False
                        stats.save()
                        logger.warning(f"Deactivated unhealthy provider: {name}")
                else:
                    health_results[name] = {'status': 'unknown', 'note': 'No health check available'}
                    
            except Exception as e:
                health_results[name] = {'status': 'error', 'error': str(e)}
                logger.error(f"Health check failed for {name}: {str(e)}")
        
        return {
            'success': True,
            'health_results': health_results,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as exc:
        logger.error(f"KYC health check failed: {str(exc)}")
        return {'success': False, 'error': str(exc)}


def calculate_market_volatility() -> float:
    """
    Calcula volatilidade do mercado KYC baseado em métricas recentes
    """
    try:
        from django.db.models import Avg, StdDev
        from datetime import timedelta
        
        # Analisar variação nos últimos 7 dias
        week_ago = timezone.now() - timedelta(days=7)
        
        # Buscar logs de verificação recentes
        recent_logs = VerificationLog.objects.filter(
            created_at__gte=week_ago
        ).values('provider__name').annotate(
            avg_response_time=Avg('response_time'),
            std_response_time=StdDev('response_time'),
            success_rate=Avg('success')
        )
        
        if not recent_logs:
            return 0.1  # Volatilidade baixa se não há dados
        
        # Calcular volatilidade baseada em:
        # 1. Variação do tempo de resposta
        # 2. Variação da taxa de sucesso
        volatilities = []
        
        for log in recent_logs:
            if log['std_response_time'] and log['avg_response_time']:
                time_volatility = log['std_response_time'] / log['avg_response_time']
                volatilities.append(min(time_volatility, 1.0))
        
        return sum(volatilities) / len(volatilities) if volatilities else 0.1
        
    except Exception as e:
        logger.error(f"Error calculating market volatility: {str(e)}")
        return 0.1  # Default baixa volatilidade


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_sdk_kyc_result(self, user_id: int, provider: str, result_data: Dict[str, Any]):
    """
    Processa resultado de verificação KYC vinda de SDK frontend
    Complementa o fluxo quando o SDK retorna dados diretamente para o frontend
    """
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        user = User.objects.get(id=user_id)
        
        # Buscar ou criar documento KYC
        document, created = KYCDocument.objects.get_or_create(
            user=user,
            verification_provider=provider,
            defaults={
                'document_type': result_data.get('document_type', 'unknown'),
                'status': 'processing'
            }
        )
        
        # Processar baseado no provedor
        if provider == 'stripe':
            success = result_data.get('status') == 'verified'
            confidence = 0.95 if success else 0.0
            details = result_data.get('verification_session', {})
            
        elif provider == 'idwall':
            success = result_data.get('approved', False)
            confidence = result_data.get('confidence', 0.0)
            details = result_data
            
        elif provider == 'unico':
            success = result_data.get('status') == 'APPROVED'
            confidence = result_data.get('similarity_score', 0.0) / 100.0
            details = result_data
            
        else:
            raise ValueError(f"Unsupported provider: {provider}")
        
        # Atualizar documento
        document.status = 'approved' if success else 'rejected'
        document.confidence_score = confidence
        document.provider_response = details
        document.processed_at = timezone.now()
        
        if not success:
            document.rejection_reason = details.get('error', 'Verification failed')
        
        document.save()
        
        # Atualizar métricas do roteador
        kyc_router.update_provider_performance(
            provider_name=provider,
            success=success,
            cost=result_data.get('cost', 0.0),
            latency_ms=result_data.get('processing_time_ms', 1000),
            pep_found=result_data.get('pep_match', False)
        )
        
        # Trigger profile update se aprovado
        if success:
            trigger_profile_update.delay(user_id)
            
            # Enviar notificação de sucesso
            send_level_upgrade_notification.delay(
                user_id=user_id,
                notification_type='kyc_approved',
                details={'provider': provider, 'confidence': confidence}
            )
        
        logger.info(f"SDK KYC result processed for user {user_id}: {success}")
        
        return {
            'success': True,
            'verification_success': success,
            'provider': provider,
            'confidence_score': confidence,
            'document_id': str(document.id)
        }
        
    except Exception as exc:
        logger.error(f"SDK KYC result processing failed: {str(exc)}")
        
        if self.request.retries < self.max_retries:
            retry_delay = 60 * (2 ** self.request.retries)
            logger.info(f"Retrying SDK KYC processing in {retry_delay} seconds")
            raise self.retry(countdown=retry_delay, exc=exc)
        
        return {
            'success': False,
            'error': str(exc),
            'user_id': user_id
        }


def process_idwall_webhook(webhook_data: Dict[str, Any]) -> Dict[str, Any]:
    """Processa webhook específico do Idwall"""
    try:
        # Exemplo de estrutura webhook Idwall
        verification_id = webhook_data.get('verification_id')
        status = webhook_data.get('status')
        result = webhook_data.get('result', {})
        
        # Buscar documento relacionado
        try:
            document = KYCDocument.objects.get(
                provider_response__verification_id=verification_id
            )
        except KYCDocument.DoesNotExist:
            logger.error(f"Document not found for Idwall verification {verification_id}")
            return {'success': False, 'error': 'Document not found'}
        
        # Atualizar status baseado no webhook
        if status == 'approved':
            document.status = 'approved'
            document.confidence_score = result.get('confidence', 0.0)
        elif status == 'rejected':
            document.status = 'rejected'
            document.rejection_reason = result.get('reason', 'Rejected by Idwall')
        else:
            document.status = 'manual_review'
        
        document.provider_response.update(webhook_data)
        document.processed_at = timezone.now()
        document.save()
        
        # Trigger profile update se aprovado
        if status == 'approved':
            trigger_profile_update.delay(document.user.id)
        
        logger.info(f"Idwall webhook processed successfully for document {document.id}")
        return {'success': True, 'document_id': str(document.id)}
        
    except Exception as exc:
        logger.error(f"Error processing Idwall webhook: {str(exc)}")
        raise


def process_stripe_webhook(webhook_data: Dict[str, Any]) -> Dict[str, Any]:
    """Processa webhook específico do Stripe Identity"""
    try:
        event_type = webhook_data.get('type')
        data = webhook_data.get('data', {}).get('object', {})
        
        if event_type == 'identity.verification_session.verified':
            session_id = data.get('id')
            
            # Buscar documento relacionado
            try:
                document = KYCDocument.objects.get(
                    provider_response__session_id=session_id
                )
            except KYCDocument.DoesNotExist:
                logger.error(f"Document not found for Stripe session {session_id}")
                return {'success': False, 'error': 'Document not found'}
            
            # Atualizar com dados do Stripe
            document.status = 'approved'
            document.confidence_score = 0.9  # Stripe tem alta confiança
            document.provider_response.update(webhook_data)
            document.processed_at = timezone.now()
            document.save()
            
            # Trigger profile update
            trigger_profile_update.delay(document.user.id)
            
            logger.info(f"Stripe webhook processed successfully for document {document.id}")
            return {'success': True, 'document_id': str(document.id)}
            
        elif event_type == 'identity.verification_session.requires_input':
            # Documento rejeitado ou precisa revisão
            session_id = data.get('id')
            
            try:
                document = KYCDocument.objects.get(
                    provider_response__session_id=session_id
                )
                document.status = 'manual_review'
                document.provider_response.update(webhook_data)
                document.save()
                
                return {'success': True, 'document_id': str(document.id)}
            except KYCDocument.DoesNotExist:
                return {'success': False, 'error': 'Document not found'}
        
        return {'success': True, 'message': f'Stripe event {event_type} processed'}
        
    except Exception as exc:
        logger.error(f"Error processing Stripe webhook: {str(exc)}")
        raise


def process_unico_webhook(webhook_data: Dict[str, Any]) -> Dict[str, Any]:
    """Processa webhook específico do Unico"""
    try:
        # Implementar lógica específica do Unico
        # Similar aos outros provedores
        
        return {'success': True, 'message': 'Unico webhook processed'}
        
    except Exception as exc:
        logger.error(f"Error processing Unico webhook: {str(exc)}")
        raise


@shared_task
def cleanup_expired_verifications():
    """
    Limpa verificações expiradas (task periódica)
    """
    try:
        from datetime import timedelta
        
        expiry_date = timezone.now() - timedelta(days=settings.KYC_VERIFICATION_TIMEOUT_DAYS)
        
        # Documentos pendentes por muito tempo
        expired_docs = KYCDocument.objects.filter(
            status='pending',
            uploaded_at__lt=expiry_date
        )
        
        count = expired_docs.count()
        expired_docs.update(
            status='expired',
            rejection_reason='Verification timeout'
        )
        
        logger.info(f"Cleaned up {count} expired KYC documents")
        return {'success': True, 'cleaned_documents': count}
        
    except Exception as exc:
        logger.error(f"Error cleaning up expired verifications: {str(exc)}")
        return {'success': False, 'error': str(exc)}