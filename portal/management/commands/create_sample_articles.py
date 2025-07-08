from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from portal.models import KnowledgeBaseCategory, KnowledgeBaseArticle
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample Knowledge Base articles for testing'

    def handle(self, *args, **options):
        # Create categories if they don't exist
        categories_data = [
            {'name': 'Networking', 'description': 'Network configuration and troubleshooting'},
            {'name': 'Microsoft 365', 'description': 'Office 365 and Microsoft services'},
            {'name': 'Security', 'description': 'Security best practices and policies'},
            {'name': 'Hardware', 'description': 'Hardware setup and maintenance'},
            {'name': 'Software', 'description': 'Software installation and configuration'},
            {'name': 'General', 'description': 'General IT support topics'},
        ]
        
        categories = {}
        for cat_data in categories_data:
            category, created = KnowledgeBaseCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
            categories[cat_data['name']] = category
            if created:
                self.stdout.write(f'Created category: {category.name}')
        
        # Get or create a test user
        user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'email': 'admin@example.com',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            user.set_password('admin123')
            user.save()
            self.stdout.write(f'Created user: {user.get_full_name()}')
        
        # Create sample articles
        articles_data = [
            {
                'title': 'How to Configure VPN Access',
                'excerpt': 'Step-by-step guide for setting up VPN connections for remote work.',
                'content': 'This article provides detailed instructions for configuring VPN access...',
                'category': 'Networking',
                'status': 'published',
                'view_count': 45,
            },
            {
                'title': 'Microsoft 365 Email Setup Guide',
                'excerpt': 'Complete guide to setting up Microsoft 365 email on various devices.',
                'content': 'Learn how to configure Microsoft 365 email on your devices...',
                'category': 'Microsoft 365',
                'status': 'published',
                'view_count': 123,
            },
            {
                'title': 'Password Security Best Practices',
                'excerpt': 'Essential password security guidelines for protecting your accounts.',
                'content': 'Strong passwords are crucial for protecting your digital assets...',
                'category': 'Security',
                'status': 'published',
                'view_count': 89,
            },
            {
                'title': 'Printer Installation Guide',
                'excerpt': 'How to install and configure network printers in your office.',
                'content': 'Follow these steps to properly install network printers...',
                'category': 'Hardware',
                'status': 'draft',
                'view_count': 12,
            },
            {
                'title': 'Software License Management',
                'excerpt': 'Best practices for managing software licenses across your organization.',
                'content': 'Proper software license management helps ensure compliance...',
                'category': 'Software',
                'status': 'published',
                'view_count': 67,
            },
            {
                'title': 'IT Support Ticket Guidelines',
                'excerpt': 'How to submit effective IT support tickets for faster resolution.',
                'content': 'Submitting well-documented support tickets helps IT staff...',
                'category': 'General',
                'status': 'published',
                'view_count': 234,
            },
            {
                'title': 'Network Troubleshooting Basics',
                'excerpt': 'Basic network troubleshooting steps for common connectivity issues.',
                'content': 'When experiencing network connectivity issues, follow these steps...',
                'category': 'Networking',
                'status': 'draft',
                'view_count': 5,
            },
            {
                'title': 'Data Backup Procedures',
                'excerpt': 'Essential data backup procedures to protect your important files.',
                'content': 'Regular data backups are essential for protecting your work...',
                'category': 'Security',
                'status': 'archived',
                'view_count': 156,
            },
        ]
        
        for article_data in articles_data:
            article, created = KnowledgeBaseArticle.objects.get_or_create(
                title=article_data['title'],
                defaults={
                    'excerpt': article_data['excerpt'],
                    'content': article_data['content'],
                    'category': categories[article_data['category']],
                    'status': article_data['status'],
                    'view_count': article_data['view_count'],
                    'author': user,
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(f'Created article: {article.title} ({article.status})')
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created sample Knowledge Base articles!')
        ) 