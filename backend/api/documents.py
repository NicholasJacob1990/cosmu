"""
Documentos Elasticsearch para busca tradicional otimizada
"""
from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from elasticsearch_dsl import analyzer

from .models import ServicePackage, FreelancerProfile, Category

# Analisadores customizados para português brasileiro
portuguese_analyzer = analyzer(
    'portuguese_analyzer',
    tokenizer='standard',
    filters=[
        'lowercase',
        'asciifolding',     # Remove acentos: "José" -> "jose"
        'portuguese_stop',  # Remove stopwords em português
        'portuguese_stemmer',  # Stemming para português
    ]
)

# Analisador com sinônimos (exemplo)
portuguese_synonyms_analyzer = analyzer(
    'portuguese_synonyms',
    tokenizer='standard',
    filters=[
        'lowercase',
        'asciifolding',
        'synonym_filter',   # Será definido nas settings do índice
        'portuguese_stop',
        'portuguese_stemmer',
    ]
)

# Analisador para autocomplete
autocomplete_analyzer = analyzer(
    'autocomplete',
    tokenizer='edge_ngram',
    filters=['lowercase', 'asciifolding']
)


@registry.register_document
class CategoryDocument(Document):
    """Documento Elasticsearch para categorias"""
    
    class Index:
        name = 'galax_categories'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0,
            'analysis': {
                'analyzer': {
                    'portuguese_analyzer': {
                        'type': 'standard',
                        'stopwords': '_portuguese_'
                    }
                }
            }
        }

    class Django:
        model = Category
        fields = [
            'name',
            'slug',
            'description',
        ]
        related_models = []


@registry.register_document
class ServicePackageDocument(Document):
    """Documento Elasticsearch para pacotes de serviços"""
    
    # Campos customizados para melhor indexação
    title = fields.TextField(
        analyzer=portuguese_analyzer,
        fields={
            'raw': fields.KeywordField(),
            'suggest': fields.CompletionField(),
        }
    )
    
    description = fields.TextField(
        analyzer=portuguese_analyzer
    )
    
    tags = fields.TextField(
        analyzer=portuguese_analyzer,
        multi=True
    )
    
    # Freelancer relacionado
    freelancer_name = fields.TextField(
        analyzer=portuguese_analyzer,
        fields={'raw': fields.KeywordField()}
    )
    freelancer_location = fields.TextField()
    freelancer_rating = fields.FloatField()
    freelancer_total_reviews = fields.IntegerField()
    
    # Categoria relacionada
    category_name = fields.TextField(
        analyzer=portuguese_analyzer,
        fields={'raw': fields.KeywordField()}
    )
    category_slug = fields.KeywordField()
    
    # Campos de filtro
    price = fields.FloatField()
    delivery_time_days = fields.IntegerField()
    is_active = fields.BooleanField()
    
    # Campos de ordenação
    created_at = fields.DateField()
    updated_at = fields.DateField()
    
    class Index:
        name = 'galax_services'
        settings = {
            'number_of_shards': 2,
            'number_of_replicas': 0,
            'analysis': {
                'filter': {
                    'portuguese_stop': {
                        'type': 'stop',
                        'stopwords': '_portuguese_'
                    },
                    'portuguese_stemmer': {
                        'type': 'stemmer',
                        'language': 'portuguese'
                    },
                    'synonym_filter': {
                        'type': 'synonym_graph',
                        'synonyms': [
                            'ux,user experience,experiência do usuário',
                            'ui,user interface,interface do usuário',
                            'dev,desenvolvedor,developer',
                            'suporte,atendimento,help desk,assistência',
                            'marketing,publicidade,propaganda',
                            'design,designer,criação',
                            'programação,desenvolvimento,coding'
                        ]
                    }
                },
                'analyzer': {
                    'portuguese_analyzer': {
                        'tokenizer': 'standard',
                        'filter': [
                            'lowercase',
                            'asciifolding',
                            'portuguese_stop',
                            'portuguese_stemmer'
                        ]
                    },
                    'portuguese_synonyms': {
                        'tokenizer': 'standard', 
                        'filter': [
                            'lowercase',
                            'asciifolding',
                            'synonym_filter',
                            'portuguese_stop',
                            'portuguese_stemmer'
                        ]
                    }
                }
            }
        }

    class Django:
        model = ServicePackage
        fields = [
            'price',
            'delivery_time_days',
            'is_active',
            'created_at',
            'updated_at',
        ]
        related_models = [FreelancerProfile, Category]

    def prepare_title(self, instance):
        return instance.title

    def prepare_description(self, instance):
        return instance.description

    def prepare_tags(self, instance):
        return instance.tags or []

    def prepare_freelancer_name(self, instance):
        return instance.freelancer.user.get_full_name()

    def prepare_freelancer_location(self, instance):
        return instance.freelancer.location or ''

    def prepare_freelancer_rating(self, instance):
        return float(instance.freelancer.average_rating)

    def prepare_freelancer_total_reviews(self, instance):
        return instance.freelancer.total_reviews

    def prepare_category_name(self, instance):
        return instance.category.name if instance.category else ''

    def prepare_category_slug(self, instance):
        return instance.category.slug if instance.category else ''

    def get_instances_from_related(self, related_instance):
        """Atualizar quando freelancer ou categoria mudar"""
        if isinstance(related_instance, FreelancerProfile):
            return related_instance.service_packages.all()
        elif isinstance(related_instance, Category):
            return related_instance.service_packages.all()


