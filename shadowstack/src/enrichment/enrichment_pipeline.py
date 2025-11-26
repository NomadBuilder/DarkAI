"""Main enrichment pipeline that orchestrates all enrichment steps."""

from typing import Dict, List
from .whois_enrichment import enrich_whois, enrich_dns
from .ip_enrichment import enrich_ip_location
from .cms_enrichment import detect_cms
from .payment_detection import detect_payment_processors
from .tech_stack_enrichment import detect_full_tech_stack

# Try to import Wappalyzer for full tech stack
try:
    from Wappalyzer import Wappalyzer, WebPage
    WAPPALYZER_AVAILABLE = True
except ImportError:
    try:
        from wappalyzer import Wappalyzer, WebPage
        WAPPALYZER_AVAILABLE = True
    except ImportError:
        WAPPALYZER_AVAILABLE = False


def enrich_domain(domain: str) -> Dict:
    """
    Enrich a domain with all available data sources.
    
    Args:
        domain: Domain name to enrich
        
    Returns:
        Dictionary containing all enrichment data
    """
    print(f"Enriching domain: {domain}")
    
    result = {
        "domain": domain,
        "ip_address": None,
        "ip_addresses": [],  # All IPs
        "ipv6_addresses": [],
        "host_name": None,
        "asn": None,
        "isp": None,
        "cdn": None,
        "cms": None,
        "payment_processor": None,
        "registrar": None,
        "creation_date": None,
        "expiration_date": None,
        "updated_date": None,
        "name_servers": [],
        "mx_records": [],
        "whois_status": None,
        "web_server": None,
        "frameworks": [],
        "analytics": [],
        "languages": [],
        "tech_stack": {},
        "http_headers": {},
        "ssl_info": {},
        "whois_data": {},
        "dns_records": {}
    }
    
    # Step 1: WHOIS enrichment
    print(f"  → WHOIS lookup...")
    whois_data = enrich_whois(domain)
    result.update(whois_data)
    
    # Extract additional WHOIS fields
    if whois_data.get("whois_data"):
        whois_info = whois_data["whois_data"]
        if whois_info.get("expiration_date"):
            try:
                from datetime import datetime
                exp_str = str(whois_info["expiration_date"])
                # Try to parse expiration date
                if isinstance(whois_info["expiration_date"], list):
                    exp_str = str(whois_info["expiration_date"][0])
                result["expiration_date"] = exp_str
            except:
                pass
        if whois_info.get("updated_date"):
            result["updated_date"] = str(whois_info["updated_date"])
        if whois_info.get("name_servers"):
            result["name_servers"] = whois_info["name_servers"] if isinstance(whois_info["name_servers"], list) else [whois_info["name_servers"]]
        if whois_info.get("status"):
            status_list = whois_info["status"] if isinstance(whois_info["status"], list) else [whois_info["status"]]
            result["whois_status"] = ", ".join(str(s) for s in status_list) if status_list else None
    
    # Step 2: DNS enrichment
    print(f"  → DNS lookup...")
    dns_data = enrich_dns(domain)
    result.update(dns_data)
    
    # Extract all IPs and DNS records
    if dns_data.get("dns_records"):
        dns_recs = dns_data["dns_records"]
        if dns_recs.get("A"):
            result["ip_addresses"] = dns_recs["A"]
            result["ip_address"] = dns_recs["A"][0] if dns_recs["A"] else None
        if dns_recs.get("AAAA"):
            result["ipv6_addresses"] = dns_recs["AAAA"]
        if dns_recs.get("MX"):
            result["mx_records"] = dns_recs["MX"]
        if dns_recs.get("NS"):
            if not result.get("name_servers"):
                result["name_servers"] = dns_recs["NS"]
    
    # Step 3: IP location and hosting (if IP found)
    if result.get("ip_address"):
        print(f"  → IP location lookup for {result['ip_address']}...")
        ip_data = enrich_ip_location(result["ip_address"])
        # Ensure ASN is a string, not a dict
        if isinstance(ip_data.get("asn"), dict):
            ip_data["asn"] = str(ip_data["asn"].get("asn", ""))
        elif ip_data.get("asn"):
            ip_data["asn"] = str(ip_data["asn"]).replace("AS", "").strip()
        result.update(ip_data)
    
    # Step 4: Full tech stack detection (using Wappalyzer library if available)
    print(f"  → Full tech stack detection...")
    try:
        tech_stack = detect_full_tech_stack(domain)
        if tech_stack:
            result["tech_stack"] = tech_stack
            # Extract key fields from tech stack
            if tech_stack.get("cms") and not result.get("cms"):
                result["cms"] = tech_stack["cms"]
            if tech_stack.get("cdn") and not result.get("cdn"):
                result["cdn"] = tech_stack["cdn"]
            if tech_stack.get("frameworks"):
                result["frameworks"] = tech_stack["frameworks"]
            if tech_stack.get("analytics"):
                result["analytics"] = tech_stack["analytics"]
            if tech_stack.get("javascript_frameworks"):
                result["frameworks"].extend(tech_stack["javascript_frameworks"])
            if tech_stack.get("web_servers"):
                result["web_server"] = tech_stack["web_servers"][0] if tech_stack["web_servers"] else None
            if tech_stack.get("payment_processors"):
                processors = tech_stack["payment_processors"]
                if result.get("payment_processor"):
                    existing = result["payment_processor"].split(", ")
                    all_processors = list(set(existing + processors))
                    result["payment_processor"] = ", ".join(all_processors)
                else:
                    result["payment_processor"] = ", ".join(processors)
            if tech_stack.get("programming_languages"):
                result["languages"] = tech_stack["programming_languages"]
    except Exception as e:
        print(f"  ⚠️  Full tech stack detection failed: {e}")
    
    # Step 5: CMS detection (fallback if tech stack didn't provide it)
    if not result.get("cms"):
        print(f"  → CMS detection...")
        cms = detect_cms(domain)
        if cms:
            result["cms"] = cms
    
    # Step 6: Payment processor detection (fallback)
    if not result.get("payment_processor"):
        print(f"  → Payment processor detection...")
        processors = detect_payment_processors(domain)
        if processors:
            result["payment_processor"] = ", ".join(processors)
    
    # Step 7: HTTP headers and server info
    print(f"  → HTTP headers analysis...")
    try:
        import requests
        url = f"https://{domain}" if not domain.startswith("http") else domain
        response = requests.get(url, timeout=10, allow_redirects=True, verify=False)
        
        # Extract HTTP headers
        headers = dict(response.headers)
        result["http_headers"] = {
            "server": headers.get("Server"),
            "x_powered_by": headers.get("X-Powered-By"),
            "content_type": headers.get("Content-Type"),
            "status_code": response.status_code
        }
        
        # Detect web server from headers
        if headers.get("Server") and not result.get("web_server"):
            result["web_server"] = headers.get("Server")
            
    except Exception as e:
        # Silently fail - some domains may not be accessible
        pass
    
    print(f"  ✓ Enrichment complete for {domain}")
    
    return result

