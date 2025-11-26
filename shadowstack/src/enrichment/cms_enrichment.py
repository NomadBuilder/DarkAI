"""CMS and tech stack detection module."""

import os
import requests
from typing import Dict, Optional, List
from dotenv import load_dotenv

load_dotenv()

# Try to import Wappalyzer (free open-source library)
try:
    from wappalyzer import Wappalyzer, WebPage
    WAPPALYZER_AVAILABLE = True
except ImportError:
    try:
        # Alternative import path
        from Wappalyzer import Wappalyzer, WebPage
        WAPPALYZER_AVAILABLE = True
    except ImportError:
        WAPPALYZER_AVAILABLE = False
        print("Note: python-wappalyzer not installed. Install with: pip install python-wappalyzer")


def detect_cms(domain: str) -> Optional[str]:
    """
    Detect CMS using multiple methods in order of preference.
    Uses free open-source Wappalyzer library first (comprehensive, no API key needed).
    Falls back to APIs if keys available, then basic header detection.
    """
    cms = None
    
    # Method 1: Wappalyzer open-source library (FREE, comprehensive, no API key needed!)
    if WAPPALYZER_AVAILABLE:
        cms = detect_with_wappalyzer_library(domain)
        if cms:
            return cms
    
    # Method 2: BuiltWith API (free tier: 10/day)
    builtwith_key = os.getenv("BUILTWITH_API_KEY", "")
    if builtwith_key:
        cms = detect_with_builtwith(domain, builtwith_key)
        if cms:
            return cms
    
    # Method 3: Wappalyzer API (paid)
    wappalyzer_key = os.getenv("WAPPALYZER_API_KEY", "")
    if wappalyzer_key:
        cms = detect_with_wappalyzer_api(domain, wappalyzer_key)
        if cms:
            return cms
    
    # Method 4: WhatCMS API (limited free lookups)
    whatcms_key = os.getenv("WHATCMS_API_KEY", "")
    if whatcms_key:
        cms = detect_with_whatcms(domain, whatcms_key)
        if cms:
            return cms
    
    # Method 5: Enhanced pattern detection (no API needed)
    cms = detect_cms_enhanced(domain)
    if cms:
        return cms
    
    # Method 6: Basic HTTP header detection (last resort)
    cms = detect_cms_from_headers(domain)
    
    return cms


def detect_with_builtwith(domain: str, api_key: str) -> Optional[str]:
    """Detect CMS using BuiltWith API (free tier: 10 requests/day)."""
    try:
        url = f"https://api.builtwith.com/v20/api.json"
        params = {
            "KEY": api_key,
            "LOOKUP": domain
        }
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            # BuiltWith returns technologies in groups
            # Look for CMS in Content Management or Ecommerce groups
            if "Results" in data and len(data["Results"]) > 0:
                result = data["Results"][0]
                paths = result.get("Result", {}).get("Paths", [])
                
                for path in paths:
                    technologies = path.get("Technologies", [])
                    for tech in technologies:
                        name = tech.get("Name", "")
                        # Check if it's a CMS
                        cms_keywords = ["WordPress", "Joomla", "Drupal", "Shopify", 
                                       "Squarespace", "Wix", "Magento", "WooCommerce"]
                        for keyword in cms_keywords:
                            if keyword.lower() in name.lower():
                                return keyword
                        
                        # Return first CMS-like technology
                        if any(tag in tech.get("Tag", "") for tag in ["cms", "content-management"]):
                            return name
    except Exception as e:
        print(f"BuiltWith API lookup failed for {domain}: {e}")
    
    return None