@registry.register_document
class FreelancerProfileDocument(Document):
    """Documento Elasticsearch para perfis de freelancers"""
    
    # Informações do usuário
    full_name = fields.TextField(
        analyzer=portuguese_analyzer,
        fields={
            'raw': fields.KeywordField(),
            'suggest': fields.CompletionField(),
        }
    )
    
    bio = fields.TextField(analyzer=portuguese_analyzer)
    
    # Skills e experiência
    skills = fields.TextField(
        analyzer=portuguese_analyzer,
        multi=True
    )
    
    # Localização
    location = fields.TextField()
    
    # Métricas
    average_rating = fields.FloatField()
    total_reviews = fields.IntegerField()
    success_rate = fields.FloatField()
    experience_years = fields.IntegerField()
    
    # Financeiro
    hourly_rate = fields.FloatField()
    
    # Status
    is_available = fields.BooleanField()
    is_verified = fields.BooleanField()
    
    # Stripe
    can_receive_payments = fields.BooleanField()
    
    # Portfolio e certificações
    portfolio = fields.ObjectField()
    certifications = fields.ObjectField()
    
    # Datas
    created_at = fields.DateField()
    updated_at = fields.DateField()
    
    class Index:
        name = 'galax_freelancers'
        settings = {
            'number_of_shards': 2,
            'number_of_replicas': 0,
            'analysis': {
                'analyzer': {
                    'portuguese_analyzer': {
                        'type': 'standard',
                        'stopwords': '_portuguese_'
                    }
                }
            }
        }

    class Django:
        model = FreelancerProfile
        fields = [
            'location',
            'average_rating',
            'total_reviews',
            'success_rate',
            'experience_years',
            'hourly_rate',
            'is_available',
            'is_verified',
            'portfolio',
            'certifications',
            'updated_at',
        ]
        related_models = []

    def prepare_full_name(self, instance):
        return instance.user.get_full_name()

    def prepare_bio(self, instance):
        return instance.bio or ''

    def prepare_skills(self, instance):
        return instance.skills or []

    def prepare_can_receive_payments(self, instance):
        return instance.can_receive_payments()

    def prepare_created_at(self, instance):
        return instance.user.date_joined


@registry.register_document  
class UnifiedSearchDocument(Document):
    """
    Documento unificado para busca global (serviços + freelancers)
    Útil para buscas que não sabem o tipo específico
    """
    
    # Tipo do documento
    content_type = fields.KeywordField()  # 'service' ou 'freelancer'
    
    # Campos comuns
    title = fields.TextField(
        analyzer=portuguese_analyzer,
        fields={'suggest': fields.CompletionField()}
    )
    description = fields.TextField(analyzer=portuguese_analyzer)
    
    # Localização
    location = fields.TextField()
    
    # Métricas
    rating = fields.FloatField()
    reviews_count = fields.IntegerField()
    
    # Preço (para serviços ou hora para freelancers)
    price = fields.FloatField()
    price_type = fields.KeywordField()  # 'fixed', 'hourly'
    
    # Tags/Skills
    tags = fields.TextField(analyzer=portuguese_analyzer, multi=True)
    
    # Status
    is_active = fields.BooleanField()
    is_available = fields.BooleanField()
    
    # IDs originais
    original_id = fields.KeywordField()
    
    # Boost para relevância
    boost_score = fields.FloatField()
    
    class Index:
        name = 'galax_unified_search'
        settings = {
            'number_of_shards': 2,
            'number_of_replicas': 0,
            'analysis': {
                'analyzer': {
                    'portuguese_analyzer': {
                        'type': 'standard',
                        'stopwords': '_portuguese_'
                    }
                }
            }
        }

    class Django:
        # Este documento não mapeia diretamente para um modelo
        # Será populado via signals customizados
        model = None
        ignore_signals = True