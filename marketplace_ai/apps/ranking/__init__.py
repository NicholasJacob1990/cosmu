"""
Camada de ranking:

1.  feature_builder.py  → transforma _hit do OpenSearch em dicionário de features normalizadas.
2.  scorer.py           → combina features heurísticos (pesos configuráveis em admin).
3.  tasks.py            → jobs Celery de métricas dinâmicas (rating, engajamento, confiança).
4.  models.py           → tabela RankingWeight (permite ajuste no Django-admin).

Obs.: a lógica de LTR (XGBoost) reside em apps/ltr/.
"""