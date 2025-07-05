from django.db import migrations

def seed_core_roles(apps, schema_editor):
    Role = apps.get_model('portal', 'Role')
    core_roles = [
        ('Super Admin', 'Full access to everything, can manage other admins and roles, enable/disable features.'),
        ('Tenant Admin', 'Full control over their assigned tenant, cannot see or affect other tenants.'),
        ('Support Agent', 'Can view/respond to tickets, add notes, limited user/logs visibility.'),
        ('Content Manager', 'Can manage KB, announcements, roadmap. No access to users, settings, or tickets.'),
        ('Auditor', 'Read-only access to all logs, settings, dashboards.'),
        ('Automation Manager', 'Manages automation scripts, integrations, platform syncs. No user/content management.'),
    ]
    for name, desc in core_roles:
        Role.objects.get_or_create(name=name, defaults={'description': desc})

class Migration(migrations.Migration):
    dependencies = [
        ('portal', '0017_user_deleted_at_user_deleted_by_user_deletion_reason_and_more'),
    ]
    operations = [
        migrations.RunPython(seed_core_roles),
    ] 