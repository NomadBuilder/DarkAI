"""Security headers and threat intelligence enrichment."""

import requests
from typing import Dict, Optional
import os
from dotenv import load_dotenv

load_dotenv()


def enrich_security_headers(domain: str) -> Dict:
    """
    Analyze security headers from HTTP response.
    
    Returns:
        Dictionary with security header information
    """
    result = {
        "security_headers": {},
        "hsts": False,
        "csp": False,
        "x_frame_options": None,
        "x_content_type_options": None,
        "x_xss_protection": None,
        "referrer_policy": None,
        "permissions_policy": None,
        "security_score": 0
    }
    
    try:
        url = f"https://{domain}" if not domain.startswith("http") else domain
        response = requests.get(url, timeout=10, allow_redirects=True, verify=False)
        
        headers = dict(response.headers)
        
        # Check for HSTS
        if headers.get("Strict-Transport-Security"):
            result["hsts"] = True
            result["security_headers"]["hsts"] = headers["Strict-Transport-Security"]
            result["security_score"] += 20
        
        # Check for Content Security Policy
        if headers.get("Content-Security-Policy") or headers.get("X-Content-Security-Policy"):
            result["csp"] = True
            csp = headers.get("Content-Security-Policy") or headers.get("X-Content-Security-Policy")
            result["security_headers"]["csp"] = csp
            result["security_score"] += 15
        
        # X-Frame-Options
        if headers.get("X-Frame-Options"):
            result["x_frame_options"] = headers["X-Frame-Options"]
            result["security_score"] += 10
        
        # X-Content-Type-Options
        if headers.get("X-Content-Type-Options"):
            result["x_content_type_options"] = headers["X-Content-Type-Options"]
            result["security_score"] += 10
        
        # X-XSS-Protection
        if headers.get("X-XSS-Protection"):
            result["x_xss_protection"] = headers["X-XSS-Protection"]
            result["security_score"] += 5
        
        # Referrer-Policy
        if headers.get("Referrer-Policy"):
            result["referrer_policy"] = headers["Referrer-Policy"]
            result["security_score"] += 5
        
        # Permissions-Policy / Feature-Policy
        if headers.get("Permissions-Policy") or headers.get("Feature-Policy"):
            result["permissions_policy"] = headers.get("Permissions-Policy") or headers.get("Feature-Policy")
            result["security_score"] += 5
        
        # Normalize score to 0-100
        result["security_score"] = min(result["security_score"], 100)
        
    except Exception as e:
        # Silently fail - some domains may not be accessible
        pass
    
    return result


def check_threat_intelligence(domain: str, ip_address: str = None) -> Dict:
    """
    Check domain/IP against threat intelligence databases.
    
    Uses free APIs where available.
    
    Returns:
        Dictionary with threat intelligence data
    """
    result = {
        "is_blacklisted": False,
        "blacklist_sources": [],
        "threat_score": 0,
        "malware_detections": [],
        "phishing_detections": []
    }
    
    # VirusTotal API (free tier: 4 requests/minute)
    virustotal_key = os.getenv("VIRUSTOTAL_API_KEY", "")
    if virustotal_key:
        try:
            # Check domain
            url = f"https://www.virustotal.com/vtapi/v2/domain/report"
            params = {"apikey": virustotal_key, "domain": domain}
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("response_code") == 1:
                    # Check detections
                    detections = data.get("detected_urls", [])
                    if detections:
                        result["is_blacklisted"] = True
                        result["threat_score"] = len(detections)
                        result["malware_detections"] = [
                            d.get("url", "") for d in detections[:10]
                        ]
        except Exception as e:
            print(f"VirusTotal lookup failed for {domain}: {e}")
    
    # AbuseIPDB for IP reputation (if IP provided)
    if ip_address:
        abuseipdb_key = os.getenv("ABUSEIPDB_API_KEY", "")
        if abuseipdb_key:
            try:
                url = "https://api.abuseipdb.com/api/v2/check"
                headers = {"Key": abuseipdb_key, "Accept": "application/json"}
                params = {"ipAddress": ip_address, "maxAgeInDays": 90}
                response = requests.get(url, headers=headers, params=params, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("data"):
                        abuse_score = data["data"].get("abuseConfidenceScore", 0)
                        if abuse_score > 50:
                            result["is_blacklisted"] = True
                            result["threat_score"] = max(result["threat_score"], abuse_score)
                            result["blacklist_sources"].append("AbuseIPDB")
            except Exception as e:
                print(f"AbuseIPDB lookup failed for {ip_address}: {e}")
    
    return result


