"""Enhanced website scraping module for comprehensive homepage analysis."""

import requests
import re
from typing import Dict, List, Optional
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import json
import time

from src.utils.config import Config


def scrape_homepage(domain: str) -> Dict:
    """
    Comprehensive homepage scraping with full HTML, text extraction, and structured data.
    
    Args:
        domain: Domain name to scrape
        
    Returns:
        Dictionary containing:
        - html: Full HTML content
        - text: Cleaned text content
        - title: Page title
        - meta_description: Meta description
        - meta_keywords: Meta keywords
        - structured_data: JSON-LD, Open Graph, Twitter Cards
        - forms: Detected forms
        - links: Internal/external/social media links
        - load_time: Page load time
        - status_code: HTTP status code
        - headers: HTTP response headers
    """
    result = {
        "html": None,
        "text": None,
        "title": None,
        "meta_description": None,
        "meta_keywords": None,
        "structured_data": {
            "json_ld": [],
            "open_graph": {},
            "twitter_cards": {},
            "schema_markup": {}
        },
        "forms": [],
        "links": {
            "internal": [],
            "external": [],
            "social_media": []
        },
        "load_time": None,
        "status_code": None,
        "headers": {},
        "error": None
    }
    
    try:
        # Try HTTPS first, fallback to HTTP
        urls_to_try = [
            f"https://{domain}",
            f"http://{domain}"
        ]
        
        response = None
        final_url = None
        
        for url in urls_to_try:
            try:
                start_time = time.time()
                response = requests.get(
                    url,
                    timeout=Config.API_TIMEOUT_SECONDS if hasattr(Config, 'API_TIMEOUT_SECONDS') else 15,
                    allow_redirects=True,
                    headers={
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    },
                    verify=False  # Many sketchy sites have invalid certs
                )
                result["load_time"] = time.time() - start_time
                result["status_code"] = response.status_code
                result["headers"] = dict(response.headers)
                final_url = response.url
                
                if response.status_code == 200:
                    break
            except requests.exceptions.SSLError:
                # Try next URL
                continue
            except requests.exceptions.RequestException as e:
                # Try next URL
                continue
        
        if not response or response.status_code != 200:
            result["error"] = f"Failed to fetch: {response.status_code if response else 'No response'}"
            return result
        
        html_content = response.text
        result["html"] = html_content
        
        # Parse with BeautifulSoup
        soup = BeautifulSoup(html_content, 'lxml')
        
        # Extract title
        title_tag = soup.find('title')
        if title_tag:
            result["title"] = title_tag.get_text(strip=True)
        
        # Extract meta tags
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            result["meta_description"] = meta_desc.get('content', '').strip()
        
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        if meta_keywords:
            result["meta_keywords"] = meta_keywords.get('content', '').strip()
        
        # Extract structured data (JSON-LD)
        json_ld_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_ld_scripts:
            try:
                script_content = script.string
                if script_content:
                    json_data = json.loads(script_content)
                    if isinstance(json_data, dict):
                        result["structured_data"]["json_ld"].append(json_data)
            except (json.JSONDecodeError, AttributeError, TypeError):
                # Skip invalid JSON-LD
                continue
        
        # Extract Open Graph tags
        og_tags = soup.find_all('meta', property=re.compile(r'^og:'))
        for tag in og_tags:
            prop = tag.get('property', '').replace('og:', '')
            content = tag.get('content', '')
            if prop and content:
                result["structured_data"]["open_graph"][prop] = content
        
        # Extract Twitter Card tags
        twitter_tags = soup.find_all('meta', attrs={'name': re.compile(r'^twitter:')})
        for tag in twitter_tags:
            name = tag.get('name', '').replace('twitter:', '')
            content = tag.get('content', '')
            if name and content:
                result["structured_data"]["twitter_cards"][name] = content
        
        # Extract text content (cleaned)
        # Remove script and style elements
        for script in soup(["script", "style", "noscript"]):
            script.decompose()
        
        # Get text
        text = soup.get_text()
        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        result["text"] = text
        
        # Extract forms
        forms = soup.find_all('form')
        for form in forms:
            form_data = {
                "action": form.get('action', ''),
                "method": form.get('method', 'get').upper(),
                "inputs": []
            }
            
            inputs = form.find_all(['input', 'textarea', 'select'])
            for inp in inputs:
                input_data = {
                    "type": inp.get('type', 'text'),
                    "name": inp.get('name', ''),
                    "placeholder": inp.get('placeholder', ''),
                    "required": inp.has_attr('required')
                }
                form_data["inputs"].append(input_data)
            
            result["forms"].append(form_data)
        
        # Extract links
        base_url = final_url or f"https://{domain}"
        links = soup.find_all('a', href=True)
        
        social_media_patterns = {
            'telegram': r't\.me/|telegram\.me/|@[\w]+',
            'discord': r'discord\.gg/|discord\.com/',
            'twitter': r'twitter\.com/|x\.com/',
            'facebook': r'facebook\.com/',
            'instagram': r'instagram\.com/',
            'linkedin': r'linkedin\.com/',
            'youtube': r'youtube\.com/',
            'reddit': r'reddit\.com/',
            'github': r'github\.com/'
        }
        
        for link in links:
            href = link.get('href', '')
            if not href:
                continue
            
            # Resolve relative URLs
            full_url = urljoin(base_url, href)
            parsed = urlparse(full_url)
            
            # Check if social media
            is_social = False
            for platform, pattern in social_media_patterns.items():
                if re.search(pattern, full_url, re.IGNORECASE):
                    result["links"]["social_media"].append({
                        "platform": platform,
                        "url": full_url,
                        "text": link.get_text(strip=True)
                    })
                    is_social = True
                    break
            
            if is_social:
                continue
            
            # Check if internal or external
            if parsed.netloc == '' or parsed.netloc == urlparse(base_url).netloc:
                # Internal link
                if full_url not in result["links"]["internal"]:
                    result["links"]["internal"].append(full_url)
            else:
                # External link
                if full_url not in result["links"]["external"]:
                    result["links"]["external"].append(full_url)
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        result["error"] = str(e)
        logger.warning(f"Web scraping failed for {domain}: {e}")
    
    return result


