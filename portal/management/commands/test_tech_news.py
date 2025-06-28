from django.core.management.base import BaseCommand
from portal.tech_news import test_news_api, get_tech_news
import logging

logger = logging.getLogger('portal.tech_news')

class Command(BaseCommand):
    help = 'Test the tech news functionality and display diagnostic information'

    def add_arguments(self, parser):
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show verbose output including all article details',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('=== Tech News Diagnostic Test ===\n')
        )
        
        # Test API connection
        self.stdout.write('Testing NewsAPI connection...')
        diagnostic = test_news_api()
        
        # Display diagnostic information
        self.stdout.write('\n--- API Diagnostic ---')
        self.stdout.write(f"API Key Valid: {diagnostic['api_key_valid']}")
        self.stdout.write(f"API Key Length: {diagnostic['api_key_length']}")
        self.stdout.write(f"Base URL: {diagnostic['base_url']}")
        self.stdout.write(f"Timeout: {diagnostic['timeout']}s")
        self.stdout.write(f"Test Status Code: {diagnostic.get('test_status_code', 'N/A')}")
        self.stdout.write(f"API Working: {diagnostic['api_working']}")
        self.stdout.write(f"Total Results: {diagnostic.get('total_results', 'N/A')}")
        
        if diagnostic.get('error_message'):
            self.stdout.write(
                self.style.ERROR(f"Error Message: {diagnostic['error_message']}")
            )
        
        # Fetch tech news
        self.stdout.write('\n--- Fetching Tech News ---')
        tech_news = get_tech_news()
        
        self.stdout.write(f"Articles fetched: {len(tech_news)}")
        
        if tech_news:
            self.stdout.write('\n--- Tech News Articles ---')
            for i, article in enumerate(tech_news, 1):
                self.stdout.write(f"\n{i}. {article['title']}")
                self.stdout.write(f"   Source: {article['source']}")
                self.stdout.write(f"   URL: {article['url']}")
                if article.get('image'):
                    self.stdout.write(f"   Image: {article['image']}")
                else:
                    self.stdout.write(f"   Image: None")
                
                if options['verbose']:
                    self.stdout.write(f"   Full title: {article['title']}")
        else:
            self.stdout.write(
                self.style.WARNING('No tech news articles were fetched!')
            )
        
        # Summary
        self.stdout.write('\n--- Summary ---')
        if diagnostic['api_working'] and tech_news:
            self.stdout.write(
                self.style.SUCCESS('✅ Tech news functionality is working correctly!')
            )
        elif diagnostic['api_working'] and not tech_news:
            self.stdout.write(
                self.style.WARNING('⚠️  API is working but no articles were fetched')
            )
        else:
            self.stdout.write(
                self.style.ERROR('❌ Tech news functionality has issues')
            )
        
        self.stdout.write('\nCheck the Django logs for detailed information.')
        self.stdout.write('Log file: django.log') 