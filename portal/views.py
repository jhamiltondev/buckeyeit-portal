from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.views import LogoutView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.urls import get_resolver
from .models import Announcement, Ticket, KnowledgeBaseCategory, KnowledgeBaseArticle, Tenant, User, TenantDocument
from django.contrib.admin.views.decorators import staff_member_required
import requests
from .adapters import get_connectwise_tickets, create_connectwise_ticket, get_connectwise_ticket_notes, post_connectwise_ticket_note, get_connectwise_ticket, split_ticket_notes
from .forms import SupportTicketForm
from datetime import datetime, timedelta

# Create your views here.

@login_required
def dashboard(request, tenant_slug=None):
    tenant = getattr(request.user, 'tenant', None)
    is_vip = getattr(tenant, 'vip', False) if tenant else False
    announcements = Announcement.objects.filter(is_active=True).order_by('-created_at')
    # Only open ConnectWise tickets
    cw_tickets = [t for t in get_connectwise_tickets(request.user) if t.get('status', {}).get('name') not in ['Closed', 'Pending Close', 'Closed - Silent']]
    cw_tickets = sorted(cw_tickets, key=lambda t: t.get('dateEntered', ''), reverse=True)[:5]
    # Fetch live tech news
    tech_news = []
    try:
        resp = requests.get(
            'https://newsapi.org/v2/top-headlines',
            params={
                'q': 'Microsoft OR cybersecurity OR security OR outage OR patch OR vulnerability OR Azure OR "Office 365"',
                'language': 'en',
                'pageSize': 5,
                'apiKey': '26ab5bf6cc45491ea78cd09939f00f92',
            },
            timeout=5
        )
        if resp.status_code == 200:
            data = resp.json()
            for article in data.get('articles', []):
                tech_news.append({
                    'title': article.get('title'),
                    'url': article.get('url'),
                    'source': article.get('source', {}).get('name'),
                    'image': article.get('urlToImage'),
                })
    except Exception as e:
        print('NewsAPI error:', e)
        tech_news = []
    print('Tech news fetched:', tech_news)
    # Fetch recent notifications (notes not by user, last 7 days)
    notifications = []
    user_email = request.user.email.lower()
    for t in cw_tickets:
        notes = get_connectwise_ticket_notes(t['id'])
        for note in notes:
            if note.get('enteredBy', '').lower() != user_email and note.get('dateCreated'):
                # Only show notes from last 7 days
                note_date = note.get('dateCreated', '')[:10]
                try:
                    note_dt = datetime.strptime(note_date, '%Y-%m-%d')
                    if note_dt >= datetime.now() - timedelta(days=7):
                        note['ticket_id'] = t['id']
                        notifications.append(note)
                except Exception:
                    continue
    notifications = sorted(notifications, key=lambda n: n.get('dateCreated', ''), reverse=True)[:10]
    return render(request, 'portal/dashboard.html', {
        'is_vip': is_vip,
        'tenant': tenant,
        'announcements': announcements,
        'cw_tickets': cw_tickets,
        'tech_news': tech_news,
        'notifications': notifications,
        'user': request.user,
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
    # Only show open ConnectWise tickets
    cw_tickets = [t for t in get_connectwise_tickets(request.user) if t.get('status', {}).get('name') not in ['Closed', 'Pending Close']]
    # Handle reply form POST
    if request.method == 'POST' and request.POST.get('reply_ticket_id'):
        ticket_id = request.POST.get('reply_ticket_id')
        reply_text = request.POST.get('reply_text')
        if ticket_id and reply_text:
            result = post_connectwise_ticket_note(ticket_id, reply_text, user_name=request.user.get_full_name() or request.user.username)
            if result:
                messages.success(request, 'Your reply has been posted to the ticket!')
            else:
                messages.error(request, 'There was an error posting your reply. Please try again.')
        return redirect('portal:support')
    # Fetch notes for each ConnectWise ticket
    cw_ticket_notes = {}
    for t in cw_tickets:
        if t.get('id'):
            cw_ticket_notes[t['id']] = get_connectwise_ticket_notes(t['id'])
    return render(request, 'portal/support.html', {'tickets': tickets, 'cw_tickets': cw_tickets, 'cw_ticket_notes': cw_ticket_notes})

@login_required
def submit_ticket_view(request):
    print("[DEBUG] submit_ticket_view called, method:", request.method)
    if request.method == 'POST':
        form = SupportTicketForm(request.POST, request.FILES)
        if form.is_valid():
            print("[DEBUG] SupportTicketForm is valid. About to call create_connectwise_ticket.")
            # Create ticket in ConnectWise
            cw_result = create_connectwise_ticket(form.cleaned_data, request.user)
            print("[DEBUG] create_connectwise_ticket returned:", cw_result)
            if cw_result:
                messages.success(request, 'Your support ticket has been submitted and routed to our team!')
            else:
                messages.error(request, 'There was an error submitting your ticket to ConnectWise. Please try again or contact support.')
            return redirect('portal:support')
        else:
            print("[DEBUG] SupportTicketForm is invalid. Errors:", form.errors)
    else:
        form = SupportTicketForm()
    return render(request, 'portal/submit_ticket.html', {'form': form})

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

@login_required
def all_tickets_view(request):
    local_open = Ticket.objects.filter(user=request.user).exclude(status__in=['resolved']).order_by('-created_at')
    cw_open = [t for t in get_connectwise_tickets(request.user) if t.get('status', {}).get('name') not in ['Closed', 'Pending Close', 'Closed - Silent']]
    cw_ticket_notes = {}
    for t in cw_open:
        if t.get('id'):
            cw_ticket_notes[t['id']] = get_connectwise_ticket_notes(t['id'])
    return render(request, 'portal/all_tickets.html', {'tickets': local_open, 'cw_tickets': cw_open, 'cw_ticket_notes': cw_ticket_notes})

@login_required
def connectwise_ticket_detail(request, ticket_id):
    ticket = get_connectwise_ticket(ticket_id)
    if not ticket:
        raise Http404("Ticket not found")
    # Security: Only allow if user is contact or domain matches
    user_email = request.user.email.lower()
    user_domain = user_email.split('@')[-1]
    ticket_email = (ticket.get('contactEmailAddress') or '').lower()
    if user_email != ticket_email and user_domain not in ticket_email:
        raise Http404("Not authorized to view this ticket")
    notes = get_connectwise_ticket_notes(ticket_id)
    notes_split = split_ticket_notes(notes)
    if request.method == 'POST' and request.POST.get('reply_text'):
        reply_text = request.POST.get('reply_text')
        print(f"[DEBUG] User {request.user.email} replying to ticket {ticket_id}: {reply_text}")
        result = post_connectwise_ticket_note(ticket_id, reply_text, user_name=request.user.get_full_name() or request.user.username)
        print(f"[DEBUG] post_connectwise_ticket_note result: {result}")
        if result:
            messages.success(request, 'Your reply has been posted to the ticket!')
        else:
            messages.error(request, 'There was an error posting your reply. Please try again.')
        return redirect('portal:connectwise_ticket_detail', ticket_id=ticket_id)
    return render(request, 'portal/connectwise_ticket_detail.html', {'ticket': ticket, 'notes': notes_split['discussion'], 'internal_notes': notes_split['internal']})
