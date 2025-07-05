from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.conf import settings
from django.utils import timezone

# Create your models here.

class Tenant(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    vip = models.BooleanField(default=False, help_text="Check if this tenant is VIP and should see automated features.")
    domain = models.CharField(max_length=100, unique=True, blank=True, null=True, help_text="Primary email domain for auto-assignment, e.g. 'reedminerals.com'")
    # Company Info fields
    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='tenant_logos/', blank=True, null=True)
    main_poc_name = models.CharField(max_length=100, blank=True, help_text="Main point of contact name")
    main_poc_email = models.EmailField(blank=True, help_text="Main point of contact email")
    renewal_date = models.DateField(blank=True, null=True, help_text="Renewal or service review date")
    users = models.ManyToManyField('portal.User', blank=True, related_name='tenants')
    groups = models.ManyToManyField(Group, blank=True, related_name='tenants')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class User(AbstractUser):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, null=True, blank=True)
    support_role = models.CharField(max_length=100, blank=True, help_text="Optional support role, e.g. 'Password Resets', 'Billing Contact'")
    phone = models.CharField(max_length=50, blank=True)
    avatar = models.ImageField(upload_to='user_avatars/', blank=True, null=True)
    # Suspension/Deletion fields:
    is_deleted = models.BooleanField(default=False)
    suspended_at = models.DateTimeField(null=True, blank=True)
    suspended_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, related_name='suspended_users', on_delete=models.SET_NULL)
    suspension_reason = models.TextField(blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, related_name='deleted_users', on_delete=models.SET_NULL)
    deletion_reason = models.TextField(blank=True)

    def has_role(self, role_name):
        """Check if the user has a given role via their user groups."""
        return self.user_groups.filter(roles__name=role_name).exists()  # type: ignore[attr-defined]

class Announcement(models.Model):
    CATEGORY_CHOICES = [
        ('general', 'General'),
        ('maintenance', 'Maintenance'),
        ('tips', 'Tips'),
    ]
    title = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    pinned = models.BooleanField(default=False, help_text="Pin this announcement to the top for all tenants.")
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES, default='general')
    author = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True)
    # Optionally, add tenant = models.ForeignKey(Tenant, ...) for tenant-specific announcements

    def __str__(self):
        return self.title

class Ticket(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, null=True, blank=True)
    subject = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.subject} ({self.get_status_display()})"

class KnowledgeBaseCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Font Awesome icon class, e.g. 'fa-envelope'")

    def __str__(self):
        return self.name

class KnowledgeBaseArticle(models.Model):
    category = models.ForeignKey(KnowledgeBaseCategory, on_delete=models.CASCADE, related_name='articles')
    title = models.CharField(max_length=200)
    content = models.TextField()
    view_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    thumbnail = models.ImageField(upload_to='kb_thumbnails/', null=True, blank=True, help_text='Optional thumbnail image for this article')

    def __str__(self):
        return self.title

# Tenant-specific document uploads
class TenantDocument(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='tenant_docs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.title} ({self.tenant.name})"

class PendingUserApproval(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('denied', 'Denied'),
        ('expired', 'Expired'),
    ]
    name = models.CharField(max_length=150)
    email = models.EmailField()
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='pending_approvals')
    role_requested = models.CharField(max_length=50)
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approvals_requested')
    submitted_on = models.DateTimeField(auto_now_add=True)
    justification = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    metadata = models.JSONField(blank=True, null=True, help_text='Optional: store form/automation metadata')

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.role_requested} [{self.status}]"

class TicketStatusSeen(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    ticket_id = models.IntegerField()
    last_status_id = models.IntegerField()
    last_status_name = models.CharField(max_length=128)
    last_checked = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('user', 'ticket_id')

class UserInvitation(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('redeemed', 'Redeemed'),
        ('expired', 'Expired'),
        ('revoked', 'Revoked'),
    )
    name = models.CharField(max_length=150, blank=True)
    email = models.EmailField()
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='invitations')
    role_assigned = models.CharField(max_length=50)
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='invitations_sent')
    date_sent = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    redeemed_on = models.DateTimeField(null=True, blank=True)
    token = models.CharField(max_length=64, unique=True)
    expiration_date = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(blank=True, null=True, help_text='Optional: store invite metadata, e.g. IP, user agent, etc.')

    def __str__(self):
        return f"{self.email} ({self.get_status_display()}) - {self.tenant.name}"

    def get_status_display(self):
        return dict(UserInvitation.STATUS_CHOICES).get(str(self.status), self.status)

class Role(models.Model):
    ROLE_TYPE_CHOICES = [
        ('admin', 'Admin Center'),
        ('client', 'Client Portal'),
    ]
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=16, choices=ROLE_TYPE_CHOICES, default='admin', help_text='Role scope: admin or client')

    def __str__(self):
        return self.name

class UserGroup(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_default = models.BooleanField(default=False, help_text="If true, all new users are added to this group.")
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    roles = models.ManyToManyField(Role, blank=True)
    users = models.ManyToManyField('portal.User', blank=True, related_name="user_groups")
    created_by = models.ForeignKey('portal.User', related_name="created_groups", on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