def detect_with_wappalyzer_library(domain: str) -> Optional[str]:
    """
    Detect CMS using Wappalyzer open-source library (FREE, no API key needed!).
    Uses Wappalyzer's comprehensive detection patterns.
    Detects 100+ CMS platforms and 1000+ technologies.
    """
    if not WAPPALYZER_AVAILABLE:
        return None
    
    try:
        url = f"http://{domain}" if not domain.startswith("http") else domain
        # Ensure https if http fails
        if not url.startswith("http"):
            url = f"https://{domain}"
        
        wappalyzer = Wappalyzer.latest()
        webpage = WebPage.new_from_url(url, timeout=10)
        technologies = wappalyzer.analyze(webpage)
        
        # Look for CMS technologies (category 1)
        cms_keywords = [
            "WordPress", "Joomla", "Drupal", "Shopify", "Squarespace", "Wix",
            "Magento", "WooCommerce", "PrestaShop", "OpenCart", "BigCommerce",
            "Ghost", "Grav", "Strapi", "Contentful", "Craft CMS", "ExpressionEngine",
            "TYPO3", "Concrete5", "SilverStripe", "Sitecore", "Umbraco", "Kentico",
            "Pimcore", "AEM", "Liferay", "SharePoint", "DNN", "Plone", "MODX",
            "ProcessWire", "Textpattern", "Bolt", "Pico", "Kirby", "Statamic"
        ]
        
        # Valid CMS platforms whitelist (strict)
        valid_cms_platforms = [
            "wordpress", "joomla", "drupal", "shopify", "squarespace", "wix",
            "magento", "woocommerce", "prestashop", "opencart", "bigcommerce",
            "ghost", "grav", "strapi", "contentful", "craft cms", "expressionengine",
            "typo3", "concrete5", "silverstripe", "sitecore", "umbraco", "kentico",
            "pimcore", "aem", "adobe experience manager", "liferay", "sharepoint", 
            "dnn", "dotnetnuke", "plone", "modx", "processwire", "textpattern", 
            "bolt", "pico", "kirby", "statamic", "wagtail", "django cms", "weebly",
            "carrd", "webflow", "tumblr", "medium", "blogger", "blogspot"
        ]
        
        # Technologies that are NOT CMS (should never be classified as CMS)
        not_cms = [
            "bootstrap", "jquery", "nginx", "apache", "cloudflare", "react", "vue",
            "angular", "node.js", "php", "python", "ruby", "java", "javascript",
            "typescript", "css", "html", "sass", "less", "webpack", "gulp",
            "babel", "express", "django", "rails", "laravel", "flask", "spring",
            "asp.net", "symfony", "fastly", "cloudfront", "akamai", "maxcdn",
            "keycdn", "bunnycdn", "stackpath", "sucuri", "incapsula", "imperva"
        ]
        
        for tech in technologies:
            tech_name = str(tech)
            tech_lower = tech_name.lower()
            
            # Skip if it's explicitly NOT a CMS
            if any(not_cms_item in tech_lower for not_cms_item in not_cms):
                continue
            
            # Check if it's a known CMS (strict matching)
            for keyword in cms_keywords:
                if keyword.lower() in tech_lower:
                    # Double-check it's actually a CMS platform
                    if any(valid_cms in tech_lower for valid_cms in valid_cms_platforms):
                        return keyword
            
            # Check by category if available (but verify it's actually a CMS)
            if hasattr(tech, 'categories'):
                categories = tech.categories
                if isinstance(categories, list):
                    for cat in categories:
                        cat_id = None
                        if isinstance(cat, dict):
                            cat_id = cat.get('id')
                        elif hasattr(cat, 'id'):
                            cat_id = cat.id
                        
                        if cat_id == 1:  # Category 1 = CMS
                            # Verify it's actually a CMS platform
                            if any(valid_cms in tech_lower for valid_cms in valid_cms_platforms):
                                return tech_name
        
        # Don't return anything if no valid CMS found
        return None
    
    except Exception as e:
        print(f"Wappalyzer library detection failed for {domain}: {e}")
    
    return None


def detect_with_wappalyzer_api(domain: str, api_key: str) -> Optional[str]:
    """Detect CMS using Wappalyzer API (paid service)."""
    try:
        url = f"https://api.wappalyzer.com/v2/lookup"
        headers = {
            "x-api-key": api_key
        }
        params = {
            "urls": domain
        }
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            # Wappalyzer returns technologies array
            if isinstance(data, list) and len(data) > 0:
                technologies = data[0].get("technologies", [])
                # Look for CMS category
                for tech in technologies:
                    categories = tech.get("categories", [])
                    if any(cat.get("id") == 1 for cat in categories):  # Category 1 = CMS
                        return tech.get("name")
    except Exception as e:
        print(f"Wappalyzer API lookup failed for {domain}: {e}")
    
    return None


def detect_with_whatcms(domain: str, api_key: str) -> Optional[str]:
    """Detect CMS using WhatCMS API."""
    try:
        url = f"https://whatcms.org/API/Tech?key={api_key}&url={domain}"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("result", {}).get("code") == 200:
                # WhatCMS returns tech stack
                cms_list = data.get("results", [])
                if cms_list:
                    return cms_list[0].get("name", "")
    except Exception as e:
        print(f"WhatCMS API lookup failed for {domain}: {e}")
    
    return None


