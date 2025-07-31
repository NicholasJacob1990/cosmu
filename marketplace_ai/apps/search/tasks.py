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
        # dados acadêmicos
        "degree_level": prof.degree_level,
        "university_rank": prof.university_rank,
        "orcid_id": prof.orcid_id,
        "lattes_id": prof.lattes_id,
        "updated_at": prof.updated_at,
    }
    client.index(
        index=settings.ELASTIC_INDEX,
        id=str(prof.id),
        body=doc,
        refresh="wait_for",
    )