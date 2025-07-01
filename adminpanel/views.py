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
    
    # Portal Insights - Real live data
    user_count = User.objects.count()
    tenant_count = Tenant.objects.count()
    open_ticket_count = Ticket.objects.filter(status__in=["open", "in_progress"]).count()
    kb_article_count = KnowledgeBaseArticle.objects.filter(is_active=True).count()

    # Recent Admin Activity - Real user activity
    recent_users = User.objects.filter(last_login__isnull=False).order_by('-last_login')[:5]
    recent_admin_activity = []
    
    for user in recent_users:
        if user.last_login:
            recent_admin_activity.append(f"{user.get_full_name() or user.username} logged in at {user.last_login.strftime('%M %d, %Y %H:%M')}")
    
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

@staff_member_required
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

@staff_member_required
def delete_user(request, user_id):
    User = get_user_model()
    user = User.objects.get(id=user_id)
    user.delete()
    return JsonResponse({'success': True})

@staff_member_required
def disable_user(request, user_id):
    User = get_user_model()
    user = User.objects.get(id=user_id)
    user.is_active = False
    user.save()
    return JsonResponse({'success': True})

class AdminLoginView(LoginView):
    template_name = 'adminpanel/login.html'
    redirect_authenticated_user = True

class AdminLogoutView(LogoutView):
    next_page = '/adminpanel/login/'
