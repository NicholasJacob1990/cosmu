from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"
    
    def ready(self):
        """
        Importa signals quando a app está pronta
        """
        try:
            import api.signals
        except ImportError:
            # Se houver problemas de import, registrar log mas não falhar
            import logging
            logger = logging.getLogger(__name__)
            logger.warning("Não foi possível importar api.signals")