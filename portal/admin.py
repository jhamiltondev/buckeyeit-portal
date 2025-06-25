from django.contrib import admin
from .models import User, Tenant
from import_export.admin import ImportExportModelAdmin

class UserInline(admin.TabularInline):
    model = User
    extra = 0

@admin.register(Tenant)
class TenantAdmin(ImportExportModelAdmin):
    inlines = [UserInline]
    list_display = ('name', 'created_at')
    search_fields = ('name',)

@admin.register(User)
class UserAdmin(ImportExportModelAdmin):
    list_display = ('username', 'email', 'is_active', 'is_staff', 'tenant')
    search_fields = ('username', 'email')
    list_filter = ('is_active', 'is_staff', 'tenant')

# Register social account models
# admin.site.register(SocialApp)
# admin.site.register(SocialAccount)
# admin.site.register(SocialToken)
