"""IP location and hosting enrichment module."""

import os
import requests
from typing import Dict, Optional
from dotenv import load_dotenv

load_dotenv()


def enrich_ip_location(ip_address: str) -> Dict:
    """Enrich IP address with location and hosting data using IPLocate.io."""
    result = {
        "host_name": None,
        "asn": None,
        "isp": None
    }
    
    if not ip_address:
        return result
    
    api_key = os.getenv("IPLOCATE_API_KEY", "")
    
    try:
        # IPLocate.io free API (no key required for basic lookups)
        url = "https://www.iplocate.io/api/lookup/" + ip_address
        if api_key:
            url += f"?apikey={api_key}"
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            asn_data = data.get("asn", "")
            # Handle ASN as string or dict
            if isinstance(asn_data, dict):
                result["asn"] = str(asn_data.get("asn", ""))
            elif isinstance(asn_data, str):
                result["asn"] = asn_data.replace("AS", "").strip()
            else:
                result["asn"] = str(asn_data) if asn_data else None
            
            result["isp"] = data.get("org", "")  # IPLocate uses 'org' for ISP
            
            # Try to extract hostname from org field
            org = data.get("org", "")
            if org:
                result["host_name"] = org.split()[0] if org.split() else None
        
        # Fallback: Try ip-api.com (free, no key required, 45 req/min)
        if not api_key:
            url = f"http://ip-api.com/json/{ip_address}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    asn_str = data.get("as", "")
                    if asn_str:
                        result["asn"] = asn_str.replace("AS", "").strip()
                    result["isp"] = result.get("isp") or data.get("isp", "")
                    result["host_name"] = result.get("host_name") or data.get("org", "")
    
    except Exception as e:
        print(f"IP location lookup failed for {ip_address}: {e}")
    
    return result


def enrich_with_alternate_api(ip_address: str) -> Dict:
    """Fallback IP enrichment using ip-api.com."""
    result = {
        "host_name": None,
        "asn": None,
        "isp": None
    }
    
    if not ip_address:
        return result
    
    try:
        url = f"http://ip-api.com/json/{ip_address}"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success":
                result["asn"] = data.get("as", "").replace("AS", "") if data.get("as") else None
                result["isp"] = data.get("isp", "")
                result["host_name"] = data.get("org", "")
    
    except Exception as e:
        print(f"Alternate IP lookup failed for {ip_address}: {e}")
    
    return result

