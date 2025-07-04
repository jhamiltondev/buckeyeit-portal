from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.contrib.auth.views import LoginView, LogoutView
from portal.models import Tenant, Ticket, KnowledgeBaseArticle, PendingUserApproval, UserInvitation, Announcement
from portal.tech_news import get_tech_news
import logging
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
import pytz
from datetime import datetime
from django.db.models import Q
from django.core.paginator import Paginator
import csv
import secrets
from django.utils import timezone
from portal.email_utils import send_invitation_email
from django.utils.decorators import method_decorator
from django.core.paginator import Paginator
from django.db import models

# Create your views here.

@staff_member_required(login_url='/adminpanel/login/')
def dashboard(request):
    User = get_user_model()
    
    # Portal Insights - Real live data
    user_count = User.objects.count()
    tenant_count = Tenant.objects.count()
    open_ticket_count = Ticket.objects.filter(status__in=["open", "in_progress"]).count()
    kb_article_count = KnowledgeBaseArticle.objects.filter(is_active=True).count()

    # Recent Admin Activity - Real user activity
    recent_users = User.objects.filter(last_login__isnull=False).order_by('-last_login')[:5]
    recent_admin_activity = []
    eastern = pytz.timezone('US/Eastern')
    for user in recent_users:
        if user.last_login:
            # Convert to EST and format as 'Mon/DD/YYYY h:mm AM/PM EST'
            dt_est = user.last_login.astimezone(eastern)
            formatted = dt_est.strftime('%b/%d/%Y %I:%M %p EST')
            recent_admin_activity.append(f"{user.get_full_name() or user.username} logged in at {formatted}")
    
    # If no recent activity, show placeholder
    if not recent_admin_activity:
        recent_admin_activity = [
            "No recent user activity",
            "System health check completed",
            "Dashboard loaded successfully"
        ]

    # System Integrations - Check actual status
    integrations = {}
    
    # Check ConnectWise connection
    try:
        # Simple test - you can expand this with actual API calls
        integrations["ConnectWise"] = "Connected" if hasattr(settings, 'CONNECTWISE_SITE') else "Not Configured"
    except:
        integrations["ConnectWise"] = "Error"
    
    # Check Pax8 (placeholder - replace with actual check)
    integrations["Pax8"] = "Valid Key" if hasattr(settings, 'PAX8_API_KEY') else "Not Configured"
    
    # Check OpenAI (placeholder - replace with actual check)
    integrations["OpenAI"] = "Valid Key" if hasattr(settings, 'OPENAI_API_KEY') else "Not Configured"

    # Automation Failures - Real data or 0
    # For now, show 0 since we don't have automation tracking yet
    automation_failures = []
    
    # You can expand this with actual automation data:
    # automation_failures = AutomationLog.objects.filter(status='failed').order_by('-created_at')[:3]
    
    if not automation_failures:
        automation_failures = [
            {"tenant": "No automation failures", "status": "All systems operational"}
        ]

    context = {
        "user_count": user_count,
        "tenant_count": tenant_count,
        "open_ticket_count": open_ticket_count,
        "kb_article_count": kb_article_count,
        "recent_admin_activity": recent_admin_activity,
        "integrations": integrations,
        "automation_failures": automation_failures,
    }
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'adminpanel/partials/dashboard.html', context)
    return render(request, 'adminpanel/dashboard.html', context)

@staff_member_required(login_url='/adminpanel/login/')
def users(request):
    return render(request, 'adminpanel/users.html')

@staff_member_required(login_url='/adminpanel/login/')
def groups(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'adminpanel/partials/groups.html')
    return render(request, 'adminpanel/groups.html')

@staff_member_required(login_url='/adminpanel/login/')
def tenants(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'adminpanel/partials/tenants.html')
    return render(request, 'adminpanel/tenants.html')

@staff_member_required(login_url='/adminpanel/login/')
def tenant_documents(request):
    return render(request, 'adminpanel/tenant_documents.html')

