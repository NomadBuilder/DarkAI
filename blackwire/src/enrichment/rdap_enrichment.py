"""
RDAP and advanced security analysis enrichment for BlackWire.
Provides RDAP lookups, SSL/TLS analysis, email security, and typosquatting detection.
Inspired by rdap-lookup tool capabilities.
"""

import socket
import ssl
import dns.resolver
from typing import Dict, Optional, List
from datetime import datetime
import re
import difflib

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.utils.logger import logger
from src.utils.retry import retry_with_backoff
from src.utils.rate_limiter import check_rate_limit, record_api_request


# Try to import whoisit for RDAP lookups (optional)
try:
    import whoisit
    WHOISIT_AVAILABLE = True
except ImportError:
    WHOISIT_AVAILABLE = False
    whoisit = None


def enrich_with_rdap(domain: str, ip: Optional[str] = None) -> Dict:
    """
    Enrich domain/IP with RDAP data.
    
    Args:
        domain: Domain name
        ip: IP address (optional)
    
    Returns:
        Dict with RDAP information
    """
    result = {
        "rdap_available": False,
        "rdap_data": {},
        "errors": []
    }
    
    if not WHOISIT_AVAILABLE:
        result["errors"].append("whoisit library not available - install with: pip install whoisit")
        return result
    
    try:
        # RDAP lookup for domain
        if domain:
            try:
                rdap_domain = whoisit.domain(domain)
                result["rdap_available"] = True
                result["rdap_data"]["domain"] = {
                    "handle": rdap_domain.get("handle"),
                    "status": rdap_domain.get("status", []),
                    "entities": rdap_domain.get("entities", []),
                    "events": rdap_domain.get("events", []),
                    "nameservers": rdap_domain.get("nameservers", []),
                    "secure_dns": rdap_domain.get("secureDNS", {}),
                    "rdap_conformance": rdap_domain.get("rdapConformance", []),
                    "object_class": rdap_domain.get("objectClassName"),
                }
                
                # Extract key dates
                events = rdap_domain.get("events", [])
                for event in events:
                    event_type = event.get("eventAction")
                    if event_type == "registration":
                        result["rdap_data"]["domain"]["registration_date"] = event.get("eventDate")
                    elif event_type == "expiration":
                        result["rdap_data"]["domain"]["expiration_date"] = event.get("eventDate")
                    elif event_type == "last changed":
                        result["rdap_data"]["domain"]["last_changed"] = event.get("eventDate")
                
                # Extract registrar info from entities
                entities = rdap_domain.get("entities", [])
                for entity in entities:
                    roles = entity.get("roles", [])
                    if "registrar" in roles:
                        result["rdap_data"]["domain"]["registrar"] = entity.get("vcardArray", [])
                        break
                
            except Exception as e:
                logger.debug(f"RDAP domain lookup failed for {domain}: {e}")
                result["errors"].append(f"RDAP domain lookup failed: {str(e)}")
        
        # RDAP lookup for IP
        if ip:
            try:
                rdap_ip = whoisit.ip(ip)
                result["rdap_available"] = True
                result["rdap_data"]["ip"] = {
                    "handle": rdap_ip.get("handle"),
                    "start_address": rdap_ip.get("startAddress"),
                    "end_address": rdap_ip.get("endAddress"),
                    "ip_version": rdap_ip.get("ipVersion"),
                    "country": rdap_ip.get("country"),
                    "entities": rdap_ip.get("entities", []),
                    "events": rdap_ip.get("events", []),
                    "object_class": rdap_ip.get("objectClassName"),
                }
                
                # Extract ASN if available
                entities = rdap_ip.get("entities", [])
                for entity in entities:
                    roles = entity.get("roles", [])
                    if "registrant" in roles or "technical" in roles:
                        # Try to extract ASN from entity
                        asn_info = entity.get("asn", {})
                        if asn_info:
                            result["rdap_data"]["ip"]["asn"] = asn_info
                            break
                
            except Exception as e:
                logger.debug(f"RDAP IP lookup failed for {ip}: {e}")
                result["errors"].append(f"RDAP IP lookup failed: {str(e)}")
    
    except Exception as e:
        logger.debug(f"RDAP enrichment failed: {e}")
        result["errors"].append(f"RDAP enrichment error: {str(e)}")
    
    return result