def detect_cms_enhanced(domain: str) -> Optional[str]:
    """
    Enhanced CMS detection using multiple patterns and indicators.
    More comprehensive than basic header detection.
    """
    try:
        url = f"http://{domain}" if not domain.startswith("http") else domain
        response = requests.get(url, timeout=10, allow_redirects=True, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        headers = response.headers
        content = response.text.lower()
        url_lower = url.lower()
        
        # Comprehensive CMS detection patterns
        cms_patterns = {
            # WordPress
            "wordpress": [
                ("wp-content", "WordPress"),
                ("wp-includes", "WordPress"),
                ("wp-json", "WordPress"),
                ("/wp-admin/", "WordPress"),
                ("wordpress", "WordPress"),
            ],
            # Joomla
            "joomla": [
                ("joomla", "Joomla"),
                ("/administrator/", "Joomla"),
                ("com_content", "Joomla"),
                ("option=com_", "Joomla"),
            ],
            # Drupal
            "drupal": [
                ("drupal", "Drupal"),
                ("sites/all/", "Drupal"),
                ("/sites/default/", "Drupal"),
                ("drupal.js", "Drupal"),
            ],
            # Shopify
            "shopify": [
                ("shopify", "Shopify"),
                ("cdn.shopify.com", "Shopify"),
                ("myshopify.com", "Shopify"),
                ("shopify-analytics", "Shopify"),
            ],
            # Squarespace
            "squarespace": [
                ("squarespace", "Squarespace"),
                ("sqs-cdn", "Squarespace"),
                ("squarespace.com", "Squarespace"),
            ],
            # Magento (more specific patterns first to avoid false positives)
            "magento": [
                ("/skin/frontend/", "Magento"),  # Very specific Magento path - check first
                ("/skin/adminhtml/", "Magento"),  # Magento admin skin
                ("mage/translate.js", "Magento"),  # Specific Magento JS files
                ("mage/cookies.js", "Magento"),
                ("mage.js", "Magento"),
                ("mage/adminhtml", "Magento"),
                ("/mage/", "Magento"),  # More specific - must be at path boundary
                ("magento", "Magento"),  # Generic check last
            ],
            # PrestaShop
            "prestashop": [
                ("prestashop", "PrestaShop"),
                ("/themes/prestashop/", "PrestaShop"),  # More specific
                ("prestashop.js", "PrestaShop"),
            ],
            # Ghost (more specific to avoid false positives)
            "ghost": [
                ("ghost.org", "Ghost"),  # Ghost CMS domain - very specific
                ("/ghost/", "Ghost"),  # Ghost admin path
                ("ghost.min.js", "Ghost"),  # Ghost JS file
                ("content/themes/ghost", "Ghost"),  # Ghost theme path
            ],
            # Wix
            "wix": [
                ("wix.com", "Wix"),
                ("wixstatic.com", "Wix"),
                ("wixpress.com", "Wix"),
            ],
            # Weebly
            "weebly": [
                ("weebly.com", "Weebly"),
                ("weeblycdn.com", "Weebly"),
            ],
            # BigCommerce
            "bigcommerce": [
                ("bigcommerce.com", "BigCommerce"),
                ("bigcommerceapi", "BigCommerce"),
            ],
            # OpenCart
            "opencart": [
                ("opencart", "OpenCart"),
                ("/catalog/view/theme/", "OpenCart"),  # More specific - OpenCart theme path
                ("/catalog/controller/", "OpenCart"),  # More specific - OpenCart controller path
                ("opencart.js", "OpenCart"),
            ],
        }
        
        # Check all patterns
        for cms_name, patterns in cms_patterns.items():
            for pattern, detected_name in patterns:
                if pattern in content or pattern in str(headers).lower() or pattern in url_lower:
                    return detected_name
        
        # Check X-Powered-By header
        powered_by = headers.get("X-Powered-By", "").lower()
        if powered_by:
            for cms_name, patterns in cms_patterns.items():
                if cms_name in powered_by:
                    return patterns[0][1]  # Return CMS name
        
        # Check meta tags
        import re
        meta_tags = re.findall(r'<meta[^>]+name=["\']generator["\'][^>]+content=["\']([^"\']+)["\']', content)
        for meta_content in meta_tags:
            meta_lower = meta_content.lower()
            for cms_name, patterns in cms_patterns.items():
                if cms_name in meta_lower:
                    return patterns[0][1]
    
    except Exception as e:
        print(f"Enhanced CMS detection failed for {domain}: {e}")
    
    return None


def detect_cms_from_headers(domain: str) -> Optional[str]:
    """Basic CMS detection from HTTP headers (fallback method)."""
    try:
        url = f"http://{domain}" if not domain.startswith("http") else domain
        response = requests.get(url, timeout=10, allow_redirects=True)
        
        headers = response.headers
        content = response.text.lower()
        
        # Quick checks
        if "wp-content" in content or "wp-includes" in content:
            return "WordPress"
        elif "joomla" in content:
            return "Joomla"
        elif "drupal" in content:
            return "Drupal"
        elif "shopify" in content:
            return "Shopify"
        elif "squarespace" in content:
            return "Squarespace"
    
    except Exception as e:
        print(f"Header-based CMS detection failed for {domain}: {e}")
    
    return None

