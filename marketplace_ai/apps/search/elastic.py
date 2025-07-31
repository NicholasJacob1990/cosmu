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