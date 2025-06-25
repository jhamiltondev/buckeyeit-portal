"""
URL configuration for buckeyeit_portal project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.http import HttpResponse

def root_redirect(request):
    if request.user.is_authenticated:
        user = request.user
        if hasattr(user, 'tenant') and user.tenant and hasattr(user.tenant, 'slug'):
            return redirect('tenant_dashboard', tenant_slug=user.tenant.slug)
        else:
            return redirect('portal:dashboard')
    # Prevent redirect loop if already on /login/
    if request.path == '/login/':
        return HttpResponse()
    return redirect('portal:login')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('', root_redirect, name='root-redirect'),
    path('', include('portal.urls')),
    # path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    # path('logout/', auth_views.LogoutView.as_view(next_page='/login/'), name='logout'),
]