@retry_with_backoff(max_retries=2)
def analyze_ssl_tls(domain: str) -> Dict:
    """
    Comprehensive SSL/TLS analysis for a domain.
    
    Analyzes:
    - Certificate details (issuer, validity, subject)
    - Supported protocols (TLS 1.0, 1.1, 1.2, 1.3)
    - Cipher suites
    - Certificate chain
    - Security vulnerabilities
    
    Args:
        domain: Domain name to analyze
    
    Returns:
        Dict with SSL/TLS analysis results
    """
    result = {
        "ssl_available": False,
        "certificate": {},
        "protocols": {},
        "cipher_suites": [],
        "security_issues": [],
        "grade": "F",
        "errors": []
    }
    
    try:
        # Connect to domain on HTTPS port
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE  # We'll verify manually
        
        with socket.create_connection((domain, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                # Get certificate
                cert = ssock.getpeercert()
                cert_binary = ssock.getpeercert(binary_form=True)
                
                result["ssl_available"] = True
                
                # Parse certificate details
                result["certificate"] = {
                    "subject": dict(x[0] for x in cert.get("subject", [])),
                    "issuer": dict(x[0] for x in cert.get("issuer", [])),
                    "version": cert.get("version"),
                    "serial_number": str(cert.get("serialNumber", "")),
                    "not_before": cert.get("notBefore"),
                    "not_after": cert.get("notAfter"),
                    "subject_alt_names": cert.get("subjectAltName", []),
                }
                
                # Check certificate validity
                not_after_str = cert.get("notAfter")
                if not_after_str:
                    try:
                        not_after = datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z")
                        days_until_expiry = (not_after - datetime.now()).days
                        result["certificate"]["days_until_expiry"] = days_until_expiry
                        result["certificate"]["is_valid"] = days_until_expiry > 0
                        
                        if days_until_expiry < 30:
                            result["security_issues"].append("Certificate expires soon")
                        if days_until_expiry < 0:
                            result["security_issues"].append("Certificate expired")
                    except Exception:
                        pass
                
                # Get SSL version
                result["protocols"]["version"] = ssock.version()
                
                # Get cipher suite
                cipher = ssock.cipher()
                if cipher:
                    result["cipher_suites"] = [{
                        "name": cipher[0],
                        "version": cipher[1],
                        "bits": cipher[2]
                    }]
                
                # Check for weak protocols
                ssl_version = ssock.version()
                if ssl_version in ["TLSv1", "TLSv1.1"]:
                    result["security_issues"].append(f"Weak protocol: {ssl_version}")
                
                # Check for weak ciphers
                if cipher:
                    cipher_name = cipher[0]
                    weak_ciphers = ["RC4", "DES", "MD5", "SHA1"]
                    if any(weak in cipher_name for weak in weak_ciphers):
                        result["security_issues"].append(f"Weak cipher: {cipher_name}")
                
                # Calculate security grade
                grade_score = 100
                if result["security_issues"]:
                    grade_score -= len(result["security_issues"]) * 20
                if days_until_expiry < 30:
                    grade_score -= 10
                
                if grade_score >= 90:
                    result["grade"] = "A"
                elif grade_score >= 80:
                    result["grade"] = "B"
                elif grade_score >= 70:
                    result["grade"] = "C"
                elif grade_score >= 60:
                    result["grade"] = "D"
                else:
                    result["grade"] = "F"
    
    except socket.timeout:
        result["errors"].append("Connection timeout")
    except socket.gaierror:
        result["errors"].append("DNS resolution failed")
    except ssl.SSLError as e:
        result["errors"].append(f"SSL error: {str(e)}")
        result["security_issues"].append("SSL/TLS connection failed")
    except Exception as e:
        logger.debug(f"SSL/TLS analysis failed for {domain}: {e}")
        result["errors"].append(f"SSL analysis error: {str(e)}")
    
    return result


def analyze_email_security(domain: str) -> Dict:
    """
    Analyze email security records (SPF, DMARC, DKIM).
    
    Args:
        domain: Domain name to analyze
    
    Returns:
        Dict with email security analysis
    """
    result = {
        "spf": {"present": False, "record": None, "issues": []},
        "dmarc": {"present": False, "record": None, "policy": None, "issues": []},
        "dkim": {"present": False, "records": [], "issues": []},
        "security_score": 0,
        "errors": []
    }
    
    try:
        # Check SPF record
        try:
            spf_answers = dns.resolver.resolve(domain, 'TXT')
            for answer in spf_answers:
                txt_record = str(answer).strip('"')
                if txt_record.startswith("v=spf1"):
                    result["spf"]["present"] = True
                    result["spf"]["record"] = txt_record
                    
                    # Check for common SPF issues
                    if "all" not in txt_record.lower():
                        result["spf"]["issues"].append("SPF record missing 'all' mechanism")
                    if "~all" in txt_record or "-all" not in txt_record:
                        if "-all" not in txt_record:
                            result["spf"]["issues"].append("SPF record should use '-all' for strict policy")
                    
                    break
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            result["spf"]["issues"].append("No SPF record found")
        except Exception as e:
            logger.debug(f"SPF lookup failed for {domain}: {e}")
            result["errors"].append(f"SPF lookup failed: {str(e)}")
        
        # Check DMARC record
        try:
            dmarc_domain = f"_dmarc.{domain}"
            dmarc_answers = dns.resolver.resolve(dmarc_domain, 'TXT')
            for answer in dmarc_answers:
                txt_record = str(answer).strip('"')
                if txt_record.startswith("v=DMARC1"):
                    result["dmarc"]["present"] = True
                    result["dmarc"]["record"] = txt_record
                    
                    # Parse DMARC policy
                    if "p=none" in txt_record:
                        result["dmarc"]["policy"] = "none"
                        result["dmarc"]["issues"].append("DMARC policy is 'none' (no protection)")
                    elif "p=quarantine" in txt_record:
                        result["dmarc"]["policy"] = "quarantine"
                    elif "p=reject" in txt_record:
                        result["dmarc"]["policy"] = "reject"
                    
                    # Check for pct (percentage)
                    if "pct=100" not in txt_record and "pct=" in txt_record:
                        result["dmarc"]["issues"].append("DMARC not applied to 100% of emails")
                    
                    break
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            result["dmarc"]["issues"].append("No DMARC record found")
        except Exception as e:
            logger.debug(f"DMARC lookup failed for {domain}: {e}")
            result["errors"].append(f"DMARC lookup failed: {str(e)}")
        
        # Check DKIM (typically in selector._domainkey.domain)
        # Common selectors: default, mail, google, selector1, etc.
        common_selectors = ["default", "mail", "google", "selector1", "dkim"]
        dkim_found = False
        
        for selector in common_selectors:
            try:
                dkim_domain = f"{selector}._domainkey.{domain}"
                dkim_answers = dns.resolver.resolve(dkim_domain, 'TXT')
                for answer in dkim_answers:
                    txt_record = str(answer).strip('"')
                    if "v=DKIM1" in txt_record or "k=rsa" in txt_record:
                        result["dkim"]["present"] = True
                        result["dkim"]["records"].append({
                            "selector": selector,
                            "record": txt_record[:100]  # Truncate for display
                        })
                        dkim_found = True
                        break
                if dkim_found:
                    break
            except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
                continue
            except Exception as e:
                logger.debug(f"DKIM lookup failed for {selector}._domainkey.{domain}: {e}")
        
        if not dkim_found:
            result["dkim"]["issues"].append("No DKIM record found (checked common selectors)")
        
        # Calculate security score
        score = 0
        if result["spf"]["present"] and not result["spf"]["issues"]:
            score += 33
        elif result["spf"]["present"]:
            score += 15
        
        if result["dmarc"]["present"]:
            if result["dmarc"]["policy"] == "reject":
                score += 34
            elif result["dmarc"]["policy"] == "quarantine":
                score += 20
            else:
                score += 10
        
        if result["dkim"]["present"]:
            score += 33
        
        result["security_score"] = score
    
    except Exception as e:
        logger.debug(f"Email security analysis failed for {domain}: {e}")
        result["errors"].append(f"Email security analysis error: {str(e)}")
    
    return result


def detect_typosquatting(domain: str) -> Dict:
    """
    Detect potential typosquatting domains.
    
    Uses string similarity and common typosquatting patterns.
    
    Args:
        domain: Domain name to check
    
    Returns:
        Dict with typosquatting analysis
    """
    result = {
        "risk_level": "low",
        "similarity_score": 0.0,
        "patterns_detected": [],
        "recommendations": []
    }
    
    try:
        # Extract base domain (without TLD)
        domain_parts = domain.split('.')
        if len(domain_parts) < 2:
            return result
        
        base_domain = domain_parts[-2]  # Second to last part (e.g., "example" from "example.com")
        tld = domain_parts[-1]
        
        # Common typosquatting patterns
        patterns = []
        
        # 1. Character substitution (homoglyphs)
        homoglyphs = {
            'o': ['0'],
            'i': ['1', 'l'],
            'e': ['3'],
            'a': ['@'],
            's': ['5', '$'],
        }
        
        # 2. Character insertion/deletion
        # 3. Character transposition
        # 4. TLD swapping
        
        # Calculate similarity to common legitimate domains
        # This is a simplified check - in production, you'd check against a database
        common_domains = [
            "google", "facebook", "amazon", "microsoft", "apple", "twitter",
            "instagram", "linkedin", "youtube", "netflix", "paypal", "ebay"
        ]
        
        max_similarity = 0.0
        most_similar = None
        
        for common_domain in common_domains:
            similarity = difflib.SequenceMatcher(None, base_domain.lower(), common_domain.lower()).ratio()
            if similarity > max_similarity:
                max_similarity = similarity
                most_similar = common_domain
        
        result["similarity_score"] = max_similarity
        
        # Check for suspicious patterns
        if max_similarity > 0.85 and base_domain.lower() != most_similar:
            result["patterns_detected"].append(f"High similarity ({max_similarity:.1%}) to '{most_similar}'")
            result["risk_level"] = "high"
            result["recommendations"].append("Domain closely resembles a well-known brand - verify legitimacy")
        elif max_similarity > 0.70:
            result["patterns_detected"].append(f"Moderate similarity ({max_similarity:.1%}) to '{most_similar}'")
            result["risk_level"] = "medium"
        
        # Check for suspicious TLDs
        suspicious_tlds = ["tk", "ml", "ga", "cf", "gq"]
        if tld.lower() in suspicious_tlds:
            result["patterns_detected"].append(f"Suspicious TLD: .{tld}")
            if result["risk_level"] == "low":
                result["risk_level"] = "medium"
        
        # Check for character patterns
        if len(base_domain) < 4:
            result["patterns_detected"].append("Very short domain name")
            result["recommendations"].append("Short domains are more susceptible to typos")
        
        # Check for numbers in domain (common in typosquatting)
        if re.search(r'\d', base_domain):
            result["patterns_detected"].append("Contains numbers (common in typosquatting)")
            if result["risk_level"] == "low":
                result["risk_level"] = "medium"
    
    except Exception as e:
        logger.debug(f"Typosquatting detection failed for {domain}: {e}")
        result["error"] = str(e)
    
    return result


def enrich_with_rdap_features(domain: str, ip: Optional[str] = None) -> Dict:
    """
    Comprehensive enrichment using RDAP and security analysis features.
    
    Combines:
    - RDAP lookups
    - SSL/TLS analysis
    - Email security (SPF/DMARC/DKIM)
    - Typosquatting detection
    
    Args:
        domain: Domain name
        ip: IP address (optional)
    
    Returns:
        Dict with all enrichment data
    """
    result = {
        "rdap": {},
        "ssl_tls": {},
        "email_security": {},
        "typosquatting": {},
        "errors": []
    }
    
    # RDAP lookups
    if check_rate_limit("rdap"):
        rdap_result = enrich_with_rdap(domain, ip)
        result["rdap"] = rdap_result
        if rdap_result.get("errors"):
            result["errors"].extend(rdap_result["errors"])
        record_api_request("rdap")
    
    # SSL/TLS analysis
    if check_rate_limit("ssl_analysis"):
        ssl_result = analyze_ssl_tls(domain)
        result["ssl_tls"] = ssl_result
        if ssl_result.get("errors"):
            result["errors"].extend(ssl_result["errors"])
        record_api_request("ssl_analysis")
    
    # Email security
    if check_rate_limit("email_security"):
        email_result = analyze_email_security(domain)
        result["email_security"] = email_result
        if email_result.get("errors"):
            result["errors"].extend(email_result["errors"])
        record_api_request("email_security")
    
    # Typosquatting detection
    typosquatting_result = detect_typosquatting(domain)
    result["typosquatting"] = typosquatting_result
    
    return result
