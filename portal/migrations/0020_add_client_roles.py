from django.db import migrations

def add_client_roles(apps, schema_editor):
    Role = apps.get_model('portal', 'Role')
    client_roles = [
        ('Standard User', 'Can view own tickets, company info, KB, announcements. Can create tickets.'),
        ('Point of Contact', 'Can manage all tickets for tenant, update company info, invite/request users.'),
        ('Billing Contact', 'Can view invoices, payment history, billing info, update billing details.'),
        ('VIP User', 'Gets priority support, can escalate tickets, see special announcements.'),
        ('Suspended/Inactive', 'Cannot log in or access the portal.'),
    ]
    for name, desc in client_roles:
        Role.objects.get_or_create(name=name, defaults={'description': desc, 'type': 'client'})

class Migration(migrations.Migration):
    dependencies = [
        ('portal', '0019_role_type'),
    ]
    operations = [
        migrations.RunPython(add_client_roles),
    ] 