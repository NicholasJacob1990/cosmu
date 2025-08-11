from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/search/", include("apps.search.urls")),
    path("api/logs/", include("apps.logs.urls")),
    path("", include("django_prometheus.urls")),
]