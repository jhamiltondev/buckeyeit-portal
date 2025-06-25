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
] 