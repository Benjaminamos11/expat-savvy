"""
Enhanced attribution service for detailed traffic source tracking
Detects AI platforms, social media, search engines, and more
"""

from typing import Dict, Optional
from urllib.parse import urlparse, parse_qs

class AttributionService:
    """Service for enhanced traffic attribution and source detection"""
    
    # AI Platform detection
    AI_PLATFORMS = {
        'chat.openai.com': 'ChatGPT',
        'chatgpt.com': 'ChatGPT',
        'openai.com': 'ChatGPT',
        'perplexity.ai': 'Perplexity',
        'claude.ai': 'Claude (Anthropic)',
        'gemini.google.com': 'Google Gemini',
        'bard.google.com': 'Google Gemini',
        'you.com': 'You.com AI',
        'phind.com': 'Phind AI',
        'copilot.microsoft.com': 'Microsoft Copilot',
        'bing.com/chat': 'Bing Chat',
    }
    
    # Social Media detection
    SOCIAL_PLATFORMS = {
        'facebook.com': 'Facebook',
        'fb.com': 'Facebook',
        'm.facebook.com': 'Facebook',
        'l.facebook.com': 'Facebook',
        'lm.facebook.com': 'Facebook',
        'instagram.com': 'Instagram',
        'linkedin.com': 'LinkedIn',
        'lnkd.in': 'LinkedIn',
        'twitter.com': 'Twitter/X',
        'x.com': 'Twitter/X',
        't.co': 'Twitter/X',
        'tiktok.com': 'TikTok',
        'reddit.com': 'Reddit',
        'pinterest.com': 'Pinterest',
        'youtube.com': 'YouTube',
        'whatsapp.com': 'WhatsApp',
        'wa.me': 'WhatsApp',
        'telegram.org': 'Telegram',
        't.me': 'Telegram',
        'snapchat.com': 'Snapchat',
    }
    
    # Search Engines
    SEARCH_ENGINES = {
        'google.com': 'Google',
        'google.ch': 'Google',
        'bing.com': 'Bing',
        'duckduckgo.com': 'DuckDuckGo',
        'yahoo.com': 'Yahoo',
        'baidu.com': 'Baidu',
        'yandex.com': 'Yandex',
        'ecosia.org': 'Ecosia',
        'startpage.com': 'Startpage',
    }
    
    @staticmethod
    def detect_source_platform(referrer: str, utm_source: str = None) -> Dict[str, str]:
        """
        Detect the platform/source from referrer URL and UTM parameters
        
        Returns:
            {
                'platform': 'ChatGPT' | 'Facebook' | 'Google' | etc.,
                'platform_type': 'ai' | 'social' | 'search' | 'referral' | 'direct',
                'referrer_domain': 'chat.openai.com',
                'detected_from': 'referrer' | 'utm' | 'both'
            }
        """
        result = {
            'platform': 'Direct',
            'platform_type': 'direct',
            'referrer_domain': None,
            'detected_from': None
        }
        
        # Check UTM source first
        if utm_source:
            utm_lower = utm_source.lower()
            
            # Check for AI platforms in UTM
            for domain, name in AttributionService.AI_PLATFORMS.items():
                if domain.replace('.', '') in utm_lower or name.lower() in utm_lower:
                    result['platform'] = name
                    result['platform_type'] = 'ai'
                    result['detected_from'] = 'utm'
                    return result
            
            # Check for social platforms in UTM
            for domain, name in AttributionService.SOCIAL_PLATFORMS.items():
                if domain.replace('.', '') in utm_lower or name.lower().replace('/', '').replace(' ', '') in utm_lower:
                    result['platform'] = name
                    result['platform_type'] = 'social'
                    result['detected_from'] = 'utm'
                    return result
        
        # Check referrer URL
        if referrer and referrer != '':
            try:
                parsed = urlparse(referrer)
                domain = parsed.netloc.lower()
                
                # Remove www. prefix
                if domain.startswith('www.'):
                    domain = domain[4:]
                
                result['referrer_domain'] = domain
                
                # Check AI platforms
                for ai_domain, name in AttributionService.AI_PLATFORMS.items():
                    if ai_domain in domain:
                        result['platform'] = name
                        result['platform_type'] = 'ai'
                        result['detected_from'] = 'referrer' if not result['detected_from'] else 'both'
                        return result
                
                # Check Social platforms
                for social_domain, name in AttributionService.SOCIAL_PLATFORMS.items():
                    if social_domain in domain:
                        result['platform'] = name
                        result['platform_type'] = 'social'
                        result['detected_from'] = 'referrer' if not result['detected_from'] else 'both'
                        return result
                
                # Check Search engines
                for search_domain, name in AttributionService.SEARCH_ENGINES.items():
                    if search_domain in domain:
                        result['platform'] = name
                        result['platform_type'] = 'search'
                        result['detected_from'] = 'referrer' if not result['detected_from'] else 'both'
                        # Try to extract search keyword
                        result['search_keyword'] = AttributionService.extract_search_keyword(referrer)
                        return result
                
                # If we got here, it's a referral
                result['platform'] = domain
                result['platform_type'] = 'referral'
                result['detected_from'] = 'referrer'
                return result
                
            except Exception as e:
                print(f"Error parsing referrer: {e}")
        
        return result
    
    @staticmethod
    def extract_search_keyword(referrer_url: str) -> Optional[str]:
        """
        Extract search keyword from search engine referrer URL
        """
        try:
            parsed = urlparse(referrer_url)
            query_params = parse_qs(parsed.query)
            
            # Google, Bing, Yahoo use 'q'
            if 'q' in query_params:
                return query_params['q'][0]
            
            # Some search engines use 'query'
            if 'query' in query_params:
                return query_params['query'][0]
            
            # DuckDuckGo sometimes uses 'q'
            if 'search' in query_params:
                return query_params['search'][0]
                
        except Exception as e:
            print(f"Error extracting keyword: {e}")
        
        return None
    
    @staticmethod
    def determine_channel(utm_source: str, utm_medium: str, referrer: str, platform_type: str) -> str:
        """
        Determine marketing channel based on all available data
        
        Returns: 'organic', 'paid', 'social', 'ai', 'referral', 'direct'
        """
        # Paid campaigns (UTM medium contains cost/cpc/ppc/paid)
        if utm_medium:
            medium_lower = utm_medium.lower()
            if any(x in medium_lower for x in ['cpc', 'ppc', 'paid', 'cost']):
                return 'paid'
        
        # AI platforms get their own channel
        if platform_type == 'ai':
            return 'ai'
        
        # Social media
        if platform_type == 'social':
            # Check if it's paid social
            if utm_medium and 'paid' in utm_medium.lower():
                return 'paid'
            return 'social'
        
        # Search engines
        if platform_type == 'search':
            # Check if it's paid search
            if utm_source and utm_medium:
                if 'google' in utm_source.lower() and any(x in utm_medium.lower() for x in ['cpc', 'paid']):
                    return 'paid'
            return 'organic'
        
        # Referral sites
        if platform_type == 'referral':
            return 'referral'
        
        # Default to direct
        return 'direct'
    
    @staticmethod
    def enrich_lead_data(lead_data: dict) -> dict:
        """
        Enrich lead data with enhanced attribution information
        
        Args:
            lead_data: Original lead data with utm_source, utm_medium, referrer
            
        Returns:
            Enriched lead data with platform, platform_type, channel, etc.
        """
        source_info = AttributionService.detect_source_platform(
            lead_data.get('referrer'),
            lead_data.get('utm_source')
        )
        
        # Determine channel
        channel = AttributionService.determine_channel(
            lead_data.get('utm_source'),
            lead_data.get('utm_medium'),
            lead_data.get('referrer'),
            source_info['platform_type']
        )
        
        # Update lead data
        enriched = lead_data.copy()
        enriched['channel'] = channel
        
        # Add to notes for detailed tracking
        if 'notes' not in enriched or enriched['notes'] is None:
            enriched['notes'] = {}
        
        enriched['notes']['source_platform'] = source_info['platform']
        enriched['notes']['platform_type'] = source_info['platform_type']
        enriched['notes']['referrer_domain'] = source_info['referrer_domain']
        enriched['notes']['detected_from'] = source_info['detected_from']
        
        if 'search_keyword' in source_info and source_info['search_keyword']:
            enriched['notes']['search_keyword'] = source_info['search_keyword']
        
        return enriched