@staff_member_required(login_url='/adminpanel/login/')
def kb_articles(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'adminpanel/partials/kb_articles.html')
    return render(request, 'adminpanel/kb_articles.html')

@staff_member_required(login_url='/adminpanel/login/')
def kb_categories(request):
    return render(request, 'adminpanel/kb_categories.html')

@staff_member_required(login_url='/adminpanel/login/')
def tickets(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'adminpanel/partials/tickets.html')
    return render(request, 'adminpanel/tickets.html')

@staff_member_required(login_url='/adminpanel/login/')
def announcements(request):
    return render(request, 'adminpanel/announcements.html')

@staff_member_required(login_url='/adminpanel/login/')
def social_accounts(request):
    return render(request, 'adminpanel/social_accounts.html')

@staff_member_required(login_url='/adminpanel/login/')
def social_tokens(request):
    return render(request, 'adminpanel/social_tokens.html')

@staff_member_required(login_url='/adminpanel/login/')
def social_apps(request):
    return render(request, 'adminpanel/social_apps.html')

# Users
@staff_member_required(login_url='/adminpanel/login/')
def users_active(request):
    User = get_user_model()
    users = User.objects.select_related('tenant').all().order_by('first_name', 'last_name')
    # Add group_names attribute to each user
    for user in users:
        user.group_names = list(user.groups.values_list('name', flat=True))
    tenants = Tenant.objects.all().order_by('name')
    total_users = users.count()
    context = {
        'users': users,
        'tenants': tenants,
        'total_users': total_users,
    }
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'adminpanel/partials/users_active.html', context)
    return render(request, 'adminpanel/users_active.html', context)

@staff_member_required(login_url='/adminpanel/login/')
def users_pending(request):
    pending_requests = PendingUserApproval.objects.select_related('tenant', 'requested_by').filter(status='pending').order_by('-submitted_on')
    tenants = Tenant.objects.all().order_by('name')
    roles = ['Superuser', 'Admin', 'POC', 'Viewer']
    context = {
        'pending_requests': pending_requests,
        'tenants': tenants,
        'roles': roles,
    }
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'adminpanel/partials/users_pending.html', context)
    return render(request, 'adminpanel/users_pending.html', context)

@staff_member_required(login_url='/adminpanel/login/')
def users_invitations(request):
    query = request.GET.get('q', '')
    tenant_id = request.GET.get('tenant', '')
    status = request.GET.get('status', '')
    unredeemed = request.GET.get('unredeemed', '')
    date_sent = request.GET.get('date_sent', '')

    invitations = UserInvitation.objects.all().select_related('tenant', 'invited_by')
    if query:
        invitations = invitations.filter(Q(email__icontains=query) | Q(name__icontains=query))
    if tenant_id:
        invitations = invitations.filter(tenant_id=tenant_id)
    if status:
        invitations = invitations.filter(status=status)
    if unredeemed:
        invitations = invitations.filter(status='pending')
    if date_sent:
        invitations = invitations.filter(date_sent__date=date_sent)
    invitations = invitations.order_by('-date_sent')

    tenants = Tenant.objects.all()
    paginator = Paginator(invitations, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'tenants': tenants,
        'statuses': UserInvitation.STATUS_CHOICES,
        'query': query,
        'tenant_id': tenant_id,
        'status': status,
        'unredeemed': unredeemed,
        'date_sent': date_sent,
    }
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'adminpanel/partials/users_invitations.html', context)
    return render(request, 'adminpanel/users_invitations.html', context)

@staff_member_required(login_url='/adminpanel/login/')
def users_deactivated(request):
    return render(request, 'adminpanel/users_deactivated.html')

@staff_member_required(login_url='/adminpanel/login/')
def users_audit(request):
    return render(request, 'adminpanel/users_audit.html')

# Tenants
@staff_member_required(login_url='/adminpanel/login/')
def tenant_settings(request):
    return render(request, 'adminpanel/tenant_settings.html')

