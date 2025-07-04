from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login as django_login, logout
from django.contrib import messages
from django.contrib.auth.views import LogoutView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect, HttpResponse, Http404, JsonResponse
from django.urls import get_resolver
from .models import Announcement, Ticket, KnowledgeBaseCategory, KnowledgeBaseArticle, Tenant, User, TenantDocument, TicketStatusSeen, Role, UserGroup
from django.contrib.admin.views.decorators import staff_member_required
import requests
from .adapters import get_connectwise_tickets, create_connectwise_ticket, get_connectwise_ticket_notes, post_connectwise_ticket_note, get_connectwise_ticket, split_ticket_notes, get_connectwise_contact_id
from .forms import SupportTicketForm
from datetime import datetime, timedelta
import logging
from .tech_news import get_tech_news, test_news_api
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .serializers import AnnouncementSerializer, KnowledgeBaseArticleSerializer, RoleSerializer, UserGroupSerializer, TenantSerializer, SuspendedDeletedUserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from rest_framework import viewsets, filters
from django.db import models

# Set up logger for views
logger = logging.getLogger('portal.views')

# Create your views here.

@login_required(login_url='/adminpanel/login/')
def dashboard(request, tenant_slug=None):
    logger.info(f"Dashboard accessed by user: {request.user.email}")
    
    tenant = getattr(request.user, 'tenant', None)
    is_vip = getattr(tenant, 'vip', False) if tenant else False
    announcements = Announcement.objects.filter(is_active=True).order_by('-created_at')
    
    # Only open ConnectWise tickets
    all_cw_tickets = get_connectwise_tickets(request.user)
    cw_tickets = [t for t in all_cw_tickets if t.get('status', {}).get('name') not in ['Closed', 'Pending Close', 'Closed - Silent']]
    cw_tickets = sorted(cw_tickets, key=lambda t: t.get('dateEntered', ''), reverse=True)[:5]

    # Service Insights calculations
    now = datetime.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    tickets_this_month = [t for t in all_cw_tickets if t.get('dateEntered') and datetime.strptime(t['dateEntered'][:10], '%Y-%m-%d') >= month_start]
    tickets_submitted_this_month = len(tickets_this_month)
    tickets_resolved_this_month = len([t for t in tickets_this_month if t.get('status', {}).get('name') in ['Closed', 'Closed - Silent', 'Pending Close']])
    # Average resolution time (for tickets resolved this month)
    resolution_times = []
    for t in tickets_this_month:
        if t.get('status', {}).get('name') in ['Closed', 'Closed - Silent', 'Pending Close']:
            created = t.get('dateEntered')
            closed = t.get('closedDate')
            if created and closed:
                try:
                    created_dt = datetime.strptime(created[:19], '%Y-%m-%dT%H:%M:%S')
                    closed_dt = datetime.strptime(closed[:19], '%Y-%m-%dT%H:%M:%S')
                    resolution_times.append((closed_dt - created_dt).total_seconds())
                except Exception:
                    continue
    avg_resolution_time = (sum(resolution_times) / len(resolution_times) / 3600) if resolution_times else 0
    avg_resolution_time = round(avg_resolution_time, 1)
    # Oldest open ticket
    open_tickets = [t for t in all_cw_tickets if t.get('status', {}).get('name') not in ['Closed', 'Closed - Silent', 'Pending Close']]
    oldest_open_ticket = None
    if open_tickets:
        oldest = min(open_tickets, key=lambda t: t.get('dateEntered', ''))
        ticket_num = oldest.get('id', 'N/A')
        created = oldest.get('dateEntered')
        if created:
            created_dt = datetime.strptime(created[:19], '%Y-%m-%dT%H:%M:%S')
            age_days = (now - created_dt).days
            oldest_open_ticket = {'id': ticket_num, 'age_days': age_days}
    # Helpful Links
    helpful_links = [
        {'title': 'Setup MFA Guide', 'url': 'https://support.microsoft.com/en-us/account-billing/how-to-use-multi-factor-authentication-0b7a5a3b-5c9a-4e4a-8e3e-7b6c6b7e3c3e', 'icon': 'fa-shield-alt'},
        {'title': 'Email Setup Instructions', 'url': 'https://support.microsoft.com/en-us/office/add-an-email-account-to-outlook-6e27792a-9267-4aa4-8bb6-c84ef146101b', 'icon': 'fa-envelope'},
        {'title': 'Microsoft Service Health', 'url': 'https://status.office.com/', 'icon': 'fa-microsoft'},
        {'title': 'Google Service Health', 'url': 'https://www.google.com/appsstatus', 'icon': 'fa-google'},
        {'title': 'Knowledge Base', 'url': '/knowledge/', 'icon': 'fa-book'},
    ]
    # Fetch live tech news using the new service
    logger.info("Fetching tech news for dashboard")
    tech_news = get_tech_news()
    logger.info(f"Tech news fetched: {len(tech_news)} articles")
    
    # Log tech news details for debugging
    for i, article in enumerate(tech_news):
        logger.debug(f"Tech news article {i+1}: {article.get('title', 'No title')[:50]}... from {article.get('source', 'Unknown')}")
    
    # --- Notification logic ---
    notifications = []
    user_email = request.user.email.lower()
    read_ids = request.session.get('read_notifications', [])
    for t in cw_tickets:
        notes = get_connectwise_ticket_notes(t['id'])
        for note in notes:
            # DEBUG: Print all note fields for inspection
            logger.info(f"[DEBUG][Notifications] Ticket {t['id']} Note: {note}")
            # Only show notes from last 7 days
            note_date = note.get('dateCreated', '')[:10]
            try:
                note_dt = datetime.strptime(note_date, '%Y-%m-%d')
                if note_dt < datetime.now() - timedelta(days=7):
                    continue
            except Exception:
                continue
            # Only notify if:
            # 1. Tech replied (not user)
            # 2. Status changed
            # 3. Owner/tech assigned/changed
            is_tech_reply = note.get('enteredBy', '').lower() != user_email and not note.get('text', '').lower().startswith('from:')
            is_status_change = note.get('detailDescriptionFlag') and (
                'status' in note.get('text', '').lower() or note.get('detailDescriptionFlag')
            )
            is_owner_change = note.get('detailDescriptionFlag')
            is_remote_support = 'user has requested remote support' in note.get('text', '').lower()
            if (is_tech_reply or is_status_change or is_owner_change) and not is_remote_support:
                note_id = f"{t['id']}_{note.get('id', note.get('dateCreated'))}"
                if note_id not in read_ids:
                    note['ticket_id'] = t['id']
                    note['notification_id'] = note_id
                    notifications.append(note)
    notifications = sorted(notifications, key=lambda n: n.get('dateCreated', ''), reverse=True)[:10]
    
    # Mark as read if requested
    if request.GET.get('mark_notifications_read') == '1':
        read_ids = list(set(read_ids + [n['notification_id'] for n in notifications]))
        request.session['read_notifications'] = read_ids
        request.session.modified = True
        return redirect('portal:dashboard')
    
    context = {
        'is_vip': is_vip,
        'tenant': tenant,
        'announcements': announcements,
        'cw_tickets': cw_tickets,
        'tech_news': tech_news,
        'notifications': notifications,
        'user': request.user,
        'tickets_submitted_this_month': tickets_submitted_this_month,
        'tickets_resolved_this_month': tickets_resolved_this_month,
        'avg_resolution_time': avg_resolution_time,
        'oldest_open_ticket': oldest_open_ticket,
        'helpful_links': helpful_links,
    }
    logger.info(f"Dashboard context prepared - Tech news: {len(tech_news)}, Tickets: {len(cw_tickets)}, Notifications: {len(notifications)}")
    return render(request, 'portal/dashboard.html', context)

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('login')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            django_login(request, user)
            tenant_slug = user.tenant.slug if user.tenant else None
            if tenant_slug:
                return redirect('portal:tenant_dashboard', tenant_slug=tenant_slug)
            else:
                return redirect('portal:dashboard')
        else:
            messages.error(request, 'Invalid username/email or password.')
    
    return render(request, 'portal/login.html')

