from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_invitation_email(email, token, tenant_name=None, role=None):
    portal_domain = getattr(settings, 'PORTAL_DOMAIN', 'https://portal.buckeyeit.com')
    registration_url = f"{portal_domain}/register/?token={token}"
    subject = f"You're invited to join {tenant_name or 'Buckeye IT Portal'}"
    html_content = render_to_string('portal/email/invitation_email.html', {
        'registration_url': registration_url,
        'tenant_name': tenant_name or 'Buckeye IT',
        'role': role or 'User',
    })
    text_content = strip_tags(html_content)
    send_mail(
        subject,
        text_content,
        getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@buckeyeit.com'),
        [email],
        html_message=html_content,
        fail_silently=False,
    ) 