@staff_member_required(login_url='/adminpanel/login/')
def tenant_activity(request):
    return render(request, 'adminpanel/tenant_activity.html')

@staff_member_required(login_url='/adminpanel/login/')
def tenant_customization(request):
    return render(request, 'adminpanel/tenant_customization.html')

@staff_member_required(login_url='/adminpanel/login/')
def tenant_staff(request):
    return render(request, 'adminpanel/tenant_staff.html')

@staff_member_required(login_url='/adminpanel/login/')
def tenant_automation(request):
    return render(request, 'adminpanel/tenant_automation.html')

# Knowledge Base
@staff_member_required(login_url='/adminpanel/login/')
def kb_feedback(request):
    return render(request, 'adminpanel/kb_feedback.html')

@staff_member_required(login_url='/adminpanel/login/')
def kb_drafts(request):
    return render(request, 'adminpanel/kb_drafts.html')

@staff_member_required(login_url='/adminpanel/login/')
def kb_suggested(request):
    return render(request, 'adminpanel/kb_suggested.html')

# Support
@staff_member_required(login_url='/adminpanel/login/')
def service_health(request):
    return render(request, 'adminpanel/service_health.html')

# Admin Center
@staff_member_required(login_url='/adminpanel/login/')
def platform_settings(request):
    return render(request, 'adminpanel/platform_settings.html')

@staff_member_required(login_url='/adminpanel/login/')
def social_identity(request):
    return render(request, 'adminpanel/social_identity.html')

@staff_member_required(login_url='/adminpanel/login/')
def api_integration(request):
    return render(request, 'adminpanel/api_integration.html')

@staff_member_required(login_url='/adminpanel/login/')
def audit_logs(request):
    return render(request, 'adminpanel/audit_logs.html')

@staff_member_required(login_url='/adminpanel/login/')
def role_manager(request):
    return render(request, 'adminpanel/role_manager.html')

@staff_member_required(login_url='/adminpanel/login/')
def system_health(request):
    return render(request, 'adminpanel/system_health.html')

@staff_member_required(login_url='/adminpanel/login/')
def user_details(request, user_id):
    User = get_user_model()
    user = User.objects.select_related('tenant').get(id=user_id)
    tickets_count = 0  # Replace with Ticket.objects.filter(user=user).count() if available
    groups = list(user.groups.values_list('name', flat=True))
    recent_actions = [
        {'timestamp': user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else '', 'description': 'Logged in'},
    ]
    data = {
        'id': user.id,
        'name': user.get_full_name() or user.username,
        'email': user.email,
        'role': 'Super Admin' if user.is_superuser else ('Admin' if user.is_staff else 'User'),
        'tenant': user.tenant.name if hasattr(user, 'tenant') and user.tenant else '',
        'mfa_enabled': getattr(user, 'mfa_enabled', False),
        'last_login': user.last_login.strftime('%b %d, %Y %I:%M%p') if user.last_login else '',
        'is_active': user.is_active,
        'groups': groups,
        'tickets_count': tickets_count,
        'recent_actions': recent_actions,
    }
    return JsonResponse(data)

@staff_member_required(login_url='/adminpanel/login/')
def edit_user(request, user_id):
    User = get_user_model()
    user = User.objects.get(id=user_id)
    if request.method == 'POST':
        user.email = request.POST.get('email', user.email)
        user.first_name = request.POST.get('first_name', user.first_name)
        user.last_name = request.POST.get('last_name', user.last_name)
        user.is_active = request.POST.get('is_active', user.is_active) == 'true'
        user.save()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False})

@staff_member_required(login_url='/adminpanel/login/')
def delete_user(request, user_id):
    User = get_user_model()
    user = User.objects.get(id=user_id)
    user.delete()
    return JsonResponse({'success': True})

@staff_member_required(login_url='/adminpanel/login/')
def disable_user(request, user_id):
    User = get_user_model()
    user = User.objects.get(id=user_id)
    user.is_active = False
    user.save()
    return JsonResponse({'success': True})

