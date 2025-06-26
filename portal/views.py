from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.views import LogoutView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import get_resolver
from .models import Announcement, Ticket, KnowledgeBaseCategory, KnowledgeBaseArticle

# Create your views here.

@login_required
def dashboard(request, tenant_slug=None):
    tenant = getattr(request.user, 'tenant', None)
    is_vip = getattr(tenant, 'vip', False) if tenant else False
    announcements = Announcement.objects.filter(is_active=True).order_by('-created_at')
    tickets = Ticket.objects.filter(user=request.user).order_by('-created_at')[:5]
    return render(request, 'portal/dashboard.html', {
        'is_vip': is_vip,
        'tenant': tenant,
        'announcements': announcements,
        'tickets': tickets,
    })

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('login')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            tenant_slug = user.tenant.slug if user.tenant else None
            if tenant_slug:
                return redirect('portal:tenant_dashboard', tenant_slug=tenant_slug)
            else:
                return redirect('portal:dashboard')
        else:
            messages.error(request, 'Invalid username/email or password.')
    
    return render(request, 'portal/login.html')

@login_required
def password_view(request):
    return render(request, 'portal/password.html')

def root_redirect(request):
    return redirect('login')

@method_decorator(csrf_exempt, name='dispatch')
class LogoutViewAllowGet(LogoutView):
    def get(self, request, *args, **kwargs):
        return self.post(request, *args, **kwargs)

@csrf_exempt
def logout_allow_get(request):
    logout(request)
    return HttpResponseRedirect('/login/')

def debug_urls(request):
    url_names = [str(k) for k in get_resolver().reverse_dict.keys()]
    return HttpResponse("<br>".join(url_names))

@login_required
def support_view(request):
    return render(request, 'portal/support.html')

@login_required
def submit_ticket_view(request):
    return render(request, 'portal/submit_ticket.html')

@login_required
def knowledge_base_view(request):
    categories = KnowledgeBaseCategory.objects.all()
    articles = KnowledgeBaseArticle.objects.filter(is_active=True).order_by('-view_count')[:5]
    return render(request, 'portal/knowledge_base.html', {
        'categories': categories,
        'trending_articles': articles,
    })

@login_required
def knowledge_article_view(request, article_id):
    article = KnowledgeBaseArticle.objects.get(pk=article_id)
    # Increment view count
    article.view_count += 1
    article.save(update_fields=['view_count'])
    return render(request, 'portal/knowledge_article.html', {'article': article})

@login_required
def profile_view(request):
    user = request.user
    tenant = getattr(user, 'tenant', None)
    return render(request, 'portal/profile.html', {
        'user': user,
        'tenant': tenant,
    })
