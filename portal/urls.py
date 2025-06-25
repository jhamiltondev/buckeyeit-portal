from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
from .views import LogoutViewAllowGet

app_name = 'portal'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('login/', views.login_view, name='login'),
    path('password/', views.password_view, name='password'),
    path('logout/', LogoutViewAllowGet.as_view(next_page='/login/'), name='logout'),
    path('.auth/logout', LogoutViewAllowGet.as_view(next_page='/login/')),
] 