@staff_member_required(login_url='/adminpanel/login/')
@require_POST
@csrf_exempt
def approve_pending_user(request, approval_id):
    from portal.models import PendingUserApproval
    try:
        approval = PendingUserApproval.objects.get(id=approval_id)
        approval.status = 'approved'
        approval.save()
        return JsonResponse({'success': True, 'message': 'Request approved.'})
    except PendingUserApproval.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Request not found.'}, status=404)

@staff_member_required(login_url='/adminpanel/login/')
@require_POST
@csrf_exempt
def deny_pending_user(request, approval_id):
    from portal.models import PendingUserApproval
    comment = request.POST.get('comment', '')
    try:
        approval = PendingUserApproval.objects.get(id=approval_id)
        approval.status = 'denied'
        approval.metadata = approval.metadata or {}
        approval.metadata['deny_comment'] = comment
        approval.save()
        return JsonResponse({'success': True, 'message': 'Request denied.'})
    except PendingUserApproval.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Request not found.'}, status=404)

@staff_member_required(login_url='/adminpanel/login/')
def pending_user_details(request, approval_id):
    from portal.models import PendingUserApproval
    try:
        approval = PendingUserApproval.objects.select_related('tenant', 'requested_by').get(id=approval_id)
        data = {
            'id': approval.id,
            'name': approval.name,
            'email': approval.email,
            'tenant': approval.tenant.name if approval.tenant else '',
            'role_requested': approval.role_requested,
            'requested_by': approval.requested_by.username if approval.requested_by else 'self-submitted',
            'submitted_on': approval.submitted_on.strftime('%b %d, %Y %I:%M%p'),
            'justification': approval.justification,
            'status': approval.status,
            'metadata': approval.metadata,
        }
        return JsonResponse({'success': True, 'data': data})
    except PendingUserApproval.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Request not found.'}, status=404)

class AdminLoginView(LoginView):
    template_name = 'adminpanel/login.html'
    redirect_authenticated_user = True

class AdminLogoutView(LogoutView):
    next_page = '/adminpanel/login/'
    def get(self, request, *args, **kwargs):
        print("=== AdminLogoutView GET called ===")
        return self.post(request, *args, **kwargs)

@staff_member_required(login_url='/adminpanel/login/')
def create_invitation(request):
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip().lower()
        tenant_id = request.POST.get('tenant')
        role = request.POST.get('role_assigned', '').strip()
        expiration_date = request.POST.get('expiration_date')
        invited_by = request.user
        if not email or not tenant_id or not role:
            return JsonResponse({'success': False, 'error': 'Email, tenant, and role are required.'})
        if UserInvitation.objects.filter(email=email, tenant_id=tenant_id, status='pending').exists():
            return JsonResponse({'success': False, 'error': 'A pending invitation for this email and tenant already exists.'})
        token = secrets.token_urlsafe(32)
        exp = None
        if expiration_date:
            try:
                exp = timezone.datetime.strptime(expiration_date, '%Y-%m-%d')
                exp = timezone.make_aware(exp)
            except Exception:
                return JsonResponse({'success': False, 'error': 'Invalid expiration date.'})
        invite = UserInvitation.objects.create(
            name=name,
            email=email,
            tenant_id=tenant_id,
            role_assigned=role,
            invited_by=invited_by,
            token=token,
            expiration_date=exp,
            status='pending',
        )
        try:
            send_invitation_email(email, token, tenant_name=invite.tenant.name, role=role)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Invitation created but email failed: {e}'})
        return JsonResponse({'success': True, 'message': 'Invitation created and email sent.'})
    return JsonResponse({'success': False, 'error': 'Invalid request.'})

@staff_member_required(login_url='/adminpanel/login/')
def resend_invitation(request, invitation_id):
    try:
        invite = UserInvitation.objects.get(id=invitation_id)
        if invite.status not in ['pending', 'expired']:
            return JsonResponse({'success': False, 'message': 'Only pending or expired invites can be resent.'})
        try:
            send_invitation_email(invite.email, invite.token, tenant_name=invite.tenant.name, role=invite.role_assigned)
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Email failed: {e}'})
        return JsonResponse({'success': True, 'message': 'Invitation resent.'})
    except UserInvitation.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Invitation not found.'})

