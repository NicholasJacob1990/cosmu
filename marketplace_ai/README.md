# Marketplace AI - Sistema de Matching Inteligente

Sistema avançado de matching para marketplace de serviços usando busca híbrida k-NN + re-rank heurístico + LTR automático.

## Arquitetura

- **Backend**: Django + DRF + Celery
- **Busca**: OpenSearch/Elasticsearch + OpenAI embeddings
- **Ranking**: Features heurísticas + XGBoost LTR
- **Banco**: PostgreSQL + pgvector
- **Cache**: Redis

## Instalação

### Docker (Recomendado)

```bash
# Clone e configure
git clone <repo>
cd marketplace_ai
cp .env.example .env
# Configure OPENAI_API_KEY no .env

# Execute
docker-compose up -d

# Migre o banco
docker-compose exec web python manage.py migrate

# Crie superuser
docker-compose exec web python manage.py createsuperuser
```

### Local

```bash
# Instale dependências
pip install -r requirements.txt

# Configure variáveis de ambiente
export OPENAI_API_KEY="sua-chave"
export DATABASE_URL="postgresql://..."

# Execute
python manage.py migrate
python manage.py runserver
```

## API Endpoints

### Busca Híbrida
```bash
GET /api/search/?q=designer&cat=design&lat=-23.5&lon=-46.6&price_max=500
```

### Admin
- Django Admin: http://localhost:8000/admin/
- Configuração de pesos: RankingWeight

## Estrutura do Projeto

```
marketplace_ai/
├── apps/
│   ├── search/        # Busca híbrida k-NN
│   ├── ranking/       # Features e scoring 
│   ├── profiles/      # Modelos de usuário
│   ├── logs/          # Logging de impressões
│   ├── ltr/           # Learning-to-Rank
│   └── ingest/        # Ingestão de dados
└── marketplace/       # Core Django
```

## Funcionamento

1. **Embedding**: Perfis são convertidos em vetores via OpenAI
2. **Indexação**: Documentos são indexados no OpenSearch
3. **Busca k-NN**: Recall inicial por similaridade semântica
4. **Re-ranking**: Features heurísticas aplicam boost/penalty
5. **LTR**: Modelo XGBoost otimiza ranking final
6. **Logging**: Impressões e cliques alimentam retreino

## Monitoramento

- Prometheus metrics: `/metrics`
- Health check: `/health`
- Admin interface para pesos de ranking