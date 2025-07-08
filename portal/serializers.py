from rest_framework import serializers
from .models import Announcement, KnowledgeBaseArticle, Role, UserGroup, Tenant, User, UserAuditLog, KnowledgeBaseCategory
 
class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'message', 'created_at', 'is_active', 'pinned', 'category', 'author']

class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'is_active']

class KnowledgeBaseCategorySerializer(serializers.ModelSerializer):
    article_count = serializers.SerializerMethodField()
    
    class Meta:
        model = KnowledgeBaseCategory
        fields = [
            'id', 'name', 'description', 'icon', 'visibility', 
            'created_at', 'updated_at', 'article_count'
        ]
    
    def get_article_count(self, obj):
        return obj.article_count

class KnowledgeBaseArticleSerializer(serializers.ModelSerializer):
    author = UserSummarySerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = KnowledgeBaseArticle
        fields = [
            'id', 'title', 'excerpt', 'content', 'category', 'category_name', 
            'status', 'author', 'view_count', 'is_active', 'created_at', 'updated_at'
        ]

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']

class TenantSerializer(serializers.ModelSerializer):
    user_count = serializers.SerializerMethodField()
    ticket_count = serializers.SerializerMethodField()
    account_manager = UserSummarySerializer(read_only=True)
    suspended_by = UserSummarySerializer(read_only=True)
    deleted_by = UserSummarySerializer(read_only=True)
    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'domain', 'main_poc_name', 'main_poc_email',
            'status', 'industry', 'created_at', 'user_count', 'ticket_count',
            'vip', 'vip_level', 'account_manager', 'priority_notes',
            'is_deleted', 'suspended_at', 'suspended_by', 'suspension_reason',
            'deleted_at', 'deleted_by', 'deletion_reason'
        ]
    def get_user_count(self, obj):
        return obj.users.count()
    def get_ticket_count(self, obj):
        return obj.ticket_set.count() if hasattr(obj, 'ticket_set') else 0

class UserGroupSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
    users = UserSummarySerializer(many=True, read_only=True)
    tenant = TenantSerializer(read_only=True)
    class Meta:
        model = UserGroup
        fields = [
            'id', 'name', 'description', 'is_default', 'tenant',
            'roles', 'users', 'created_at', 'updated_at'
        ]

class SuspendedDeletedUserSerializer(serializers.ModelSerializer):
    tenant = TenantSerializer(read_only=True)
    suspended_by = UserSummarySerializer(read_only=True)
    deleted_by = UserSummarySerializer(read_only=True)
    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'email', 'support_role', 'tenant', 'is_active', 'is_deleted',
            'suspended_at', 'suspended_by', 'suspension_reason',
            'deleted_at', 'deleted_by', 'deletion_reason',
            'date_joined', 'last_login'
        ] 

class UserAuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    performed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = UserAuditLog
        fields = [
            'id', 'timestamp', 'user', 'user_name', 'user_email',
            'action_type', 'performed_by', 'performed_by_name',
            'ip_address', 'description', 'details'
        ]

    def get_performed_by_name(self, obj):
        return obj.performed_by.get_full_name() if obj.performed_by else 'System' 