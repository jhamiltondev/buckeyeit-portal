from django.contrib import admin
from .models import User, Tenant, Announcement, Ticket, KnowledgeBaseCategory, KnowledgeBaseArticle
from import_export.admin import ImportExportModelAdmin

class UserInline(admin.TabularInline):
    model = User
    extra = 0

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    inlines = [UserInline]
    list_display = ('name', 'slug', 'vip', 'domain')
    search_fields = ('name', 'slug', 'domain')
    fields = ('name', 'slug', 'vip')
    prepopulated_fields = {"slug": ("name",)}

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
