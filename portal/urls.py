from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

app_name = 'portal'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('login/', views.login_view, name='login'),
    path('password/', views.password_view, name='password'),
    path('logout/', auth_views.LogoutView.as_view(next_page='/login/'), name='logout'),
    path('.auth/logout', auth_views.LogoutView.as_view(next_page='/login/')),
] 