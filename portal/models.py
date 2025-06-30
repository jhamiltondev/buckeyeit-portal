from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify

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

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class User(AbstractUser):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, null=True, blank=True)
    support_role = models.CharField(max_length=100, blank=True, help_text="Optional support role, e.g. 'Password Resets', 'Billing Contact'")

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
