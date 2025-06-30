from django.contrib import admin
from .models import User, Tenant, Announcement, Ticket, KnowledgeBaseCategory, KnowledgeBaseArticle, TenantDocument
from import_export.admin import ImportExportModelAdmin

class UserInline(admin.TabularInline):
    model = User
    extra = 1
    fields = ('first_name', 'last_name', 'email')
    readonly_fields = ()
    show_change_link = True
    can_delete = True
    verbose_name = 'User'
    verbose_name_plural = 'Users'

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
