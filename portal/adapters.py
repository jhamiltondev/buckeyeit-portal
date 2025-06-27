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

def create_connectwise_ticket(form_data, user):
    """
    Create a ticket in ConnectWise using mapped fields from the support form.
    """
    base_url = f"{settings.CONNECTWISE_SITE}/v4_6_release/apis/3.0/service/tickets"
    company_id = settings.CONNECTWISE_COMPANY_ID
    public_key = settings.CONNECTWISE_PUBLIC_KEY
    private_key = settings.CONNECTWISE_PRIVATE_KEY
    client_id = settings.CONNECTWISE_CLIENT_ID

    headers = {
        'Authorization': f'Basic ' + requests.auth._basic_auth_str(f'{company_id}+{public_key}', private_key).split(' ')[1],
        'clientId': client_id,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }

    # Map form fields to ConnectWise fields
    summary = form_data['request_type']
    if form_data.get('request_type') == 'Other' and form_data.get('request_type_other'):
        summary = form_data['request_type_other']
    summary = f"{summary} - {form_data['description'][:60]}"
    contact_email = form_data.get('affected_user') or user.email

    # Add onsite/remote note to description
    onsite_note = ''
    if form_data.get('onsite_or_remote') == 'Onsite Visit Requested':
        onsite_note = 'User requests onsite visit.'
    elif form_data.get('onsite_or_remote') == 'Remote Support':
        onsite_note = 'User requests remote support.'
    description = form_data['description']
    if onsite_note:
        description = onsite_note + '\n\n' + description

    # Defaults (customize as needed)
    payload = {
        "summary": summary,
        "board": {"name": "Implementation (MS)"},
        "status": {"name": "Needs Worked"},
        "type": {"name": "Request"},
        "subType": {"name": form_data['request_type']},
        "item": {"name": form_data['request_type']},
        "priority": {"name": form_data['priority']},
        "source": {"name": "Portal"},
        "contactEmailAddress": contact_email,
        "contactName": user.get_full_name() or user.username,
        "company": {"identifier": user.tenant.domain if hasattr(user, 'tenant') and user.tenant else None},
        "site": None,
        "initialDescription": description,
    }

    # Remove None values
    payload = {k: v for k, v in payload.items() if v is not None}

    try:
        resp = requests.post(base_url, headers=headers, json=payload, timeout=10)
        if resp.status_code in (200, 201):
            return resp.json()
        else:
            print("ConnectWise ticket creation failed:", resp.status_code, resp.text)
    except Exception as e:
        print("ConnectWise ticket creation error:", e)
    return None 