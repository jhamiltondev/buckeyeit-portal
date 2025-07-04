from rest_framework import serializers
from .models import Announcement, KnowledgeBaseArticle, Role, UserGroup, Tenant, User
 
class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'message', 'created_at', 'is_active', 'pinned', 'category', 'author']

class KnowledgeBaseArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeBaseArticle
        fields = ['id', 'title', 'excerpt', 'category', 'updated_at', 'rating', 'is_active']

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']

class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ['id', 'name']

class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'is_active']

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