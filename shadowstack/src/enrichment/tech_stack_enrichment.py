"""Comprehensive technology stack detection module."""

import os
import requests
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()


def detect_full_tech_stack(domain: str) -> Dict:
    """
    Detect full technology stack including CMS, frameworks, analytics, etc.
    Returns a dictionary with detected technologies.
    Uses Wappalyzer library (free) first, then falls back to APIs.
    """
    result = {
        "cms": None,
        "frameworks": [],
        "languages": [],
        "web_servers": [],
        "analytics": [],
        "cdn": None,
        "payment_processors": [],
        "advertising": [],
        "javascript_frameworks": [],
        "programming_languages": [],
        "database": [],
        "caching": [],
        "security": [],
        "other": []
    }
    
    # Try Wappalyzer library first (FREE, comprehensive)
    try:
        from Wappalyzer import Wappalyzer, WebPage
        wappalyzer_lib_data = get_wappalyzer_library_tech_stack(domain)
        if wappalyzer_lib_data:
            result.update(wappalyzer_lib_data)
            return result
    except ImportError:
        try:
            from wappalyzer import Wappalyzer, WebPage
            wappalyzer_lib_data = get_wappalyzer_library_tech_stack(domain)
            if wappalyzer_lib_data:
                result.update(wappalyzer_lib_data)
                return result
        except ImportError:
            pass
    
    # Try BuiltWith API
    builtwith_key = os.getenv("BUILTWITH_API_KEY", "")
    if builtwith_key:
        builtwith_data = get_builtwith_tech_stack(domain, builtwith_key)
        if builtwith_data:
            result.update(builtwith_data)
            return result
    
    # Try Wappalyzer API
    wappalyzer_key = os.getenv("WAPPALYZER_API_KEY", "")
    if wappalyzer_key:
        wappalyzer_data = get_wappalyzer_tech_stack(domain, wappalyzer_key)
        if wappalyzer_data:
            result.update(wappalyzer_data)
            return result
    
    # Fallback to basic detection
    return result