@staff_member_required(login_url='/adminpanel/login/')
def revoke_invitation(request, invitation_id):
    try:
        invite = UserInvitation.objects.get(id=invitation_id)
        if invite.status in ['redeemed', 'revoked']:
            return JsonResponse({'success': False, 'message': 'Cannot revoke a redeemed or already revoked invite.'})
        invite.status = 'revoked'
        invite.save()
        return JsonResponse({'success': True, 'message': 'Invitation revoked.'})
    except UserInvitation.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Invitation not found.'})

@staff_member_required(login_url='/adminpanel/login/')
def edit_invitation(request, invitation_id):
    try:
        invite = UserInvitation.objects.get(id=invitation_id)
        if request.method == 'POST':
            if invite.status == 'redeemed':
                return JsonResponse({'success': False, 'message': 'Cannot edit a redeemed invite.'})
            invite.name = request.POST.get('name', invite.name)
            invite.email = request.POST.get('email', invite.email)
            invite.tenant_id = request.POST.get('tenant', invite.tenant_id)
            invite.role_assigned = request.POST.get('role_assigned', invite.role_assigned)
            expiration_date = request.POST.get('expiration_date')
            if expiration_date:
                try:
                    exp = timezone.datetime.strptime(expiration_date, '%Y-%m-%d')
                    exp = timezone.make_aware(exp)
                    invite.expiration_date = exp
                except Exception:
                    return JsonResponse({'success': False, 'message': 'Invalid expiration date.'})
            invite.save()
            return JsonResponse({'success': True, 'message': 'Invitation updated.'})
        return JsonResponse({'success': False, 'message': 'Invalid request.'})
    except UserInvitation.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Invitation not found.'})

@staff_member_required(login_url='/adminpanel/login/')
def view_invitation(request, invitation_id):
    try:
        invite = UserInvitation.objects.select_related('tenant').get(id=invitation_id)
        data = {
            'name': invite.name,
            'email': invite.email,
            'tenant': invite.tenant.name,
            'tenant_id': invite.tenant.id,
            'role_assigned': invite.role_assigned,
            'date_sent': invite.date_sent.strftime('%Y-%m-%d %H:%M'),
            'status': invite.get_status_display(),
            'redeemed_on': invite.redeemed_on.strftime('%Y-%m-%d %H:%M') if invite.redeemed_on else '',
            'expiration_date': invite.expiration_date.strftime('%Y-%m-%d') if invite.expiration_date else '',
        }
        return JsonResponse({'success': True, 'data': data})
    except UserInvitation.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Invitation not found.'})

@staff_member_required(login_url='/adminpanel/login/')
def export_invitations_csv(request):
    # Filter logic (reuse from users_invitations)
    query = request.GET.get('q', '')
    tenant_id = request.GET.get('tenant', '')
    status = request.GET.get('status', '')
    unredeemed = request.GET.get('unredeemed', '')
    date_sent = request.GET.get('date_sent', '')
    invitations = UserInvitation.objects.all().select_related('tenant', 'invited_by')
    if query:
        invitations = invitations.filter(Q(email__icontains=query) | Q(name__icontains=query))
    if tenant_id:
        invitations = invitations.filter(tenant_id=tenant_id)
    if status:
        invitations = invitations.filter(status=status)
    if unredeemed:
        invitations = invitations.filter(status='pending')
    if date_sent:
        invitations = invitations.filter(date_sent__date=date_sent)
    invitations = invitations.order_by('-date_sent')
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="invitations.csv"'
    writer = csv.writer(response)
    writer.writerow(['Name', 'Email', 'Tenant', 'Role', 'Date Sent', 'Status', 'Redeemed On'])
    for i in invitations:
        writer.writerow([
            i.name,
            i.email,
            i.tenant.name,
            i.role_assigned,
            i.date_sent.strftime('%Y-%m-%d %H:%M'),
            i.get_status_display(),
            i.redeemed_on.strftime('%Y-%m-%d %H:%M') if i.redeemed_on else '',
        ])
    return response