@login_required(login_url='/adminpanel/login/')
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

@login_required(login_url='/adminpanel/login/')
def support_view(request):
    # Only show open ConnectWise tickets (not Closed, Pending Close, or Closed - Silent)
    cw_tickets = [t for t in get_connectwise_tickets(request.user) if t.get('status', {}).get('name') not in ['Closed', 'Pending Close', 'Closed - Silent']]
    cw_tickets = sorted(cw_tickets, key=lambda t: t.get('dateEntered', ''), reverse=True)
    for ticket in cw_tickets:
        status_name = ticket.get('status', {}).get('name', '')
        if status_name == 'Needs Worked':
            ticket['status_color'] = 'warning'
        elif status_name == 'Working Issue Now':
            ticket['status_color'] = 'info'
        elif status_name == 'Pending Close':
            ticket['status_color'] = 'primary'
        elif status_name == 'Closed':
            ticket['status_color'] = 'success'
        else:
            ticket['status_color'] = 'secondary'
    # Fetch closed tickets using contact ID and correct conditions
    from portal.adapters import get_connectwise_contact_id, get_connectwise_tickets as get_cw_tickets_api
    contact_id = get_connectwise_contact_id(request.user.email)
    closed_cw_tickets = []
    if contact_id:
        closed_conditions = f'(status/name="Closed" OR status/name="Closed - Silent" OR status/name="Pending Close") AND contact/id={contact_id}'
        closed_cw_tickets = get_cw_tickets_api(request.user, extra_conditions=closed_conditions)
        closed_cw_tickets = sorted(closed_cw_tickets, key=lambda t: t.get('dateEntered', ''), reverse=True)
    return render(request, 'portal/support.html', {
        'cw_tickets': cw_tickets,
        'closed_cw_tickets': closed_cw_tickets
    })

