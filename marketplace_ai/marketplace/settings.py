from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv("DJANGO_SECRET", "dev-secret")
DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth", 
    "django.contrib.contenttypes",
    "django.contrib.sessions", 
    "django.contrib.messages", 
    "django.contrib.staticfiles",
    "django.contrib.gis",
    "django_prometheus",
    "rest_framework",
    "waffle",
    "apps.search", 
    "apps.ranking", 
    "apps.profiles", 
    "apps.logs", 
    "apps.ltr",
    "apps.ingest",
]

MIDDLEWARE = [
    "django_prometheus.middleware.PrometheusBeforeMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "apps.logs.middleware.ImpressionLoggingMiddleware",
    "django_prometheus.middleware.PrometheusAfterMiddleware",
    "waffle.middleware.WaffleMiddleware",
]

ROOT_URLCONF = "marketplace.urls"
WSGI_APPLICATION = "marketplace.wsgi.application"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "HOST": os.getenv("PG_HOST", "db"),
        "USER": "postgres",
        "PASSWORD": os.getenv("PG_PASS", "postgres"),
        "NAME": os.getenv("PG_DB", "marketplace"),
    }
}

STATIC_URL = "static/"

# Celery Configuration
CELERY_BROKER_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
CELERY_RESULT_BACKEND = CELERY_BROKER_URL

from celery.schedules import crontab
CELERY_BEAT_SCHEDULE = {
    "train-ltr-daily": {
        "task": "django.core.management.call_command",
        "schedule": crontab(hour=3, minute=0),
        "args": ("train_ltr",),
    },
    "update-metrics-daily": {
        "task": "apps.ranking.tasks.update_metrics",
        "schedule": crontab(hour=2, minute=30),
    },
}

# OpenSearch Configuration
ELASTIC_HOST = os.getenv("ELASTIC_HOST", "http://elastic:9200")
ELASTIC_INDEX = os.getenv("ELASTIC_INDEX", "profissionais_v1")

# Pesos de ranking (fallback se não houver registros no banco)
RANKING_WEIGHTS_DEFAULT = {
    "sim_semantico": 0.40,
    "score_confianca": 0.20,
    "score_avaliacao": 0.20,
    "score_engajamento": 0.10,
    "score_proximidade": 0.10,
}

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# Internationalization
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

# Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]