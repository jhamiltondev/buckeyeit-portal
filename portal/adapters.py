from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from .models import Tenant
import requests
from django.conf import settings
import base64

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
    - Standard users: by contact ID (looked up by email)
    - VIP users: by domain (all tickets for their company)
    Returns a list of ticket dicts.
    """
    base_url = f"{settings.CONNECTWISE_SITE}/v4_6_release/apis/3.0/service/tickets"
    company_id = settings.CONNECTWISE_COMPANY_ID
    public_key = settings.CONNECTWISE_PUBLIC_KEY
    private_key = settings.CONNECTWISE_PRIVATE_KEY
    client_id = settings.CONNECTWISE_CLIENT_ID
    auth_string = f"{company_id}+{public_key}:{private_key}"
    auth_b64 = base64.b64encode(auth_string.encode()).decode()
    headers = {
        'Authorization': f'Basic {auth_b64}',
        'clientId': client_id,
        'Accept': 'application/json',
    }
    # Build query
    if hasattr(user, 'tenant') and getattr(user.tenant, 'vip', False):
        # VIP: all tickets for the domain
        domain = user.email.split('@')[-1]
        conditions = f"contactEmail contains '{domain}'"
    else:
        # Standard: look up contact ID by email
        contact_id = get_connectwise_contact_id(user.email)
        if not contact_id:
            return []
        conditions = f"contact/id={contact_id}"
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

def get_connectwise_contact_id(email, company_identifier=None):
    """
    Look up a ConnectWise contact by email. If not found, create it.
    Returns the contact ID or None.
    """
    base_url = f"{settings.CONNECTWISE_SITE}/v4_6_release/apis/3.0/companies/contacts"
    company_id = settings.CONNECTWISE_COMPANY_ID
    public_key = settings.CONNECTWISE_PUBLIC_KEY
    private_key = settings.CONNECTWISE_PRIVATE_KEY
    client_id = settings.CONNECTWISE_CLIENT_ID
    auth_string = f"{company_id}+{public_key}:{private_key}"
    auth_b64 = base64.b64encode(auth_string.encode()).decode()
    headers = {
        'Authorization': f'Basic {auth_b64}',
        'clientId': client_id,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
    # Try to find contact by email
    params = {'conditions': f"email='{email}'"}
    try:
        resp = requests.get(base_url, headers=headers, params=params, timeout=10)
        if resp.status_code == 200 and resp.json():
            return resp.json()[0]['id']
    except Exception:
        pass
    # If not found, create contact
    payload = {
        'email': email,
        'company': {'identifier': company_identifier} if company_identifier else None,
        'firstName': email.split('@')[0],
        'lastName': '',
    }
    payload = {k: v for k, v in payload.items() if v is not None}
    try:
        resp = requests.post(base_url, headers=headers, json=payload, timeout=10)
        if resp.status_code in (200, 201):
            return resp.json()['id']
    except Exception:
        pass
    return None

def create_connectwise_ticket(form_data, user):
    print("[DEBUG] create_connectwise_ticket called for user:", user.email)
    base_url = f"{settings.CONNECTWISE_SITE}/v4_6_release/apis/3.0/service/tickets"
    company_id = settings.CONNECTWISE_COMPANY_ID
    public_key = settings.CONNECTWISE_PUBLIC_KEY
    private_key = settings.CONNECTWISE_PRIVATE_KEY
    client_id = settings.CONNECTWISE_CLIENT_ID
    auth_string = f"{company_id}+{public_key}:{private_key}"
    auth_b64 = base64.b64encode(auth_string.encode()).decode()
    headers = {
        'Authorization': f'Basic {auth_b64}',
        'clientId': client_id,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
    summary = form_data['request_type']
    if form_data.get('request_type') == 'Other' and form_data.get('request_type_other'):
        summary = form_data['request_type_other']
    summary = f"{summary} - {form_data['description'][:60]}"
    contact_email = form_data.get('affected_user') or user.email
    company_identifier = None
    if hasattr(user, 'tenant') and user.tenant:
        company_identifier = user.tenant.name or user.tenant.domain
    contact_id = get_connectwise_contact_id(contact_email, company_identifier)
    onsite_note = ''
    if form_data.get('onsite_or_remote') == 'Onsite Visit Requested':
        onsite_note = 'User requests onsite visit.'
    elif form_data.get('onsite_or_remote') == 'Remote Support':
        onsite_note = 'User requests remote support.'
    description = form_data['description']
    if onsite_note:
        description = onsite_note + '\n\n' + description

    # Mappings for ConnectWise
    PRIORITY_MAP = {
        'Low (e.g., minor inconvenience)': 'Priority 4 - Low',
        'Medium (e.g., workarounds exist)': 'Priority 3 - Medium',
        'High (e.g., unable to work)': 'Priority 2 - High',
        'Emergency (e.g., business down)': 'Priority 1 - Critical',
        'Low': 'Priority 4 - Low',
        'Medium': 'Priority 3 - Medium',
        'High': 'Priority 2 - High',
        'Emergency': 'Priority 1 - Critical',
    }
    SUBTYPE_MAP = {
        'Technical Issue': 'Software',
        'Password Reset': 'Email',
        'Software Installation': 'Software',
        'Hardware Problem': 'Laptop / Workstation',
        'Network Issue': 'Network',
        'General Inquiry': 'Email',
        'Other': 'Email',
        'New User Setup': 'Email',
    }
    # Use safe defaults if not found
    priority = PRIORITY_MAP.get(form_data.get('priority'), 'Priority 3 - Medium')
    subtype = SUBTYPE_MAP.get(form_data.get('request_type'), 'Email')

    payload = {
        "summary": summary,
        "board": {"name": "Help Desk (MS)"},
        "status": {"name": "New"},
        "type": {"name": "Incident"},
        "subType": {"name": subtype},
        "item": {"name": subtype},
        "priority": {"name": priority},
        "source": {"name": "Portal"},
        "contactId": contact_id,
        "contactEmailAddress": contact_email,
        "contactName": user.get_full_name() or user.username,
        "company": {"identifier": company_identifier} if company_identifier else None,
        "site": None,
        "initialDescription": description,
    }
    payload = {k: v for k, v in payload.items() if v is not None}
    print("[DEBUG] Submitting ConnectWise ticket with payload:", payload)
    try:
        resp = requests.post(base_url, headers=headers, json=payload, timeout=10)
        print("[DEBUG] ConnectWise response status:", resp.status_code)
        print("[DEBUG] ConnectWise response text:", resp.text)
        if resp.status_code in (200, 201):
            print("[DEBUG] Ticket created successfully.")
            return resp.json()
        else:
            print("ConnectWise ticket creation failed:", resp.status_code, resp.text)
    except Exception as e:
        print("ConnectWise ticket creation error:", e)
    print("[DEBUG] create_connectwise_ticket finished for user:", user.email)
    return None

def test_connectwise_fetch_by_email(email):
    """Standalone test for ConnectWise ticket fetch by email (no Django ORM)."""
    import os
    from django.conf import settings
    import requests
    base_url = f"{settings.CONNECTWISE_SITE}/v4_6_release/apis/3.0/service/tickets"
    company_id = settings.CONNECTWISE_COMPANY_ID
    public_key = settings.CONNECTWISE_PUBLIC_KEY
    private_key = settings.CONNECTWISE_PRIVATE_KEY
    client_id = settings.CONNECTWISE_CLIENT_ID
    headers = {
        'Authorization': f'Basic ' + requests.auth._basic_auth_str(f'{company_id}+{public_key}', private_key).split(' ')[1],
        'clientId': client_id,
        'Accept': 'application/json',
    }
    params = {
        'conditions': f"contactEmail='{email}'",
        'orderBy': 'dateEntered desc',
        'pageSize': 10,
    }
    try:
        resp = requests.get(base_url, headers=headers, params=params, timeout=10)
        print('[DEBUG] ConnectWise fetch status:', resp.status_code)
        print('[DEBUG] ConnectWise fetch response:', resp.text)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        print('[DEBUG] ConnectWise fetch error:', e)
    return [] 

def test_connectwise_fetch_by_contact_email(email):
    """Standalone test: Look up contact by email, then fetch tickets by contactId."""
    from django.conf import settings
    import requests
    # Step 1: Look up contact by email
    contacts_url = f"{settings.CONNECTWISE_SITE}/v4_6_release/apis/3.0/companies/contacts"
    company_id = settings.CONNECTWISE_COMPANY_ID
    public_key = settings.CONNECTWISE_PUBLIC_KEY
    private_key = settings.CONNECTWISE_PRIVATE_KEY
    client_id = settings.CONNECTWISE_CLIENT_ID
    headers = {
        'Authorization': f'Basic ' + requests.auth._basic_auth_str(f'{company_id}+{public_key}', private_key).split(' ')[1],
        'clientId': client_id,
        'Accept': 'application/json',
    }
    params = {'conditions': f"email='{email}'"}
    try:
        resp = requests.get(contacts_url, headers=headers, params=params, timeout=10)
        print('[DEBUG] Contact lookup status:', resp.status_code)
        print('[DEBUG] Contact lookup response:', resp.text)
        if resp.status_code == 200 and resp.json():
            contact_id = resp.json()[0]['id']
            print(f'[DEBUG] Found contactId: {contact_id}')
        else:
            print('[DEBUG] No contact found for email.')
            return []
    except Exception as e:
        print('[DEBUG] Contact lookup error:', e)
        return []
    # Step 2: Fetch tickets by contactId
    tickets_url = f"{settings.CONNECTWISE_SITE}/v4_6_release/apis/3.0/service/tickets"
    params = {
        'conditions': f"contactId={contact_id}",
        'orderBy': 'dateEntered desc',
        'pageSize': 10,
    }
    try:
        resp = requests.get(tickets_url, headers=headers, params=params, timeout=10)
        print('[DEBUG] Ticket fetch status:', resp.status_code)
        print('[DEBUG] Ticket fetch response:', resp.text)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        print('[DEBUG] Ticket fetch error:', e)
    return [] 