@login_required(login_url='/adminpanel/login/')
def submit_ticket_view(request):
    print("[DEBUG] submit_ticket_view TOP - method:", request.method)
    if request.method == 'POST':
        form = SupportTicketForm(request.POST, request.FILES)
        if form.is_valid():
            print("[DEBUG] SupportTicketForm is valid. About to call create_connectwise_ticket.")
            # Create ticket in ConnectWise
            cw_result = create_connectwise_ticket(form.cleaned_data, request.user)
            print("[DEBUG] create_connectwise_ticket returned:", cw_result)
            if cw_result:
                messages.success(request, 'Thank you for your submission! We have received your request and will be assigning a technician shortly. If it is during normal business hours (M-F 8:00a-5:00p, excluding Federal holidays), a technician will begin working on your ticket as soon as possible and will reach out via phone or email if more information is needed. If this request was received outside of normal hours, our team will triage your request once we return to the office.')
                # Use ConnectWise ticket ID for thank you page
                cw_ticket_id = cw_result.get('id')
                return redirect('portal:ticket_thank_you', ticket_id=cw_ticket_id)
            else:
                return render(request, 'portal/ticket_submit_error.html')
        else:
            print("[ERROR] SupportTicketForm is invalid. Errors:", form.errors)
    else:
        form = SupportTicketForm()
    return render(request, 'portal/submit_ticket.html', {'form': form})

@login_required(login_url='/adminpanel/login/')
def knowledge_base_view(request):
    categories = KnowledgeBaseCategory.objects.all()
    # Trending articles are global (most viewed by all users)
    articles = KnowledgeBaseArticle.objects.filter(is_active=True).order_by('-view_count')[:5]
    return render(request, 'portal/knowledge_base.html', {
        'categories': categories,
        'trending_articles': articles,
    })

@login_required(login_url='/adminpanel/login/')
def knowledge_article_view(request, article_id):
    article = KnowledgeBaseArticle.objects.get(pk=article_id)
    # Increment view count
    article.view_count += 1
    article.save(update_fields=['view_count'])
    return render(request, 'portal/knowledge_article.html', {'article': article})

@login_required(login_url='/adminpanel/login/')
def profile_view(request):
    user = request.user
    tenant = getattr(user, 'tenant', None)
    password_errors = []
    profile_success = False
    password_success = False
    if request.method == 'POST':
        # Profile update
        if 'full_name' in request.POST:
            full_name = request.POST.get('full_name', '').strip()
            phone = request.POST.get('phone', '').strip()
            if full_name:
                names = full_name.split(' ', 1)
                user.first_name = names[0]
                user.last_name = names[1] if len(names) > 1 else ''
            user.phone = phone
            user.save()
            profile_success = True
        # Password change
        if 'current_password' in request.POST and 'new_password' in request.POST and 'confirm_password' in request.POST:
            current_password = request.POST.get('current_password')
            new_password = request.POST.get('new_password')
            confirm_password = request.POST.get('confirm_password')
            if not user.check_password(current_password):
                password_errors.append('Current password is incorrect.')
            elif new_password != confirm_password:
                password_errors.append('New password and confirmation do not match.')
            else:
                try:
                    validate_password(new_password, user=user)
                except ValidationError as e:
                    password_errors.extend(e.messages)
                else:
                    user.set_password(new_password)
                    user.save()
                    password_success = True
    return render(request, 'portal/profile.html', {
        'user': user,
        'tenant': tenant,
        'password_errors': password_errors,
        'profile_success': profile_success,
        'password_success': password_success,
    })

@login_required(login_url='/adminpanel/login/')
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

@login_required(login_url='/adminpanel/login/')
def announcements_view(request):
    # Pinned announcement (if any)
    pinned = Announcement.objects.filter(is_active=True, pinned=True).order_by('-created_at').first()
    # Feed: all other active announcements, newest first
    feed = Announcement.objects.filter(is_active=True, pinned=False).order_by('-created_at')
    return render(request, 'portal/announcements.html', {
        'pinned': pinned,
        'feed': feed,
    })

@login_required(login_url='/adminpanel/login/')
def debug_tech_news(request):
    """Debug view to test tech news functionality"""
    logger.info("Debug tech news view accessed")
    
    # Test NewsAPI connection
    diagnostic = test_news_api()
    
    # Fetch tech news
    tech_news = get_tech_news()
    
    # Prepare debug information
    debug_info = {
        'diagnostic': diagnostic,
        'tech_news_count': len(tech_news),
        'tech_news_articles': tech_news,
        'user_email': request.user.email,
        'timestamp': datetime.now().isoformat(),
    }
    
    logger.info(f"Debug tech news info: {debug_info}")
    
    return render(request, 'portal/debug_tech_news.html', {
        'debug_info': debug_info,
    })

