from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.views import LogoutView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect, HttpResponse, Http404, JsonResponse
from django.urls import get_resolver
from .models import Announcement, Ticket, KnowledgeBaseCategory, KnowledgeBaseArticle, Tenant, User, TenantDocument
from django.contrib.admin.views.decorators import staff_member_required
import requests
from .adapters import get_connectwise_tickets, create_connectwise_ticket, get_connectwise_ticket_notes, post_connectwise_ticket_note, get_connectwise_ticket, split_ticket_notes, get_connectwise_contact_id
from .forms import SupportTicketForm
from datetime import datetime, timedelta
import logging
from .tech_news import get_tech_news, test_news_api
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

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
            is_status_change = note.get('detailDescriptionFlag') and 'status' in note.get('text', '').lower()
            is_owner_change = note.get('detailDescriptionFlag') and 'assigned' in note.get('text', '').lower()
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
            login(request, user)
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
        'is_tech': is_tech
    })

@login_required(login_url='/adminpanel/login/')
def notifications_api(request):
    """API endpoint for notifications - used by live update JavaScript"""
    user_email = request.user.email.lower()
    read_ids = request.session.get('read_notifications', [])

    # Mark all as read if requested
    if request.GET.get('mark_notifications_read') == '1':
        # Get all current notification IDs
        cw_tickets = [t for t in get_connectwise_tickets(request.user) if t.get('status', {}).get('name') not in ['Closed', 'Pending Close', 'Closed - Silent']]
        all_note_ids = []
        for t in cw_tickets:
            notes = get_connectwise_ticket_notes(t['id'])
            for note in notes:
                note_id = f"{t['id']}_{note.get('id', note.get('dateCreated'))}"
                all_note_ids.append(note_id)
        print(f"[DEBUG][Notifications] Marking all as read: {all_note_ids}")
        request.session['read_notifications'] = all_note_ids
        request.session.modified = True
        return JsonResponse({'count': 0, 'notifications': []})

    # Get recent tickets and their notes
    cw_tickets = [t for t in get_connectwise_tickets(request.user) if t.get('status', {}).get('name') not in ['Closed', 'Pending Close', 'Closed - Silent']]

    notifications = []
    for t in cw_tickets:
        notes = get_connectwise_ticket_notes(t['id'])
        for note in notes:
            note_id = f"{t['id']}_{note.get('id', note.get('dateCreated'))}"
            # Only show notes from last 7 days
            note_date = note.get('dateCreated', '')[:10]
            try:
                note_dt = datetime.strptime(note_date, '%Y-%m-%d')
                if note_dt < datetime.now() - timedelta(days=7):
                    continue
            except Exception:
                continue

            is_tech_reply = note.get('enteredBy', '').lower() != user_email and not note.get('text', '').lower().startswith('from:')
            is_status_change = note.get('detailDescriptionFlag') and 'status' in note.get('text', '').lower()
            is_owner_change = note.get('detailDescriptionFlag') and 'assigned' in note.get('text', '').lower()
            is_remote_support = 'user has requested remote support' in note.get('text', '').lower()
            is_user_reply = note.get('enteredBy', '').lower() == user_email or note.get('text', '').lower().startswith('from:')

            # Extract display name (same logic as ticket detail)
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
                    note['ticket_id'] = t['id']
                    note['notification_id'] = note_id
                    note['display_name'] = display_name
                    note['notification_message'] = f"{display_name} has replied to ticket"
                    notifications.append(note)
                    print(f"[DEBUG][Notifications] -> ADDED to notifications: {note_id}")
                else:
                    print(f"[DEBUG][Notifications] -> SKIPPED (already read): {note_id}")
            else:
                print(f"[DEBUG][Notifications] -> FILTERED OUT: {note_id}")

    notifications = sorted(notifications, key=lambda n: n.get('dateCreated', ''), reverse=True)[:10]
    print(f"[DEBUG][Notifications] Final notifications: {[n['notification_id'] for n in notifications]}")

    return JsonResponse({
        'count': len(notifications),
        'notifications': notifications
    })

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

def ticket_thank_you_view(request, ticket_id):
    return render(request, 'portal/ticket_submit_thank_you.html', {'ticket_id': ticket_id})
