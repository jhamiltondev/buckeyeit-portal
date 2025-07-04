from django.urls import path
from . import views
from .views import AdminLoginView, AdminLogoutView

app_name = 'adminpanel'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    # Users
    path('users/active/', views.users_active, name='users_active'),
    path('users/<int:user_id>/details/', views.user_details, name='user_details'),
    path('users/<int:user_id>/edit/', views.edit_user, name='edit_user'),
    path('users/<int:user_id>/delete/', views.delete_user, name='delete_user'),
    path('users/<int:user_id>/disable/', views.disable_user, name='disable_user'),
    path('users/pending/', views.users_pending, name='users_pending'),
    path('users/invitations/', views.users_invitations, name='users_invitations'),
    path('users/groups/', views.groups, name='groups'),
    path('users/deactivated/', views.users_deactivated, name='users_deactivated'),
    path('users/audit/', views.users_audit, name='users_audit'),
    path('users/pending/<int:approval_id>/approve/', views.approve_pending_user, name='approve_pending_user'),
    path('users/pending/<int:approval_id>/deny/', views.deny_pending_user, name='deny_pending_user'),
    path('users/pending/<int:approval_id>/details/', views.pending_user_details, name='pending_user_details'),
    path('users/invitations/create/', views.create_invitation, name='create_invitation'),
    path('users/invitations/<int:invitation_id>/resend/', views.resend_invitation, name='resend_invitation'),
    path('users/invitations/<int:invitation_id>/revoke/', views.revoke_invitation, name='revoke_invitation'),
    path('users/invitations/<int:invitation_id>/edit/', views.edit_invitation, name='edit_invitation'),
    path('users/invitations/<int:invitation_id>/view/', views.view_invitation, name='view_invitation'),
    path('users/invitations/export/', views.export_invitations_csv, name='export_invitations_csv'),
    # Tenants
    path('tenants/', views.tenants, name='tenants'),
    path('tenants/documents/', views.tenant_documents, name='tenant_documents'),
    path('tenants/settings/', views.tenant_settings, name='tenant_settings'),
    path('tenants/activity/', views.tenant_activity, name='tenant_activity'),
    path('tenants/customization/', views.tenant_customization, name='tenant_customization'),
    path('tenants/staff/', views.tenant_staff, name='tenant_staff'),
    path('tenants/automation/', views.tenant_automation, name='tenant_automation'),
    # Knowledge Base
    path('kb/articles/', views.kb_articles, name='kb_articles'),
    path('kb/categories/', views.kb_categories, name='kb_categories'),
    path('kb/feedback/', views.kb_feedback, name='kb_feedback'),
    path('kb/drafts/', views.kb_drafts, name='kb_drafts'),
    path('kb/suggested/', views.kb_suggested, name='kb_suggested'),
    # Support
    path('support/tickets/', views.tickets, name='tickets'),
    path('support/announcements/', views.announcements, name='announcements'),
    path('support/service-health/', views.service_health, name='service_health'),
    # Admin Center
    path('admin/platform-settings/', views.platform_settings, name='platform_settings'),
    path('admin/social-identity/', views.social_identity, name='social_identity'),
    path('admin/api-integration/', views.api_integration, name='api_integration'),
    path('admin/audit-logs/', views.audit_logs, name='audit_logs'),
    path('admin/role-manager/', views.role_manager, name='role_manager'),
    path('admin/system-health/', views.system_health, name='system_health'),
    path('api/dashboard-stats/', views.api_dashboard_stats, name='api_dashboard_stats'),
    path('api/users/', views.api_users, name='api_users'),
    path('api/tenants/', views.api_tenants, name='api_tenants'),
    path('login/', AdminLoginView.as_view(), name='login'),
    path('logout/', AdminLogoutView.as_view(), name='logout'),
] 