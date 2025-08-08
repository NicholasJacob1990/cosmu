# 🔍 Elasticsearch Setup - GalaxIA Backend

## Configuração Completa do Elasticsearch

### 📦 **1. Dependências Instaladas**

```bash
# Já incluído no requirements.txt
django-elasticsearch-dsl>=7.4.0
elasticsearch>=8.11.0
elasticsearch-dsl>=8.11.0
```

### 🐳 **2. Docker Setup**

```bash
# Subir Elasticsearch + Kibana
cd backend/
docker-compose -f docker-compose.elasticsearch.yml up -d

# Verificar se está funcionando
curl http://localhost:9200
curl http://localhost:5601  # Kibana UI
```

### ⚙️ **3. Configuração Django**

Já configurado em `settings.py`:

```python
# Elasticsearch DSL
ELASTICSEARCH_DSL = {
    'default': {
        'hosts': 'localhost:9200',
        'timeout': 30,
        'max_retries': 3,
    },
}

# Índices configurados
ELASTICSEARCH_INDEX_NAMES = {
    'services': 'galax_services',
    'freelancers': 'galax_freelancers', 
    'categories': 'galax_categories',
}
```

### 🏗️ **4. Inicialização dos Índices**

```bash
# Criar e popular todos os índices
python manage.py elasticsearch_setup --rebuild --populate

# Apenas verificar status
python manage.py elasticsearch_setup --check

# Apenas popular (índices já existem)
python manage.py elasticsearch_setup --populate
```

### 🚀 **5. API Endpoints Disponíveis**

#### **Busca de Serviços**
```
GET /api/search/elasticsearch/services/
```
**Parâmetros:**
- `q`: Termo de busca
- `category`: Slug da categoria
- `price_min`, `price_max`: Faixa de preço
- `delivery_max_days`: Prazo máximo
- `min_rating`: Rating mínimo
- `location`: Localização
- `tags`: Tags (múltiplas)
- `sort_by`: `relevance`, `price_asc`, `price_desc`, `rating`, `newest`
- `limit`, `offset`: Paginação

**Exemplo:**
```bash
curl "http://localhost:8000/api/search/elasticsearch/services/?q=design&category=design&price_max=500&sort_by=rating&limit=10"
```

#### **Busca de Freelancers**
```
GET /api/search/elasticsearch/freelancers/
```
**Parâmetros:**
- `q`: Termo de busca
- `skills`: Skills (múltiplas)
- `hourly_rate_min`, `hourly_rate_max`: Faixa de preço/hora
- `min_rating`: Rating mínimo
- `min_experience`: Anos mínimos de experiência
- `location`: Localização
- `is_available`, `is_verified`, `can_receive_payments`: Filtros boolean
- `sort_by`: `relevance`, `price_asc`, `price_desc`, `rating`, `experience`

#### **Busca Unificada**
```
GET /api/search/elasticsearch/unified/
```
**Parâmetros:**
- `q`: Termo de busca
- `types`: `service`, `freelancer` (múltiplos)

#### **Sugestões Melhoradas**
```
GET /api/search/suggestions/?type=all
```
Agora usa Elasticsearch com fallback para banco.

#### **Agregações (Filtros Dinâmicos)**
```
GET /api/search/elasticsearch/aggregations/?type=service
```
Retorna estatísticas para construir filtros dinâmicos.

### 🔄 **6. Sincronização Automática**

Os documentos Elasticsearch são **sincronizados automaticamente** quando:
- ✅ ServicePackage é criado/atualizado/deletado
- ✅ FreelancerProfile é criado/atualizado/deletado  
- ✅ Category é criada/atualizada/deletada

Via **Django signals** configurados nos documents.

### 📊 **7. Recursos Avançados**

#### **Busca Multi-field**
- Busca em título, descrição, tags, nome do freelancer
- **Pesos diferentes**: título tem peso 3x, descrição 2x
- **Fuzziness**: Tolerância a erros de digitação
- **Analisador português**: Remove acentos, stopwords

#### **Filtros Combinados**
- Filtros por categoria, preço, localização, rating
- **Agregações dinâmicas** para construir filtros em tempo real
- **Range queries** para valores numéricos

#### **Ordenação Inteligente**
- Por relevância (score)
- Por preço (asc/desc)  
- Por rating
- Por data de criação
- Por tempo de entrega

#### **Autocompletar**
- Suggestions baseadas em completion fields
- Separadas por tipo (serviços/freelancers)

### 🎯 **8. Benefícios vs Database**

| Aspecto | PostgreSQL | Elasticsearch |
|---------|------------|---------------|
| **Busca textual** | LIKE %termo% | Análise completa de texto |
| **Relevância** | Não tem scoring | Score de relevância |
| **Fuzziness** | Sem tolerância | Correção automática |
| **Performance** | Lenta em texto | Otimizada para busca |
| **Filtros** | JOINs pesados | Agregações rápidas |
| **Idioma** | Não entende português | Analisador português |
| **Autocompletar** | Query complexa | Campo completion nativo |

### 🔧 **9. Monitoramento**

#### **Kibana Dashboard**
- Acesse: http://localhost:5601
- Visualize índices, queries, performance
- Create dashboards para métricas de busca

#### **Health Check**
```bash
# Status do cluster
curl http://localhost:9200/_cluster/health

# Status dos índices
curl http://localhost:9200/_cat/indices?v

# Estatísticas
curl http://localhost:9200/galax_services/_stats
```

### 🚨 **10. Troubleshooting**

#### **Elasticsearch não conecta**
```bash
# Verificar se está rodando
docker ps | grep elasticsearch

# Ver logs
docker logs galax_elasticsearch

# Restart
docker-compose -f docker-compose.elasticsearch.yml restart
```

#### **Índices vazios**
```bash
# Verificar se há dados no banco
python manage.py shell
>>> from api.models import ServicePackage
>>> ServicePackage.objects.count()

# Re-popular
python manage.py elasticsearch_setup --populate
```

#### **Busca retorna erro**
- Verificar se `django_elasticsearch_dsl` está em `INSTALLED_APPS`
- Verificar conectividade: `curl http://localhost:9200`
- Ver logs Django para erros específicos

### 📈 **11. Performance Tips**

#### **Produção**
```python
# settings.py para produção
ELASTICSEARCH_DSL = {
    'default': {
        'hosts': ['es-node1:9200', 'es-node2:9200'],
        'http_auth': ('username', 'password'),
        'use_ssl': True,
        'verify_certs': True,
    },
}

# Desabilitar auto-refresh
ELASTICSEARCH_DSL_AUTO_REFRESH = False
```

#### **Indexação em Batch**
```bash
# Para grandes volumes de dados
python manage.py elasticsearch_setup --populate
# Usa queryset_pagination = 5000 automaticamente
```

#### **Cache de Resultados**
- Implementar cache Redis nas views de busca
- Cache por 5-10 minutos para queries populares

### 🔮 **12. Futuras Melhorias**

- **Machine Learning**: Elasticsearch ML para detecção de anomalias
- **Synonyms**: Configurar sinônimos em português
- **Percolator**: Alertas baseados em queries salvas
- **Geo Queries**: Busca por proximidade geográfica
- **A/B Testing**: Diferentes algoritmos de ranking