@login_required(login_url='/adminpanel/login/')
def all_tickets_view(request):
    local_open = Ticket.objects.filter(user=request.user).exclude(status__in=['resolved']).order_by('-created_at')
    cw_open = [t for t in get_connectwise_tickets(request.user) if t.get('status', {}).get('name') not in ['Closed', 'Pending Close', 'Closed - Silent']]
    cw_ticket_notes = {}
    for t in cw_open:
        if t.get('id'):
            cw_ticket_notes[t['id']] = get_connectwise_ticket_notes(t['id'])
    return render(request, 'portal/all_tickets.html', {'tickets': local_open, 'cw_tickets': cw_open, 'cw_ticket_notes': cw_ticket_notes})

@login_required(login_url='/adminpanel/login/')
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
    # Enhance notes with display_name
    for note in notes:
        text = note.get('text', '')
        entered_by = note.get('enteredBy') or note.get('createdBy') or note.get('member', {}).get('name')
        if text.startswith('From: '):
            # Format: From: Name (email)\nMessage
            first_line = text.split('\n', 1)[0]
            display_name = first_line.replace('From: ', '').strip()
            # If entered_by is api_admin, show the extracted name
            if entered_by == 'api_admin':
                note['display_name'] = display_name
            else:
                note['display_name'] = entered_by or display_name
        elif entered_by == 'api_admin' and text:
            # If entered_by is api_admin but no From: line, fallback to 'Buckeye IT'
            note['display_name'] = 'Buckeye IT'
        elif entered_by:
            note['display_name'] = entered_by
        else:
            note['display_name'] = 'Buckeye IT'
    # After enhancing notes with display_name
    notes = sorted(notes, key=lambda n: n.get('dateCreated', ''))
    notes_split = split_ticket_notes(notes)
    # Determine if user is a tech/admin (for internal notes access)
    is_tech = request.user.is_staff or request.user.is_superuser
    # Generate logical description from user's original request
    user_description = None
    for note in notes:
        entered_by = note.get('enteredBy', '').lower()
        if entered_by and entered_by != 'api_admin':
            # Use the first non-api_admin note as the user's request
            user_description = note.get('text', '').strip()
            break
    if not user_description:
        # Fallback to initialDescription or a default
        user_description = ticket.get('initialDescription', '').strip() or 'No description available.'
    if request.method == 'POST':
        if request.POST.get('reply_text'):
            reply_text = request.POST.get('reply_text')
            user_display = f"From: {request.user.get_full_name() or request.user.username} ({request.user.email})\n"
            note_text = user_display + reply_text
            print(f"[DEBUG] User {request.user.email} replying to ticket {ticket_id}: {reply_text}")
            result = post_connectwise_ticket_note(ticket_id, note_text, user_name=request.user.get_full_name() or request.user.username)
            print(f"[DEBUG] post_connectwise_ticket_note result: {result}")
            if result:
                messages.success(request, 'Your reply has been posted to the ticket!')
            else:
                messages.error(request, 'There was an error posting your reply. Please try again.')
            return redirect('portal:connectwise_ticket_detail', ticket_id=ticket_id)
        elif request.POST.get('request_remote_support'):
            # Post a note to ConnectWise
            remote_note = f"From: {request.user.get_full_name() or request.user.username} ({request.user.email})\nUser has requested remote support. (ScreenConnect: https://buckeyeit.screenconnect.com/Host#Access)"
            result = post_connectwise_ticket_note(ticket_id, remote_note, user_name=request.user.get_full_name() or request.user.username)
            if result:
                messages.success(request, 'Your remote support request has been sent! (Coming Soon: This will launch a remote session automatically.)')
            else:
                messages.error(request, 'There was an error sending your remote support request. Please try again.')
            return redirect('portal:connectwise_ticket_detail', ticket_id=ticket_id)
    return render(request, 'portal/connectwise_ticket_detail.html', {
        'ticket': ticket, 
        'notes': notes_split['discussion'],
        'internal_notes': notes_split['internal'],
        'is_tech': is_tech,
        'user_description': user_description,
    })

@login_required(login_url='/adminpanel/login/')
def ticket_thank_you_view(request, ticket_id):
    return render(request, 'portal/ticket_submit_thank_you.html', {'ticket_id': ticket_id})

