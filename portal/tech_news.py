import logging
import requests
from typing import List, Dict, Optional
from django.conf import settings

# Set up logger for tech news
logger = logging.getLogger('portal.tech_news')

class TechNewsService:
    """Service class for fetching and managing tech news from NewsAPI"""
    
    def __init__(self):
        self.api_key = '26ab5bf6cc45491ea78cd09939f00f92'
        self.base_url = 'https://newsapi.org/v2/top-headlines'
        self.timeout = 10
        self.max_articles = 5
        
    def fetch_tech_news(self) -> List[Dict]:
        """
        Fetch tech news from NewsAPI with comprehensive logging and error handling
        
        Returns:
            List[Dict]: List of news articles with title, url, source, and image
        """
        logger.info("Starting tech news fetch from NewsAPI")
        # Use a broad query for maximum results
        params = {
            'q': 'technology',
            'apiKey': self.api_key,
            'language': 'en',
            'pageSize': self.max_articles,
        }
        try:
            resp = requests.get(self.base_url, params=params, timeout=self.timeout)
            logger.info(f"NewsAPI status: {resp.status_code}")
            if resp.status_code == 200:
                articles = resp.json().get('articles', [])
                if articles:
                    logger.info(f"Fetched {len(articles)} articles for query 'technology'")
                    return [
                        {
                            'title': a.get('title'),
                            'url': a.get('url'),
                            'source': a.get('source', {}).get('name'),
                            'image': a.get('urlToImage'),
                        }
                        for a in articles if a.get('title')
                    ][:self.max_articles]
                else:
                    logger.warning(f"No articles found. NewsAPI response: {resp.json()}")
            else:
                logger.error(f"NewsAPI error: {resp.status_code} {resp.text}")
        except Exception as e:
            logger.error(f"Exception fetching news: {e}")
        # Static fallback if no news found
        logger.warning("No tech news found from NewsAPI. Using static fallback.")
        return [
            {
                'title': 'Microsoft launches new AI-powered security tools',
                'url': 'https://www.microsoft.com/security/blog/',
                'source': 'Microsoft Security Blog',
                'image': 'https://news.microsoft.com/wp-content/uploads/prod/sites/626/2023/05/AI-security.jpg',
            },
            {
                'title': '5 Ways to Protect Your Business from Ransomware',
                'url': 'https://www.cisa.gov/news-events/news/5-ways-protect-your-business-ransomware',
                'source': 'CISA',
                'image': 'https://www.cisa.gov/sites/default/files/styles/featured_image/public/2023-06/ransomware.jpg',
            },
            {
                'title': 'The Future of Cloud Computing in 2025',
                'url': 'https://www.techrepublic.com/article/future-of-cloud-computing/',
                'source': 'TechRepublic',
                'image': 'https://www.techrepublic.com/wp-content/uploads/2023/01/cloud-future.jpg',
            },
        ]
    
    def _process_article(self, article: Dict, index: int) -> Optional[Dict]:
        """
        Process a single article from NewsAPI response
        
        Args:
            article: Raw article data from NewsAPI
            index: Article index for logging
            
        Returns:
            Optional[Dict]: Processed article or None if invalid
        """
        try:
            # Extract required fields
            title = article.get('title', '').strip()
            url = article.get('url', '').strip()
            source_name = article.get('source', {}).get('name', '').strip()
            image_url = article.get('urlToImage', '').strip()
            
            # Validate required fields
            if not title or not url:
                logger.warning(f"Article {index+1} missing required fields (title: {bool(title)}, url: {bool(url)})")
                return None
            
            # Clean and validate URL
            if not url.startswith('http'):
                logger.warning(f"Article {index+1} has invalid URL: {url}")
                return None
            
            # Process image URL
            if image_url and not image_url.startswith('http'):
                logger.warning(f"Article {index+1} has invalid image URL: {image_url}")
                image_url = None
            
            processed_article = {
                'title': title,
                'url': url,
                'source': source_name or 'Unknown Source',
                'image': image_url,
            }
            
            logger.debug(f"Article {index+1} processed successfully: {title[:50]}...")
            return processed_article
            
        except Exception as e:
            logger.error(f"Error processing article {index+1}: {str(e)}")
            return None
    
    def test_api_connection(self) -> Dict:
        """
        Test the NewsAPI connection and return diagnostic information
        
        Returns:
            Dict: Diagnostic information about the API connection
        """
        logger.info("Testing NewsAPI connection")
        
        diagnostic = {
            'api_key_valid': bool(self.api_key),
            'api_key_length': len(self.api_key) if self.api_key else 0,
            'base_url': self.base_url,
            'timeout': self.timeout,
        }
        
        try:
            # Make a simple test request
            test_params = {
                'q': 'test',
                'pageSize': 1,
                'apiKey': self.api_key,
            }
            
            logger.debug("Making test request to NewsAPI")
            response = requests.get(
                self.base_url,
                params=test_params,
                timeout=5
            )
            
            diagnostic['test_status_code'] = response.status_code
            diagnostic['test_successful'] = response.status_code == 200
            
            if response.status_code == 200:
                data = response.json()
                diagnostic['api_working'] = True
                diagnostic['total_results'] = data.get('totalResults', 0)
                logger.info("NewsAPI test successful")
            else:
                diagnostic['api_working'] = False
                diagnostic['error_message'] = response.text
                logger.error(f"NewsAPI test failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            diagnostic['api_working'] = False
            diagnostic['error_message'] = str(e)
            logger.error(f"NewsAPI test exception: {str(e)}")
        
        logger.info(f"NewsAPI diagnostic: {diagnostic}")
        return diagnostic


# Global instance for easy access
tech_news_service = TechNewsService()


def get_tech_news() -> List[Dict]:
    """
    Convenience function to get tech news
    
    Returns:
        List[Dict]: List of processed tech news articles
    """
    logger.info("get_tech_news() called")
    return tech_news_service.fetch_tech_news()


def test_news_api() -> Dict:
    """
    Convenience function to test NewsAPI connection
    
    Returns:
        Dict: Diagnostic information
    """
    logger.info("test_news_api() called")
    return tech_news_service.test_api_connection() 