@staff_member_required(login_url='/adminpanel/login/')
@csrf_exempt
def api_dashboard_stats(request):
    User = get_user_model()
    user_count = User.objects.count()
    tenant_count = Tenant.objects.count()
    open_ticket_count = Ticket.objects.filter(status__in=["open", "in_progress"]).count()
    kb_article_count = KnowledgeBaseArticle.objects.filter(is_active=True).count()
    # Integrations
    integrations = {}
    try:
        integrations["ConnectWise"] = "Connected" if hasattr(settings, 'CONNECTWISE_SITE') else "Not Configured"
    except:
        integrations["ConnectWise"] = "Error"
    integrations["Pax8"] = "Valid Key" if hasattr(settings, 'PAX8_API_KEY') else "Not Configured"
    integrations["OpenAI"] = "Valid Key" if hasattr(settings, 'OPENAI_API_KEY') else "Not Configured"
    # Automation Failures (placeholder)
    automation_failures = []
    if not automation_failures:
        automation_failures = [
            {"tenant": "No automation failures", "status": "All systems operational"}
        ]
    return JsonResponse({
        "user_count": user_count,
        "tenant_count": tenant_count,
        "open_ticket_count": open_ticket_count,
        "kb_article_count": kb_article_count,
        "integrations": integrations,
        "automation_failures": automation_failures,
    })

@staff_member_required(login_url='/adminpanel/login/')
@csrf_exempt
def api_users(request):
    User = get_user_model()
    page = int(request.GET.get('page', 1))
    per_page = int(request.GET.get('per_page', 10))
    search = request.GET.get('search', '').strip().lower()
    role = request.GET.get('role', '')
    tenant = request.GET.get('tenant', '')
    status = request.GET.get('status', '')
    users = User.objects.select_related('tenant').all()
    if search:
        users = users.filter(
            models.Q(first_name__icontains=search) |
            models.Q(last_name__icontains=search) |
            models.Q(email__icontains=search)
        )
    if role and role != 'All Roles':
        if role == 'Admin':
            users = users.filter(is_staff=True, is_superuser=False)
        elif role == 'Tech':
            users = users.filter(groups__name='Tech')
        elif role == 'Client':
            users = users.filter(groups__name='Client')
    if tenant and tenant != 'All Tenants':
        users = users.filter(tenant__name=tenant)
    if status and status != 'All Statuses':
        if status == 'Active':
            users = users.filter(is_active=True)
        elif status == 'Suspended':
            users = users.filter(is_active=False)
    users = users.order_by('first_name', 'last_name')
    paginator = Paginator(users, per_page)
    page_obj = paginator.get_page(page)
    user_list = []
    for user in page_obj:
        user_list.append({
            'id': user.id,
            'fullName': user.get_full_name() or user.username,
            'email': user.email,
            'role': 'Admin' if user.is_staff else 'User',
            'tenant': user.tenant.name if hasattr(user, 'tenant') and user.tenant else '',
            'status': 'Active' if user.is_active else 'Suspended',
            'lastLogin': user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else '',
            'dateCreated': user.date_joined.strftime('%Y-%m-%d') if user.date_joined else '',
            'avatar': user.avatar.url if hasattr(user, 'avatar') and user.avatar else '',
        })
    return JsonResponse({
        'results': user_list,
        'total': paginator.count,
        'page': page,
        'totalPages': paginator.num_pages,
    })

@staff_member_required(login_url='/adminpanel/login/')
@csrf_exempt
def api_tenants(request):
    tenants = Tenant.objects.all().order_by('name')
    tenant_list = [{'id': t.id, 'name': t.name} for t in tenants]
    return JsonResponse({'results': tenant_list})
