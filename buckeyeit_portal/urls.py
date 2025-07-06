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
from django.urls import path, include, re_path
from django.contrib.auth import views as auth_views
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.urls import reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import logout
from django.views.generic import TemplateView
from .views import spa_index

def superuser_only(view_func):
    return user_passes_test(lambda u: u.is_superuser)(view_func)

# Custom admin view that redirects staff to /adminpanel/
def custom_admin_view(request):
    if request.user.is_authenticated and request.user.is_staff and not request.user.is_superuser:
        return HttpResponseRedirect('/adminpanel/')
    return admin.site.admin_view(admin.site.index)(request)

def root_redirect(request):
    if request.user.is_authenticated:
        user = request.user
        # If user has a tenant and a valid slug, redirect to tenant dashboard
        if hasattr(user, 'tenant') and user.tenant and getattr(user.tenant, 'slug', None):
            return redirect(f'/dashboard')
        # If user has no tenant, redirect to generic dashboard
        elif not hasattr(user, 'tenant') or not user.tenant:
            return redirect('/dashboard')
        # If tenant exists but no slug, log out and show error
        else:
            logout(request)
            return HttpResponse(b"Your account is not properly configured. Please contact support.", status=400, content_type='text/plain')
    # Prevent redirect loop if already on /login/
    if request.path == '/login/':
        return HttpResponse()
    return redirect('/login/')

urlpatterns = [
    path('accounts/', include('allauth.urls')),
    # Route adminpanel API endpoints to Django
    path('adminpanel/api/', include('adminpanel.urls')),
    # React admin panel - handles all /adminpanel/* routes
    path('adminpanel/', spa_index),
    # Django admin - only for superusers
    path('admin/', admin.site.urls),
    # API routes
    path('api/', include('portal.urls')),
    # Root redirect
    path('', root_redirect, name='root-redirect'),
    # Catch-all: serve React index.html for all other routes (including main portal)
    re_path(r'^(?!api/|admin/).*$', spa_index),
]
