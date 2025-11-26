"""Reverse IP lookup and IP reputation enrichment."""

import requests
from typing import Dict, List
import os
from dotenv import load_dotenv

load_dotenv()


def reverse_ip_lookup(ip_address: str) -> Dict:
    """
    Perform reverse IP lookup to find other domains on the same IP.
    
    Uses free APIs where available.
    
    Returns:
        Dictionary with reverse IP data
    """
    result = {
        "shared_domains": [],
        "shared_domain_count": 0,
        "ip_reputation": None,
        "is_shared_hosting": False
    }
    
    if not ip_address:
        return result
    
    try:
        # Method 1: SecurityTrails API (free tier available)
        securitytrails_key = os.getenv("SECURITYTRAILS_API_KEY", "")
        if securitytrails_key:
            url = f"https://api.securitytrails.com/v1/domains/list"
            headers = {"APIKEY": securitytrails_key}
            params = {"ipv4": ip_address}
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                domains = data.get("records", [])
                result["shared_domains"] = [d.get("hostname", "") for d in domains[:100]]  # Limit to 100
                result["shared_domain_count"] = len(domains)
                result["is_shared_hosting"] = len(domains) > 1
        
        # Method 2: Use free reverse DNS lookup (limited)
        # Note: Most free APIs have rate limits
        if not result["shared_domains"]:
            # Try using dns.reversename (limited results)
            try:
                import dns.reversename
                import dns.resolver
                rev_name = dns.reversename.from_address(ip_address)
                ptr_records = dns.resolver.resolve(rev_name, 'PTR')
                result["shared_domains"] = [str(ptr).rstrip('.') for ptr in ptr_records]
                result["shared_domain_count"] = len(result["shared_domains"])
            except:
                pass
        
        # Method 3: Check IP reputation using free services
        # AbuseIPDB (free tier: 1,000 requests/day)
        abuseipdb_key = os.getenv("ABUSEIPDB_API_KEY", "")
        if abuseipdb_key:
            url = "https://api.abuseipdb.com/api/v2/check"
            headers = {"Key": abuseipdb_key, "Accept": "application/json"}
            params = {"ipAddress": ip_address, "maxAgeInDays": 90, "verbose": ""}
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("data"):
                    abuse_confidence = data["data"].get("abuseConfidenceScore", 0)
                    result["ip_reputation"] = {
                        "abuse_score": abuse_confidence,
                        "is_public": data["data"].get("isPublic", False),
                        "usage_type": data["data"].get("usageType", ""),
                        "is_whitelisted": data["data"].get("isWhitelisted", False)
                    }
        
        # If shared_domain_count > 10, likely shared hosting
        if result["shared_domain_count"] > 10:
            result["is_shared_hosting"] = True
            
    except Exception as e:
        print(f"Reverse IP lookup failed for {ip_address}: {e}")
    
    return result