@login_required(login_url='/adminpanel/login/')
def notifications_api(request):
    """API endpoint for notifications - used by live update JavaScript"""
    user_email = request.user.email.lower()
    read_ids = request.session.get('read_notifications', [])

    # Mark all as read if requested (only clears badge, not the list)
    if request.GET.get('mark_notifications_read') == '1':
        # Only update the session to clear the badge count
        cw_tickets = [t for t in get_connectwise_tickets(request.user) if t.get('status', {}).get('name') not in ['Closed', 'Pending Close', 'Closed - Silent']]
        all_note_ids = []
        for t in cw_tickets:
            notes = get_connectwise_ticket_notes(t['id'])
            for note in notes:
                note_id = f"{t['id']}_{note.get('id', note.get('dateCreated'))}"
                all_note_ids.append(note_id)
        request.session['read_notifications'] = all_note_ids
        request.session.modified = True
        # Return notifications, but with count 0
        notifications = _get_notifications(request, all_note_ids)
        return JsonResponse({'count': 0, 'notifications': notifications})

    # Get notifications as usual
    notifications = _get_notifications(request, read_ids)
    return JsonResponse({'count': len([n for n in notifications if n['notification_id'] not in read_ids]), 'notifications': notifications})

# Helper to build notifications list
def _get_notifications(request, read_ids):
    user_email = request.user.email.lower()
    cw_tickets = [t for t in get_connectwise_tickets(request.user) if t.get('status', {}).get('name') not in ['Closed', 'Pending Close', 'Closed - Silent']]
    notifications = []
    for t in cw_tickets:
        ticket_id = t['id']
        current_status_id = t.get('status', {}).get('id')
        current_status_name = t.get('status', {}).get('name')
        # Get or create TicketStatusSeen
        seen, created = TicketStatusSeen.objects.get_or_create(user=request.user, ticket_id=ticket_id, defaults={
            'last_status_id': current_status_id,
            'last_status_name': current_status_name,
            'last_checked': timezone.now(),
        })
        if not created and seen.last_status_id != current_status_id:
            notifications.append({
                'ticket_id': ticket_id,
                'notification_id': f'status_{ticket_id}_{current_status_id}',
                'display_name': 'System',
                'text': f"Ticket status changed to {current_status_name}",
                'dateCreated': timezone.now().isoformat(),
            })
            seen.last_status_id = current_status_id
            seen.last_status_name = current_status_name
            seen.last_checked = timezone.now()
            seen.save()
        # Assignment change notification
        current_owner_id = t.get('owner', {}).get('id')
        if hasattr(seen, 'last_owner_id'):
            if seen.last_owner_id != current_owner_id:
                notifications.append({
                    'ticket_id': ticket_id,
                    'notification_id': f'owner_{ticket_id}_{current_owner_id}',
                    'display_name': 'System',
                    'text': f"Ticket assigned to {t.get('owner', {}).get('name', 'Unassigned')}",
                    'dateCreated': timezone.now().isoformat(),
                })
                seen.last_owner_id = current_owner_id
                seen.save()
        else:
            seen.last_owner_id = current_owner_id
            seen.save()
        notes = get_connectwise_ticket_notes(ticket_id)
        for note in notes:
            note_id = f"{ticket_id}_{note.get('id', note.get('dateCreated'))}"
            # Only show notes from last 7 days
            note_date = note.get('dateCreated', '')[:10]
            try:
                note_dt = datetime.strptime(note_date, '%Y-%m-%d')
                if note_dt < datetime.now() - timedelta(days=7):
                    continue
            except Exception:
                continue
            is_tech_reply = note.get('enteredBy', '').lower() != user_email and not note.get('text', '').lower().startswith('from:')
            is_status_change = note.get('detailDescriptionFlag') and (
                'status' in note.get('text', '').lower() or note.get('detailDescriptionFlag')
            )
            is_owner_change = note.get('detailDescriptionFlag')
            is_remote_support = 'user has requested remote support' in note.get('text', '').lower()
            is_user_reply = note.get('enteredBy', '').lower() == user_email or note.get('text', '').lower().startswith('from:')
            text = note.get('text', '')
            if text.startswith('From: '):
                first_line = text.split('\n', 1)[0]
                display_name = first_line.replace('From: ', '').strip()
            elif note.get('enteredBy'):
                display_name = note.get('enteredBy')
            elif note.get('createdBy'):
                display_name = note.get('createdBy')
            elif note.get('member', {}).get('name'):
                display_name = note['member']['name']
            else:
                display_name = 'Buckeye IT'
            if (is_tech_reply or is_status_change or is_owner_change) and not is_remote_support and not is_user_reply:
                if note_id not in read_ids:
                    note['ticket_id'] = ticket_id
                    note['notification_id'] = note_id
                    note['display_name'] = display_name
                    note['notification_message'] = f"{display_name} has replied to ticket"
                    notifications.append(note)
    notifications = sorted(notifications, key=lambda n: n.get('dateCreated', ''), reverse=True)[:10]
    return notifications

@csrf_exempt
@login_required(login_url='/adminpanel/login/')
def notifications_clear_api(request):
    """API endpoint to clear a single notification by notification_id (POST)"""
    if request.method == 'POST':
        notification_id = request.POST.get('notification_id')
        if not notification_id:
            return JsonResponse({'success': False, 'error': 'No notification_id provided'}, status=400)
        read_ids = request.session.get('read_notifications', [])
        if notification_id not in read_ids:
            read_ids.append(notification_id)
            request.session['read_notifications'] = read_ids
            request.session.modified = True
        return JsonResponse({'success': True})
    return JsonResponse({'success': False, 'error': 'POST required'}, status=405)

