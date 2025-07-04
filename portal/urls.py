from django.urls import path, include
from . import views
from django.contrib.auth import views as auth_views
from .views import LogoutViewAllowGet, logout_allow_get, dashboard, login_view, password_view, root_redirect, debug_urls, support_view, submit_ticket_view, knowledge_base_view, knowledge_article_view, profile_view, company_info_view, announcements_view, all_tickets_view, connectwise_ticket_detail, debug_tech_news, notifications_api, dashboard_tickets_api, dashboard_tech_news_api, dashboard_announcements_api, support_tickets_api, api_announcements_list, status_proxy, dashboard_ticket_summary_api, security_center_api, api_knowledge_base_articles, RoleViewSet, UserGroupViewSet, api_suspended_users, api_deleted_users, api_restore_user, api_permanent_delete_user
from rest_framework.routers import DefaultRouter

app_name = 'portal'

router = DefaultRouter()
router.register(r'user-groups', UserGroupViewSet, basename='usergroup')
router.register(r'roles', RoleViewSet, basename='role')

urlpatterns = [
    # Only keep API endpoints and adminpanel/admin routes
    # Remove or comment out all routes that serve Django templates for the main portal
    # path('', views.dashboard, name='dashboard'),
    # path('login/', views.login_view, name='login'),
    # path('password/', views.password_view, name='password'),
    # path('logout/', logout_allow_get, name='logout'),
    # path('.auth/logout', logout_allow_get),
    # path('dashboard/', views.dashboard, name='dashboard'),
    # path('<slug:tenant_slug>/dashboard/', views.dashboard, name='tenant_dashboard'),
    # path('debug-urls/', views.debug_urls),
    # path('support/', views.support_view, name='support'),
    # path('support/submit/', views.submit_ticket_view, name='submit_ticket'),
    # path('knowledge/', views.knowledge_base_view, name='knowledge_base'),
    # path('knowledge/article/<int:article_id>/', views.knowledge_article_view, name='knowledge_article'),
    # path('profile/', views.profile_view, name='profile'),
    # path('company-info/', company_info_view, name='company_info'),
    # path('announcements/', announcements_view, name='announcements'),
    # path('support/all/', views.all_tickets_view, name='all_tickets'),
    # path('support/ticket/<int:ticket_id>/', views.connectwise_ticket_detail, name='connectwise_ticket_detail'),
    # path('tickets/', all_tickets_view, name='all_tickets'),
    # path('tickets/<int:ticket_id>/', connectwise_ticket_detail, name='connectwise_ticket_detail'),
    # path('debug/tech-news/', debug_tech_news, name='debug_tech_news'),
    # path('support/thank-you/<int:ticket_id>/', views.ticket_thank_you_view, name='ticket_thank_you'),
    # Only keep API endpoints below
    path('api/notifications/', notifications_api, name='notifications_api'),
    path('api/dashboard/tickets/', dashboard_tickets_api, name='dashboard_tickets_api'),
    path('api/dashboard/tech-news/', dashboard_tech_news_api, name='dashboard_tech_news_api'),
    path('api/dashboard/announcements/', dashboard_announcements_api, name='dashboard_announcements_api'),
    path('api/support/tickets/', support_tickets_api, name='support_tickets_api'),
    path('api/notifications/clear/', views.notifications_clear_api, name='notifications_clear_api'),
    path('api/announcements/', api_announcements_list, name='api_announcements_list'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/logout/', views.api_logout, name='api_logout'),
    path('api/user/', views.api_user, name='api_user'),
    path('api/user/update/', views.api_user_update, name='api_user_update'),
    path('api/status/', status_proxy, name='status-proxy'),
    path('api/dashboard_ticket_summary/', dashboard_ticket_summary_api, name='dashboard-ticket-summary'),
    path('api/security_center/', security_center_api, name='security-center'),
    path('api/knowledge_base_articles/', api_knowledge_base_articles, name='api_knowledge_base_articles'),
    path('api/company_info/', views.api_company_info, name='api_company_info'),
    path('api/log-frontend/', views.api_frontend_log, name='api_frontend_log'),
    path('api/', include(router.urls)),
    path('api/users/suspended/', api_suspended_users, name='api_suspended_users'),
    path('api/users/deleted/', api_deleted_users, name='api_deleted_users'),
    path('api/users/<int:user_id>/restore/', api_restore_user, name='api_restore_user'),
    path('api/users/<int:user_id>/permanent_delete/', api_permanent_delete_user, name='api_permanent_delete_user'),
] 