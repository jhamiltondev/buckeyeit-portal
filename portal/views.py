from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.views import LogoutView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import get_resolver
from .models import Announcement, Ticket, KnowledgeBaseCategory, KnowledgeBaseArticle, Tenant, User, TenantDocument
from django.contrib.admin.views.decorators import staff_member_required

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
    tickets = Ticket.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'portal/support.html', {'tickets': tickets})

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

@login_required
def company_info_view(request):
    tenant = getattr(request.user, 'tenant', None)
    if not tenant:
        return redirect('portal:dashboard')
    # Handle document upload (admin/staff only)
    is_admin = request.user.is_staff or request.user.is_superuser
    if is_admin and request.method == 'POST' and 'file' in request.FILES:
        title = request.POST.get('title', '').strip()
        file = request.FILES['file']
        if title and file:
            TenantDocument.objects.create(
                tenant=tenant,
                title=title,
                file=file,
                uploaded_by=request.user
            )
            return redirect('portal:company_info')
    # Key contacts: all users in this tenant
    contacts = User.objects.filter(tenant=tenant).order_by('first_name', 'last_name')
    # Tenant docs
    docs = TenantDocument.objects.filter(tenant=tenant).order_by('-uploaded_at')
    return render(request, 'portal/company_info.html', {
        'tenant': tenant,
        'contacts': contacts,
        'docs': docs,
        'is_admin': is_admin,
    })

@login_required
def announcements_view(request):
    # Pinned announcement (if any)
    pinned = Announcement.objects.filter(is_active=True, pinned=True).order_by('-created_at').first()
    # Feed: all other active announcements, newest first
    feed = Announcement.objects.filter(is_active=True, pinned=False).order_by('-created_at')
    return render(request, 'portal/announcements.html', {
        'pinned': pinned,
        'feed': feed,
    })