@login_required(login_url='/adminpanel/login/')
def dashboard_tickets_api(request):
    """API endpoint for dashboard recent tickets - used by live update JavaScript"""
    # Only open ConnectWise tickets
    cw_tickets = [t for t in get_connectwise_tickets(request.user) if t.get('status', {}).get('name') not in ['Closed', 'Pending Close', 'Closed - Silent']]
    cw_tickets = sorted(cw_tickets, key=lambda t: t.get('dateEntered', ''), reverse=True)[:5]
    
    return JsonResponse({
        'tickets': cw_tickets
    })

@login_required(login_url='/adminpanel/login/')
def dashboard_tech_news_api(request):
    """API endpoint for dashboard tech news - used by live update JavaScript"""
    tech_news = get_tech_news()
    
    return JsonResponse({
        'articles': tech_news
    })

@login_required(login_url='/adminpanel/login/')
def dashboard_announcements_api(request):
    """API endpoint for dashboard announcements - used by live update JavaScript"""
    announcements = Announcement.objects.filter(is_active=True).order_by('-created_at')
    
    announcements_data = []
    for announcement in announcements:
        announcements_data.append({
            'title': announcement.title,
            'message': announcement.message,
            'created_at': announcement.created_at.strftime('%Y-%m-%d %H:%M')
        })
    
    return JsonResponse({
        'announcements': announcements_data
    })

@login_required(login_url='/adminpanel/login/')
def support_tickets_api(request):
    """API endpoint for support page tickets - used by live update JavaScript"""
    # Only show open ConnectWise tickets
    cw_tickets = [t for t in get_connectwise_tickets(request.user) if t.get('status', {}).get('name') not in ['Closed', 'Pending Close']]
    
    # Add status color for badges
    for ticket in cw_tickets:
        status_name = ticket.get('status', {}).get('name', '')
        if status_name == 'Needs Worked':
            ticket['status_color'] = 'warning'
        elif status_name == 'Working Issue Now':
            ticket['status_color'] = 'info'
        elif status_name == 'Pending Close':
            ticket['status_color'] = 'primary'
        elif status_name == 'Closed':
            ticket['status_color'] = 'success'
        else:
            ticket['status_color'] = 'secondary'
    
    return JsonResponse({
        'tickets': cw_tickets
    })

