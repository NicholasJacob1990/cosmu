"""
URLs para sistema de badges e gamificação
"""

from django.urls import path
from .views.badge_views import (
    user_profile_gamification, user_leaderboard, badges_catalog,
    xp_history, manual_check_badges, simulate_project_completion
)

app_name = 'badges'

urlpatterns = [
    # Perfil de gamificação do usuário
    path('profile/', user_profile_gamification, name='user_profile'),
    
    # Leaderboard e rankings
    path('leaderboard/', user_leaderboard, name='leaderboard'),
    
    # Catálogo público de badges
    path('catalog/', badges_catalog, name='catalog'),
    
    # Histórico de XP
    path('xp/history/', xp_history, name='xp_history'),
    
    # Ações do usuário
    path('check/', manual_check_badges, name='manual_check'),
    path('simulate/project/', simulate_project_completion, name='simulate_project'),
]