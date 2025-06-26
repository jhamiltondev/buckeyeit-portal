from django.contrib import admin
from .models import User, Tenant, Announcement, Ticket, KnowledgeBaseCategory, KnowledgeBaseArticle, TenantDocument
from import_export.admin import ImportExportModelAdmin

class UserInline(admin.TabularInline):
    model = User
    extra = 0

class TenantDocumentInline(admin.TabularInline):
    model = TenantDocument
    extra = 0
    readonly_fields = ('uploaded_at', 'uploaded_by')

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    inlines = [UserInline, TenantDocumentInline]
    list_display = ('name', 'slug', 'vip', 'domain', 'created_at', 'renewal_date')
    search_fields = ('name', 'slug', 'domain')
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

@admin.register(User)
class UserAdmin(ImportExportModelAdmin):
    list_display = ('username', 'email', 'is_active', 'is_staff', 'tenant')
    search_fields = ('username', 'email')
    list_filter = ('is_active', 'is_staff', 'tenant')

# Register social account models
# admin.site.register(SocialApp)
# admin.site.register(SocialAccount)
# admin.site.register(SocialToken)

admin.site.register(Announcement)
admin.site.register(Ticket)
admin.site.register(KnowledgeBaseCategory)
admin.site.register(KnowledgeBaseArticle)
admin.site.register(TenantDocument)
