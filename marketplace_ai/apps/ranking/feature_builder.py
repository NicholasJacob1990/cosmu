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