@api_view(['GET'])
def api_announcements_list(request):
    """API endpoint to list all active announcements."""
    announcements = Announcement.objects.filter(is_active=True).order_by('-created_at')
    serializer = AnnouncementSerializer(announcements, many=True)
    return Response(serializer.data)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        django_login(request, user)
        return JsonResponse({'success': True, 'username': user.username, 'email': user.email})
    else:
        return JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=400)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_logout(request):
    logout(request)
    response = JsonResponse({'success': True})
    # Delete all session-related cookies
    response.delete_cookie('sessionid')
    response.delete_cookie('csrftoken')
    # Delete custom session cookie if set
    if hasattr(settings, 'SESSION_COOKIE_NAME'):
        response.delete_cookie(settings.SESSION_COOKIE_NAME)
    # Clear any other potential session cookies
    response.delete_cookie('sessionid', domain='.buckeyeit.com')
    response.delete_cookie('csrftoken', domain='.buckeyeit.com')
    # Set cookies to expire in the past to ensure they're deleted
    response.set_cookie('sessionid', '', max_age=0, expires='Thu, 01 Jan 1970 00:00:00 GMT')
    response.set_cookie('csrftoken', '', max_age=0, expires='Thu, 01 Jan 1970 00:00:00 GMT')
    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_user(request):
    user = request.user
    tenant = user.tenant if hasattr(user, 'tenant') and user.tenant else None
    return JsonResponse({
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_authenticated': user.is_authenticated,
        'support_role': getattr(user, 'support_role', ''),
        'phone': '',  # Placeholder, add if you add a phone field to User
        'email_notifications': None,  # Placeholder for future preference
        'theme': None,  # Placeholder for future preference
        'show_tech_news': None,  # Placeholder for future preference
        'tenant': {
            'name': tenant.name if tenant else '',
            'vip': tenant.vip if tenant else False,
            'address': tenant.address if tenant else '',
            'phone': tenant.phone if tenant else '',
            'website': tenant.website if tenant else '',
            'logo': tenant.logo.url if tenant and tenant.logo else '',
        } if tenant else None,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_knowledge_base_articles(request):
    articles = KnowledgeBaseArticle.objects.filter(is_active=True).order_by('-updated_at')
    serializer = KnowledgeBaseArticleSerializer(articles, many=True)
    return Response(serializer.data)

def status_proxy(request):
    ms_status = 'Unknown'
    google_status = 'Unknown'
    try:
        ms_resp = requests.get('https://status.office.com/api/status', timeout=5)
        if ms_resp.ok:
            ms_data = ms_resp.json()
            ms_status = ms_data.get('Status', {}).get('ServiceStatus', 'Operational')
        else:
            ms_status = 'Unavailable'
    except Exception as e:
        logger.error(f"Microsoft status fetch error: {e}")
        ms_status = 'Error'
    try:
        g_resp = requests.get('https://www.google.com/appsstatus/dashboard/incidents.json', timeout=5)
        if g_resp.ok:
            g_data = g_resp.json()
            google_status = 'Operational' if g_data.get('incidents', []) == [] else 'Issues'
        else:
            google_status = 'Unavailable'
    except Exception as e:
        logger.error(f"Google status fetch error: {e}")
        google_status = 'Error'
    return JsonResponse({'microsoft': ms_status, 'google': google_status})

@login_required(login_url='/adminpanel/login/')
def dashboard_ticket_summary_api(request):
    """API endpoint for dashboard ticket summary stats for the current user."""
    all_cw_tickets = get_connectwise_tickets(request.user)
    # Open tickets
    open_tickets = [t for t in all_cw_tickets if t.get('status', {}).get('name') not in ['Closed', 'Closed - Silent', 'Pending Close']]
    open_tickets_count = len(open_tickets)
    # Tickets resolved this month
    now = datetime.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    tickets_this_month = [t for t in all_cw_tickets if t.get('dateEntered') and datetime.strptime(t['dateEntered'][:10], '%Y-%m-%d') >= month_start]
    tickets_resolved_this_month = len([t for t in tickets_this_month if t.get('status', {}).get('name') in ['Closed', 'Closed - Silent', 'Pending Close']])
    # Average response time (for tickets resolved this month)
    resolution_times = []
    for t in tickets_this_month:
        if t.get('status', {}).get('name') in ['Closed', 'Closed - Silent', 'Pending Close']:
            created = t.get('dateEntered')
            closed = t.get('closedDate')
            if created and closed:
                try:
                    created_dt = datetime.strptime(created[:19], '%Y-%m-%dT%H:%M:%S')
                    closed_dt = datetime.strptime(closed[:19], '%Y-%m-%dT%H:%M:%S')
                    resolution_times.append((closed_dt - created_dt).total_seconds())
                except Exception:
                    continue
    avg_response_time = (sum(resolution_times) / len(resolution_times) / 3600) if resolution_times else 0
    avg_response_time = round(avg_response_time, 1)
    return JsonResponse({
        'open_tickets': open_tickets_count,
        'resolved_this_month': tickets_resolved_this_month,
        'avg_response_time': avg_response_time
    })

@login_required(login_url='/adminpanel/login/')
def security_center_api(request):
    """API endpoint for dashboard Security Center card (mock data for now)."""
    return JsonResponse({
        'mfa_status': 'Enabled',
        'last_blocked_login': '2 days ago',
        'risky_signins': 'None',
    })

@api_view(['PATCH', 'POST'])
@permission_classes([IsAuthenticated])
def api_user_update(request):
    user = request.user
    data = request.data if hasattr(request, 'data') else request.POST
    updated = False
    if 'phone' in data:
        user.phone = data['phone']
        updated = True
    if 'support_role' in data:
        user.support_role = data['support_role']
        updated = True
    # Preferences (store in session or user profile as needed)
    if 'email_notifications' in data:
        request.session['email_notifications'] = data['email_notifications']
        updated = True
    if 'theme' in data:
        request.session['theme'] = data['theme']
        updated = True
    if 'show_tech_news' in data:
        request.session['show_tech_news'] = data['show_tech_news']
        updated = True
    if updated:
        user.save()
        request.session.modified = True
    # Return updated user data (same as api_user)
    tenant = user.tenant if hasattr(user, 'tenant') and user.tenant else None
    return JsonResponse({
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_authenticated': user.is_authenticated,
        'support_role': getattr(user, 'support_role', ''),
        'phone': getattr(user, 'phone', ''),
        'email_notifications': request.session.get('email_notifications', None),
        'theme': request.session.get('theme', None),
        'show_tech_news': request.session.get('show_tech_news', None),
        'tenant': {
            'name': tenant.name if tenant else '',
            'vip': tenant.vip if tenant else False,
            'address': tenant.address if tenant else '',
            'phone': tenant.phone if tenant else '',
            'website': tenant.website if tenant else '',
            'logo': tenant.logo.url if tenant and tenant.logo else '',
        } if tenant else None,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_company_info(request):
    tenant = getattr(request.user, 'tenant', None)
    if not tenant:
        return JsonResponse({'error': 'No tenant found'}, status=404)
    contacts = User.objects.filter(tenant=tenant).order_by('first_name', 'last_name')
    docs = TenantDocument.objects.filter(tenant=tenant).order_by('-uploaded_at')
    # Mock data for support info and services
    support_info = {
        'assigned_tech': 'John Hamilton',
        'sla': 'VIP Tier – 2hr Response',
        'support_line': '(800) 555-1234',
        'email_support': 'support@buckeyeit.com',
        'timezone': 'EST (UTC -5)',
    }
    services = [
        {'category': 'Microsoft 365', 'services': ['Email', 'Teams', 'SharePoint', 'Licensing']},
        {'category': 'Network & Firewall', 'services': ['FortiGate Management', 'VPN Setup']},
        {'category': 'Device Management', 'services': ['NinjaRMM', 'Windows Patch Management']},
        {'category': 'Support Tools', 'services': ['ConnectWise', 'ScreenConnect']},
    ]
    return JsonResponse({
        'company_profile': {
            'name': tenant.name,
            'domain': tenant.domain,
            'tenant_id': tenant.slug.upper() if tenant.slug else '',
            'plan_type': 'VIP' if tenant.vip else 'Standard',
            'security_tier': 'Standard',  # Placeholder, add to model if needed
            'onboarded': tenant.created_at.strftime('%b %d, %Y') if tenant.created_at else '',
            'logo': tenant.logo.url if tenant.logo else '',
        },
        'contacts': [
            {
                'name': f'{u.first_name} {u.last_name}',
                'role': u.support_role or 'User',
                'email': u.email,
                'phone': u.phone if hasattr(u, 'phone') else ''
            } for u in contacts
        ],
        'support_info': support_info,
        'services': services,
        'documents': [
            {
                'title': d.title,
                'url': d.file.url,
                'uploaded_at': d.uploaded_at.strftime('%b %d, %Y')
            } for d in docs
        ],
    })

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_frontend_log(request):
    import logging
    logger = logging.getLogger('frontend.react')
    data = request.data
    logger.info(f"[ReactLog] {data}")
    return Response({'status': 'ok'})

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

class UserGroupViewSet(viewsets.ModelViewSet):
    queryset = UserGroup.objects.all().prefetch_related('roles', 'users', 'tenant')
    serializer_class = UserGroupSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['updated_at', 'name']

    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role')
        tenant = self.request.query_params.get('tenant')
        if role:
            queryset = queryset.filter(roles__name=role)
        if tenant:
            queryset = queryset.filter(tenant__id=tenant)
        return queryset

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_suspended_users(request):
    users = User.objects.filter(is_active=False, is_deleted=False)
    # Filtering
    name = request.GET.get('name')
    email = request.GET.get('email')
    tenant = request.GET.get('tenant')
    role = request.GET.get('role')
    admin = request.GET.get('admin')
    if name:
        users = users.filter(models.Q(first_name__icontains=name) | models.Q(last_name__icontains=name))
    if email:
        users = users.filter(email__icontains=email)
    if tenant:
        users = users.filter(tenant__id=tenant)
    if role:
        users = users.filter(support_role__icontains=role)
    if admin:
        users = users.filter(suspended_by__id=admin)
    # Date range filter (suspended_at)
    start = request.GET.get('start')
    end = request.GET.get('end')
    if start:
        users = users.filter(suspended_at__gte=start)
    if end:
        users = users.filter(suspended_at__lte=end)
    data = SuspendedDeletedUserSerializer(users, many=True).data
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_deleted_users(request):
    users = User.objects.filter(is_deleted=True)
    # Filtering (same as above, but for deleted fields)
    name = request.GET.get('name')
    email = request.GET.get('email')
    tenant = request.GET.get('tenant')
    role = request.GET.get('role')
    admin = request.GET.get('admin')
    if name:
        users = users.filter(models.Q(first_name__icontains=name) | models.Q(last_name__icontains=name))
    if email:
        users = users.filter(email__icontains=email)
    if tenant:
        users = users.filter(tenant__id=tenant)
    if role:
        users = users.filter(support_role__icontains=role)
    if admin:
        users = users.filter(deleted_by__id=admin)
    # Date range filter (deleted_at)
    start = request.GET.get('start')
    end = request.GET.get('end')
    if start:
        users = users.filter(deleted_at__gte=start)
    if end:
        users = users.filter(deleted_at__lte=end)
    data = SuspendedDeletedUserSerializer(users, many=True).data
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_restore_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.is_active = True
        user.suspended_at = None
        user.suspended_by = None
        user.suspension_reason = ''
        user.is_deleted = False
        user.deleted_at = None
        user.deleted_by = None
        user.deletion_reason = ''
        user.save()
        return Response({'status': 'restored'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_permanent_delete_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return Response({'status': 'deleted'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_system_usage(request):
    # TODO: Replace with real system usage data
    return Response({
        'usage_percent': 71,
        'details': '71% of resources used'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_security_center(request):
    # TODO: Replace with real security data
    return Response({
        'mfa_status': 'Enabled',
        'last_blocked_login': '2 days ago',
        'risky_signins': 'None'
    })
