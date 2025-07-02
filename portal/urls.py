from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
from .views import LogoutViewAllowGet, logout_allow_get, dashboard, login_view, password_view, root_redirect, debug_urls, support_view, submit_ticket_view, knowledge_base_view, knowledge_article_view, profile_view, company_info_view, announcements_view, all_tickets_view, connectwise_ticket_detail, debug_tech_news, notifications_api, dashboard_tickets_api, dashboard_tech_news_api, dashboard_announcements_api, support_tickets_api

app_name = 'portal'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('login/', views.login_view, name='login'),
    path('password/', views.password_view, name='password'),
    path('logout/', logout_allow_get, name='logout'),
    path('.auth/logout', logout_allow_get),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('<slug:tenant_slug>/dashboard/', views.dashboard, name='tenant_dashboard'),
    path('debug-urls/', views.debug_urls),
    path('support/', views.support_view, name='support'),
    path('support/submit/', views.submit_ticket_view, name='submit_ticket'),
    path('knowledge/', views.knowledge_base_view, name='knowledge_base'),
    path('knowledge/article/<int:article_id>/', views.knowledge_article_view, name='knowledge_article'),
    path('profile/', views.profile_view, name='profile'),
    path('company-info/', company_info_view, name='company_info'),
    path('announcements/', announcements_view, name='announcements'),
    path('support/all/', views.all_tickets_view, name='all_tickets'),
    path('support/ticket/<int:ticket_id>/', views.connectwise_ticket_detail, name='connectwise_ticket_detail'),
    path('tickets/', all_tickets_view, name='all_tickets'),
    path('tickets/<int:ticket_id>/', connectwise_ticket_detail, name='connectwise_ticket_detail'),
    path('debug/tech-news/', debug_tech_news, name='debug_tech_news'),
    path('api/notifications/', notifications_api, name='notifications_api'),
    path('api/dashboard/tickets/', dashboard_tickets_api, name='dashboard_tickets_api'),
    path('api/dashboard/tech-news/', dashboard_tech_news_api, name='dashboard_tech_news_api'),
    path('api/dashboard/announcements/', dashboard_announcements_api, name='dashboard_announcements_api'),
    path('api/support/tickets/', support_tickets_api, name='support_tickets_api'),
    path('support/thank-you/<int:ticket_id>/', views.ticket_thank_you_view, name='ticket_thank_you'),
    path('api/notifications/clear/', views.notifications_clear_api, name='notifications_clear_api'),
] 