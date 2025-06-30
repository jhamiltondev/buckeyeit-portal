from django.urls import path
from . import views

app_name = 'adminpanel'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('users/', views.users, name='users'),
    path('groups/', views.groups, name='groups'),
    path('tenants/', views.tenants, name='tenants'),
    path('tenant-documents/', views.tenant_documents, name='tenant_documents'),
    path('kb-articles/', views.kb_articles, name='kb_articles'),
    path('kb-categories/', views.kb_categories, name='kb_categories'),
    path('tickets/', views.tickets, name='tickets'),
    path('announcements/', views.announcements, name='announcements'),
    path('social-accounts/', views.social_accounts, name='social_accounts'),
    path('social-tokens/', views.social_tokens, name='social_tokens'),
    path('social-apps/', views.social_apps, name='social_apps'),
] 