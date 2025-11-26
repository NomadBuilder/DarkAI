"""Subdomain enumeration and discovery module."""

import dns.resolver
from typing import Dict, List
import os
from dotenv import load_dotenv

load_dotenv()


def enumerate_subdomains(domain: str) -> List[str]:
    """
    Enumerate subdomains using common subdomain names and DNS queries.
    
    Returns:
        List of discovered subdomains
    """
    subdomains = []
    
    # Common subdomain prefixes
    common_prefixes = [
        'www', 'mail', 'ftp', 'blog', 'api', 'admin', 'test', 'dev',
        'staging', 'prod', 'app', 'cdn', 'static', 'assets', 'img',
        'images', 'media', 'files', 'download', 'upload', 'secure',
        'ssl', 'vpn', 'remote', 'ssh', 'ns', 'ns1', 'ns2', 'ns3',
        'webmail', 'email', 'smtp', 'pop', 'imap', 'exchange', 'owa',
        'cpanel', 'whm', 'webdisk', 'autodiscover', 'autoconfig',
        'm', 'mobile', 'wap', 'old', 'new', 'backup', 'backups',
        'beta', 'alpha', 'demo', 'docs', 'support', 'help', 'faq',
        'shop', 'store', 'cart', 'checkout', 'payment', 'pay',
        'forum', 'forums', 'community', 'chat', 'irc', 'wiki',
        'search', 'search2', 'find', 'archive', 'archives', 'old'
    ]
    
    # Try common subdomains
    for prefix in common_prefixes[:50]:  # Limit to first 50 to avoid timeout
        try:
            subdomain = f"{prefix}.{domain}"
            dns.resolver.resolve(subdomain, 'A')
            subdomains.append(subdomain)
        except:
            pass
    
    return subdomains


def enrich_subdomains(domain: str) -> Dict:
    """
    Enrich domain with subdomain information.
    
    Returns:
        Dictionary with subdomain data
    """
    result = {
        "subdomains": [],
        "subdomain_count": 0
    }
    
    try:
        subdomains = enumerate_subdomains(domain)
        result["subdomains"] = subdomains
        result["subdomain_count"] = len(subdomains)
    except Exception as e:
        print(f"Subdomain enumeration failed for {domain}: {e}")
    
    return result