def get_wappalyzer_library_tech_stack(domain: str) -> Optional[Dict]:
    """Get full tech stack using Wappalyzer open-source library."""
    try:
        from Wappalyzer import Wappalyzer, WebPage
    except ImportError:
        try:
            from wappalyzer import Wappalyzer, WebPage
        except ImportError:
            return None
    
    try:
        url = f"https://{domain}" if not domain.startswith("http") else domain
        if not url.startswith("http"):
            url = f"http://{domain}"
        
        wappalyzer = Wappalyzer.latest()
        webpage = WebPage.new_from_url(url, timeout=10)
        technologies = wappalyzer.analyze(webpage)
        
        result = {
            "cms": None,
            "frameworks": [],
            "languages": [],
            "web_servers": [],
            "analytics": [],
            "cdn": None,
            "payment_processors": [],
            "advertising": [],
            "javascript_frameworks": [],
            "programming_languages": [],
            "database": [],
            "caching": [],
            "security": [],
            "other": []
        }
        
        # Category mappings (Wappalyzer category IDs)
        category_map = {
            1: "cms",  # CMS
            2: "frameworks",  # Frameworks
            3: "analytics",  # Analytics
            4: "advertising",  # Advertising
            5: "web_servers",  # Web Servers
            6: "programming_languages",  # Programming Languages
            7: "javascript_frameworks",  # JavaScript Frameworks
            8: "cdn",  # CDN
            9: "database",  # Database
            10: "caching",  # Caching
            11: "payment_processors",  # Payment Processors
            12: "security",  # Security
        }
        
        # Get Wappalyzer categories
        try:
            wappalyzer_categories = wappalyzer.categories
        except:
            wappalyzer_categories = {}
        
        for tech in technologies:
            tech_name = str(tech)
            
            # Try to get category from Wappalyzer's database
            categorized = False
            
            # Check known technology mappings
            tech_lower = tech_name.lower()
            
            # JavaScript Frameworks
            js_frameworks = ['react', 'vue', 'angular', 'next.js', 'nuxt', 'svelte', 'ember', 'backbone', 'meteor']
            if any(fw in tech_lower for fw in js_frameworks):
                result["javascript_frameworks"].append(tech_name)
                categorized = True
            
            # General Frameworks
            frameworks = ['django', 'rails', 'laravel', 'express', 'flask', 'spring', 'asp.net', 'symfony']
            if any(fw in tech_lower for fw in frameworks):
                result["frameworks"].append(tech_name)
                categorized = True
            
            # Analytics (check before languages to avoid false positives)
            analytics_list = ['google tag manager', 'google analytics', 'ga', 'matomo', 'mixpanel', 'segment', 'amplitude', 'hotjar', 'mixpanel', 'analytics', 'tracking']
            if any(ana in tech_lower for ana in analytics_list):
                result["analytics"].append(tech_name)
                categorized = True
            
            # Programming Languages (only if not already categorized as analytics)
            if not categorized:
                languages_list = ['node.js', 'php', 'python', 'ruby', 'java', 'go', 'rust', 'c++', 'c#', 'typescript', 'javascript']
                if any(lang in tech_lower for lang in languages_list):
                    result["programming_languages"].append(tech_name)
                    categorized = True
            
            # CDN
            if 'cloudflare' in tech_lower or 'cloudfront' in tech_lower or 'fastly' in tech_lower:
                if not result["cdn"]:
                    result["cdn"] = tech_name
                categorized = True
            
            # CMS - strict whitelist only
            valid_cms_platforms = [
                'wordpress', 'drupal', 'joomla', 'shopify', 'squarespace', 'wix', 
                'magento', 'woocommerce', 'prestashop', 'opencart', 'bigcommerce',
                'ghost', 'grav', 'strapi', 'contentful', 'craft cms', 'expressionengine',
                'typo3', 'concrete5', 'silverstripe', 'sitecore', 'umbraco', 'kentico',
                'pimcore', 'aem', 'adobe experience manager', 'liferay', 'sharepoint',
                'dnn', 'dotnetnuke', 'plone', 'modx', 'processwire', 'textpattern',
                'bolt', 'pico', 'kirby', 'statamic', 'wagtail', 'django cms', 'weebly',
                'carrd', 'webflow', 'tumblr', 'medium', 'blogger', 'blogspot'
            ]
            # Explicitly NOT CMS (should never be classified as CMS)
            not_cms = [
                'bootstrap', 'jquery', 'nginx', 'apache', 'cloudflare', 'react', 'vue',
                'angular', 'node.js', 'php', 'python', 'ruby', 'java', 'javascript',
                'typescript', 'css', 'html', 'sass', 'less', 'webpack', 'gulp',
                'babel', 'express', 'django', 'rails', 'laravel', 'flask', 'spring',
                'asp.net', 'symfony', 'fastly', 'cloudfront', 'akamai', 'maxcdn',
                'keycdn', 'bunnycdn', 'stackpath', 'sucuri', 'incapsula', 'imperva'
            ]
            
            # Skip if it's explicitly NOT a CMS
            if any(not_cms_item in tech_lower for not_cms_item in not_cms):
                categorized = True  # Mark as categorized so it doesn't fall through
            
            # Only classify as CMS if it's in the valid CMS list
            if any(valid_cms in tech_lower for valid_cms in valid_cms_platforms):
                if not result["cms"]:
                    result["cms"] = tech_name
                categorized = True
            
            # Try to get categories from tech object
            if not categorized:
                categories = []
                try:
                    if hasattr(tech, 'categories'):
                        cats = tech.categories
                        if isinstance(cats, list):
                            categories = cats
                        elif isinstance(cats, dict):
                            categories = list(cats.values())
                except:
                    pass
                
                    # Try category mapping
                    valid_cms_platforms = [
                        'wordpress', 'drupal', 'joomla', 'shopify', 'squarespace', 'wix', 
                        'magento', 'woocommerce', 'prestashop', 'opencart', 'bigcommerce',
                        'ghost', 'grav', 'strapi', 'contentful', 'craft cms', 'expressionengine',
                        'typo3', 'concrete5', 'silverstripe', 'sitecore', 'umbraco', 'kentico',
                        'pimcore', 'aem', 'adobe experience manager', 'liferay', 'sharepoint',
                        'dnn', 'dotnetnuke', 'plone', 'modx', 'processwire', 'textpattern',
                        'bolt', 'pico', 'kirby', 'statamic', 'wagtail', 'django cms', 'weebly',
                        'carrd', 'webflow', 'tumblr', 'medium', 'blogger', 'blogspot'
                    ]
                    not_cms = [
                        'bootstrap', 'jquery', 'nginx', 'apache', 'cloudflare', 'react', 'vue',
                        'angular', 'node.js', 'php', 'python', 'ruby', 'java', 'javascript',
                        'typescript', 'css', 'html', 'sass', 'less', 'webpack', 'gulp',
                        'babel', 'express', 'django', 'rails', 'laravel', 'flask', 'spring',
                        'asp.net', 'symfony', 'fastly', 'cloudfront', 'akamai', 'maxcdn',
                        'keycdn', 'bunnycdn', 'stackpath', 'sucuri', 'incapsula', 'imperva'
                    ]
                    
                    for cat in categories:
                        cat_id = None
                        if isinstance(cat, dict):
                            cat_id = cat.get('id')
                        elif hasattr(cat, 'id'):
                            cat_id = cat.id
                        elif isinstance(cat, (int, str)):
                            try:
                                cat_id = int(cat)
                            except:
                                pass
                        
                        if cat_id and cat_id in category_map:
                            category = category_map[cat_id]
                            
                            # Special handling for CMS category - must verify it's actually a CMS
                            if category == "cms":
                                # Only set as CMS if it's in the valid CMS whitelist
                                if any(valid_cms in tech_lower for valid_cms in valid_cms_platforms):
                                    if not result["cms"]:
                                        result["cms"] = tech_name
                                    categorized = True
                                # If categorized as CMS but not in whitelist, skip it
                                elif any(not_cms_item in tech_lower for not_cms_item in not_cms):
                                    # Don't set as CMS, but mark as categorized
                                    categorized = True
                            elif category == "cdn" and not result["cdn"]:
                                result["cdn"] = tech_name
                                categorized = True
                            elif category in result:
                                if tech_name not in result[category]:
                                    result[category].append(tech_name)
                                categorized = True
            
                # If still not categorized, check if it's a known tech
                if not categorized:
                    # Web servers detection
                    web_servers = ['nginx', 'apache', 'iis', 'lighttpd', 'caddy', 'tomcat', 'jetty']
                    if any(ws in tech_lower for ws in web_servers):
                        if tech_name not in result["web_servers"]:
                            result["web_servers"].append(tech_name)
                        categorized = True
                    
                    # CDN detection (if not already set)
                    cdns = ['cloudflare', 'cloudfront', 'fastly', 'akamai', 'maxcdn', 'keycdn', 
                           'bunnycdn', 'stackpath', 'sucuri', 'incapsula', 'imperva', 'cdn77']
                    if not result["cdn"] and any(cdn in tech_lower for cdn in cdns):
                        result["cdn"] = tech_name
                        categorized = True
                    
                    # CSS Frameworks
                    css_frameworks = ['bootstrap', 'foundation', 'bulma', 'tailwind', 'materialize', 'semantic ui']
                    if any(cf in tech_lower for cf in css_frameworks):
                        if tech_name not in result["frameworks"]:
                            result["frameworks"].append(tech_name)
                        categorized = True
                    
                    # JavaScript Libraries (not frameworks)
                    js_libraries = ['jquery', 'lodash', 'underscore', 'moment', 'axios', 'fetch']
                    if any(jl in tech_lower for jl in js_libraries):
                        if tech_name not in result["javascript_frameworks"]:
                            result["javascript_frameworks"].append(tech_name)
                        categorized = True
                    
                    # If still not categorized, add to "other"
                    if not categorized:
                        if tech_name not in result["other"]:
                            result["other"].append(tech_name)
        
        return result
    except Exception as e:
        print(f"Wappalyzer library tech stack detection failed for {domain}: {e}")
        return None


