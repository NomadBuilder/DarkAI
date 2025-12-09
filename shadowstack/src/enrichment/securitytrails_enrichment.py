"""SecurityTrails API enrichment module."""

import requests
import os
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

SECURITYTRAILS_API_KEY = os.getenv("SECURITYTRAILS_API_KEY", "")
SECURITYTRAILS_BASE_URL = "https://api.securitytrails.com/v1"


def enrich_with_securitytrails(domain: str) -> Dict:
    """
    Enrich domain with SecurityTrails API data.
    
    Returns:
        Dictionary with SecurityTrails enrichment data
    """
    result = {
        "securitytrails": {
            "available": False,
            "subdomains": [],
            "subdomain_count": 0,
            "historical_dns": [],
            "whois_history": [],
            "associated_domains": [],
            "dns_records": {},
            "tags": []
        }
    }
    
    if not SECURITYTRAILS_API_KEY:
        return result
    
    headers = {"APIKEY": SECURITYTRAILS_API_KEY}
    
    try:
        # 1. Get domain details (current DNS, WHOIS, tags)
        url = f"{SECURITYTRAILS_BASE_URL}/domain/{domain}"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            result["securitytrails"]["available"] = True
            
            # Current DNS records
            if data.get("current_dns"):
                dns = data["current_dns"]
                # Extract IPs from A records
                a_ips = []
                if dns.get("a", {}).get("values"):
                    a_ips = [v.get("ip") for v in dns["a"]["values"] if v.get("ip")]
                
                # Extract values from other record types
                mx_records = []
                if dns.get("mx", {}).get("values"):
                    mx_records = [v.get("host") for v in dns["mx"]["values"] if v.get("host")]
                
                ns_records = []
                if dns.get("ns", {}).get("values"):
                    ns_records = [v.get("host") for v in dns["ns"]["values"] if v.get("host")]
                
                txt_records = []
                if dns.get("txt", {}).get("values"):
                    txt_records = [v.get("value") for v in dns["txt"]["values"] if v.get("value")]
                
                result["securitytrails"]["dns_records"] = {
                    "a": a_ips,
                    "aaaa": dns.get("aaaa", {}).get("values", []),
                    "mx": mx_records,
                    "ns": ns_records,
                    "txt": txt_records
                }
            
            # Tags (security classifications)
            if data.get("tags"):
                result["securitytrails"]["tags"] = data["tags"]
        
        # 2. Get subdomains
        url = f"{SECURITYTRAILS_BASE_URL}/domain/{domain}/subdomains"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            subdomains = data.get("subdomains", [])
            result["securitytrails"]["subdomains"] = subdomains
            result["securitytrails"]["subdomain_count"] = len(subdomains)
        
        # 3. Get historical DNS records (last 30 days)
        url = f"{SECURITYTRAILS_BASE_URL}/history/{domain}/dns/a"
        response = requests.get(url, headers=headers, params={"page": 1}, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            records = data.get("records", [])
            # Get unique IPs from history
            historical_ips = []
            for record in records[:50]:  # Limit to 50 most recent
                if record.get("values"):
                    historical_ips.extend([v.get("ip") for v in record["values"] if v.get("ip")])
            result["securitytrails"]["historical_dns"] = list(set(historical_ips))[:20]  # Unique, limit to 20
        elif response.status_code == 429:
            print(f"  ⚠️  SecurityTrails rate limit hit for historical DNS")
        
        # 4. Get WHOIS history (ownership changes)
        url = f"{SECURITYTRAILS_BASE_URL}/history/{domain}/whois"
        response = requests.get(url, headers=headers, params={"page": 1}, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            history = data.get("history", [])
            result["securitytrails"]["whois_history"] = [
                {
                    "date": h.get("created_date"),
                    "registrar": h.get("registrar"),
                    "registrant": h.get("registrant")
                }
                for h in history[:10]  # Last 10 changes
            ]
        
        # 5. Get associated domains (same registrant email/org)
        # This requires reverse WHOIS which SecurityTrails supports
        url = f"{SECURITYTRAILS_BASE_URL}/domains/list"
        # Note: This requires email/org from WHOIS first
        
    except Exception as e:
        print(f"SecurityTrails enrichment failed for {domain}: {e}")
    
    return result


def get_securitytrails_ip_data(ip_address: str) -> Dict:
    """
    Get IP address data from SecurityTrails.
    
    Returns:
        Dictionary with IP information
    """
    result = {
        "securitytrails_ip": {
            "available": False,
            "associated_domains": [],
            "domain_count": 0,
            "nearby_ips": [],
            "ip_info": {}
        }
    }
    
    if not SECURITYTRAILS_API_KEY:
        return result
    
    headers = {"APIKEY": SECURITYTRAILS_API_KEY}
    
    try:
        # Get domains on this IP
        url = f"{SECURITYTRAILS_BASE_URL}/domains/list"
        params = {"ipv4": ip_address}
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            records = data.get("records", [])
            result["securitytrails_ip"]["available"] = True
            result["securitytrails_ip"]["associated_domains"] = [
                r.get("hostname", "") for r in records[:100]
            ]
            result["securitytrails_ip"]["domain_count"] = len(records)
        
        # Get IP details
        url = f"{SECURITYTRAILS_BASE_URL}/ips/nearby/{ip_address}"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            result["securitytrails_ip"]["nearby_ips"] = data.get("blocks", [])[:10]
            result["securitytrails_ip"]["ip_info"] = data.get("record", {})
        
    except Exception as e:
        print(f"SecurityTrails IP lookup failed for {ip_address}: {e}")
    
    return result

