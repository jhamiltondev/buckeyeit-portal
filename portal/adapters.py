from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from .models import Tenant
import requests
from django.conf import settings

class NoNewUsersAccountAdapter(DefaultAccountAdapter):
    def is_open_for_signup(self, request):
        # Allow social logins but prevent regular signups
        if request and hasattr(request, 'session'):
            # Check if this is a social login
            social_login = request.session.get('socialaccount_sociallogin')
            if social_login:
                return True
        return False

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def is_open_for_signup(self, request, sociallogin):
        # Always allow social logins to create accounts
        return True
    
    def save_user(self, request, sociallogin, form=None):
        user = super().save_user(request, sociallogin, form)
        # Ensure social users are active
        user.is_active = True
        # Hybrid tenant auto-assignment based on email domain
        email = user.email
        if email and '@' in email:
            domain = email.split('@')[1].lower()
            try:
                tenant = Tenant.objects.get(domain__iexact=domain)
                user.tenant = tenant
            except Tenant.DoesNotExist:
                pass  # Leave tenant blank for admin review
        user.save()
        return user 

def get_connectwise_tickets(user):
    """
    Fetch ConnectWise tickets for the user.
    - Standard users: by email
    - VIP users: by domain (all tickets for their company)
    Returns a list of ticket dicts.
    """
    base_url = f"{settings.CONNECTWISE_SITE}/v4_6_release/apis/3.0/service/tickets"
    company_id = settings.CONNECTWISE_COMPANY_ID
    public_key = settings.CONNECTWISE_PUBLIC_KEY
    private_key = settings.CONNECTWISE_PRIVATE_KEY
    client_id = settings.CONNECTWISE_CLIENT_ID

    # Auth header
    auth = f'{company_id}+{public_key}:{private_key}'
    headers = {
        'Authorization': f'Basic ' + requests.auth._basic_auth_str(f'{company_id}+{public_key}', private_key).split(' ')[1],
        'clientId': client_id,
        'Accept': 'application/json',
    }

    # Build query
    if hasattr(user, 'tenant') and getattr(user.tenant, 'vip', False):
        # VIP: all tickets for the domain
        domain = user.email.split('@')[-1]
        conditions = f"contact/email contains '{domain}'"
    else:
        # Standard: only their tickets
        conditions = f"contact/email='{user.email}'"

    params = {
        'conditions': conditions,
        'orderBy': 'dateEntered desc',
        'pageSize': 10,
    }

    try:
        resp = requests.get(base_url, headers=headers, params=params, timeout=10)
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass
    return [] 