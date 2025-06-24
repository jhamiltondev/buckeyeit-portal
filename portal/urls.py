from django.urls import path
from . import views

app_name = 'portal'

urlpatterns = [
    path('', views.root_redirect, name='root-redirect'),
    path('login/', views.login_view, name='login'),
    path('password/', views.password_view, name='password'),
] 