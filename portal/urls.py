from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
from .views import LogoutViewAllowGet, logout_allow_get

app_name = 'portal'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('login/', views.login_view, name='login'),
    path('password/', views.password_view, name='password'),
    path('logout/', logout_allow_get, name='logout'),
    path('.auth/logout', logout_allow_get),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('<slug:tenant_slug>/dashboard/', views.dashboard, name='tenant_dashboard'),
    path('debug-urls/', views.debug_urls),
    path('support/', views.support_view, name='support'),
    path('support/submit/', views.submit_ticket_view, name='submit_ticket'),
    path('knowledge/', views.knowledge_base_view, name='knowledge_base'),
    path('knowledge/article/<int:article_id>/', views.knowledge_article_view, name='knowledge_article'),
    path('profile/', views.profile_view, name='profile'),
] 