def get_builtwith_tech_stack(domain: str, api_key: str) -> Optional[Dict]:
    """Get full tech stack from BuiltWith API."""
    try:
        url = f"https://api.builtwith.com/v20/api.json"
        params = {
            "KEY": api_key,
            "LOOKUP": domain
        }
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            result = {
                "cms": None,
                "frameworks": [],
                "languages": [],
                "web_servers": [],
                "analytics": [],
                "cdn": None,
                "payment_processors": [],
                "other": []
            }
            
            if "Results" in data and len(data["Results"]) > 0:
                result_data = data["Results"][0].get("Result", {})
                paths = result_data.get("Paths", [])
                
                for path in paths:
                    technologies = path.get("Technologies", [])
                    for tech in technologies:
                        name = tech.get("Name", "")
                        tag = tech.get("Tag", "").lower()
                        
                        # Categorize technologies
                        if "cms" in tag or "content-management" in tag:
                            if not result["cms"]:
                                result["cms"] = name
                        elif "framework" in tag:
                            result["frameworks"].append(name)
                        elif "analytics" in tag:
                            result["analytics"].append(name)
                        elif "cdn" in tag:
                            result["cdn"] = name
                        elif "payment" in tag or "ecommerce" in tag:
                            result["payment_processors"].append(name)
                        elif "server" in tag:
                            result["web_servers"].append(name)
                        else:
                            result["other"].append(name)
            
            return result
    except Exception as e:
        print(f"BuiltWith tech stack lookup failed for {domain}: {e}")
    
    return None


def get_wappalyzer_tech_stack(domain: str, api_key: str) -> Optional[Dict]:
    """Get full tech stack from Wappalyzer API."""
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
            result = {
                "cms": None,
                "frameworks": [],
                "languages": [],
                "web_servers": [],
                "analytics": [],
                "cdn": None,
                "payment_processors": [],
                "other": []
            }
            
            if isinstance(data, list) and len(data) > 0:
                technologies = data[0].get("technologies", [])
                
                for tech in technologies:
                    name = tech.get("name", "")
                    categories = tech.get("categories", [])
                    
                    # Categorize by category ID
                    for cat in categories:
                        cat_id = cat.get("id")
                        cat_name = cat.get("name", "").lower()
                        
                        if cat_id == 1 or "cms" in cat_name:  # CMS
                            if not result["cms"]:
                                result["cms"] = name
                        elif cat_id == 2 or "framework" in cat_name:
                            result["frameworks"].append(name)
                        elif cat_id == 3 or "analytics" in cat_name:
                            result["analytics"].append(name)
                        elif cat_id == 8 or "cdn" in cat_name:
                            result["cdn"] = name
                        elif cat_id == 11 or "payment" in cat_name:
                            result["payment_processors"].append(name)
                        elif cat_id == 5 or "server" in cat_name:
                            result["web_servers"].append(name)
                        else:
                            result["other"].append(name)
            
            return result
    except Exception as e:
        print(f"Wappalyzer tech stack lookup failed for {domain}: {e}")
    
    return None

