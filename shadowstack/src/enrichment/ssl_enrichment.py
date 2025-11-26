"""SSL/TLS Certificate enrichment module."""

import socket
import ssl
from typing import Dict, Optional
from datetime import datetime


def enrich_ssl_certificate(domain: str) -> Dict:
    """
    Enrich domain with SSL/TLS certificate information.
    
    Returns:
        Dictionary with SSL certificate details
    """
    result = {
        "ssl_issuer": None,
        "ssl_subject": None,
        "ssl_expires": None,
        "ssl_starts": None,
        "ssl_sans": [],  # Subject Alternative Names
        "ssl_fingerprint": None,
        "ssl_version": None,
        "ssl_cipher": None
    }
    
    try:
        # Try HTTPS first
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        
        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                cipher = ssock.cipher()
                
                if cert:
                    # Extract certificate information
                    issuer = dict(x[0] for x in cert.get('issuer', []))
                    subject = dict(x[0] for x in cert.get('subject', []))
                    
                    result["ssl_issuer"] = issuer.get('commonName', '') or issuer.get('organizationName', '')
                    result["ssl_subject"] = subject.get('commonName', '') or subject.get('organizationName', '')
                    
                    # Certificate dates
                    if cert.get('notAfter'):
                        result["ssl_expires"] = datetime.strptime(
                            cert['notAfter'], '%b %d %H:%M:%S %Y %Z'
                        ).isoformat()
                    if cert.get('notBefore'):
                        result["ssl_starts"] = datetime.strptime(
                            cert['notBefore'], '%b %d %H:%M:%S %Y %Z'
                        ).isoformat()
                    
                    # Subject Alternative Names
                    ext_keyusage = cert.get('subjectAltName', [])
                    for san_type, san_value in ext_keyusage:
                        if san_type == 'DNS':
                            result["ssl_sans"].append(san_value)
                    
                    # Certificate fingerprint (SHA256)
                    cert_der = ssock.getpeercert(binary_form=True)
                    if cert_der:
                        import hashlib
                        result["ssl_fingerprint"] = hashlib.sha256(cert_der).hexdigest()
                
                if cipher:
                    result["ssl_version"] = cipher[1]  # Protocol version
                    result["ssl_cipher"] = cipher[0]   # Cipher suite
                    
    except Exception as e:
        # Silently fail - not all domains have SSL
        pass
    
    return result


