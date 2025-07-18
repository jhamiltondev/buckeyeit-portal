from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from .models import Tenant
import requests
from django.conf import settings
import base64
import requests.auth
import traceback

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

def get_connectwise_tickets(user, extra_conditions=None):
    """
    Fetch ConnectWise tickets for the user.
    - Standard users: by contact ID (looked up by email)
    - VIP users: by domain (all tickets for their company)
    If extra_conditions is provided, use it as the API 'conditions' parameter instead of the default logic.
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
    print(f"[DEBUG] Fetching ConnectWise tickets for user: {user.email}")
    # Build query
    if extra_conditions:
        conditions = extra_conditions
        print(f"[DEBUG] Using extra_conditions for API: {conditions}")
    elif hasattr(user, 'tenant') and getattr(user.tenant, 'vip', False):
        # VIP: all tickets for the domain
        domain = user.email.split('@')[-1]
        conditions = f"contactEmail contains '{domain}'"
        print(f"[DEBUG] User is VIP. Using domain: {domain}")
        print(f"[DEBUG] API conditions: {conditions}")
    else:
        # Standard: look up contact ID by email
        contact_id = get_connectwise_contact_id(user.email)
        print(f"[DEBUG] User is not VIP. Contact ID for {user.email}: {contact_id}")
        if not contact_id:
            print(f"[DEBUG] No contact ID found for {user.email}. Returning empty list.")
            return []
        conditions = f"contact/id={contact_id}"
        print(f"[DEBUG] API conditions: {conditions}")
    params = {
        'conditions': conditions,
        'orderBy': 'dateEntered desc',
        'pageSize': 10,
    }
    try:
        resp = requests.get(base_url, headers=headers, params=params, timeout=30)
        print(f"[DEBUG] ConnectWise API status: {resp.status_code}")
        print(f"[DEBUG] ConnectWise API response: {resp.text}")
        if resp.status_code == 200:
            print(f"[DEBUG] Tickets fetched: {resp.json()}")
            return resp.json()
    except Exception as e:
        print(f"[DEBUG] Exception while fetching tickets: {e}")
    return []

def get_connectwise_contact_id(email, company_identifier=None):
    """
    Look up a ConnectWise contact by email (main or communication item). If not found, create it.
    Returns the contact ID or None.
    """
    base_url = f"{settings.CONNECTWISE_SITE}/v4_6_release/apis/3.0/company/contacts"
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
    # Try to find contact by email (main or communication item)
    params = {'childconditions': f'communicationItems/value like "%{email}%" AND communicationItems/communicationType="Email"'}
    try:
        print(f"[DEBUG] Contact lookup by childconditions: {params}")
        resp = requests.get(base_url, headers=headers, params=params, timeout=10)
        print(f"[DEBUG] Contact lookup status: {resp.status_code}")
        print(f"[DEBUG] Contact lookup response: {resp.text}")
        if resp.status_code == 200 and resp.json():
            contact_id = resp.json()[0]['id']
            print(f"[DEBUG] Found contact ID: {contact_id} for email: {email}")
            return contact_id
    except Exception as e:
        print(f"[DEBUG] Exception during contact lookup: {e}")
    # If not found, create contact
    payload = {
        'email': email,
        'company': {'identifier': company_identifier} if company_identifier else None,
        'firstName': email.split('@')[0],
        'lastName': '',
    }
    payload = {k: v for k, v in payload.items() if v is not None}
    try:
        print(f"[DEBUG] Creating contact with payload: {payload}")
        resp = requests.post(base_url, headers=headers, json=payload, timeout=10)
        print(f"[DEBUG] Contact creation status: {resp.status_code}")
        print(f"[DEBUG] Contact creation response: {resp.text}")
        if resp.status_code in (200, 201):
            contact_id = resp.json()['id']
            print(f"[DEBUG] Created contact ID: {contact_id} for email: {email}")
            return contact_id
    except Exception as e:
        print(f"[DEBUG] Exception during contact creation: {e}")
    print(f"[DEBUG] Could not find or create contact for email: {email}")
    return None

def create_connectwise_ticket(form_data, user):
    print("[DEBUG] create_connectwise_ticket called for user:", user.email)
    print("[DEBUG] form_data:", form_data)
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
    if summary == 'New User Setup':
        summary = f"New User Setup - {user.get_full_name() or user.username or user.email}"
    else:
        summary = f"{summary} - {user.get_full_name() or user.username or user.email}"
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
    # Build formatted note/message
    submitter_name = user.get_full_name() or user.username or user.email
    issue_request = form_data['description'] or 'No description provided.'
    onsite_or_remote = form_data.get('onsite_or_remote', 'N/A')
    # Markdown for ConnectWise
    note_markdown = f"**Submitted By:** {submitter_name}\n\n**Issue/Request:** {issue_request}\n\n---\n\n**On-site or Remote:** {onsite_or_remote}"
    # HTML for portal
    note_html = f"<strong>Submitted By:</strong> {submitter_name}<br><strong>Issue/Request:</strong> {issue_request}<hr style='margin:8px 0;'><strong>On-site or Remote:</strong> {onsite_or_remote}"
    description = note_markdown
    # For portal ticket description, use a short label
    portal_ticket_description = f"New User Setup for {issue_request.split('for')[-1].strip()}" if 'new user setup' in issue_request.lower() else form_data['request_type']
    # Board/item/status mapping
    REQUEST_TYPE_TO_ITEM = {
        'Technical Issue': 'Software / Drivers',
        'Password Reset': 'Outlook',
        'Software Installation': 'Software / Drivers',
        'Hardware Problem': 'Hardware - Other',
        'Network Issue': 'Network Connectivity',
        'General Inquiry': 'Information',
        'Other': 'Information',
        'New User Setup': 'New User',
    }
    # Valid subtypes for Help Desk (MS)
    HELPDESK_SUBTYPES = [
        'Account Managment',
        'Backup (BDR) Appliance',
        'Battery Replacement',
        'Email',
        'Internet',
        'Laptop / Workstation',
        'Network',
        'Phone System',
        'Printer Setup',
        'Security',
        'Server',
        'Software',
        'Spec New Equipment',
        'Subscription Mgmt',
    ]
    # Map request_type to valid subType for Help Desk (MS)
    REQUEST_TYPE_TO_SUBTYPE = {
        'Technical Issue': 'Software',
        'Password Reset': 'Email',
        'Software Installation': 'Software',
        'Hardware Problem': 'Laptop / Workstation',
        'Network Issue': 'Network',
        'General Inquiry': 'Email',
        'Other': 'Email',
        'New User Setup': 'Account Managment',
    }
    # Board/type mapping based on request type
    INCIDENT_TYPES = [
        'Technical Issue',
        'Password Reset',
        'Software Installation',
        'Hardware Problem',
        'Network Issue',
    ]
    if form_data.get('request_type') in INCIDENT_TYPES:
        board = 'Help Desk (MS)'
        ticket_type = 'Incident'
    else:
        board = 'Implementation (MS)'
        ticket_type = 'Request'
    item = REQUEST_TYPE_TO_ITEM.get(form_data.get('request_type'), 'Software / Drivers')
    status = 'Needs Worked'
    # Priority mapping (as before)
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
    priority = PRIORITY_MAP.get(form_data.get('priority'), 'Priority 3 - Medium')
    # Determine subType
    if board == 'Help Desk (MS)':
        subtype = REQUEST_TYPE_TO_SUBTYPE.get(form_data.get('request_type'), 'Email')
        if subtype not in HELPDESK_SUBTYPES:
            subtype = 'Email'
    elif board == 'Implementation (MS)':
        subtype = 'Account Managment'
    else:
        subtype = item
    # Build payload
    payload = {
        "summary": summary,
        "board": {"name": board},
        "status": {"name": status},
        "type": {"name": ticket_type},
        "item": {"name": item},
        "priority": {"name": priority},
        "source": {"name": "Portal"},
        "contact": {"id": contact_id},
        "contactEmailAddress": contact_email,
        "contactName": user.get_full_name() or user.username,
        "company": {"identifier": company_identifier} if company_identifier else None,
        "site": None,
        "initialDescription": description,
    }
    if subtype:
        payload["subType"] = {"name": subtype}
    payload = {k: v for k, v in payload.items() if v is not None}
    print("[DEBUG] Submitting ConnectWise ticket with payload:", payload)
    try:
        resp = requests.post(base_url, headers=headers, json=payload, timeout=30)
        print("[DEBUG] ConnectWise response status:", resp.status_code)
        print("[DEBUG] ConnectWise response text:", resp.text)
        if resp.status_code in (200, 201):
            print("[DEBUG] Ticket created successfully.")
            return resp.json()
        else:
            print("[ERROR] ConnectWise ticket creation failed:", resp.status_code, resp.text)
    except Exception as e:
        print("[ERROR] ConnectWise ticket creation error:", e)
        traceback.print_exc()
    print("[DEBUG] create_connectwise_ticket finished for user:", user.email)
    return None

def test_connectwise_fetch_by_email(email):
    """Standalone test for ConnectWise ticket fetch by email (no Django ORM)."""
    import os
    from django.conf import settings
    import requests
    import base64
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
    params = {
        'conditions': f"contactEmail='{email}'",
        'orderBy': 'dateEntered desc',
        'pageSize': 10,
    }
    try:
        resp = requests.get(base_url, headers=headers, params=params, timeout=30)
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
    import base64
    # Step 1: Look up contact by email
    contacts_url = f"{settings.CONNECTWISE_SITE}/v4_6_release/apis/3.0/company/contacts"
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
        resp = requests.get(tickets_url, headers=headers, params=params, timeout=30)
        print('[DEBUG] Ticket fetch status:', resp.status_code)
        print('[DEBUG] Ticket fetch response:', resp.text)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        print('[DEBUG] Ticket fetch error:', e)
    return [] 

def debug_list_board_statuses_and_items(board_name="Help Desk (MS)"):
    """Fetch and print all valid statuses and items for a given board name from ConnectWise."""
    from django.conf import settings
    import requests
    import base64
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
    # 1. Get all boards, find the board ID for the given name
    boards_url = f"{settings.CONNECTWISE_SITE}/v4_6_release/apis/3.0/service/boards"
    resp = requests.get(boards_url, headers=headers, timeout=30)
    boards = resp.json()
    board_id = None
    for b in boards:
        if b.get('name') == board_name:
            board_id = b.get('id')
            break
    if not board_id:
        print(f"[DEBUG] Board '{board_name}' not found.")
        return
    # 2. Get statuses
    statuses_url = f"{settings.CONNECTWISE_SITE}/v4_6_release/apis/3.0/service/boards/{board_id}/statuses"
    resp = requests.get(statuses_url, headers=headers, timeout=30)
    print(f"[DEBUG] Statuses for board '{board_name}':")
    for s in resp.json():
        print("-", s.get('name'))
    # 3. Get items
    items_url = f"{settings.CONNECTWISE_SITE}/v4_6_release/apis/3.0/service/boards/{board_id}/items"
    resp = requests.get(items_url, headers=headers, timeout=30)
    print(f"[DEBUG] Items for board '{board_name}':")
    for i in resp.json():
        print("-", i.get('name')) 

def get_connectwise_ticket_notes(ticket_id):
    """
    Fetch all notes/discussions for a ConnectWise ticket by ID.
    Returns a list of note dicts.
    """
    base_url = f"{settings.CONNECTWISE_SITE}/v4_6_release/apis/3.0/service/tickets/{ticket_id}/allNotes"
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
    try:
        resp = requests.get(base_url, headers=headers, timeout=15)
        print(f"[DEBUG] get_connectwise_ticket_notes API status: {resp.status_code}")
        print(f"[DEBUG] get_connectwise_ticket_notes API response: {resp.text}")
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        print(f"[DEBUG] Exception fetching notes for ticket {ticket_id}: {e}")
    return []

def post_connectwise_ticket_note(ticket_id, text, user_name=None):
    """
    Post a note (reply) to a ConnectWise ticket by ID.
    Returns the API response dict or None.
    """
    base_url = f"{settings.CONNECTWISE_SITE}/v4_6_release/apis/3.0/service/tickets/{ticket_id}/notes"
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
    payload = {
        'text': text,
        'detailDescriptionFlag': True,
        'internalAnalysisFlag': False,
        'resolutionFlag': False,
        'customerUpdatedFlag': True,
    }
    # Do NOT include 'enteredBy' in the payload; ConnectWise sets this automatically
    try:
        resp = requests.post(base_url, headers=headers, json=payload, timeout=15)
        if resp.status_code in (200, 201):
            return resp.json()
        else:
            print(f"[DEBUG] Failed to post note: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f"[DEBUG] Exception posting note for ticket {ticket_id}: {e}")
    return None 

def get_connectwise_ticket(ticket_id):
    """
    Fetch a single ConnectWise ticket by ID.
    Returns a ticket dict or None.
    """
    base_url = f"{settings.CONNECTWISE_SITE}/v4_6_release/apis/3.0/service/tickets/{ticket_id}"
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
    try:
        resp = requests.get(base_url, headers=headers, timeout=15)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        print(f"[DEBUG] Exception fetching ticket {ticket_id}: {e}")
    return None 

def split_ticket_notes(notes):
    """
    Split notes into 'discussion' (customer-facing) and 'internal' (technician-only).
    Returns a dict with 'discussion' and 'internal' lists.
    """
    discussion = [n for n in notes if not n.get('internalAnalysisFlag') and not n.get('resolutionFlag')]
    internal = [n for n in notes if n.get('internalAnalysisFlag') or n.get('resolutionFlag')]
    
    # Debug logging
    print(f"[DEBUG] split_ticket_notes: Total notes: {len(notes)}")
    print(f"[DEBUG] split_ticket_notes: Discussion notes: {len(discussion)}")
    print(f"[DEBUG] split_ticket_notes: Internal notes: {len(internal)}")
    
    for i, note in enumerate(notes):
        print(f"[DEBUG] Note {i}: internalAnalysisFlag={note.get('internalAnalysisFlag')}, resolutionFlag={note.get('resolutionFlag')}, enteredBy={note.get('enteredBy')}")
    
    return {'discussion': discussion, 'internal': internal} 