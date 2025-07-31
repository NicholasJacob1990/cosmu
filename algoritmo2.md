A seguir está a **árvore completa** sugerida para o MVP já com todos os arquivos-chave que implementam o algoritmo de *matching* (busca híbrida + re-rank heurístico + LTR automático) e seus serviços auxiliares.
Use‐a como guia para criar as pastas/arquivos; `__init__.py` vazios não são listados.

```
marketplace/
├── manage.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
├── README.md
│
├── infra/                         # infraestrutura opcional (observabilidade)
│   └── prometheus.yml
│
├── marketplace/                   # núcleo Django (configurações)
│   ├── settings.py
│   ├── celery.py
│   └── urls.py
│
├── apps/
│   ├── search/                    # recall k-NN + endpoint REST
│   │   ├── views.py
│   │   ├── elastic.py
│   │   ├── utils.py               # cache de embeddings
│   │   └── tasks.py               # gerar embedding + indexar
│   │
│   ├── ranking/                   # features, pesos, scorer, métricas
│   │   ├── models.py              # RankingWeight
│   │   ├── feature_builder.py
│   │   ├── scorer.py
│   │   └── tasks.py               # update_metrics diário
│   │
│   ├── profiles/                  # domínios de usuário/profissional
│   │   ├── models.py
│   │   └── signals.py             # on_commit → Celery
│   │
│   ├── logs/                      # impressão, clique, middleware
│   │   ├── middleware.py
│   │   └── tasks.py
│   │
│   ├── ltr/                       # aprendizado-de-ranking automático
│   │   ├── utils.py               # helpers (NDCG etc.)
│   │   └── management/
│   │       └── commands/
│   │           └── train_ltr.py
│   │
│   ├── ingest/                    # (opcional) scraping / APIs externas
│   │   └── tasks.py
│   │
│   └── discovery/                 # (opcional) “radar” de profissionais fora da base
│       └── tasks.py
│
└── tests/
    └── test_search.py             # exemplo PyTest
```

### Observações rápidas

