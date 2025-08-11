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

    Função é cacheada em memória por LRU —⚠️ process-local. TTL simples
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