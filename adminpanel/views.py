from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render

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
