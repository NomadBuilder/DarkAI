"""HTTP security headers analysis module."""

import requests
from typing import Dict, List
from urllib.parse import urlparse


def analyze_security_headers(domain: str) -> Dict:
    """
    Analyze HTTP security headers for a domain.
    
    Checks for:
    - Content Security Policy (CSP)
    - Strict Transport Security (HSTS)
    - X-Frame-Options
    - X-Content-Type-Options
    - Referrer-Policy
    - Permissions-Policy
    - And other security headers
    
    Args:
        domain: Domain name to analyze
        
    Returns:
        Dictionary with security header analysis
    """
    result = {
        "headers_present": {},
        "headers_missing": [],
        "security_score": 0,
        "recommendations": [],
        "csp": None,
        "hsts": None,
        "x_frame_options": None,
        "x_content_type_options": None,
        "referrer_policy": None,
        "permissions_policy": None,
        "error": None
    }
    
    # Security headers to check
    security_headers = {
        "Content-Security-Policy": "csp",
        "Strict-Transport-Security": "hsts",
        "X-Frame-Options": "x_frame_options",
        "X-Content-Type-Options": "x_content_type_options",
        "Referrer-Policy": "referrer_policy",
        "Permissions-Policy": "permissions_policy",
        "X-XSS-Protection": "x_xss_protection",
        "Public-Key-Pins": "hpkp",
        "Expect-CT": "expect_ct"
    }
    
    try:
        # Try HTTPS first, fallback to HTTP
        urls_to_try = [
            f"https://{domain}",
            f"http://{domain}"
        ]
        
        response = None
        for url in urls_to_try:
            try:
                # Use Config timeout if available, otherwise 25 seconds
                try:
                    from src.utils.config import Config
                    timeout_value = Config.API_TIMEOUT_SECONDS
                except:
                    timeout_value = 25
                
                response = requests.get(
                    url,
                    timeout=timeout_value,
                    allow_redirects=True,
                    verify=False,  # Many sketchy sites have invalid certs
                    headers={
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                )
                if response.status_code == 200:
                    break
            except (requests.exceptions.RequestException, requests.exceptions.SSLError):
                continue
        
        if not response or response.status_code != 200:
            result["error"] = f"Failed to fetch: {response.status_code if response else 'No response'}"
            return result
        
        headers = response.headers
        
        # Check each security header
        for header_name, result_key in security_headers.items():
            header_value = headers.get(header_name)
            if header_value:
                result["headers_present"][header_name] = header_value
                result[result_key] = header_value
            else:
                result["headers_missing"].append(header_name)
        
        # Calculate security score (0-100)
        total_headers = len(security_headers)
        present_headers = len(result["headers_present"])
        result["security_score"] = int((present_headers / total_headers) * 100) if total_headers > 0 else 0
        
        # Generate recommendations
        if "Strict-Transport-Security" not in result["headers_present"]:
            result["recommendations"].append("Enable HSTS to force HTTPS connections")
        
        if "Content-Security-Policy" not in result["headers_present"]:
            result["recommendations"].append("Add CSP to prevent XSS attacks")
        
        if "X-Frame-Options" not in result["headers_present"]:
            result["recommendations"].append("Add X-Frame-Options to prevent clickjacking")
        
        if "X-Content-Type-Options" not in result["headers_present"]:
            result["recommendations"].append("Add X-Content-Type-Options: nosniff")
        
        # Analyze CSP if present
        if result["csp"]:
            csp_analysis = analyze_csp(result["csp"])
            result["csp_analysis"] = csp_analysis
        
        # Analyze HSTS if present
        if result["hsts"]:
            hsts_analysis = analyze_hsts(result["hsts"])
            result["hsts_analysis"] = hsts_analysis
    
    except Exception as e:
        result["error"] = f"Security headers analysis failed: {str(e)}"
    
    return result


def analyze_csp(csp_header: str) -> Dict:
    """Analyze Content Security Policy header."""
    result = {
        "directives": {},
        "has_unsafe_inline": False,
        "has_unsafe_eval": False,
        "allows_external_scripts": False,
        "allows_data_uris": False
    }
    
    # Parse CSP directives
    directives = csp_header.split(';')
    for directive in directives:
        directive = directive.strip()
        if ' ' in directive:
            key, value = directive.split(' ', 1)
            result["directives"][key.lower()] = value
        
        # Check for unsafe patterns
        if 'unsafe-inline' in directive.lower():
            result["has_unsafe_inline"] = True
        if 'unsafe-eval' in directive.lower():
            result["has_unsafe_eval"] = True
        if 'http://' in directive.lower() or 'https://' in directive.lower():
            result["allows_external_scripts"] = True
        if 'data:' in directive.lower():
            result["allows_data_uris"] = True
    
    return result


def analyze_hsts(hsts_header: str) -> Dict:
    """Analyze HSTS header."""
    result = {
        "max_age": None,
        "include_subdomains": False,
        "preload": False
    }
    
    # Parse HSTS directives
    if "max-age" in hsts_header.lower():
        import re
        match = re.search(r'max-age=(\d+)', hsts_header, re.IGNORECASE)
        if match:
            result["max_age"] = int(match.group(1))
    
    result["include_subdomains"] = "includeSubDomains" in hsts_header
    result["preload"] = "preload" in hsts_header
    
    return result

