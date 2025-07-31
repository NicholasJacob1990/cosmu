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