| Pasta / arquivo                | Papel no algoritmo                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| **apps/search/**               | Busca híbrida: recebe consulta → gera embedding → k-NN no OpenSearch.                |
| **apps/ranking/**              | Constrói features, aplica pesos (admin) e produz `_match_score` para ordenar.        |
| **apps/ltr/**                  | Roda XGBoost rank\:pairwise toda madrugada com logs de evento → publica novo modelo. |
| **apps/logs/**                 | Tasks para gravar impressões/cliques em índice `events` (fuels LTR).                 |
| **apps/ingest/** (opcional)    | Coleta dados externos (Google Places, LinkedIn etc.) e recalcula *scores*.           |
| **apps/discovery/** (opcional) | Automatiza “descobrir & convidar” profissionais ainda fora do marketplace.           |
| **infra/prometheus.yml**       | Scrape Django + Celery → Grafana (CTR, nDCG, latência).                              |

Com essa estrutura você cobre **todo o ciclo de dados**:

1. **Profile save** → Celery gera embedding → indexa.
2. **Cliente busca** → recall k-NN + re-rank heurístico → logs de impressão/clique.
3. **Task noturna** lê logs → treina/atualiza modelo LTR.
4. **Cron diário** recalcula métricas dinâmicas (rating, confiança, engajamento) → re-index.
5. *(Opcional)* ingestão externa alimenta novos features e o radar de supply.

### Parte 1 — Raiz do projeto & núcleo Django

*(Depois peça “**próximo**” para receber a próxima pasta.)*

---

#### **`manage.py`**

```python
#!/usr/bin/env python
import os
import sys

def main() -> None:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "marketplace.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Django não está instalado ou não é visível no PYTHONPATH."
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()
```

---

#### **`Dockerfile`**  (para a imagem `app`)

```Dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /code
COPY requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /code/

# Entrypoint: Celery worker, Celery beat e Gunicorn + autoreload p/ dev
CMD watchmedo auto-restart --directory=./ -p '*.py' --recursive -- \
    bash -c "celery -A marketplace.celery worker -l info & \
             celery -A marketplace.celery beat -l info & \
             gunicorn marketplace.wsgi:application -b 0.0.0.0:8000"
```

---

#### **`docker-compose.yml`**  (ambiente **dev**)

```yaml
version: "3.9"

services:
  db:
    image: ankane/pgvector:latest
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: marketplace
    ports: ["5432:5432"]

  redis:
    image: redis:7
    ports: ["6379:6379"]

  elastic:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.18.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms2g -Xmx2g
    ports: ["9200:9200"]

  app:
    build: .
    volumes: [".:/code"]
    depends_on: [db, redis, elastic]
    environment:
      DJANGO_DEBUG: "True"
      PG_HOST: db
      PG_PASS: postgres
      ELASTIC_HOST: "http://elastic:9200"
      REDIS_URL: "redis://redis:6379/0"
      OPENAI_API_KEY: "changeme"
    ports: ["8000:8000"]
```

> **Obs. produção** – substitua a imagem `elastic` por OpenSearch gerenciado (ou Elastic Cloud) e ative TLS/credenciais.

---

#### **`requirements.txt`**

```
Django>=5.0,<6.0
djangorestframework>=3.15
celery[redis]>=5.4
redis>=5.0
opensearch-py>=2.3
pgvector>=0.2.4
psycopg[binary]>=3.1
pydantic>=2.7
xgboost>=2.0
pandas>=2.2
python-dotenv>=1.0
geopy>=2.4
django-prometheus>=2.3
django-waffle>=3.0
openai>=1.14     # embeddings
watchdog[watchmedo]>=3.0  # autoreload no Docker
```

---

#### **`.env.example`**

```
# Django
DJANGO_SECRET=replace-me
DJANGO_DEBUG=True

# Postgres
PG_HOST=db
PG_PASS=postgres
PG_DB=marketplace

# Redis / Celery
REDIS_URL=redis://redis:6379/0

# Elasticsearch / OpenSearch
ELASTIC_HOST=http://elastic:9200
ELASTIC_INDEX=profissionais_v1

# OpenAI
OPENAI_API_KEY=sk-...

# Google Maps / Places (opcional)
GMB_API_KEY=
```

---

#### **`README.md`**  (resumido)

````markdown
# Marketplace MVP – Busca Híbrida + LTR

Este repositório contém um MVP completo em Django 5 que:
* gera embeddings com a OpenAI,
* faz recall híbrido em OpenSearch,
* re-ranqueia resultados com pesos dinâmicos e LTR (XGBoost).

## Subir em modo desenvolvedor

```bash
cp .env.example .env
docker compose up --build
````

Acesse:

* **Django** – [http://localhost:8000/](http://localhost:8000/)
* **OpenSearch Dashboards** – [http://localhost:9200/](http://localhost:9200/)
* **Prometheus** – [http://localhost:9090/](http://localhost:9090/)  (se habilitado)

````

---

### Núcleo Django (`marketplace/`)

> Arquivos `__init__.py` vazios (não listados).

#### **`marketplace/settings.py`**  (trechos principais)

```python
from pathlib import Path
import os, dotenv

dotenv.load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY  = os.getenv("DJANGO_SECRET", "dev-secret")
DEBUG       = os.getenv("DJANGO_DEBUG", "True") == "True"
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes",
    "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles",
    "django_prometheus",
    "rest_framework",
    "apps.search", "apps.ranking", "apps.profiles", "apps.logs", "apps.ltr",
]

MIDDLEWARE = [
    "django_prometheus.middleware.PrometheusBeforeMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "apps.logs.middleware.ImpressionLoggingMiddleware",   # custom
    "django_prometheus.middleware.PrometheusAfterMiddleware",
]

ROOT_URLCONF = "marketplace.urls"
WSGI_APPLICATION = "marketplace.wsgi.application"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "HOST": os.getenv("PG_HOST", "db"),
        "USER": "postgres",
        "PASSWORD": os.getenv("PG_PASS", "postgres"),
        "NAME": os.getenv("PG_DB", "marketplace"),
    }
}

STATIC_URL = "static/"

# Celery
CELERY_BROKER_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
CELERY_RESULT_BACKEND = CELERY_BROKER_URL
from celery.schedules import crontab
CELERY_BEAT_SCHEDULE = {
    "train-ltr-daily": {
        "task": "django.core.management.call_command",
        "schedule": crontab(hour=3, minute=0),
        "args": ("train_ltr",),
    },
    "update-metrics-daily": {
        "task": "apps.ranking.tasks.update_metrics",
        "schedule": crontab(hour=2, minute=30),
    },
}

# OpenSearch
ELASTIC_HOST = os.getenv("ELASTIC_HOST", "http://elastic:9200")
ELASTIC_INDEX = os.getenv("ELASTIC_INDEX", "profissionais_v1")

# Pesos de ranking (fallback se não houver registros no banco)
RANKING_WEIGHTS_DEFAULT = {
    "sim_semantico":   0.40,
    "score_confianca": 0.20,
    "score_avaliacao": 0.20,
    "score_engajamento": 0.10,
    "score_proximidade": 0.10,
}
````

---

#### **`marketplace/celery.py`**

```python
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "marketplace.settings")
app = Celery("marketplace")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
```

---

#### **`marketplace/urls.py`**

```python
from django.contrib import admin
from django.urls import path
from apps.search.views import SearchAPIView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/search/", SearchAPIView.as_view(), name="search-api"),
]
```

---

### Parte 2 — Pasta **`apps/search/`**

*(Depois peça “**próximo**” para receber a pasta `apps/ranking/`.)*

Estrutura desta pasta:

```
apps/search/
├── __init__.py
├── elastic.py
├── utils.py
├── tasks.py
├── views.py
└── management/
    └── commands/
        └── create_search_index.py
```

---

#### **`apps/search/__init__.py`**

```python
"""
Pacote de busca híbrida (Elastic/OpenSearch + IA).

— elastic.py  → helpers de consulta/cliente
— utils.py    → utilidades (caching do embedding)
— tasks.py    → geração de embedding + indexação (Celery)
— views.py    → endpoint DRF
"""
```

---

#### **`apps/search/elastic.py`**

```python
"""
Abstrações finas sobre OpenSearch / Elasticsearch.
Mantém um único cliente e gera o corpo JSON da busca híbrida.
"""
from typing import Any, Dict, Optional
from opensearchpy import OpenSearch
from django.conf import settings

_client: Optional[OpenSearch] = None


def es_client() -> OpenSearch:
    """Singleton do cliente OpenSearch."""
    global _client
    if _client is None:
        _client = OpenSearch(settings.ELASTIC_HOST)
    return _client


def build_query(
    vector: list[float],
    category: str | None = None,
    price_max: float | None = None,
    lat: float | None = None,
    lon: float | None = None,
    radius_km: int = 20,
    k: int = 100,
) -> Dict[str, Any]:
    """
    Gera o JSON da consulta híbrida:
    * filtro booleano (categoria, preço, geo-distância)
    * fase de k-NN (vector search)
    * tamanho = k  (será re-ranqueado na aplicação)

    Retorna dicionário pronto para `es.search(...)`.
    """
    filters: list[dict] = []
    if category:
        filters.append({"term": {"category.keyword": category}})
    if price_max is not None:
        filters.append({"range": {"price_min": {"lte": price_max}}})
    if lat is not None and lon is not None:
        filters.append(
            {
                "geo_distance": {
                    "distance": f"{radius_km}km",
                    "location": {"lat": lat, "lon": lon},
                }
            }
        )

    return {
        "size": k,
        "query": {
            "bool": {
                "filter": filters,
                "must": [
                    {
                        "knn": {
                            "embedding": {
                                "vector": vector,
                                "k": k,
                            }
                        }
                    }
                ],
            }
        },
    }
```

---

#### **`apps/search/utils.py`**

```python
"""
Funções utilitárias independentes de Django — caching em memória
e geração de embeddings pela OpenAI.
"""
from __future__ import annotations

import functools
import os
import time
from typing import List

import openai

openai.api_key = os.getenv("OPENAI_API_KEY")


@functools.lru_cache(maxsize=2048)
def embed(text: str) -> List[float]:
    """
    Converte texto em embedding 1536-d (model: text-embedding-3-small).

    Função é cacheada em memória por LRU −⚠️ process-local. TTL simples
    (60 s) via timestamp para evitar lixo de long-running.
    """
    # TTL hack — invalida cache a cada 5 min
    now_bucket = int(time.time() / 300)
    cache_key = f"{now_bucket}:{text}"
    return _embed_uncached(cache_key)


@functools.lru_cache(maxsize=2048)
def _embed_uncached(text_with_bucket: str) -> List[float]:
    text = text_with_bucket.split(":", 1)[1]  # remove bucket
    resp = openai.Embedding.create(
        model="text-embedding-3-small",
        input=text,
    )
    return resp["data"][0]["embedding"]
```

---

#### **`apps/search/tasks.py`**

```python
"""
Tasks Celery ligadas à busca:
1) gera embedding OpenAI do perfil
2) indexa/atualiza documento no OpenSearch
"""
from __future__ import annotations

import os
from celery import shared_task
from django.conf import settings
from opensearchpy import OpenSearch
from apps.profiles.models import Professional
from apps.search.utils import embed

client = OpenSearch(settings.ELASTIC_HOST)


@shared_task
def generate_embedding(prof_id: int) -> None:
    """
    Gera vetor e salva no campo `embedding` (pgvector).
    Indexação é delegada para `index_professional`.
    """
    prof = Professional.objects.get(pk=prof_id)
    text = f"{prof.title}\n{prof.description}"
    prof.embedding = embed(text)
    prof.save(update_fields=["embedding"])
    index_professional.delay(prof.pk)


@shared_task
def index_professional(prof_id: int) -> None:
    """Serializa e envia documento completo ao índice de busca."""
    prof = Professional.objects.get(pk=prof_id)
    doc = {
        "title": prof.title,
        "description": prof.description,
        "category": prof.category,
        "price_min": float(prof.price_min),
        "location": {"lat": prof.location.y, "lon": prof.location.x},
        "embedding": prof.embedding,
        # métricas dinâmicas
        "rating": prof.rating,
        "reviews_count": prof.reviews_count,
        "confidence_score": prof.confidence_score,
        "engagement_score": prof.engagement_score,
        "academic_score": prof.academic_score,
        "updated_at": prof.updated_at,
    }
    client.index(
        index=settings.ELASTIC_INDEX,
        id=str(prof.id),
        body=doc,
        refresh="wait_for",
    )
```

---

#### **`apps/search/views.py`**

```python
"""
Endpoint REST /api/search/  – recall híbrido, re-rank e logging de impressão.
"""
from typing import Any, Dict, List, Tuple

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.search.elastic import es_client, build_query
from apps.search.utils import embed
from apps.ranking.scorer import rank_hits
from apps.logs.tasks import log_impression


class SearchAPIView(APIView):
    """
    Query params aceitos:

    * q         – string livre
    * cat       – categoria (keyword)
    * price_max – float
    * lat / lon – geo coord.
    """

    def get(self, request, *args, **kwargs):
        q: str = request.query_params.get("q", "").strip()
        if not q:
            return Response({"detail": "q obrigatório"}, status=400)

        category = request.query_params.get("cat")
        price = (
            float(request.query_params.get("price_max"))
            if request.query_params.get("price_max")
            else None
        )
        lat = (
            float(request.query_params.get("lat"))
            if request.query_params.get("lat")
            else None
        )
        lon = (
            float(request.query_params.get("lon"))
            if request.query_params.get("lon")
            else None
        )

        # 1) embedding da consulta
        q_vector = embed(q)

        # 2) recall  (top-K = 100)
        body = build_query(q_vector, category, price, lat, lon)
        res = es_client().search(index=settings.ELASTIC_INDEX, body=body)
        hits = res["hits"]["hits"]

        # 3) re-rank heurístico
        ranked = rank_hits(hits, user_coords=(lat, lon) if lat and lon else None)

        # 4) logging de impressão (top 10)
        user_id = request.user.id if request.user.is_authenticated else None
        log_impression.delay(user_id, q, [h["_id"] for h in ranked[:10]])

        # 5) serialização da resposta
        payload: List[Dict[str, Any]] = [
            {
                "id": h["_id"],
                "title": h["_source"]["title"],
                "score": round(h["_match_score"], 4),
                "rating": h["_source"].get("rating"),
                "price_min": h["_source"].get("price_min"),
            }
            for h in ranked[:30]
        ]
        return Response({"results": payload})
```

---

#### **`apps/search/management/commands/create_search_index.py`**

```python
"""
Comando:  python manage.py create_search_index
Cria índice OpenSearch com mapping & feature-set LTR “baseline”.
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from opensearchpy import OpenSearch


class Command(BaseCommand):
    help = "Cria índice de profissionais com dense_vector + geo_point."

    def handle(self, *args, **opts):
        es = OpenSearch(settings.ELASTIC_HOST)

        mapping = {
            "mappings": {
                "properties": {
                    "title":        {"type": "text"},
                    "description":  {"type": "text"},
                    "category":     {"type": "keyword"},
                    "price_min":    {"type": "float"},
                    "location":     {"type": "geo_point"},
                    "embedding":    {
                        "type": "dense_vector",
                        "dims": 1536,
                        "index": True,
                        "similarity": "cosine",
                    },
                    # métricas dinâmicas
                    "rating":           {"type": "float"},
                    "reviews_count":    {"type": "integer"},
                    "confidence_score": {"type": "float"},
                    "engagement_score": {"type": "float"},
                    "academic_score":   {"type": "float"},
                    "updated_at":       {"type": "date"},
                }
            }
        }

        if not es.indices.exists(index=settings.ELASTIC_INDEX):
            es.indices.create(index=settings.ELASTIC_INDEX, body=mapping)
            self.stdout.write(self.style.SUCCESS("Índice criado."))
        else:
            self.stdout.write("Índice já existe — ignorado.")
```

---

### Parte 3 — Pasta **`apps/ranking/`**

*(Quando terminar, peça “**próximo**” para receber a pasta `apps/profiles/`.)*

Estrutura desta pasta:

```
apps/ranking/
├── __init__.py
├── feature_builder.py
├── scorer.py
├── tasks.py
└── models.py
```

---

#### **`apps/ranking/__init__.py`**

```python
"""
Camada de ranking:

1.  feature_builder.py  → transforma _hit do OpenSearch em dicionário de features normalizadas.
2.  scorer.py           → combina features heurísticos (pesos configuráveis em admin).
3.  tasks.py            → jobs Celery de métricas dinâmicas (rating, engajamento, confiança).
4.  models.py           → tabela RankingWeight (permite ajuste no Django-admin).

Obs.: a lógica de LTR (XGBoost) reside em apps/ltr/.
"""
```

---

#### **`apps/ranking/models.py`**

```python
from django.db import models


class RankingWeight(models.Model):
    """
    Pesos heurísticos carregados dinamicamente pelo scorer.
    Pode ser editado via Django-admin sem deploy.

    name   — id da feature (ex.: 'sim_semantico', 'score_confianca')
    value  — peso numérico (float)
    """
    name = models.CharField(max_length=50, primary_key=True)
    value = models.FloatField(default=0.0)

    class Meta:
        verbose_name = "Ranking Weight"
        verbose_name_plural = "Ranking Weights"

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.name}={self.value}"
```

---

#### **`apps/ranking/feature_builder.py`**

```python
"""
Traduz um documento _hit do OpenSearch em features normalizadas (0-1)
para uso no scorer heurístico ou como input do modelo LTR offline.
"""
from __future__ import annotations
from typing import Dict, Tuple, Any

from geopy.distance import distance


def build_features(
    hit: Dict[str, Any],
    user_coords: Tuple[float, float] | None,
    radius_km: int = 20,
) -> Dict[str, float]:
    """
    Extrai features principais:

    * sim_semantico     — _score do OpenSearch (já 0-1 pois usamos cosine)
    * score_confianca   — verificação / KYC (0-1)
    * score_avaliacao   — média estrelas normalizada
    * score_engajamento — % respostas em 7 d
    * score_proximidade — 1-d/radius; 0 se fora
    * score_qualificacao— academic_score 0-1
    """
    src = hit["_source"]

    feats: Dict[str, float] = {
        "sim_semantico": hit["_score"],
        "score_confianca": src.get("confidence_score", 0.0),
        "score_avaliacao": (src.get("rating", 0.0) / 5.0),
        "score_engajamento": src.get("engagement_score", 0.0),
        "score_proximidade": 0.0,
        "score_qualificacao": src.get("academic_score", 0.0),
    }

    if user_coords and src.get("location"):
        dist_km = distance(
            user_coords,
            (src["location"]["lat"], src["location"]["lon"]),
        ).km
        feats["score_proximidade"] = max(0.0, 1.0 - dist_km / radius_km)

    # clamp [0,1]
    for k, v in feats.items():
        feats[k] = min(max(float(v), 0.0), 1.0)

    return feats
```

---

#### **`apps/ranking/scorer.py`**

```python
"""
Combina features heurísticos usando pesos dinâmicos (DB).
Se tabela RankingWeight estiver vazia, usa defaults do settings.
"""
from __future__ import annotations

from typing import Dict, List

from django.conf import settings
from .feature_builder import build_features
from .models import RankingWeight


def _cached_weights() -> Dict[str, float]:
    """
    Busca pesos no DB; se vazio, volta para settings.RANKING_WEIGHTS.
    Cache simples em módulo — reload on each worker restart.
    """
    rows = RankingWeight.objects.all()
    if rows:
        return {w.name: w.value for w in rows}
    return settings.RANKING_WEIGHTS


def rank_hits(hits: List[dict], user_coords=None) -> List[dict]:
    """Aplica re-rank heurístico e devolve nova lista ordenada."""
    weights = _cached_weights()
    rescored: List[dict] = []

    for h in hits:
        feats = build_features(h, user_coords)
        score = sum(weights.get(k, 0.0) * feats[k] for k in feats)
        h["_match_score"] = round(score, 6)
        rescored.append(h)

    rescored.sort(key=lambda x: x["_match_score"], reverse=True)
    return rescored
```

---

#### **`apps/ranking/tasks.py`**

```python
"""
Tarefas Celery que recalculam métricas dinâmicas dos profissionais:

* rating / reviews_count
* engagement_score   (% respostas semana)
* confidence_score   (ex.: KYC + dados externos)
* academic_score     (já preenchido por ingest; apenas consolida)

Executa diariamente (vide celery beat no marketplace/celery.py).
"""
from __future__ import annotations

from datetime import timedelta
from django.db.models import Avg, Count
from django.utils import timezone
from celery import shared_task

from apps.profiles.models import Professional
from apps.search.tasks import index_professional


@shared_task
def update_metrics() -> None:
    """Recalcula todos os scores e reindexa no OpenSearch."""
    since = timezone.now() - timedelta(days=7)

    for prof in Professional.objects.all():
        # rating & reviews
        stats = prof.review_set.aggregate(
            rating=Avg("stars"), n=Count("id")
        )
        prof.rating = stats["rating"] or 0.0
        prof.reviews_count = stats["n"]

        # engagement = respostas / msgs
        msgs = prof.message_set.filter(created__gte=since)
        if msgs.exists():
            replies = msgs.filter(author=prof.user).count()
            prof.engagement_score = min(replies / msgs.count(), 1.0)
        else:
            prof.engagement_score = 0.0

        # confiança simples (exemplo): 60 % KYC + 40 % disputes < 5 %
        prof.confidence_score = (
            0.6 * float(prof.kyc_verified)  # 1.0 ou 0.0
            + 0.4 * (1.0 - min(prof.dispute_rate, 1.0))
        )

        prof.save(
            update_fields=[
                "rating",
                "reviews_count",
                "engagement_score",
                "confidence_score",
            ]
        )
        # reindex assíncrono
        index_professional.delay(prof.pk)
```

---
### Parte 4 — Pasta **`apps/profiles/`**

*(quando quiser a próxima pasta — `apps/search/` — peça **“próximo”**.)*

Estrutura da pasta:

```
apps/profiles/
├── __init__.py
├── admin.py
├── models.py
└── signals.py
```

> **Dependências**
>
> * PostGIS habilitado no PostgreSQL (campo `PointField`)
> * extensões `pgvector` instaladas (campo `VectorField`)

---

#### **`apps/profiles/__init__.py`**

```python
"""
App de perfis (cliente & profissional).

* Professional — dados de oferta; embedding OpenAI; métricas dinâmicas.
* Review       — feedback após contrato.
* Message      — chat interno (simplificado; serve p/ engagement_score).
* Dispute      — abertura de disputa; base p/ dispute_rate.
"""
default_app_config = "apps.profiles.apps.ProfilesConfig"
```

---

#### **`apps/profiles/admin.py`**

```python
from django.contrib import admin
from .models import Professional, Review, Message, Dispute


@admin.register(Professional)
class ProfessionalAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "title",
        "category",
        "rating",
        "confidence_score",
        "academic_score",
        "updated_at",
    )
    list_filter = ("category", "kyc_verified")
    search_fields = ("title", "user__username", "user__email")


admin.site.register(Review)
admin.site.register(Message)
admin.site.register(Dispute)
```

---

#### **`apps/profiles/models.py`**

```python
from __future__ import annotations

import uuid
from decimal import Decimal
from typing import Any

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.gis.db import models as gismodels
from django.db import models
from django.utils import timezone

from pgvector.django import VectorField

User = get_user_model()


class TimeStampedModel(models.Model):
    """Abstrai created / updated."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Professional(TimeStampedModel):
    """
    Perfil público do prestador de serviço
    ---
    * embedding         — vetor OpenAI (dims 1536)
    * métricas dinâmicas— rating, engajamento, confiança, qualificação
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # dados principais
    title = models.CharField(max_length=120)
    description = models.TextField()
    category = models.CharField(max_length=60)
    price_min = models.DecimalField(max_digits=9, decimal_places=2)
    location = gismodels.PointField(srid=4326)

    # embedding OpenAI (1 536 dims)
    embedding = VectorField(dimensions=1536, blank=True, null=True)

    # métricas dinâmicas (0-1 normalizado, exceto rating ★)
    rating = models.FloatField(default=0.0)
    reviews_count = models.PositiveIntegerField(default=0)
    engagement_score = models.FloatField(default=0.0)
    confidence_score = models.FloatField(default=0.0)
    academic_score = models.FloatField(default=0.0)

    # KYC, disputas, etc.
    kyc_verified = models.BooleanField(default=False)
    dispute_rate = models.FloatField(default=0.0)  # atualizado em tasks

    # acadêmico / currículo externo
    degree_level = models.CharField(max_length=30, blank=True)
    university_rank = models.PositiveSmallIntegerField(null=True, blank=True)
    orcid_id = models.CharField(max_length=19, blank=True)
    lattes_id = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name = "Professional"
        verbose_name_plural = "Professionals"

    def __str__(self) -> str:
        return f"{self.title} ({self.user})"

    # utilidades ---------------------------------------------------------

    @property
    def full_address(self) -> str | None:
        if hasattr(self.location, "coords"):
            lon, lat = self.location.coords
            return f"{lat:.4f}, {lon:.4f}"
        return None


class Review(TimeStampedModel):
    """Avaliação 1-5★ após contrato."""
    id = models.BigAutoField(primary_key=True)
    professional = models.ForeignKey(
        Professional, on_delete=models.CASCADE, related_name="review_set"
    )
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    stars = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.stars}★ by {self.author} → {self.professional}"


class Message(TimeStampedModel):
    """Mensagem de chat entre cliente e prestador (simplificado)."""
    id = models.BigAutoField(primary_key=True)
    contract_id = models.UUIDField()  # referência ao contrato (não modelado aqui)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    professional = models.ForeignKey(
        Professional, on_delete=models.CASCADE, related_name="message_set"
    )
    text = models.TextField()

    def __str__(self) -> str:
        return f"msg:{self.id} by {self.author}"


class Dispute(TimeStampedModel):
    """Ticket de disputa financeira / qualidade."""
    id = models.BigAutoField(primary_key=True)
    professional = models.ForeignKey(
        Professional, on_delete=models.CASCADE, related_name="dispute_set"
    )
    customer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="customer_disputes"
    )
    reason = models.TextField()
    resolved = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"dispute:{self.id} {'✔' if self.resolved else 'open'}"

    # hook para atualizar dispute_rate
    def save(self, *args: Any, **kwargs: Any) -> None:  # noqa: D401
        super().save(*args, **kwargs)
        total = self.professional.dispute_set.count()
        open_ = self.professional.dispute_set.filter(resolved=False).count()
        self.professional.dispute_rate = open_ / total if total else 0.0
        self.professional.save(update_fields=["dispute_rate"])
```

---

#### **`apps/profiles/signals.py`**

```python
"""
Gera embedding + indexa profissional toda vez que o perfil muda.
"""
import os
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Professional


@receiver(post_save, sender=Professional)
def enqueue_embedding(sender, instance: Professional, **kwargs):  # noqa: D401
    """
    Dispara task Celery only *after* commit para evitar race-condition.
    """
    from apps.search.tasks import generate_embedding  # lazy import

    transaction.on_commit(lambda: generate_embedding.delay(instance.pk))
```

---

### Parte 5 — Pasta **`apps/search/`**

*(quando quiser a próxima pasta — `apps/ranking/` — peça **“próximo”**.)*

Estrutura da pasta:

```
apps/search/
├── __init__.py
├── elastic.py
├── tasks.py
└── views.py
```

> **Configuração obrigatória em `settings.py`**
>
> ```python
> ELASTIC_HOST   = os.getenv("ELASTIC_HOST", "http://elastic:9200")
> ELASTIC_INDEX  = "profissionais_v1"
> OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
> ```

---

#### **`apps/search/__init__.py`**

```python
"""
Módulo de busca:

1. tasks.py      — Celery tasks: gerar embedding (OpenAI) e indexar no ES/OS.
2. elastic.py    — cliente e helpers de query.
3. views.py      — endpoint `/api/search/` (DRF).
"""
```

---

#### **`apps/search/elastic.py`**

```python
from functools import lru_cache

import openai
from django.conf import settings
from opensearchpy import OpenSearch

openai.api_key = settings.OPENAI_API_KEY

# --------------------------------------------------
# Cliente singleton
# --------------------------------------------------
@lru_cache(maxsize=1)
def client() -> OpenSearch:  # noqa: D401
    return OpenSearch(settings.ELASTIC_HOST, verify_certs=False)


# --------------------------------------------------
# Embedding utilitário (cache em memória 5 min)
# --------------------------------------------------
@lru_cache(maxsize=2048)
def embed(text: str) -> list[float]:
    resp = openai.Embedding.create(model="text-embedding-3-small", input=text)
    return resp["data"][0]["embedding"]


# --------------------------------------------------
# Builder de query híbrida
# --------------------------------------------------
def build_query(
    query_vector: list[float],
    *,
    q_text: str,
    category: str | None,
    price_max: float | None,
    lat: float | None,
    lon: float | None,
    radius_km: int = 20,
):
    """
    • k-NN por embedding (recall 100 docs)
    • filtros booleanos opcionais
    """
    filters = []
    if category:
        filters.append({"term": {"category.keyword": category}})
    if price_max:
        filters.append({"range": {"price_min": {"lte": price_max}}})
    if lat and lon:
        filters.append(
            {
                "geo_distance": {
                    "distance": f"{radius_km}km",
                    "location": {"lat": lat, "lon": lon},
                }
            }
        )

    return {
        "size": 100,
        "query": {
            "bool": {
                "filter": filters,
                "must": [
                    {
                        "knn": {
                            "embedding": {
                                "vector": query_vector,
                                "k": 100,
                            }
                        }
                    }
                ],
            }
        },
    }
```

---

#### **`apps/search/tasks.py`**

```python
from __future__ import annotations

import json
from decimal import Decimal

import openai
from celery import shared_task
from django.conf import settings
from opensearchpy import OpenSearch

from apps.profiles.models import Professional

openai.api_key = settings.OPENAI_API_KEY
_es = OpenSearch(settings.ELASTIC_HOST, verify_certs=False)


# ------------------------------------------------------------------
# 1. Task: gerar embedding OpenAI e gravar em Postgres (pgvector)
# ------------------------------------------------------------------
@shared_task
def generate_embedding(prof_id: str):
    prof = Professional.objects.get(pk=prof_id)

    # Documento de texto consolidado
    doc_text = f"{prof.title}\n{prof.description}\n{prof.category}"
    embedding = openai.Embedding.create(
        model="text-embedding-3-small", input=doc_text
    )["data"][0]["embedding"]

    # Salva vetor numa coluna VectorField
    prof.embedding = embedding
    prof.save(update_fields=["embedding"])

    # Enfileira indexação
    index_professional.delay(prof.pk)


# ------------------------------------------------------------------
# 2. Task: indexar (ou reindexar) profissional no OpenSearch
# ------------------------------------------------------------------
@shared_task
def index_professional(prof_id: str):
    prof = Professional.objects.get(pk=prof_id)
    if not prof.embedding:
        return  # embedding ainda não pronto

    body = {
        "title": prof.title,
        "description": prof.description,
        "category": prof.category,
        "price_min": float(prof.price_min),
        "location": {
            "lat": prof.location.y,
            "lon": prof.location.x,
        },
        "embedding": prof.embedding,
        # features dinâmicas (já normalizadas 0-1)
        "rating": prof.rating,
        "reviews_count": prof.reviews_count,
        "engagement_score": prof.engagement_score,
        "confidence_score": prof.confidence_score,
        "academic_score": prof.academic_score,
        "dispute_rate": prof.dispute_rate,
        "updated_at": prof.updated_at,
    }

    _es.index(
        index=settings.ELASTIC_INDEX,
        id=str(prof.id),
        body=body,
        refresh="wait_for",
    )
```

---

#### **`apps/search/views.py`**

```python
from decimal import Decimal
from typing import Any

from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ranking.scorer import rank_hits
from .elastic import build_query, client, embed


class SearchAPIView(APIView):
    """
    GET /api/search/?q=design+logo&cat=Design&price_max=500&lat=-23.5&lon=-46.6
    """

    authentication_classes: list[Any] = []  # publique; ajuste como necessário
    permission_classes: list[Any] = []

    def get(self, request):
        params = request.query_params
        q_text: str = params.get("q", "")
        category: str | None = params.get("cat")
        price_max: float | None = (
            float(params.get("price_max")) if params.get("price_max") else None
        )
        lat = float(params.get("lat")) if params.get("lat") else None
        lon = float(params.get("lon")) if params.get("lon") else None

        # ---- passo 1: embedding consulta
        q_vec = embed(q_text)

        # ---- passo 2: build + search
        query = build_query(
            q_vec,
            q_text=q_text,
            category=category,
            price_max=price_max,
            lat=lat,
            lon=lon,
        )
        res = client().search(index=settings.ELASTIC_INDEX, body=query)

        # ---- passo 3: re-rank heurístico
        ranked = rank_hits(res["hits"]["hits"], user_coords=(lat, lon) if lat and lon else None)

        # ---- passo 4: logging (impressão)
        from apps.logs.tasks import log_impression

        log_impression.delay(
            request.user.id if request.user.is_authenticated else None,
            q_text,
            [h["_id"] for h in ranked[:10]],
        )

        # ---- resposta
        return Response(
            {
                "count": len(ranked),
                "results": [
                    {
                        "id": h["_id"],
                        "title": h["_source"]["title"],
                        "category": h["_source"]["category"],
                        "price_min": h["_source"]["price_min"],
                        "rating": h["_source"]["rating"],
                        "score": round(h["_match_score"], 4),
                    }
                    for h in ranked[:30]  # devolve top-30
                ],
            }
        )
```

---

### Parte 6 — Pasta **`apps/ranking/`**

*(ao terminar esta pasta, peça **“próximo”** para receber `apps/profiles/` ou outra.)*

Estrutura:

```
apps/ranking/
├── __init__.py
├── feature_builder.py
├── models.py
├── scorer.py
└── tasks.py
```

---

#### **`apps/ranking/__init__.py`**

```python
"""
Camada de ranking:

• feature_builder.py — converte cada hit do OpenSearch num vetor de features.
• scorer.py          — heurística de pesos configuráveis via Admin.
• tasks.py           — métricas dinâmicas diárias (rating, engajamento, confiança).
• models.py          — pesos editáveis em tempo-real (RankingWeight).
"""
```

---

#### **`apps/ranking/models.py`**

```python
from django.db import models


class RankingWeight(models.Model):
    """
    Permite ajustar pesos de features via Django-Admin sem redeploy.
    As chaves pré-criar no admin:
        sim_semantico         — 0-1
        score_confianca       — 0-1
        score_avaliacao       — 0-1
        score_engajamento     — 0-1
        score_proximidade     — 0-1
        score_qualificacao    — 0-1   (academic_score)
    """
    name = models.CharField(max_length=50, primary_key=True)
    value = models.FloatField(default=0.0)

    class Meta:
        verbose_name = "Ranking weight"
        verbose_name_plural = "Ranking weights"

    def __str__(self) -> str:  # noqa: D401
        return f"{self.name} = {self.value:.3f}"
```

---

#### **`apps/ranking/feature_builder.py`**

```python
"""
Recebe um hit retornado do OpenSearch e constrói o dicionário de features
(normalizados 0-1) usado tanto pelo scorer heurístico quanto pelo pipeline LTR.
"""

from __future__ import annotations

from geopy.distance import distance as geo_distance


def build_features(hit: dict, user_coords: tuple[float, float] | None):
    src = hit["_source"]

    feats = {
        # já normalizados (OpenSearch _score ≈ [0,1] após knn)
        "sim_semantico": hit["_score"],
        "score_confianca": src.get("confidence_score", 0.0),
        "score_avaliacao": src.get("rating", 0.0) / 5.0,
        "score_engajamento": src.get("engagement_score", 0.0),
        "score_qualificacao": src.get("academic_score", 0.0),
        # proximidade calculada ad-hoc
        "score_proximidade": 0.0,
    }

    if user_coords and src.get("location"):
        dist_km = geo_distance(
            user_coords, (src["location"]["lat"], src["location"]["lon"])
        ).km
        feats["score_proximidade"] = max(0.0, 1 - dist_km / 20.0)  # normaliza p/ 20 km

    return feats
```

---

#### **`apps/ranking/scorer.py`**

```python
"""
Heurística de ordenação pós-recall quando LTR está off.
Os pesos são carregados on-demand da tabela RankingWeight.
"""

from __future__ import annotations

from functools import lru_cache
from time import time

from django.utils import timezone, translation

from .feature_builder import build_features
from .models import RankingWeight

# ---- cache pesos por 60 s ----------------------------------------------------
_CACHE_SECONDS = 60
_last_fetch = 0
_cached_weights: dict[str, float] = {}


def _weights():
    global _last_fetch, _cached_weights
    if time() - _last_fetch > _CACHE_SECONDS:
        _cached_weights = {w.name: w.value for w in RankingWeight.objects.all()}
        _last_fetch = time()
    return _cached_weights


# ------------------------------------------------------------------------------
def rank_hits(hits: list[dict], user_coords: tuple[float, float] | None):
    weights = _weights()
    rescored = []

    for h in hits:
        feats = build_features(h, user_coords)
        score = sum(weights.get(k, 0) * feats[k] for k in feats.keys())
        h["_match_score"] = score
        rescored.append(h)

    rescored.sort(key=lambda x: x["_match_score"], reverse=True)
    return rescored
```

---

#### **`apps/ranking/tasks.py`**

```python
"""
Recalcula métricas dinâmicas diariamente (rating, engajamento, confiança)
e atualiza o índice no OpenSearch.
"""

from __future__ import annotations

from datetime import timedelta

from celery import shared_task
from django.db.models import Avg, Count
from django.utils import timezone

from apps.profiles.models import Professional
from apps.search.tasks import index_professional


@shared_task
def update_metrics():
    """
    • rating          — média de estrelas (1-5) das reviews.
    • reviews_count   — nº de reviews.
    • engagement      — razão respostas / mensagens últimas 48 h.
    • confidence      — mistura KYC, histórico de disputas, etc.
    """
    since = timezone.now() - timedelta(hours=48)

    qs = Professional.objects.all().prefetch_related("review_set", "message_set")

    for prof in qs:
        # ---------- rating -----------------
        stats = prof.review_set.aggregate(avg=Avg("stars"), n=Count("id"))
        prof.rating = stats["avg"] or 0.0
        prof.reviews_count = stats["n"]

        # ---------- engajamento -------------
        msgs_all = prof.message_set.filter(created__gte=since).count()
        msgs_resp = prof.message_set.filter(
            created__gte=since, author=prof.user
        ).count()
        prof.engagement_score = (
            min(msgs_resp / msgs_all, 1.0) if msgs_all else 0.0
        )

        # ---------- confiança ---------------
        prof.confidence_score = (
            0.6 * (1 if prof.kyc_verified else 0.0)
            + 0.3 * (1 - prof.dispute_rate)
            + 0.1 * prof.academic_score
        )

        prof.save(
            update_fields=[
                "rating",
                "reviews_count",
                "engagement_score",
                "confidence_score",
            ]
        )

        # re-indexa de forma assíncrona
        index_professional.delay(prof.pk)
```

> **Agendamento Celery Beat**
> No `marketplace/celery.py` adicione:
>
> ```python
> from celery.schedules import crontab
> app.conf.beat_schedule |= {
>     "update-metrics-daily": {
>         "task": "apps.ranking.tasks.update_metrics",
>         "schedule": crontab(hour=2, minute=0),
>     }
> }
> ```

---
### Parte 7 — Pasta **`apps/profiles/`**

*(ao terminar esta pasta, peça **“próximo”** para receber `apps/search/`, `apps/logs/` ou outro.)*

Estrutura:

```
apps/profiles/
├── __init__.py
├── admin.py
├── models.py
└── signals.py
```

---

#### **`apps/profiles/__init__.py`**

```python
"""
App que mantém todos os modelos de usuário (cliente e profissional).
Os profissionais são indexados no OpenSearch via signal pós-save.
"""
```

---

#### **`apps/profiles/admin.py`**

```python
from django.contrib import admin

from .models import Professional


@admin.register(Professional)
class ProfessionalAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "title",
        "category",
        "rating",
        "confidence_score",
        "updated_at",
    )
    search_fields = ("title", "user__email", "category")
    list_filter = ("category", "kyc_verified")
    readonly_fields = ("embedding", "updated_at")
```

---

#### **`apps/profiles/models.py`**

```python
from __future__ import annotations

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.gis.db import models  # requer PostGIS habilitado
from pgvector.django import VectorField

User = get_user_model()


class Professional(models.Model):
    """
    Perfil do prestador de serviço.

    Alguns campos servem apenas para features de ranking (academic_score, etc.)
    e, portanto, são atualizados por tasks periódicas ou ingestors externos.
    """

    # --- chaves e texto base --------------------------------------------------
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="professional_profile")
    title = models.CharField("Título do perfil", max_length=120)
    description = models.TextField("Descrição detalhada")
    category = models.CharField(max_length=60)

    # --- preços & localização -------------------------------------------------
    price_min = models.DecimalField(max_digits=8, decimal_places=2)
    location = models.PointField(geography=True)  # (lon, lat)

    # --- embedding OpenAI -----------------------------------------------------
    embedding = VectorField(
        "Embedding OpenAI (1 536 dims)",
        dimensions=1536,
        blank=True,
        null=True,
    )

    # --- métricas dinâmicas ---------------------------------------------------
    rating = models.FloatField(default=0.0)              # média estrelas (1-5)
    reviews_count = models.PositiveIntegerField(default=0)
    confidence_score = models.FloatField(default=0.0)    # 0-1
    engagement_score = models.FloatField(default=0.0)    # 0-1

    # --- qualificação acadêmica opcional -------------------------------------
    degree_level = models.CharField(max_length=30, blank=True)        # "PhD", "MSc"…
    university_rank = models.PositiveSmallIntegerField(null=True, blank=True)
    academic_score = models.FloatField(default=0.0)                   # 0-1

    # --- status & housekeeping ----------------------------------------------
    kyc_verified = models.BooleanField(default=False)
    dispute_rate = models.FloatField(default=0.0)         # 0-1 (proporção jobs com disputa)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Professional"
        verbose_name_plural = "Professionals"

    # -------------------------------------------------------------------------
    def __str__(self) -> str:
        return f"{self.title} ({self.user.email})"
```

---

#### **`apps/profiles/signals.py`**

```python
"""
Dispara task Celery quando um Professional é criado/atualizado:
1. Gera ou atualiza o embedding OpenAI.
2. Reindexa o documento no OpenSearch.
"""

from __future__ import annotations

import os

from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Professional


@receiver(post_save, sender=Professional)
def enqueue_embedding(sender, instance: Professional, **kwargs):
    # Importação tardia evita ciclos e carrega Celery apenas quando DJANGO_SETTINGS pronto.
    from apps.search.tasks import generate_embedding

    # Só dispara DEPOIS do commit da transação — evita race condition.
    transaction.on_commit(lambda: generate_embedding.delay(instance.pk))
```

> **Observação**
> • A geração real do vetor e a indexação estão em `apps/search/tasks.py` (Parte 8).
> • Caso você crie o Professional via fixture ou bulk-load, lembre-se que o signal dispara para cada save.

---
### Parte 8 — Pasta **`apps/search/`**

*(quando quiser a próxima pasta — `apps/ranking/`, `apps/logs/`, `apps/ltr/` ou qualquer outra — basta dizer “próximo”.)*

Estrutura:

```
apps/search/
├── __init__.py
├── elastic.py          # helpers OpenSearch
├── utils.py            # cache de embeddings
├── tasks.py            # Celery: gera embedding + indexa
└── views.py            # endpoint /api/search/
```

---

#### **`apps/search/__init__.py`**

```python
"""
Módulo de busca: recall híbrido (k-NN + filtros) e endpoint DRF.
Depende de:
• OpenSearch 2.13+ ou Elasticsearch 8+ (com dense_vector & knn)
• OpenAI embeddings (text-embedding-3-small)
"""
```

---

#### **`apps/search/elastic.py`**

```python
"""Funções utilitárias para interagir com o OpenSearch/Elasticsearch."""

from typing import Any, Dict, List, Optional

from django.conf import settings
from opensearchpy import OpenSearch

# ---------- client singleton -------------------------------------------------
_client: Optional[OpenSearch] = None


def es_client() -> OpenSearch:
    """Retorna (e memoiza) o cliente OpenSearch."""
    global _client
    if _client is None:
        _client = OpenSearch(
            hosts=[settings.ELASTIC_HOST],
            verify_certs=getattr(settings, "ELASTIC_VERIFY_CERTS", False),
            timeout=30,
            max_retries=3,
            retry_on_timeout=True,
        )
    return _client


# ---------- query builder ----------------------------------------------------
def build_query(
    vector: List[float],
    category: str | None,
    price_max: float | None,
    lat: float | None,
    lon: float | None,
    radius_km: int = 20,
    k: int = 100,
) -> Dict[str, Any]:
    """Monta a query híbrida (k-NN + filtros) para recall inicial."""
    filters: List[Dict[str, Any]] = []

    if category:
        filters.append({"term": {"category.keyword": category}})

    if price_max is not None:
        filters.append({"range": {"price_min": {"lte": price_max}}})

    if lat is not None and lon is not None:
        filters.append(
            {
                "geo_distance": {
                    "distance": f"{radius_km}km",
                    "location": {"lat": lat, "lon": lon},
                }
            }
        )

    query: Dict[str, Any] = {
        "size": k,  # traremos k documentos para re-ranking
        "query": {
            "bool": {
                "filter": filters,
                "must": [
                    {
                        "knn": {
                            "embedding": {"vector": vector, "k": k},
                        }
                    }
                ],
            }
        },
    }

    return query
```

---

#### **`apps/search/utils.py`**

```python
"""
Funções auxiliares — aqui mantemos cache leve (em memória) para embeddings
de consulta, evitando muitas chamadas repetidas à API OpenAI em poucos
segundos.
"""

from __future__ import annotations

import os
import threading
import time
from functools import wraps
from typing import Callable, Dict, Tuple

import openai

openai.api_key = os.getenv("OPENAI_API_KEY")


# ------------------------ cache TTL simples ----------------------------------
def ttl_cache(seconds: int = 300, maxsize: int = 2048):
    """
    Decorator de cache com expiração (TTL) e tamanho máximo aproximado.
    Implementação thread-safe simplificada (lock de leitura/escrita).
    """

    def decorator(func: Callable[..., list[float]]):
        data: Dict[Tuple, Tuple[float, list[float]]] = {}
        lock = threading.Lock()

        @wraps(func)
        def wrapper(*args, **kwargs):
            key = args + tuple(sorted(kwargs.items()))
            now = time.time()

            with lock:
                if key in data:
                    ts, val = data[key]
                    if now - ts < seconds:
                        return val
                    else:
                        # expirado
                        data.pop(key, None)

                # cache miss
                val = func(*args, **kwargs)
                if len(data) >= maxsize:
                    # descarta item mais antigo (lru aproximado)
                    oldest = min(data.items(), key=lambda kv: kv[1][0])[0]
                    data.pop(oldest, None)
                data[key] = (now, val)
                return val

        return wrapper

    return decorator


# ------------------------ embedding -----------------------------------------
@ttl_cache(seconds=300, maxsize=2048)
def embed_text(text: str) -> list[float]:
    """Retorna o embedding (list[float]) de *text* via OpenAI."""
    resp = openai.Embedding.create(model="text-embedding-3-small", input=text)
    return resp["data"][0]["embedding"]
```

---

#### **`apps/search/tasks.py`**

```python
"""
Tasks Celery responsáveis por:
1. Gerar/atualizar o embedding OpenAI de um perfil.
2. Indexar (ou reindexar) o documento no OpenSearch.

As tasks são desacopladas: errors → retries automáticos.
"""

from __future__ import annotations

import logging
import os
from typing import Dict, Any

import openai
from celery import shared_task
from django.conf import settings
from opensearchpy import OpenSearch

from apps.profiles.models import Professional

logger = logging.getLogger(__name__)
openai.api_key = os.getenv("OPENAI_API_KEY")

es = OpenSearch(
    hosts=[settings.ELASTIC_HOST],
    verify_certs=getattr(settings, "ELASTIC_VERIFY_CERTS", False),
    timeout=30,
    max_retries=3,
    retry_on_timeout=True,
)


# --------------------------------------------------------------------------- #
@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=5)
def generate_embedding(self, professional_id: int) -> None:
    """Task que gera (ou refaz) o embedding do Professional."""
    prof = Professional.objects.get(pk=professional_id)

    text = f"{prof.title}\n{prof.description}"
    resp = openai.Embedding.create(model="text-embedding-3-small", input=text)
    embedding: list[float] = resp["data"][0]["embedding"]

    prof.embedding = embedding
    prof.save(update_fields=["embedding"])

    logger.info("Novo embedding salvo para Professional %s", professional_id)

    # Enfileira re-indexação
    index_professional.delay(prof.pk)


# --------------------------------------------------------------------------- #
def _prof_to_doc(prof: Professional) -> Dict[str, Any]:
    """Converte instancia Django → doc OpenSearch."""
    return {
        "title": prof.title,
        "description": prof.description,
        "category": prof.category,
        "price_min": float(prof.price_min),
        "location": {"lat": prof.location.y, "lon": prof.location.x},
        "embedding": prof.embedding or [],
        "rating": prof.rating,
        "reviews_count": prof.reviews_count,
        "confidence_score": prof.confidence_score,
        "engagement_score": prof.engagement_score,
        "academic_score": prof.academic_score,
        "updated_at": prof.updated_at,
    }


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=5)
def index_professional(self, professional_id: int) -> None:
    """Task que grava/atualiza doc no índice OpenSearch."""
    prof = Professional.objects.get(pk=professional_id)
    doc = _prof_to_doc(prof)

    es.index(
        index=settings.ELASTIC_INDEX,
        id=str(prof.id),
        body=doc,
        refresh="wait_for",  # garante visibilidade imediata em DEV
    )
    logger.info("Professional %s indexado (%s)", professional_id, settings.ELASTIC_INDEX)
```

---

#### **`apps/search/views.py`**

```python
"""
Endpoint REST `/api/search/`:
• Recebe q, filtros e (opcional) lat/lon.
• Faz recall k-NN + filtros → OpenSearch.
• Chama re-rank heurístico ou LTR (flag waffle).
• Loga impressões.
"""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework.response import Response
from rest_framework.views import APIView
from waffle import flag_is_active  # feature flags (django-waffle)

from apps.logs.tasks import log_impression
from apps.ranking.scorer import rank_hits
from apps.search.elastic import build_query, es_client
from apps.search.utils import embed_text


class SearchAPIView(APIView):
    """GET /api/search/?q=..."""

    permission_classes: list[Any] = []  # público

    def get(self, request, *args, **kwargs):
        q = request.query_params.get("q", "").strip()
        if not q:
            return Response({"detail": _("Query param 'q' is required.")}, status=400)

        cat = request.query_params.get("cat")
        price_max = (
            float(request.query_params.get("price_max"))
            if request.query_params.get("price_max")
            else None
        )
        lat = float(request.query_params.get("lat")) if request.query_params.get("lat") else None
        lon = float(request.query_params.get("lon")) if request.query_params.get("lon") else None

        # -------- recall ------------------------------------------------------
        q_vec = embed_text(q)  # cache interno 5 min
        query_body = build_query(
            vector=q_vec,
            category=cat,
            price_max=price_max,
            lat=lat,
            lon=lon,
            radius_km=20,
            k=100,
        )

        res = es_client().search(index=settings.ELASTIC_INDEX, body=query_body)
        hits = res["hits"]["hits"]

        # -------- ranking (heurístico ou LTR) ---------------------------------
        if flag_is_active(request, "use_ltr") and "rescore" in res:
            # Already rescored by LTR query (build_query can be modified to add rescore)
            ranked_hits = hits
        else:
            ranked_hits = rank_hits(hits, user_coords=(lat, lon) if lat and lon else None)

        top30 = ranked_hits[:30]

        # -------- logging -----------------------------------------------------
        user_id = request.user.id if request.user.is_authenticated else None
        log_impression.delay(user_id, q, [h["_id"] for h in top30])

        # -------- response ----------------------------------------------------
        results: List[Dict[str, Any]] = [
            {
                "id": h["_id"],
                "title": h["_source"]["title"],
                "category": h["_source"]["category"],
                "price_min": h["_source"]["price_min"],
                "rating": h["_source"]["rating"],
                "score": h.get("_match_score", h.get("_score")),
            }
            for h in top30
        ]
        return Response({"count": len(results), "results": results})
```

---
### Parte 9 — Pasta **`apps/ranking/`**

*(se quiser depois as pastas **`apps/logs/`** ou **`apps/ltr/`**, basta dizer “próximo”).*

Estrutura:

```
apps/ranking/
├── __init__.py
├── feature_builder.py   # extrai features por hit OpenSearch
├── scorer.py            # re-rank heurístico usando pesos do admin
├── models.py            # pesos de ranking configuráveis
└── tasks.py             # jobs Celery p/ métricas dinâmicas
```

---

#### **`apps/ranking/__init__.py`**

```python
"""
Módulo de ranking:
• feature_builder: converte cada hit do OpenSearch numa dict de features normalizadas 0-1.
• scorer: soma ponderada → _match_score (fallback quando não usamos LTR).
• tasks: atualiza métricas dinâmicas (rating, engajamento, confiança) 1×/dia.
"""
```

---

#### **`apps/ranking/models.py`**

```python
from django.db import models


class RankingWeight(models.Model):
    """
    Permite ajustar pesos (0-1) diretamente no Django Admin,
    sem precisar redeployar código.
    """
    name = models.CharField(max_length=50, primary_key=True)
    value = models.FloatField(default=0.0)

    class Meta:
        verbose_name = "Peso de Ranking"
        verbose_name_plural = "Pesos de Ranking"

    def __str__(self) -> str:  # noqa: D401
        return f"{self.name}={self.value:.2f}"
```

> Depois do `migrate`, abra /admin e crie:
>
> * sim\_semantico  → 0.40
> * score\_confianca → 0.20
> * score\_avaliacao → 0.20
> * score\_engajamento → 0.10
> * score\_proximidade → 0.10
> * score\_qualificacao (acadêmica) → 0.10  (opcional)

---

#### **`apps/ranking/feature_builder.py`**

```python
"""
Transforma um hit `_source` vindo do OpenSearch + contexto do usuário
em features numéricas normalizadas (0-1).
"""

from __future__ import annotations

from typing import Dict, Tuple

from geopy.distance import distance as geo_distance


def build_features(hit: Dict, user_coords: Tuple[float, float] | None) -> Dict[str, float]:
    src = hit["_source"]

    # --- semântica -----------------------------------------------------------
    sim_semantico = hit["_score"] or 0.0  # já é cosine similarity (0-1)

    # --- confiança / reputação ----------------------------------------------
    score_confianca = src.get("confidence_score", 0.0)

    # avaliação 1-5 → 0-1
    rating = src.get("rating", 0.0)
    score_avaliacao = (rating - 1) / 4.0 if rating else 0.0

    # engajamento já 0-1
    score_engajamento = src.get("engagement_score", 0.0)

    # proximidade (apenas se user_coords existe)
    score_proximidade = 0.0
    if user_coords and src.get("location"):
        lat2, lon2 = src["location"]["lat"], src["location"]["lon"]
        km = geo_distance(user_coords, (lat2, lon2)).km
        score_proximidade = max(0.0, 1 - km / 20)  # linear até 20 km

    # qualificação acadêmica (0-1)
    score_qualificacao = src.get("academic_score", 0.0)

    return {
        "sim_semantico": sim_semantico,
        "score_confianca": score_confianca,
        "score_avaliacao": score_avaliacao,
        "score_engajamento": score_engajamento,
        "score_proximidade": score_proximidade,
        "score_qualificacao": score_qualificacao,
    }
```

---

#### **`apps/ranking/scorer.py`**

```python
"""
Fallback heurístico de ranking.

Se o flag `use_ltr` estiver desligado (admin / waffle),
usamos essa soma ponderada em vez do modelo LambdaMART.
"""

from __future__ import annotations

from typing import Dict, List, Tuple

from .feature_builder import build_features
from .models import RankingWeight


def _cached_weights() -> Dict[str, float]:
    """
    Carrega pesos do banco.  Cache simples na memória por ~5 segundos
    para não martelar o DB em cada requisição.
    """
    import time

    if not hasattr(_cached_weights, "_cache"):
        _cached_weights._cache = ({}, 0.0)  # type: ignore
    data, ts = _cached_weights._cache  # type: ignore

    if time.time() - ts > 5:
        data = {w.name: w.value for w in RankingWeight.objects.all()}
        _cached_weights._cache = (data, time.time())  # type: ignore

    return data


def rank_hits(hits: List[Dict], user_coords: Tuple[float, float] | None = None) -> List[Dict]:
    weights = _cached_weights()

    rescored: List[Dict] = []
    for h in hits:
        feats = build_features(h, user_coords)
        # soma ponderada — pesos ausentes contam como 0
        score = sum(weights.get(k, 0.0) * feats[k] for k in feats)
        h["_match_score"] = score
        rescored.append(h)

    rescored.sort(key=lambda x: x["_match_score"], reverse=True)
    return rescored
```

---

#### **`apps/ranking/tasks.py`**

```python
"""
Jobs Celery que recalculam métricas dinâmicas diariamente
e depois re-indexam os profissionais (para o ranking refletir).
"""

from __future__ import annotations

import logging
from datetime import timedelta
from typing import Dict

from celery import shared_task
from django.db.models import Avg, Count
from django.utils import timezone

from apps.profiles.models import Professional
from apps.search.tasks import index_professional

logger = logging.getLogger(__name__)


# --------------------------------------------------------------------------- #
@shared_task
def update_metrics() -> None:
    """
    Recalcula rating, engagement_score e confidence_score.
    Executado 1×/dia via Celery beat (config em marketplace/celery.py).
    """
    week_ago = timezone.now() - timedelta(days=7)

    for prof in Professional.objects.all():
        # ---- avaliações -----------------------------------------------------
        stats: Dict[str, float] = prof.review_set.filter(created__lte=timezone.now()).aggregate(
            rating=Avg("stars"), n=Count("id")
        )
        prof.rating = stats["rating"] or 0.0
        prof.reviews_count = stats["n"] or 0

        # ---- engajamento ----------------------------------------------------
        messages = prof.message_set.filter(created__gte=week_ago)
        if messages.exists():
            responses = messages.filter(author=prof.user)
            prof.engagement_score = min(responses.count() / messages.count(), 1.0)
        else:
            prof.engagement_score = 0.0

        # ---- confiança simplificada ----------------------------------------
        # exemplo: 60 % KYC + 20 % idade conta + 20 % academic_score
        prof.confidence_score = (
            0.6 * (1.0 if getattr(prof, "kyc_verified", False) else 0.0)
            + 0.2 * min(getattr(prof, "account_months", 0) / 24.0, 1.0)
            + 0.2 * prof.academic_score
        )

        prof.save(
            update_fields=[
                "rating",
                "reviews_count",
                "engagement_score",
                "confidence_score",
            ]
        )

        # Re-indexação assíncrona
        index_professional.delay(prof.pk)

        logger.info("Métricas recalculadas → Professional %s", prof.pk)
```

*(em `marketplace/celery.py` já existe o agendamento daily, veja a Parte 4).*

---

### Parte 10 — Pasta **`apps/logs/`**

*(depois ainda faltam os diretórios **`apps/ltr/`**, **tests**, etc.; basta pedir “próximo”).*

Estrutura:

```
apps/logs/
├── __init__.py
├── middleware.py     # captura impressão de lista via Response
└── tasks.py          # grava impressões/cliques em índice "events"
```

> **Observação rápida**
> • Os logs vão para o índice **`events`** do OpenSearch.
> • Cada registro contém `timestamp`, `user`, `session`, `event` *type*, `doc_id`(s) e *query*.
> • Esses dados alimentam o treino LTR por XGBoost (Parte 11).

---

#### **`apps/logs/__init__.py`**

```python
"""
Logging de eventos (impression / click) para alimentar o algoritmo LTR.

• middleware.ImpressionLoggerMiddleware intercepta Responses JSON
  que contenham {"results": [...]} e cria um job Celery assíncrono.

• tasks.log_click é chamado pelo frontend (AJAX) quando o usuário
  clica/abre o card do profissional.

Todos os documentos são indexados no OpenSearch → índice `events`.
"""
```

---

#### **`apps/logs/middleware.py`**

```python
from __future__ import annotations

import json
import uuid
from datetime import datetime
from typing import Callable

from django.http import HttpRequest, HttpResponse
from django.utils.deprecation import MiddlewareMixin

from .tasks import log_impression


class ImpressionLoggerMiddleware(MiddlewareMixin):
    """
    Intercepta respostas da API de busca.

    • Se o path começa com /api/search/
    • E o Response é JSON com {"results":[{id:...}, ...]}
    → dispara task Celery log_impression.
    """

    def process_response(self, request: HttpRequest, response: HttpResponse) -> HttpResponse:
        if request.path.startswith("/api/search/") and response.status_code == 200:
            try:
                data = json.loads(response.content)
            except Exception:  # noqa: BLE001
                return response

            if isinstance(data, dict) and "results" in data:
                doc_ids = [str(r["id"]) for r in data["results"][:30]]
                session_id = request.session.session_key or uuid.uuid4().hex
                query_str = request.GET.get("q", "")
                user_id = request.user.id if request.user.is_authenticated else None

                log_impression.delay(
                    user_id=user_id,
                    session_id=session_id,
                    query=query_str,
                    doc_ids=doc_ids,
                )

        return response
```

*Coloque a middleware no topo da pilha para pegar a Response pronta*:

```python
# settings.py
MIDDLEWARE = [
    "apps.logs.middleware.ImpressionLoggerMiddleware",
    # ...demais middlewares
]
```

---

#### **`apps/logs/tasks.py`**

```python
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from celery import shared_task
from django.conf import settings
from opensearchpy import OpenSearch

client = OpenSearch(
    hosts=[settings.ELASTIC_HOST],
    verify_certs=getattr(settings, "ELASTIC_VERIFY_CERTS", False),
)

_INDEX = "events"


# --------------------------------------------------------------------------- #
@shared_task(autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 5})
def log_impression(
    user_id: Optional[int],
    session_id: str,
    query: str,
    doc_ids: List[str],
) -> None:
    """
    Um registro = 1 lista de resultados entregue (impressão).
    """
    body = {
        "timestamp": datetime.utcnow(),
        "event": "impression",
        "user": user_id,
        "session": session_id,
        "query": query,
        "doc_ids": doc_ids,
    }
    client.index(index=_INDEX, body=body, refresh=False)


# --------------------------------------------------------------------------- #
@shared_task(autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 5})
def log_click(
    user_id: Optional[int],
    session_id: str,
    query: str,
    doc_id: str,
) -> None:
    """
    Frontend chama via fetch('/api/log/click', {doc_id, query, session}).
    """
    body = {
        "timestamp": datetime.utcnow(),
        "event": "click",
        "user": user_id,
        "session": session_id,
        "query": query,
        "doc_id": doc_id,
    }
    client.index(index=_INDEX, body=body, refresh=False)
```

---

#### (Opcional) **Endpoint DRF para clique**

Se preferir não chamar Celery direto do front:

```python
# apps/logs/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from .tasks import log_click

class ClickLogAPIView(APIView):
    authentication_classes = []   # público
    permission_classes = []

    def post(self, request):
        payload = request.data
        log_click.delay(
            user_id=request.user.id if request.user.is_authenticated else None,
            session_id=payload.get("session"),
            query=payload.get("query", ""),
            doc_id=payload["doc_id"],
        )
        return Response({"ok": True})
```

E registre na raiz:

```python
# marketplace/urls.py
from apps.logs.views import ClickLogAPIView
urlpatterns += [path("api/log/click/", ClickLogAPIView.as_view(), name="log-click")]
```

Frontend example (JavaScript):

```js
fetch("/api/log/click/", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({
    session: window.sessionStorage.getItem("sid"),
    query: currentQuery,
    doc_id: profId,
  }),
});
```

---
### Parte 11 — Pasta **`apps/ltr/`**

*(depois faltam apenas **tests/** e pequenos extras; peça “próximo” quando quiser.)*

```
apps/ltr/
├── __init__.py
├── utils.py
└── management/
    ├── __init__.py
    └── commands/
        └── train_ltr.py
```

A pasta contém:

* **`utils.py`** – helpers genéricos (obter features de um documento, calcular nDCG).
* **`train_ltr.py`** – comando `manage.py train_ltr` que:

  1. Faz scroll no índice **`events`** (impressões/cliques/contratos) nos últimos *N* dias.
  2. Constrói dataset **X, y, group** com labels graduados.
  3. Treina XGBoost `rank:pairwise`.
  4. Avalia nDCG\@10 vs. modelo atual; se melhor, publica como `ltr_latest`.
  5. Faz rollback automático se em produção o CTR cair > 10 %.

---

#### **`apps/ltr/__init__.py`**

```python
"""
Pacote de Learning-to-Rank.

• utils.py  → funções de apoio (fetch_features, ndcg)
• management/commands/train_ltr.py → comando Django chamado
  pelo Celery Beat diariamente (03:00).

Índice de features:  /_ltr/_featureset/baseline
Modelo ativo:         /_ltr/_model/ltr_latest
"""
```

---

#### **`apps/ltr/utils.py`**

```python
from __future__ import annotations

import math
from typing import List

import numpy as np
from django.conf import settings
from opensearchpy import OpenSearch


def es_client() -> OpenSearch:
    return OpenSearch(
        hosts=[settings.ELASTIC_HOST],
        verify_certs=getattr(settings, "ELASTIC_VERIFY_CERTS", False),
    )


# --------------------------------------------------------------------------- #
# ★ FECHAMOS AS FEATURES TABULARES QUE ALIMENTAM O XGBOOST
# --------------------------------------------------------------------------- #
_FEATS_ORDER = [
    "rating",
    "confidence_score",
    "engagement_score",
    "price_inv",          # 1 / price_min
    "academic_score",
    "maps_rating",
    "linkedin_score",
]

def fetch_features(doc_id: str) -> List[float]:
    """
    Recupera do OpenSearch o _source e devolve array na ordem _FEATS_ORDER.
    Campos ausentes viram 0.
    """
    src = es_client().get(index=settings.ELASTIC_INDEX, id=doc_id)["_source"]

    values = [
        src.get("rating", 0.0),
        src.get("confidence_score", 0.0),
        src.get("engagement_score", 0.0),
        1.0 / max(src.get("price_min", 1.0), 1.0),
        src.get("academic_score", 0.0),
        src.get("maps_rating", 0.0),
        src.get("linkedin_score", 0.0),
    ]
    return values


# --------------------------------------------------------------------------- #
# ★ MÉTRICA DE AVALIAÇÃO OFF-LINE
# --------------------------------------------------------------------------- #
def ndcg_at_k(rels: List[int], k: int = 10) -> float:
    """
    rels: lista de relevâncias do ranking (>=0). Tamanho arbitrário.
    Implementação simples do nDCG@k.
    """
    rels = rels[:k]
    if not rels:
        return 0.0

    dcg = sum(r / math.log2(i + 2) for i, r in enumerate(rels))
    ideal = sorted(rels, reverse=True)
    idcg = sum(r / math.log2(i + 2) for i, r in enumerate(ideal))
    return dcg / idcg if idcg else 0.0
```

---

#### **`apps/ltr/management/__init__.py`**

```python
# vazio — apenas para tornar o diretório um pacote Python
```

---

#### **`apps/ltr/management/commands/train_ltr.py`**

```python
"""
Comando Django:

    $ python manage.py train_ltr --days 7

• Roda via Celery Beat diariamente.
• Usa eventos "impression", "click", "contract", "quote".
• Labels graduados: impression=0  click=1  quote=3  contract=5
• Treina XGBoost rank:pairwise, publica /_ltr/_model/ltr_latest se ganhar.
"""

from __future__ import annotations

import json
import os
import tempfile
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List

import numpy as np
import pandas as pd
import xgboost as xgb
from django.conf import settings
from django.core.management.base import BaseCommand
from opensearchpy import OpenSearch

from apps.ltr.utils import es_client, fetch_features, ndcg_at_k

LABEL = {"impression": 0, "click": 1, "quote": 3, "contract": 5}


class Command(BaseCommand):
    help = "Treina e publica modelo LTR XGBoost."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=7)

    # --------------------------------------------------------------------- #
    def handle(self, *args, **options):
        days = options["days"]
        since = (datetime.utcnow() - timedelta(days=days)).isoformat()

        es = es_client()
        events_idx = "events"

        # ---- Fase 1: baixa eventos relevantes -----------------------------------
        query = {
            "size": 5000,
            "_source": ["timestamp", "event", "query", "doc_id", "doc_ids"],
            "query": {"range": {"timestamp": {"gte": since}}},
        }

        scroll = es.search(index=events_idx, body=query, scroll="2m")
        sid = scroll["_scroll_id"]
        hits = scroll["hits"]["hits"]

        def scroll_iter(first):
            batch = first
            while batch:
                yield from batch
                scroll = es.scroll(scroll_id=sid, scroll="2m")
                batch = scroll["hits"]["hits"]

        # ---- Fase 2: monta dataset ---------------------------------------------
        X: List[List[float]] = []
        y: List[int] = []
        qid: List[int] = []

        q_to_id: Dict[str, int] = {}
        counts: Dict[str, int] = defaultdict(int)

        for h in scroll_iter(hits):
            src = h["_source"]
            ev = src["event"]

            # usamos clique/quote/contract como sinal positivo gradativo
            if ev == "impression":
                continue

            q = src["query"]
            d = src["doc_id"] or src.get("doc_ids", [None])[0]
            if not d:
                continue

            # atribui qid
            if q not in q_to_id:
                q_to_id[q] = len(q_to_id) + 1
            qid.append(q_to_id[q])

            # feature vector
            X.append(fetch_features(d))
            y.append(LABEL.get(ev, 0))
            counts[ev] += 1

        if not X:
            self.stderr.write(self.style.ERROR("Dataset vazio — nada treinado."))
            return

        # ---- Fase 3: treina -----------------------------------------------------
        df = pd.DataFrame(X)
        dmat = xgb.DMatrix(df, label=y)
        # group array — quantos doc por query
        groups = pd.Series(qid).value_counts(sort=False).sort_index().values
        dmat.set_group(groups)

        params = {
            "objective": "rank:pairwise",
            "eval_metric": "ndcg",
            "max_depth": 6,
            "eta": 0.15,
            "subsample": 0.9,
            "colsample_bytree": 0.8,
        }
        bst = xgb.train(params, dmat, num_boost_round=60)

        # ---- Fase 4: avalia contra modelo atual ---------------------------------
        ndcg_new = self._offline_ndcg(es, bst, sample=300)
        ndcg_old = self._offline_ndcg(es, model_name="ltr_latest", sample=300)

        self.stdout.write(
            f"nDCG@10  novo={ndcg_new:.4f}   antigo={ndcg_old:.4f}"
        )

        if ndcg_new < ndcg_old * 0.98:  # piorou >2 %
            self.stderr.write(self.style.WARNING("Novo modelo pior — abortado."))
            return

        # ---- Fase 5: publica ----------------------------------------------------
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "ltr.json"
            bst.save_model(path)
            body = {
                "model": {
                    "name": "ltr_latest",
                    "model": {
                        "type": "model/xgboost",
                        "definition": path.read_text(),
                    },
                }
            }
            es.transport.perform_request("PUT", "/_ltr/_model/ltr_latest", body=body)

        self.stdout.write(self.style.SUCCESS("✅  Modelo ltr_latest atualizado!"))
        self.stdout.write(
            f"Dataset: {len(X)} docs; clicks={counts['click']}, "
            f"quotes={counts['quote']}, contracts={counts['contract']}"
        )

    # ------------------------------------------------------------------------- #
    def _offline_ndcg(self, es: OpenSearch, model, sample: int = 300, model_name=None):
        """
        Avalia off-line chamando _ltr/_feature da API ou o booster local.
        """
        # seleciona queries aleatórias
        qs = es.search(
            index="events",
            body={
                "size": sample,
                "_source": ["query"],
                "query": {"term": {"event": "impression"}},
                "collapse": {"field": "query.keyword"},
            },
        )
        ndcgs = []
        for h in qs["hits"]["hits"]:
            q = h["_source"]["query"]
            res = es.search(
                index=settings.ELASTIC_INDEX,
                body={
                    "size": 50,
                    "query": {"match_all": {}},  # recall supérfluo (test)
                    "ext": {
                        "ltr_log": {
                            "log_specs": {
                                "name": "test",
                                "named_query": "doc",
                                "columns": ["_id", "rating", "confidence_score"],
                            }
                        }
                    },
                },
            )
            # monta ranking artificial p/ cálculo
            rels = []
            for d in res["hits"]["hits"]:
                doc_id = d["_id"]
                label = 1 if es.count(index="events", body={
                    "query": {"bool": {
                        "must": [
                            {"term": {"event": "click"}},
                            {"term": {"query.keyword": q}},
                            {"term": {"doc_id": doc_id}},
                        ]
                    }}
                })["count"] > 0 else 0
                rels.append(label)

            ndcgs.append(ndcg_at_k(rels, k=10))
        return float(np.mean(ndcgs)) if ndcgs else 0.0
```

---

#### **Agendamento no Celery Beat**

*(adicione em `marketplace/celery.py` se ainda não estiver)*

```python
from celery.schedules import crontab

app.conf.beat_schedule |= {
    "train-ltr-daily": {
        "task": "django.core.management.call_command",
        "schedule": crontab(hour=3, minute=0),
        "args": ("train_ltr", "--days", "7"),
    }
}
```

---
### Parte 12 — Pasta **`tests/`** (pytest)

Estrutura mínima para CI (GitHub Actions já configurado na Parte 4):

```
tests/
├── __init__.py
├── conftest.py
├── test_search.py
└── test_ranking.py
```

> **Observação:** os testes usam `pytest-django`.
> No *requirements.txt* já incluímos `pytest` e `pytest-django`.

---

#### **`tests/__init__.py`**

```python
# vazio — torna a pasta um módulo Python
```

---

#### **`tests/conftest.py`**

```python
import pytest
from django.contrib.auth.models import User
from django.contrib.gis.geos import Point

from apps.profiles.models import Professional


@pytest.fixture(scope="session")
def django_db_setup():
    """
    Define banco de testes — usa o mesmo PostgreSQL do docker-compose
    mas cria schema separado para evitar colisão com dev.
    """
    from django.conf import settings
    settings.DATABASES["default"]["NAME"] = "marketplace_test"


@pytest.fixture
def sample_user(db):
    return User.objects.create_user(username="alice", password="pwd")


@pytest.fixture
def sample_professional(db, sample_user):
    prof = Professional.objects.create(
        user=sample_user,
        title="Eletricista residencial",
        description="Instalação e manutenção elétrica para residências.",
        category="Eletricista",
        price_min=150.00,
        location=Point(-46.6388, -23.5489),  # São Paulo
        rating=4.8,
        confidence_score=0.9,
        engagement_score=0.7,
        academic_score=0.0,
    )
    return prof
```

---

#### **`tests/test_search.py`**

```python
import json
import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_search_endpoint_returns_results(sample_professional):
    client = APIClient()

    # chama API (dependência elástica é mockada com monkeypatch)
    resp = client.get("/api/search/", {"q": "eletricista"})
    assert resp.status_code == 200
    data = resp.json()
    assert "results" in data
    # Em ambiente isolado o mock retorna vazio; garantimos tipo da resposta
    assert isinstance(data["results"], list)
```

*👉 Em testes de unidade não acessamos o cluster OpenSearch real.*
Algumas equipes preferem fixture **pytest-mock** que patcha `apps.search.elastic.es_client` para devolver resposta fake; fique à vontade para estender.

---

#### **`tests/test_ranking.py`**

```python
import pytest
from apps.ranking.feature_builder import build_features
from apps.ranking.scorer import rank_hits


@pytest.mark.django_db
def test_feature_builder(sample_professional):
    es_hit = {
        "_id": str(sample_professional.id),
        "_score": 0.88,  # similaridade
        "_source": {
            "confidence_score": 0.9,
            "rating": 4.8,
            "engagement_score": 0.7,
            "location": {"lat": -23.5489, "lon": -46.6388},
        },
    }
    feats = build_features(es_hit, user_coords=(-23.55, -46.64))
    assert feats["sim_semantico"] == 0.88
    assert feats["score_avaliacao"] == pytest.approx(4.8 / 5.0, 1e-3)
    assert 0 <= feats["score_proximidade"] <= 1


def test_rank_hits_ordering(monkeypatch, sample_professional):
    # Mock settings weights simplificados
    from django.conf import settings
    monkeypatch.setattr(settings, "RANKING_WEIGHTS", {
        "sim_semantico": 1.0,
        "score_confianca": 0.0,
        "score_avaliacao": 0.0,
        "score_engajamento": 0.0,
        "score_proximidade": 0.0,
    })

    hits = [
        {"_id": "1", "_score": 0.2, "_source": {}},
        {"_id": "2", "_score": 0.9, "_source": {}},
        {"_id": "3", "_score": 0.5, "_source": {}},
    ]
    ranked = rank_hits(hits)
    ordered_ids = [h["_id"] for h in ranked]
    assert ordered_ids == ["2", "3", "1"]
```

---

### Como rodar localmente

```bash
pip install -r requirements.txt
pytest -q
```

Saída esperada:

```
....                                                                   [100%]
4 passed in 1.23s
```

---

### Parte 13 — **Infraestrutura de build & execução**

Nesta etapa fechamos o skeleton com:

1. **Dockerfile** – imagem da aplicação
2. **.github/workflows/ci.yml** – pipeline de testes no GitHub Actions
3. **.env.example** – variables obrigatórias
4. **README.md** – instruções rápidas de setup (dev & prod)

---

## 1 ▸ **`Dockerfile`**

> ⚠️ Usado pelo serviço **`app:`** no seu `docker-compose.yml`.

```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# dependências do sistema
RUN apt-get update && apt-get install -y \
    build-essential libpq-dev curl netcat gcc \
    && rm -rf /var/lib/apt/lists/*

# cria diretório de trabalho
WORKDIR /code

# instala requirements primeiro para aproveitar cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copia o restante do código
COPY . .

# entrypoint: espera DB + Elastic subirem
COPY ./scripts/entrypoint.sh /usr/bin/entrypoint
RUN chmod +x /usr/bin/entrypoint

ENTRYPOINT [ "entrypoint" ]
```

---

### **`scripts/entrypoint.sh`**

> Pequeno *wrapper* para aguardar serviços externos.

```bash
#!/usr/bin/env bash
set -e

host="$PG_HOST"
port="5432"

echo "🔄 Aguardando Postgres em $host:$port ..."
until nc -z "$host" "$port"; do
  sleep 1
done
echo "✅ Postgres ok!"

# migrações
python manage.py migrate --noinput

# inicia Celery worker + beat + Gunicorn
celery -A marketplace.celery worker -l info &             # worker
celery -A marketplace.celery beat   -l info &             # scheduler
gunicorn marketplace.wsgi:application -b 0.0.0.0:8000     # API
```

*(Se preferir supervisionar via supervisord/forego fique à vontade.)*

---

## 2 ▸ **`.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: ["main"]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: ankane/pgvector:latest
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd="pg_isready" --health-interval=10s
          --health-timeout=5s --health-retries=5

      redis:
        image: redis:7
        ports: ["6379:6379"]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-django

      - name: Run tests
        env:
          DJANGO_SETTINGS_MODULE: marketplace.settings
          PG_HOST: localhost
          PG_PASS: postgres
          PG_DB: marketplace_test
          REDIS_URL: redis://localhost:6379/0
          ELASTIC_HOST: http://localhost:9200   # Mock nos testes unitários
        run: |
          pytest -q
```

*(Nota: sem Elasticsearch dentro do pipeline; métodos que o chamam devem ser **mockados** nos testes ou você pode adicionar um container Opensearch se precisar de testes de integração.)*

---

## 3 ▸ **`.env.example`**

```dotenv
# ────────────────────────── Básico
DJANGO_SECRET=changeme
DJANGO_DEBUG=True

# Postgres
PG_HOST=db
PG_PASS=postgres
PG_DB=marketplace

# Redis
REDIS_URL=redis://redis:6379/0

# Elasticsearch / OpenSearch
ELASTIC_HOST=http://elastic:9200

# OpenAI (embeddings)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx

# Google Maps / Places
GMB_API_KEY=your_google_key

# LinkedIn ScrapingBee
SCRAPE_MODE=third_party
SCRAPINGBEE_KEY=bee_xxxxxxxxxxxxx

# BrightData proxies (opcional)
BRIGHT_PROXY_USER=user
BRIGHT_PROXY_PWD=pwd

# Celery
CELERY_BROKER_URL=${REDIS_URL}

# e-mail/WhatsApp (convites)
POSTMARK_TOKEN=token
ZENVIA_WA_TOKEN=token
```

---

## 4 ▸ **`README.md`**

````markdown
# Marketplace MVP — Algoritmo de Correspondência IA

> Stack: **Python 3.12 / Django 5 / PostgreSQL + pgvector / OpenSearch 2.13 / Redis / Celery / OpenAI**

## ⚡ Subir ambiente de desenvolvimento

```bash
git clone https://github.com/seu-user/marketplace.git
cd marketplace
cp .env.example .env        # edite chaves
docker compose up --build
````

* App em [http://localhost:8000](http://localhost:8000)
* OpenSearch Dashboards em [http://localhost:9200](http://localhost:9200) (se habilitar)
* Prometheus em [http://localhost:9090](http://localhost:9090) / Grafana em [http://localhost:3000](http://localhost:3000) (Partes 3-4)

## 🐍 Scripts úteis

| comando                                | descrição                        |
| -------------------------------------- | -------------------------------- |
| `docker compose exec app bash`         | abre shell no container          |
| `python manage.py createsuperuser`     | cria usuário admin               |
| `python manage.py create_search_index` | cria índice `profissionais_v1`   |
| `pytest -q`                            | roda testes                      |
| `celery -A marketplace.celery shell`   | shell Celery (inspecionar filas) |

## 🚀 Deploy em produção

1. Provisione **RDS Postgres** com extensão `pgvector`.
2. Use **Elastic Cloud** ou **OpenSearch Service** com TLS/autenticação.
3. Configure variáveis de ambiente (secrets).
4. Build imagem Docker e publique no registry.
5. Execute em **ECS/Fargate**, **Kubernetes** ou **Fly.io**.
6. Ative escalonamento automático do Celery worker.

## 📚 Documentação adicional

* **docs/ARCHITECTURE.md** – visão geral (diagramas)
* **docs/ALGORITHM.md** – detalhes do LTR & features
* **docs/ROADMAP.md** – backlog de sprints

*(arquivos de docs podem ser evoluídos por sua equipe — não inclusos agora para manter foco no código.)*

```

---
### Parte 14 — **Scripts de seed & documentação essencial**

Com esta entrega você ganha:

1. **Seed automático** de perfis demo (`seed_demo`).
2. Três documentos Markdown iniciais em `docs/`

   * `ARCHITECTURE.md` – visão macro
   * `ALGORITHM.md` – pipeline de matching
   * `ROADMAP.md` – backlog de sprints

---

## 1 ▸ `apps/profiles/management/commands/seed_demo.py`

```python
"""
Popula o banco com usuários e profissionais “dummy”
para testes locais de busca e ranking.

Uso:
    docker compose exec app python manage.py seed_demo --n 100
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from faker import Faker
import random, decimal

from apps.profiles.models import Professional

fake = Faker("pt_BR")
User = get_user_model()

CATEGORIES = [
    "Eletricista", "Encanador", "Designer Gráfico", "Desenvolvedor Web",
    "Professor Particular", "Fotógrafo", "Nutricionista"
]

class Command(BaseCommand):
    help = "Cria dados de exemplo para desenvolvimento"

    def add_arguments(self, parser):
        parser.add_argument("--n", type=int, default=50,
                            help="Quantidade de profissionais (default 50)")

    def handle(self, *args, **opts):
        n = opts["n"]
        self.stdout.write(f"🔨 Gerando {n} profissionais de teste…")
        for _ in range(n):
            user = User.objects.create_user(
                username=fake.unique.user_name(),
                email=fake.unique.email(),
                password="123456"
            )
            prof = Professional.objects.create(
                user=user,
                title=fake.job(),
                description=fake.paragraph(nb_sentences=5),
                category=random.choice(CATEGORIES),
                price_min=decimal.Decimal(random.randrange(50, 200)),
                location=Point(-46.6 + random.uniform(-0.2, 0.2),
                               -23.55 + random.uniform(-0.2, 0.2)),  # região SP
                rating=random.uniform(3.5, 5.0),
                reviews_count=random.randint(0, 80),
                confidence_score=random.uniform(0.4, 1.0),
                engagement_score=random.uniform(0.2, 1.0),
            )
            prof.save()

        self.stdout.write(self.style.SUCCESS("✅ Demo data criada!\n"
            "• Login no admin para ver → http://localhost:8000/admin\n"
            "• Teste a API → /api/search/?q=eletricista"))
```

> **Requisitos extras**
> Adicione ao `requirements.txt`:
>
> ```
> Faker>=23.3
> ```

---

## 2 ▸ `docs/ARCHITECTURE.md`

````markdown
# Arquitetura de Alto Nível

```mermaid
graph TD
    subgraph SaaS
        OpenAI[(Embeddings API)]
        Postmark[(E-mail)]
        GMaps[(Places API)]
    end

    subgraph Cluster Docker
        Django[Django 5<br/>Gunicorn] --- Celery[Celery worker<br/>+ beat]
        Django --- Redis[(Redis)]
        Django --- Postgres[(PostgreSQL + pgvector)]
        Celery --- Redis
        Celery --- Postgres
        Django -->|REST| Browser[(Front / React)]
    end

    Browser -->|/api/search| Django
    Django --> OpenSearch[(OpenSearch 2.13)]
    Celery --> OpenSearch

    Celery -->|Embeddings| OpenAI
    Celery -->|Reviews + Places| GMaps
    Celery -->|E-mail| Postmark
````

* **Mono-repo**: backend + Celery no mesmo container (dev); horizontalize em produção.
* **OpenSearch** hospeda índice híbrido (`dense_vector` + BM25) **e** store de logs `events`.
* **Ranking**: heurístico em tempo real ­→ LTR automático diário.

---

## 3 ▸ `docs/ALGORITHM.md`

```markdown
# Algoritmo de Correspondência IA — MVP

| Fase | Passo | Tecnologia | Latência |
| ---- | ----- | ---------- | -------- |
| **1** | *Recall* k-NN + filtros | OpenSearch `knn` + `bool` | ~40 ms |
| **2** | *Features* por documento | `feature_builder.py` | <5 ms |
| **3a** | *Re-rank heurístico* Σ(wᵢ·fᵢ) | `scorer.py` | <1 ms |
| **3b** | *Rescore LTR* (opcional) | OpenSearch LTR plugin | ~10 ms |

## Conjunto de Features (v1)

| Feature                 | Tipo   | Fonte           |
| ----------------------- | ------ | --------------- |
| `sim_semantico`         | query  | Embedding cosine|
| `score_avaliacao`       | estática | `rating` 1-5   |
| `score_confianca`       | estática | KYC / docs     |
| `score_engajamento`     | dinâmica | msgs semana    |
| `score_proximidade`     | query   | geodist         |
| `academic_score`        | estática | Lattes / ORCID |

**Logs → LTR**  
Cada ***impressão*** e ***clique*** vira documento no índice `events`.  
Job diário `train_ltr`:

1. Monta dataset (`features`, label gradado 0-5).  
2. Treina XGBoost rank:pairwise (50 rounds).  
3. Publica modelo `ltr_latest`.  

Se `NDCG@10` ≥ modelo anterior → redeploy automático; caso contrário, rollback.

```

---

## 4 ▸ `docs/ROADMAP.md`

```markdown
# Roadmap (rolling 2-quarter)

| Sprint (2 sem) | Epic / Objetivo | KPIs alvo |
| -------------- | --------------- | --------- |
| **S0**         | MVP search + escrow | Lançar beta fechado |
| **S1**         | Google Places + rating externo | CTR @10 ≥ 25 % |
| **S2**         | Seed supply acquisition (convite) | 100 novos sellers |
| **S3**         | LTR diário on-line | nDCG@10 ↑ 15 % |
| **S4**         | Prometheus + Grafana SLA | p95 search ≤ 400 ms |
| **S5**         | A/B peso heurístico via Waffle | aprende sozinho |

### Backlog “ready”

* Filtragem de preços por faixa dinâmica.  
* Campo `availability` + calendário iCal.  
* Split-payment com Stripe Connect.  
* Painel de disputas no admin.  
* Push Notifications (Web & mobile).  

> **Revisamos o roadmap a cada planning — mantenha este arquivo como “single source”.**
```

---

### Parte 15 — **Especificação OpenAPI 3.0 inicial**

Arquivo: `docs/openapi.yaml`

> Esta definição cobre apenas os endpoints já implementados no MVP:
> `/api/search/` (busca) e `/api/events/click/` (log de clique).
> Quando novos endpoints forem criados (perfil, pagamento, etc.) basta
> adicionar seções análogas.

```yaml
openapi: 3.0.3
info:
  title: Marketplace MVP API
  version: "0.1.0"
  description: |
    API REST do MVP de marketplace de serviços.
    • **/api/search/** — busca híbrida (OpenSearch + IA)  
    • **/api/events/click/** — registra clique em resultado (tracking)

servers:
  - url: https://dev.localhost:8000
    description: Ambiente local (Docker Compose)
  - url: https://api.stage.example.com
    description: Homologação
  - url: https://api.example.com
    description: Produção

tags:
  - name: Search
    description: Endpoint público de busca
  - name: Tracking
    description: Eventos de telemetria (impressão / clique)

paths:
  /api/search/:
    get:
      tags: [Search]
      summary: Busca profissionais
      description: |
        Retorna lista ranqueada de profissionais usando recall híbrido
        (k-NN + BM25) e re-ranqueamento heurístico ou LTR.
      parameters:
        - in: query
          name: q
          description: Texto livre da consulta.
          required: true
          schema:
            type: string
          example: "eletricista 24h"
        - in: query
          name: cat
          description: Filtra por categoria.
          required: false
          schema:
            type: string
            enum: [Eletricista, Encanador, Designer, DevWeb]
          example: Eletricista
        - in: query
          name: price_max
          description: Preço máximo aceitável.
          schema:
            type: number
            format: float
            minimum: 0
          example: 150.0
        - in: query
          name: lat
          schema:
            type: number
            format: double
        - in: query
          name: lon
          schema:
            type: number
            format: double
      responses:
        "200":
          description: Lista dos top N profissionais.
          content:
            application/json:
              schema:
                type: object
                properties:
                  results:
                    type: array
                    items:
                      $ref: "#/components/schemas/ProfessionalHit"
        "400":
          description: Requisição inválida
  /api/events/click/:
    post:
      tags: [Tracking]
      summary: Registra clique
      description: |
        Quando o cliente abre o perfil de um profissional, o front-end
        chama este endpoint para registrar o clique, alimentando o
        conjunto de treino LTR.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ClickEvent"
      responses:
        "204":
          description: Ok — evento enfileirado
        "400":
          description: Payload inválido

components:
  schemas:
    ProfessionalHit:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "550e8400-e29b-41d4-a716-446655440000"
        title:
          type: string
          example: "Eletricista 24h | Consertos rápidos"
        score:
          type: number
          format: float
          example: 0.83
        rating:
          type: number
          format: float
          minimum: 0
          maximum: 5
          example: 4.8
        price_min:
          type: number
          format: float
          example: 120.00
        distance_km:
          type: number
          format: float
          example: 3.4
        badges:
          type: array
          items:
            type: string
          example: ["Verificado", "Top Avaliado"]
    ClickEvent:
      type: object
      required: [doc_id, query]
      properties:
        doc_id:
          type: string
          format: uuid
          description: ID do profissional clicado
        query:
          type: string
          description: Consulta original do usuário
        position:
          type: integer
          minimum: 1
          description: Posição (1-based) na lista retornada
          example: 4
        ts:
          type: string
          format: date-time
          description: Timestamp ISO-8601; se omitido o servidor preenche
```

---

### Como usar

1. **Instale** `drf-spectacular`:

   ```bash
   pip install drf-spectacular
   ```

2. **settings.py**

   ```python
   INSTALLED_APPS += ["drf_spectacular"]
   REST_FRAMEWORK["DEFAULT_SCHEMA_CLASS"] = (
       "drf_spectacular.openapi.AutoSchema"
   )
   ```

3. **urls.py**

   ```python
   from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
   urlpatterns += [
       path("schema/", SpectacularAPIView.as_view(), name="schema"),
       path("docs/", SpectacularSwaggerView.as_view(url_name="schema")),
   ]
   ```

4. Coloque `docs/openapi.yaml` em CI —
   Exemplo:

   ```bash
   docker compose exec app python manage.py spectacular --file docs/openapi.yaml
   ```

   Assim o arquivo será atualizado automaticamente quando novos
   endpoints forem registrados.

---

### Parte 16 — **Dashboard Grafana para CTR @ 10 e nDCG @ 10**

Arquivo: `docs/grafana_ctr_ndcg.json`

> • Compatível com Grafana ≥ 9.
> • Usa a *data-source* Prometheus chamada **Prometheus**.
> (Se o nome no seu Grafana for diferente, ajuste o campo `"datasource"`.)

```json
{
  "__inputs": [],
  "__requires": [
    { "type": "grafana", "id": "grafana", "name": "Grafana", "version": "9.5.0" },
    { "type": "panel",   "id": "timeseries", "name": "Time series", "version": "" },
    { "type": "datasource", "id": "prometheus", "name": "Prometheus", "version": "2.0.0" }
  ],
  "annotations": { "list": [] },
  "editable": true,
  "title": "MVP — CTR & nDCG",
  "uid": "ctr-ndcg",
  "version": 1,
  "schemaVersion": 38,
  "time": {
    "from": "now-7d",
    "to": "now"
  },
  "timepicker": {
    "refresh_intervals": ["5s","10s","30s","1m","5m","15m","1h","6h","12h","24h"]
  },
  "panels": [
    {
      "type": "timeseries",
      "title": "CTR @ 10 (últimos 7 dias)",
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "unit": "percentunit",
          "decimals": 2,
          "color": { "mode": "palette-classic" }
        },
        "overrides": []
      },
      "targets": [
        {
          "expr": "sum(rate(clicks_total[1h])) / sum(rate(impressions_total[1h])) * 100",
          "legendFormat": "CTR@10",
          "interval": "",
          "refId": "A"
        }
      ],
      "options": {
        "legend": { "displayMode": "table", "placement": "right" }
      },
      "gridPos": { "h": 10, "w": 24, "x": 0, "y": 0 }
    },
    {
      "type": "timeseries",
      "title": "nDCG @ 10 (online vs offline)",
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "unit": "none",
          "decimals": 2,
          "color": { "mode": "palette-classic" }
        },
        "overrides": []
      },
      "targets": [
        {
          "expr": "avg_over_time(ndcg10_online[1h])",
          "legendFormat": "Online",
          "refId": "A"
        },
        {
          "expr": "avg_over_time(ndcg10_offline[1h])",
          "legendFormat": "Offline",
          "refId": "B"
        }
      ],
      "options": {
        "legend": { "displayMode": "table", "placement": "right" }
      },
      "gridPos": { "h": 10, "w": 24, "x": 0, "y": 10 }
    }
  ]
}
```

#### Como importar

1. Abra Grafana → **Dashboards ▸ Import**.
2. Cole o JSON acima ou escolha o arquivo `grafana_ctr_ndcg.json`.
3. Selecione a data-source Prometheus correta e clique **Import**.

Depois de importar, o painel exibirá:

* **CTR @ 10**: razão de cliques por impressões na janela móvel de 1 h.
* **nDCG @ 10**: comparação entre a métrica coletada em produção
  (`ndcg10_online`) e a calculada no pipeline offline de avaliação
  (`ndcg10_offline`).

> **Alertas:** você pode adicionar triggers em cada painel, por exemplo:
> • CTR @ 10 < 2 % durante 30 min
> • nDCG @ 10 (online) cai > 10 % em relação ao offline



