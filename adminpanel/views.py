from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.contrib.auth.views import LoginView, LogoutView
from portal.models import Tenant, Ticket, KnowledgeBaseArticle
from portal.tech_news import get_tech_news
import logging
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse

# Create your views here.

@staff_member_required
def dashboard(request):
    User = get_user_model()
    # Portal Insights
    user_count = User.objects.count()
    tenant_count = Tenant.objects.count()
    open_ticket_count = Ticket.objects.filter(status__in=["open", "in_progress"]).count()
    kb_article_count = KnowledgeBaseArticle.objects.filter(is_active=True).count()

    # Recent Admin Activity (stub: replace with real audit log if available)
    recent_admin_activity = [
        "John reset user password for jsmith@reedminerals",
        "Automation failed for tenant Wyandot County",
        "Jane approved new user for Buckeye IT",
        "System health check completed",
    ]

    # System Integrations (stub: replace with real checks if available)
    integrations = {
        "ConnectWise": "Connected",
        "Pax8": "Valid Key",
        "OpenAI": "Expiring Soon",
    }

    # Automation Failures (stub: replace with real automation log if available)
    automation_failures = [
        {"tenant": "Reed Minerals", "status": "Reset Failed"},
        {"tenant": "Wyandot", "status": "Termination Failed"},
        {"tenant": "Crawford", "status": "User Provisioned"},
    ]

    # Tech news (optional, for future expansion)
    # tech_news = get_tech_news()

    context = {
        "user_count": user_count,
        "tenant_count": tenant_count,
        "open_ticket_count": open_ticket_count,
        "kb_article_count": kb_article_count,
        "recent_admin_activity": recent_admin_activity,
        "integrations": integrations,
        "automation_failures": automation_failures,
        # "tech_news": tech_news,
    }
    return render(request, 'adminpanel/dashboard.html', context)

@staff_member_required
def users(request):
    return render(request, 'adminpanel/users.html')

@staff_member_required
def groups(request):
    return render(request, 'adminpanel/groups.html')

@staff_member_required
def tenants(request):
    return render(request, 'adminpanel/tenants.html')

@staff_member_required
def tenant_documents(request):
    return render(request, 'adminpanel/tenant_documents.html')

@staff_member_required
def kb_articles(request):
    return render(request, 'adminpanel/kb_articles.html')

@staff_member_required
def kb_categories(request):
    return render(request, 'adminpanel/kb_categories.html')

@staff_member_required
def tickets(request):
    return render(request, 'adminpanel/tickets.html')

@staff_member_required
def announcements(request):
    return render(request, 'adminpanel/announcements.html')

@staff_member_required
def social_accounts(request):
    return render(request, 'adminpanel/social_accounts.html')

@staff_member_required
def social_tokens(request):
    return render(request, 'adminpanel/social_tokens.html')

@staff_member_required
def social_apps(request):
    return render(request, 'adminpanel/social_apps.html')

# Users
@staff_member_required
def users_active(request):
    User = get_user_model()
    
    # Get all users with related tenant data
    users = User.objects.select_related('tenant').all().order_by('first_name', 'last_name')
    
    # Get all tenants for filter dropdown
    tenants = Tenant.objects.all().order_by('name')
    
    # Count total users
    total_users = users.count()
    
    context = {
        'users': users,
        'tenants': tenants,
        'total_users': total_users,
    }
    return render(request, 'adminpanel/users_active.html', context)

@staff_member_required
def users_pending(request):
    return render(request, 'adminpanel/users_pending.html')
@staff_member_required
def users_invitations(request):
    return render(request, 'adminpanel/users_invitations.html')
@staff_member_required
def users_deactivated(request):
    return render(request, 'adminpanel/users_deactivated.html')
@staff_member_required
def users_audit(request):
    return render(request, 'adminpanel/users_audit.html')

# Tenants
@staff_member_required
def tenant_settings(request):
    return render(request, 'adminpanel/tenant_settings.html')
@staff_member_required
def tenant_activity(request):
    return render(request, 'adminpanel/tenant_activity.html')
@staff_member_required
def tenant_customization(request):
    return render(request, 'adminpanel/tenant_customization.html')
@staff_member_required
def tenant_staff(request):
    return render(request, 'adminpanel/tenant_staff.html')
@staff_member_required
def tenant_automation(request):
    return render(request, 'adminpanel/tenant_automation.html')

# Knowledge Base
@staff_member_required
def kb_feedback(request):
    return render(request, 'adminpanel/kb_feedback.html')
@staff_member_required
def kb_drafts(request):
    return render(request, 'adminpanel/kb_drafts.html')
@staff_member_required
def kb_suggested(request):
    return render(request, 'adminpanel/kb_suggested.html')

# Support
@staff_member_required
def service_health(request):
    return render(request, 'adminpanel/service_health.html')

# Admin Center
@staff_member_required
def platform_settings(request):
    return render(request, 'adminpanel/platform_settings.html')
@staff_member_required
def social_identity(request):
    return render(request, 'adminpanel/social_identity.html')
@staff_member_required
def api_integration(request):
    return render(request, 'adminpanel/api_integration.html')
@staff_member_required
def audit_logs(request):
    return render(request, 'adminpanel/audit_logs.html')
@staff_member_required
def role_manager(request):
    return render(request, 'adminpanel/role_manager.html')
@staff_member_required
def system_health(request):
    return render(request, 'adminpanel/system_health.html')

@staff_member_required
def user_details(request, user_id):
    """API endpoint for user details modal"""
    User = get_user_model()
    try:
        user = User.objects.select_related('tenant').get(id=user_id)
        
        # Get user's tickets count (placeholder for now)
        tickets_count = 0  # Ticket.objects.filter(user=user).count()
        
        # Get user's groups
        groups = list(user.groups.values_list('name', flat=True))
        
        # Mock recent actions (replace with real audit log later)
        recent_actions = [
            {'timestamp': '2025-06-30 09:12 AM', 'description': 'Logged into portal'},
            {'timestamp': '2025-06-29 10:15 AM', 'description': 'Submitted support ticket'},
            {'timestamp': '2025-06-28 14:30 PM', 'description': 'Updated profile'},
        ]
        
        user_data = {
            'id': user.id,
            'full_name': user.get_full_name() or user.username,
            'email': user.email,
            'role': 'Super Admin' if user.is_superuser else 'Admin' if user.is_staff else 'User',
            'tenant': user.tenant.name if user.tenant else None,
            'mfa_enabled': user.is_superuser or user.is_staff,  # Mock MFA status
            'last_login': user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else None,
            'last_ip': '192.168.1.100',  # Mock IP
            'devices': 'Chrome on Windows',  # Mock device info
            'tickets_count': tickets_count,
            'automation_count': 0,  # Mock automation count
            'groups': ', '.join(groups) if groups else '—',
            'recent_actions': recent_actions,
        }
        
        return JsonResponse(user_data)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

class AdminLoginView(LoginView):
    template_name = 'adminpanel/login.html'
    redirect_authenticated_user = True

class AdminLogoutView(LogoutView):
    next_page = '/adminpanel/login/'