def extract_main_content(html_content: str) -> str:
    """
    Extract main content from HTML, removing navigation, headers, footers.
    
    Uses heuristics to find the main content area.
    """
    try:
        soup = BeautifulSoup(html_content, 'lxml')
        
        # Remove common non-content elements
        for element in soup.find_all(['nav', 'header', 'footer', 'aside', 'script', 'style']):
            element.decompose()
        
        # Try to find main content area
        main = soup.find('main')
        if main:
            return main.get_text(strip=True)
        
        # Try article tag
        article = soup.find('article')
        if article:
            return article.get_text(strip=True)
        
        # Try content divs
        content_divs = soup.find_all(['div'], class_=re.compile(r'content|main|article|post', re.I))
        if content_divs:
            # Get the largest one
            largest = max(content_divs, key=lambda x: len(x.get_text()))
            return largest.get_text(strip=True)
        
        # Fallback to body text
        body = soup.find('body')
        if body:
            return body.get_text(strip=True)
        
        return soup.get_text(strip=True)
    
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Content extraction failed: {e}")
        return ""


def extract_headings(html_content: str) -> Dict[str, List[str]]:
    """Extract all headings (H1-H6) from HTML."""
    try:
        soup = BeautifulSoup(html_content, 'lxml')
        headings = {
            "h1": [],
            "h2": [],
            "h3": [],
            "h4": [],
            "h5": [],
            "h6": []
        }
        
        for level in range(1, 7):
            tags = soup.find_all(f'h{level}')
            headings[f"h{level}"] = [tag.get_text(strip=True) for tag in tags if tag.get_text(strip=True)]
        
        return headings
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Heading extraction failed: {e}")
        return {f"h{i}": [] for i in range(1, 7)}

