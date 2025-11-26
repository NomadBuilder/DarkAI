"""Enhanced enrichment features: reverse WHOIS, certificate transparency, social media, email discovery."""

import requests
from typing import Dict, List, Optional
import re
from src.utils.logger import logger
from src.utils.retry import retry_with_backoff
from src.utils.rate_limiter import check_rate_limit, record_api_request
from src.utils.cache import get_cached, set_cached


# Rate limiting handled via check_rate_limit/record_api_request


def reverse_whois(domain: str, registrar: Optional[str] = None, 
                  registrant_email: Optional[str] = None) -> Dict:
    """
    Find other domains registered by the same entity (reverse WHOIS).
    
    Args:
        domain: Domain to search
        registrar: Registrar name (if known)
        registrant_email: Registrant email (if known)
    
    Returns:
        Dict with related domains
    """
    results = {
        "related_domains": [],
        "registrant_email": registrant_email,
        "registrar": registrar,
        "source": "reverse_whois"
    }
    
    # Check cache
    cached = get_cached("reverse_whois", domain, ttl_hours=168)  # 7 days
    if cached:
        return cached
    
    # Method 1: Use free reverse WHOIS APIs (limited free tiers)
    # - ViewDNS.info (free tier: 100 queries/day)
    # - WhoisXML API (free tier: 1000 queries/month)
    
    # Method 2: Certificate Transparency logs (free, no API key)
    # Domains with same registrant often share certificates
    ct_results = get_certificate_transparency(domain)
    if ct_results.get("related_domains"):
        results["related_domains"].extend(ct_results["related_domains"])
        results["source"] = "certificate_transparency"
    
    # Method 3: If we have registrant email, search for it
    if registrant_email:
        email_domains = _search_domains_by_email(registrant_email)
        results["related_domains"].extend(email_domains)
    
    # Deduplicate
    results["related_domains"] = list(set(results["related_domains"]))
    results["related_domains"] = [d for d in results["related_domains"] if d != domain]
    
    # Cache for 7 days
    set_cache(cache_key, results, ttl=604800)
    
    return results


@retry_with_backoff(max_retries=2)
def get_certificate_transparency(domain: str) -> Dict:
    """
    Get Certificate Transparency logs for a domain (crt.sh - free, no API key).
    
    Returns domains that share certificates or are related.
    """
    results = {
        "certificates": [],
        "related_domains": [],
        "subdomains": []
    }
    
    # Check cache
    cached = get_cached("ct_logs", domain, ttl_hours=24)
    if cached:
        return cached
    
    try:
        if check_rate_limit("crt.sh"):
            # Query crt.sh (Certificate Transparency log search)
            url = "https://crt.sh/"
            params = {
                "q": f"%.{domain}",
                "output": "json"
            }
            
            response = requests.get(url, params=params, timeout=15)
            if response.status_code == 200:
                data = response.json()
                
                # Extract unique domain names from certificates
                all_domains = set()
                for cert in data:
                    name_value = cert.get("name_value", "")
                    # Parse domain names (can be comma-separated or newline-separated)
                    domains = re.split(r'[,\n]', name_value)
                    for d in domains:
                        d = d.strip().lower()
                        # Remove wildcards
                        d = d.replace("*.", "")
                        if d and domain in d:
                            all_domains.add(d)
                    
                    # Also check common_name
                    cn = cert.get("common_name", "").lower()
                    if cn and domain in cn:
                        all_domains.add(cn.replace("*.", ""))
                
                results["related_domains"] = list(all_domains)
                results["certificates"] = data[:20]  # Limit to 20 certs
                results["subdomains"] = [d for d in all_domains if d.startswith(domain)]
                
                record_api_request("crt.sh")
    except Exception as e:
        logger.debug(f"Certificate Transparency lookup failed: {e}")
    
    # Cache for 24 hours
    set_cached("ct_logs", domain, results, ttl_hours=24)
    
    return results


def _search_domains_by_email(email: str) -> List[str]:
    """Search for domains registered with a specific email (limited free options)."""
    domains = []
    
    # Most reverse WHOIS by email requires paid APIs
    # Free options are very limited
    
    # Could use:
    # - ViewDNS.info reverse WHOIS (free tier: 100/day)
    # - WhoisXML API (free tier: 1000/month)
    
    return domains


def discover_emails(domain: str) -> Dict:
    """
    Discover email addresses associated with a domain.
    
    Methods:
    - Certificate Transparency logs (email in certs)
    - WHOIS data
    - Social media profiles
    - Public records
    """
    results = {
        "emails": [],
        "sources": []
    }
    
    # Check cache
    cached = get_cached("email_discovery", domain, ttl_hours=168)  # 7 days
    if cached:
        return cached
    
    # Method 1: Certificate Transparency logs
    ct_results = get_certificate_transparency(domain)
    # Extract emails from certificate data if available
    
    # Method 2: Common email patterns
    # Try common admin emails
    common_emails = [
        f"admin@{domain}",
        f"contact@{domain}",
        f"info@{domain}",
        f"abuse@{domain}",
        f"support@{domain}"
    ]
    # Note: We can't verify these exist without sending emails
    # But we can list them as potential contacts
    
    results["emails"] = common_emails
    results["sources"] = ["common_patterns"]
    
    # Cache for 7 days
    set_cache(cache_key, results, ttl=604800)
    
    return results


def search_social_media(handle: str, platform: Optional[str] = None) -> Dict:
    """
    Search for social media profiles associated with a handle.
    
    Args:
        handle: Username/handle to search
        platform: Specific platform (WhatsApp, Telegram, Instagram, etc.)
    
    Returns:
        Dict with profile information
    """
    results = {
        "profiles": [],
        "platforms": []
    }
    
    # Most social media APIs require authentication
    # Free options are limited:
    # - Public profile scraping (rate-limited, may violate ToS)
    # - Some platforms have public APIs (limited)
    
    # For now, return structure for future implementation
    return results


def enrich_with_threat_intel(enrichment_data: Dict, entity_type: str, value: str) -> Dict:
    """
    Add threat intelligence data to enrichment results.
    
    Args:
        enrichment_data: Existing enrichment data
        entity_type: Type of entity (domain, phone, etc.)
        value: Entity value
    
    Returns:
        Enriched data with threat intelligence
    """
    from src.enrichment.threat_intel import check_threat_intel
    
    threat_data = {}
    
    if entity_type == "domain":
        threat_data = check_threat_intel(domain=value)
        if enrichment_data.get("ip_address"):
            ip_threat = check_threat_intel(ip=enrichment_data["ip_address"])
            if ip_threat.get("is_malicious"):
                threat_data["is_malicious"] = True
                threat_data["threat_sources"].extend(ip_threat.get("threat_sources", []))
    
    elif entity_type == "phone":
        # Limited threat intel for phone numbers
        # Could check against spam/abuse databases
        pass
    
    # Add threat intelligence to enrichment data
    enrichment_data["threat_intel"] = threat_data
    enrichment_data["is_malicious"] = threat_data.get("is_malicious", False)
    enrichment_data["reputation_score"] = threat_data.get("reputation_score", 100)
    
    return enrichment_data

