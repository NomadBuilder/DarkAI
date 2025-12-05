"""SSL/TLS certificate analysis module."""

import ssl
import socket
from typing import Dict, Optional
from datetime import datetime
import re


def analyze_ssl_certificate(domain: str) -> Dict:
    """
    Analyze SSL/TLS certificate for a domain.
    
    Args:
        domain: Domain name to analyze
        
    Returns:
        Dictionary with SSL certificate information
    """
    result = {
        "certificate_available": False,
        "issuer": None,
        "subject": None,
        "valid_from": None,
        "valid_until": None,
        "days_until_expiry": None,
        "serial_number": None,
        "version": None,
        "signature_algorithm": None,
        "tls_version": None,
        "cipher_suite": None,
        "is_valid": False,
        "is_expired": False,
        "is_self_signed": False,
        "error": None
    }
    
    try:
        # Try HTTPS connection
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE  # Don't verify cert (many sketchy sites have invalid certs)
        
        with socket.create_connection((domain, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                cipher = ssock.cipher()
                
                result["certificate_available"] = True
                result["tls_version"] = ssock.version()
                
                if cipher:
                    result["cipher_suite"] = {
                        "name": cipher[0],
                        "version": cipher[1],
                        "bits": cipher[2] if len(cipher) > 2 else None
                    }
                
                if cert:
                    # Issuer
                    issuer = dict(x[0] for x in cert.get('issuer', []))
                    result["issuer"] = issuer.get('commonName') or issuer.get('organizationName') or str(issuer)
                    
                    # Subject
                    subject = dict(x[0] for x in cert.get('subject', []))
                    result["subject"] = subject.get('commonName') or subject.get('organizationName') or str(subject)
                    
                    # Validity dates
                    if cert.get('notBefore'):
                        try:
                            result["valid_from"] = datetime.strptime(cert['notBefore'], '%b %d %H:%M:%S %Y %Z').isoformat()
                        except (ValueError, TypeError) as e:
                            # Fallback to raw value if parsing fails
                            result["valid_from"] = str(cert['notBefore'])
                    
                    if cert.get('notAfter'):
                        try:
                            valid_until = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                            result["valid_until"] = valid_until.isoformat()
                            
                            # Calculate days until expiry
                            now = datetime.now()
                            if valid_until > now:
                                result["days_until_expiry"] = (valid_until - now).days
                                result["is_valid"] = True
                            else:
                                result["is_expired"] = True
                                result["days_until_expiry"] = 0
                        except (ValueError, TypeError) as e:
                            # Fallback to raw value if parsing fails
                            result["valid_until"] = str(cert['notAfter'])
                    
                    # Serial number
                    result["serial_number"] = str(cert.get('serialNumber', ''))
                    
                    # Version
                    result["version"] = cert.get('version')
                    
                    # Check if self-signed (issuer == subject)
                    if result["issuer"] and result["subject"]:
                        result["is_self_signed"] = (result["issuer"].lower() == result["subject"].lower())
                    
                    # Signature algorithm (if available in extensions)
                    if cert.get('signatureAlgorithm'):
                        result["signature_algorithm"] = cert['signatureAlgorithm']
    
    except socket.timeout:
        result["error"] = "Connection timeout"
    except socket.gaierror:
        result["error"] = "DNS resolution failed"
    except ssl.SSLError as e:
        result["error"] = f"SSL error: {str(e)}"
    except Exception as e:
        result["error"] = f"Certificate analysis failed: {str(e)}"
    
    return result


def get_certificate_transparency(domain: str) -> Dict:
    """
    Get certificate transparency logs for a domain.
    
    Uses crt.sh API (free, no API key needed).
    
    Args:
        domain: Domain name to check
        
    Returns:
        Dictionary with CT log information
    """
    result = {
        "ct_logs": [],
        "total_certificates": 0,
        "first_seen": None,
        "last_seen": None,
        "subdomains": []
    }
    
    try:
        import requests
        url = f"https://crt.sh/?q={domain}&output=json"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if isinstance(data, list) and len(data) > 0:
                result["total_certificates"] = len(data)
                
                # Extract unique subdomains
                subdomains = set()
                dates = []
                
                for cert in data:
                    name = cert.get('name_value', '')
                    if name and name != domain:
                        # Clean up name (remove wildcards, etc.)
                        clean_name = name.replace('*.', '').strip()
                        if clean_name and clean_name != domain:
                            subdomains.add(clean_name)
                    
                    # Get dates
                    if cert.get('not_before'):
                        dates.append(cert['not_before'])
                    if cert.get('not_after'):
                        dates.append(cert['not_after'])
                
                result["subdomains"] = sorted(list(subdomains))[:50]  # Limit to 50
                
                if dates:
                    result["first_seen"] = min(dates)
                    result["last_seen"] = max(dates)
                
                # Store sample CT log entries
                result["ct_logs"] = data[:10]  # First 10 entries
    
    except Exception as e:
        result["error"] = f"CT log lookup failed: {str(e)}"
    
    return result

