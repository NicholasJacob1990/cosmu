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
    readonly_fields = ("embedding", "updated_at")


admin.site.register(Review)
admin.site.register(Message)
admin.site.register(Dispute)