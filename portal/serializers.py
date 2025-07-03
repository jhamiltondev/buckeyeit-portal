from rest_framework import serializers
from .models import Announcement, KnowledgeBaseArticle
 
class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'message', 'created_at', 'is_active', 'pinned', 'category', 'author']

class KnowledgeBaseArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeBaseArticle
        fields = ['id', 'title', 'excerpt', 'category', 'updated_at', 'rating', 'is_active'] 