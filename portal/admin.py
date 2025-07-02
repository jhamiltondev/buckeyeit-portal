from django.contrib import admin
from .models import User, Tenant, Announcement, Ticket, KnowledgeBaseCategory, KnowledgeBaseArticle, TenantDocument, PendingUserApproval, UserInvitation
from import_export.admin import ImportExportModelAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.admin.sites import NotRegistered
from django import forms
from django.contrib.auth.forms import UserCreationForm
import secrets
from django.utils import timezone
from .email_utils import send_invitation_email

class TenantDocumentInline(admin.TabularInline):
    model = TenantDocument
    extra = 0
    readonly_fields = ('uploaded_at', 'uploaded_by')

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    inlines = [TenantDocumentInline]
    list_display = ('name', 'slug', 'vip', 'domain', 'created_at', 'renewal_date', 'main_poc_email')
    search_fields = ('name', 'slug', 'domain')
    autocomplete_fields = ['users', 'groups']
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'vip', 'domain', 'created_at', 'renewal_date')
        }),
        ('Company Info', {
            'fields': ('address', 'phone', 'website', 'logo', 'main_poc_name', 'main_poc_email')
        }),
    )
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ('created_at',)

class UserAdminCreationForm(UserCreationForm):
    send_invite = forms.BooleanField(required=False, label="Send invitation email")
    class Meta:
        model = User
        fields = ('username', 'email', 'tenant', 'send_invite')

class CustomUserAdmin(BaseUserAdmin):
    add_form = UserAdminCreationForm
    search_fields = ['username', 'email', 'first_name', 'last_name']
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'tenant', 'password1', 'password2', 'send_invite'),
        }),
    )
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if not change and form.cleaned_data.get('send_invite'):
            token = secrets.token_urlsafe(32)
            invite = UserInvitation.objects.create(
                name=f"{obj.first_name} {obj.last_name}".strip(),
                email=obj.email,
                tenant=obj.tenant,
                role_assigned='Admin',
                invited_by=request.user,
                token=token,
                status='pending',
                date_sent=timezone.now(),
            )
            try:
                send_invitation_email(obj.email, token, tenant_name=obj.tenant.name, role='Admin')
            except Exception as e:
                # Optionally log or show admin error
                pass

try:
    admin.site.unregister(User)
except NotRegistered:
    pass
admin.site.register(User, CustomUserAdmin)

# Register social account models
# admin.site.register(SocialApp)
# admin.site.register(SocialAccount)
# admin.site.register(SocialToken)

class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'pinned', 'created_at', 'author', 'is_active')
    list_filter = ('category', 'pinned', 'is_active')
    search_fields = ('title', 'message')
    fields = ('title', 'message', 'category', 'pinned', 'is_active', 'author')
    readonly_fields = ('created_at',)
    def save_model(self, request, obj, form, change):
        if not obj.author:
            obj.author = request.user
        super().save_model(request, obj, form, change)

admin.site.register(Announcement, AnnouncementAdmin)

admin.site.register(Ticket)
admin.site.register(KnowledgeBaseCategory)

class KnowledgeBaseArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'view_count', 'is_active', 'created_at', 'thumbnail')
    list_filter = ('category', 'is_active')
    search_fields = ('title', 'content')
    fields = ('title', 'category', 'content', 'thumbnail', 'is_active')
    readonly_fields = ('view_count', 'created_at', 'updated_at')

admin.site.register(KnowledgeBaseArticle, KnowledgeBaseArticleAdmin)

admin.site.register(TenantDocument)

try:
    from allauth.account.models import EmailAddress
    admin.site.unregister(EmailAddress)
except Exception:
    pass

@admin.register(PendingUserApproval)
class PendingUserApprovalAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'tenant', 'role_requested', 'requested_by', 'submitted_on', 'status')
    list_filter = ('status', 'tenant', 'role_requested', 'submitted_on')
    search_fields = ('name', 'email', 'requested_by__username', 'tenant__name')
    actions = ['approve_selected', 'deny_selected']

    def approve_selected(self, request, queryset):
        updated = queryset.update(status='approved')
        self.message_user(request, f"{updated} request(s) approved.")
    approve_selected.short_description = "Approve selected requests"

    def deny_selected(self, request, queryset):
        updated = queryset.update(status='denied')
        self.message_user(request, f"{updated} request(s) denied.")
    deny_selected.short_description = "Deny selected requests"

@admin.register(UserInvitation)
class UserInvitationAdmin(admin.ModelAdmin):
    list_display = ('email', 'tenant', 'role_assigned', 'date_sent', 'status', 'redeemed_on', 'invited_by')
    search_fields = ('email', 'name')
    list_filter = ('tenant', 'status', 'date_sent')
    actions = ['resend_invite', 'revoke_invite']

    def resend_invite(self, request, queryset):
        # Placeholder for resend logic
        self.message_user(request, f"Resent {queryset.count()} invites.")
    resend_invite.short_description = "Resend selected invitations"

    def revoke_invite(self, request, queryset):
        updated = queryset.update(status='revoked')
        self.message_user(request, f"Revoked {updated} invites.")
    revoke_invite.short_description = "Revoke selected invitations"
