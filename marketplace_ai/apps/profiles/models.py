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
    phone_verified = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)

    # ===== QUALIFICAÇÃO ACADÊMICA =====
    degree_level = models.CharField(max_length=30, blank=True)        # "PhD", "MSc", "BSc"…
    university_rank = models.PositiveSmallIntegerField(null=True, blank=True)  # posição QS 1-1000
    academic_score = models.FloatField(default=0.0)                     # normalizado 0-1
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