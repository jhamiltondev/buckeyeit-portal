from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.contrib.auth.views import LoginView, LogoutView

# Create your views here.

@staff_member_required
def dashboard(request):
    return render(request, 'adminpanel/dashboard.html')

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
    return render(request, 'adminpanel/users_active.html')
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

class AdminLoginView(LoginView):
    template_name = 'adminpanel/login.html'
    redirect_authenticated_user = True

class AdminLogoutView(LogoutView):
    next_page = '/adminpanel/login/'
