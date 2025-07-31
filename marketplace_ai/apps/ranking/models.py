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