"""
Comando para configurar e popular índices Elasticsearch
"""
import time
from django.core.management.base import BaseCommand
from django.conf import settings
from elasticsearch_dsl import connections
from elasticsearch.exceptions import ConnectionError, NotFoundError

from api.documents import (
    ServicePackageDocument, 
    FreelancerProfileDocument, 
    CategoryDocument
)
from api.models import ServicePackage, FreelancerProfile, Category


class Command(BaseCommand):
    help = 'Configura e popula índices Elasticsearch'

    def add_arguments(self, parser):
        parser.add_argument(
            '--rebuild',
            action='store_true',
            help='Apaga e recria todos os índices',
        )
        parser.add_argument(
            '--populate',
            action='store_true',
            help='Popula os índices com dados do banco',
        )
        parser.add_argument(
            '--check',
            action='store_true',
            help='Verifica status dos índices',
        )

    def handle(self, *args, **options):
        try:
            # Testar conexão
            self.stdout.write("🔌 Testando conexão com Elasticsearch...")
            es = connections.get_connection()
            
            if not es.ping():
                raise ConnectionError("Não foi possível conectar ao Elasticsearch")
            
            self.stdout.write(
                self.style.SUCCESS("✅ Conexão com Elasticsearch estabelecida")
            )
            
            if options['check']:
                self._check_indices()
                return
            
            if options['rebuild']:
                self._rebuild_indices()
            
            if options['populate']:
                self._populate_indices()
                
            if not options['rebuild'] and not options['populate']:
                self.stdout.write(
                    self.style.WARNING(
                        "💡 Use --rebuild para recriar índices ou --populate para popular"
                    )
                )
                
        except ConnectionError as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Erro de conexão: {e}")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Erro: {e}")
            )

    def _check_indices(self):
        """Verifica status dos índices"""
        es = connections.get_connection()
        documents = [ServicePackageDocument, FreelancerProfileDocument, CategoryDocument]
        
        self.stdout.write("\n📊 STATUS DOS ÍNDICES:")
        self.stdout.write("-" * 50)
        
        for doc_class in documents:
            index_name = doc_class._index._name
            try:
                if es.indices.exists(index=index_name):
                    # Obter estatísticas do índice
                    stats = es.indices.stats(index=index_name)
                    doc_count = stats['indices'][index_name]['total']['docs']['count']
                    size = stats['indices'][index_name]['total']['store']['size_in_bytes']
                    size_mb = round(size / (1024 * 1024), 2)
                    
                    self.stdout.write(
                        f"✅ {index_name}: {doc_count} documentos ({size_mb} MB)"
                    )
                else:
                    self.stdout.write(
                        f"❌ {index_name}: Índice não existe"
                    )
            except Exception as e:
                self.stdout.write(
                    f"⚠️  {index_name}: Erro ao verificar - {e}"
                )

    def _rebuild_indices(self):
        """Apaga e recria todos os índices"""
        self.stdout.write("\n🔥 RECRIANDO ÍNDICES...")
        
        documents = [ServicePackageDocument, FreelancerProfileDocument, CategoryDocument]
        
        for doc_class in documents:
            index_name = doc_class._index._name
            
            try:
                self.stdout.write(f"🗑️  Apagando índice {index_name}...")
                doc_class._index.delete(ignore=404)
                time.sleep(1)
                
                self.stdout.write(f"🏗️  Criando índice {index_name}...")
                doc_class.init()
                
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Índice {index_name} recriado")
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"❌ Erro ao recriar {index_name}: {e}")
                )

    def _populate_indices(self):
        """Popula os índices com dados do banco"""
        self.stdout.write("\n📥 POPULANDO ÍNDICES...")
        
        # Popular categorias
        self._populate_categories()
        
        # Popular freelancers
        self._populate_freelancers()
        
        # Popular serviços
        self._populate_services()

    def _populate_categories(self):
        """Popula índice de categorias"""
        self.stdout.write("📁 Populando categorias...")
        
        try:
            categories = Category.objects.all()
            
            if not categories.exists():
                self.stdout.write(
                    self.style.WARNING("⚠️  Nenhuma categoria encontrada no banco")
                )
                return
            
            # Indexar em batch
            CategoryDocument().update(categories, refresh=True)
            
            count = categories.count()
            self.stdout.write(
                self.style.SUCCESS(f"✅ {count} categorias indexadas")
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Erro ao indexar categorias: {e}")
            )

    def _populate_freelancers(self):
        """Popula índice de freelancers"""
        self.stdout.write("👥 Populando freelancers...")
        
        try:
            freelancers = FreelancerProfile.objects.select_related('user').all()
            
            if not freelancers.exists():
                self.stdout.write(
                    self.style.WARNING("⚠️  Nenhum freelancer encontrado no banco")
                )
                return
            
            # Indexar em batch
            FreelancerProfileDocument().update(freelancers, refresh=True)
            
            count = freelancers.count()
            self.stdout.write(
                self.style.SUCCESS(f"✅ {count} freelancers indexados")
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Erro ao indexar freelancers: {e}")
            )

    def _populate_services(self):
        """Popula índice de serviços"""
        self.stdout.write("🛍️  Populando serviços...")
        
        try:
            services = ServicePackage.objects.select_related(
                'freelancer__user', 'category'
            ).filter(is_active=True)
            
            if not services.exists():
                self.stdout.write(
                    self.style.WARNING("⚠️  Nenhum serviço encontrado no banco")
                )
                return
            
            # Indexar em batch
            ServicePackageDocument().update(services, refresh=True)
            
            count = services.count()
            self.stdout.write(
                self.style.SUCCESS(f"✅ {count} serviços indexados")
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Erro ao indexar serviços: {e}")
            )