"""Domain enrichment - adapts patterns from AIPornTracker."""

import os
import requests
import whois
from typing import Dict, Optional
import socket
import dns.resolver
from dotenv import load_dotenv

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.utils.rate_limiter import check_rate_limit, record_api_request
from src.utils.retry import retry_with_backoff
from src.utils.logger import logger
from src.utils.config import Config

load_dotenv()


def enrich_domain(domain: str) -> Dict:
    """
    Enrich a domain with DNS, IP, hosting, and redirect chain data.
    This adapts the domain enrichment patterns from AIPornTracker.
    
    Args:
        domain: Domain name to enrich
        
    Returns:
        Dictionary containing enrichment data
    """
    result = {
        "domain": domain,
        "ip_address": None,
        "ip_addresses": [],
        "ipv6_addresses": [],
        "host_name": None,
        "asn": None,
        "isp": None,
        "country": None,
        "city": None,
        "registrar": None,
        "creation_date": None,
        "expiration_date": None,
        "updated_date": None,
        "whois_status": None,
        "name_servers": [],
        "mx_records": [],
        "dns_records": {},
        "cdn": None,
        "cms": None,
        "redirect_chain": [],
        "is_shortlink": False,
        "shortlink_provider": None,
        "ssl_info": {},
        "errors": []
    }
    
    try:
        # Remove protocol if present
        domain = domain.replace("http://", "").replace("https://", "").replace("www.", "")
        domain = domain.split("/")[0].strip()
        
        # Check if it's a shortlink
        shortlink_domains = ["bit.ly", "t.co", "tinyurl.com", "short.link", "rebrand.ly", "cutt.ly"]
        for short_domain in shortlink_domains:
            if short_domain in domain.lower():
                result["is_shortlink"] = True
                result["shortlink_provider"] = short_domain
                break
        
        # DNS lookup
        try:
            ip = socket.gethostbyname(domain)
            result["ip_address"] = ip
            result["ip_addresses"] = [ip]
        except socket.gaierror:
            result["errors"].append(f"DNS lookup failed for {domain}")
        
        # Get A records
        try:
            answers = dns.resolver.resolve(domain, 'A')
            result["ip_addresses"] = [str(answer) for answer in answers]
            result["ip_address"] = result["ip_addresses"][0] if result["ip_addresses"] else None
        except Exception as e:
            logger.debug(f"DNS A record lookup failed for {domain}: {e}")
            result["errors"].append(f"A record lookup failed: {str(e)}")
        
        # Get MX records
        try:
            mx_answers = dns.resolver.resolve(domain, 'MX')
            mx_list = [str(mx) for mx in mx_answers]
            result["dns_records"]["MX"] = mx_list
            result["mx_records"] = mx_list
        except Exception as e:
            logger.debug(f"DNS MX record lookup failed for {domain}: {e}")
            pass  # MX records are optional
        
        # Get NS records (nameservers)
        try:
            ns_answers = dns.resolver.resolve(domain, 'NS')
            ns_list = [str(ns).rstrip('.') for ns in ns_answers]
            result["dns_records"]["NS"] = ns_list
            result["name_servers"] = ns_list
        except Exception as e:
            logger.debug(f"DNS NS record lookup failed for {domain}: {e}")
            pass
        
        # Get AAAA records (IPv6)
        try:
            aaaa_answers = dns.resolver.resolve(domain, 'AAAA')
            ipv6_list = [str(ip) for ip in aaaa_answers]
            result["dns_records"]["AAAA"] = ipv6_list
            result["ipv6_addresses"] = ipv6_list
        except Exception as e:
            logger.debug(f"DNS AAAA record lookup failed for {domain}: {e}")
            pass
        
        # Get CNAME records
        try:
            cname_answers = dns.resolver.resolve(domain, 'CNAME')
            result["dns_records"]["CNAME"] = [str(cname).rstrip('.') for cname in cname_answers]
        except Exception as e:
            logger.debug(f"DNS CNAME record lookup failed for {domain}: {e}")
            pass
        
        # Detect CDN from nameservers or CNAME
        cdn_indicators = {
            "cloudflare": "Cloudflare",
            "cloudfront": "AWS CloudFront",
            "fastly": "Fastly",
            "akamai": "Akamai",
            "incapdns": "Incapsula",
            "azure": "Azure CDN",
            "google": "Google Cloud CDN"
        }
        
        ns_list = result.get("name_servers", [])
        cname_list = result["dns_records"].get("CNAME", [])
        for indicator, cdn_name in cdn_indicators.items():
            if any(indicator.lower() in str(ns).lower() for ns in ns_list) or \
               any(indicator.lower() in str(cname).lower() for cname in cname_list):
                result["cdn"] = cdn_name
                break
        
        # WHOIS lookup (FREE - no API key needed)
        try:
            whois_data = enrich_whois(domain)
            result.update(whois_data)
            
            # Extract additional WHOIS fields from whois_data
            if whois_data.get("whois_data"):
                whois_info = whois_data["whois_data"]
                
                # Extract expiration date
                if whois_info.get("expiration_date"):
                    exp_date = whois_info["expiration_date"]
                    if isinstance(exp_date, list) and exp_date:
                        exp_date = exp_date[0]
                    result["expiration_date"] = str(exp_date)
                
                # Extract updated date
                if whois_info.get("updated_date"):
                    upd_date = whois_info["updated_date"]
                    if isinstance(upd_date, list) and upd_date:
                        upd_date = upd_date[0]
                    result["updated_date"] = str(upd_date)
                
                # Extract name servers (if not already from DNS)
                if whois_info.get("name_servers"):
                    ns_list = whois_info["name_servers"]
                    if isinstance(ns_list, list):
                        ns_list = [str(ns).rstrip('.') for ns in ns_list]
                    else:
                        ns_list = [str(ns_list).rstrip('.')]
                    
                    # Merge with DNS NS records (prefer DNS if available)
                    if not result.get("name_servers"):
                        result["name_servers"] = ns_list
                    else:
                        # Merge and dedupe
                        all_ns = list(set(result["name_servers"] + ns_list))
                        result["name_servers"] = all_ns
                
                # Extract WHOIS status
                if whois_info.get("status"):
                    status_list = whois_info["status"]
                    if isinstance(status_list, list):
                        result["whois_status"] = ", ".join(str(s) for s in status_list)
                    else:
                        result["whois_status"] = str(status_list)
        except Exception as e:
            logger.debug(f"WHOIS lookup failed for {domain}: {e}")
            result["errors"].append(f"WHOIS lookup failed: {str(e)}")
        
        # IP location lookup (FREE APIs)
        # Note: If using CDN (Cloudflare, etc.), location will be CDN location, not actual server
        if result.get("ip_address"):
            # Check if it's a CDN IP (Cloudflare, etc.)
            isp_value = result.get("isp") or ""
            is_cdn = result.get("cdn") or any(cdn in isp_value.lower() for cdn in ["cloudflare", "fastly", "cloudfront", "akamai"])
            
            if check_rate_limit("ip-api.com"):
                try:
                    ip_data = enrich_ip_location(result["ip_address"])
                    record_api_request("ip-api.com")
                    
                    # If it's a CDN, note that location is CDN location, not actual server
                    if is_cdn:
                        ip_data["location_note"] = "Location shown is CDN/proxy location, not actual server location"
                        # Don't show city/country for CDN IPs as it's misleading
                        if "city" in ip_data:
                            ip_data["city"] = None
                        if "country" in ip_data:
                            ip_data["country"] = None
                    
                    result.update(ip_data)
                except Exception as e:
                    logger.debug(f"IP location lookup failed for {result['ip_address']}: {e}")
                    result["errors"].append(f"IP location lookup failed: {str(e)}")
        
        # Enhanced enrichment: Certificate Transparency, Reverse WHOIS, Email Discovery
        try:
            from src.enrichment.enhanced_enrichment import (
                get_certificate_transparency,
                reverse_whois,
                discover_emails
            )
            
            # Certificate Transparency logs (free, no API key)
            ct_data = get_certificate_transparency(domain)
            if ct_data.get("related_domains"):
                result["ct_related_domains"] = ct_data["related_domains"][:20]  # Limit to 20
                result["ct_subdomains"] = ct_data.get("subdomains", [])[:20]
                result["ct_certificates"] = len(ct_data.get("certificates", []))
            
            # Reverse WHOIS (find domains with same registrant)
            if result.get("registrar"):
                reverse_whois_data = reverse_whois(domain, registrar=result.get("registrar"))
                if reverse_whois_data.get("related_domains"):
                    result["reverse_whois_domains"] = reverse_whois_data["related_domains"][:20]
            
            # Email discovery
            email_data = discover_emails(domain)
            if email_data.get("emails"):
                result["discovered_emails"] = email_data["emails"]
        except Exception as e:
            logger.debug(f"Enhanced enrichment failed: {e}")
            # Don't add to errors - these are optional enhancements
        
        # Threat Intelligence (VirusTotal, abuse.ch, blocklists)
        try:
            from src.enrichment.threat_intel import check_threat_intel
            
            threat_data = check_threat_intel(domain=domain)
            # Always include threat intel data, not just when malicious
            result["threat_intel"] = threat_data.get("details", {})
            result["threat_level"] = threat_data.get("threat_level", "clean")
            result["reputation_score"] = threat_data.get("reputation_score", 100)
            result["threat_context"] = threat_data.get("context", [])
            result["false_positive_risk"] = threat_data.get("false_positive_risk", False)
            
            # Only mark as malicious if threat level is medium or high
            if threat_data.get("threat_level") in ["medium", "high"]:
                result["is_malicious"] = True
                result["threat_sources"] = threat_data.get("threat_sources", [])
            elif threat_data.get("threat_level") == "low":
                # Low threat - show but don't mark as malicious
                result["threat_sources"] = threat_data.get("threat_sources", [])
                result["is_malicious"] = False
                result["threat_warning"] = "Low threat detected - possible false positive"
            
            # Also check IP if available
            if result.get("ip_address"):
                ip_threat = check_threat_intel(ip=result["ip_address"])
                if ip_threat.get("is_malicious"):
                    result["is_malicious"] = True
                    if not result.get("threat_sources"):
                        result["threat_sources"] = []
                    result["threat_sources"].extend(ip_threat.get("threat_sources", []))
        except Exception as e:
            logger.debug(f"Threat intelligence check failed: {e}")
            # Don't add to errors - threat intel is optional
        
        # Basic CMS detection (header-based, similar to AIPornTracker)
        try:
            if not result.get("cms"):
                cms = _detect_cms_basic(domain)
                if cms:
                    result["cms"] = cms
        except Exception as e:
            logger.debug(f"CMS detection failed: {e}")
            # Don't add to errors - CMS detection is optional
        
    except Exception as e:
        result["errors"].append(str(e))
        import traceback
        traceback.print_exc()
    
    return result


def _detect_cms_basic(domain: str) -> Optional[str]:
    """Basic CMS detection using HTTP headers and content patterns (FREE, no API key needed)."""
    try:
        url = f"http://{domain}" if not domain.startswith("http") else domain
        response = requests.get(url, timeout=10, allow_redirects=True, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        headers = response.headers
        content = response.text.lower()
        
        # Basic CMS detection patterns
        cms_patterns = {
            "WordPress": ["wp-content", "wp-includes", "wp-json", "/wp-admin/", "wordpress"],
            "Joomla": ["joomla", "/administrator/", "com_content", "option=com_"],
            "Drupal": ["drupal", "sites/all/", "/sites/default/", "drupal.js"],
            "Shopify": ["shopify", "cdn.shopify.com", "myshopify.com", "shopify-analytics"],
            "Squarespace": ["squarespace", "sqs-cdn", "squarespace.com"],
            "Magento": ["magento", "/media/", "/skin/", "mage/"],
            "WooCommerce": ["woocommerce", "wc-", "woocommerce-"],
            "Drupal": ["drupal", "sites/all/", "/sites/default/"],
            "Ghost": ["ghost", "ghost.org"],
            "Wix": ["wix.com", "wixstatic.com", "wixpress.com"]
        }
        
        # Check content for CMS patterns
        for cms_name, patterns in cms_patterns.items():
            for pattern in patterns:
                if pattern in content or pattern in str(headers).lower():
                    return cms_name
        
        # Check X-Powered-By header
        powered_by = headers.get("X-Powered-By", "").lower()
        if powered_by:
            for cms_name in cms_patterns.keys():
                if cms_name.lower() in powered_by:
                    return cms_name
        
        # Check meta generator tag
        import re
        meta_tags = re.findall(r'<meta[^>]+name=["\']generator["\'][^>]+content=["\']([^"\']+)["\']', content)
        for meta_content in meta_tags:
            meta_lower = meta_content.lower()
            for cms_name in cms_patterns.keys():
                if cms_name.lower() in meta_lower:
                    return cms_name
    
    except Exception as e:
        logger.debug(f"Basic CMS detection failed for {domain}: {e}")
    
    return None


def enrich_whois(domain: str) -> Dict:
    """Enrich domain with WHOIS data (FREE - python-whois library)."""
    result = {
        "registrar": None,
        "creation_date": None,
        "whois_data": {}
    }
    
    try:
        w = whois.whois(domain)
        
        if w:
            result["registrar"] = w.registrar if hasattr(w, 'registrar') and w.registrar else None
            
            # Handle creation date (can be a list or single date)
            # Note: Some registrars return their own creation date, not the domain's
            if hasattr(w, 'creation_date'):
                creation_date = w.creation_date
                if isinstance(creation_date, list) and creation_date:
                    creation_date = creation_date[0]
                if creation_date:
                    from datetime import datetime
                    if isinstance(creation_date, datetime):
                        # Check if date seems suspicious (very old dates might be registrar's, not domain's)
                        # If date is before 2005, it's likely wrong (registrar's creation date, not domain's)
                        if creation_date.year >= 2005:
                            result["creation_date"] = creation_date.strftime('%Y-%m-%d')
                        else:
                            logger.debug(f"Suspicious creation date {creation_date} for {domain} - likely registrar's date, not domain's")
                            result["creation_date"] = None
                    else:
                        # Try to parse string date
                        try:
                            parsed_date = datetime.strptime(str(creation_date)[:10], '%Y-%m-%d')
                            if parsed_date.year >= 2005:
                                result["creation_date"] = str(creation_date)[:10]
                            else:
                                result["creation_date"] = None
                        except:
                            result["creation_date"] = None
            
            # Store raw WHOIS data for extraction
            result["whois_data"] = {
                "expiration_date": w.expiration_date if hasattr(w, 'expiration_date') and w.expiration_date else None,
                "updated_date": w.updated_date if hasattr(w, 'updated_date') and w.updated_date else None,
                "name_servers": list(w.name_servers) if hasattr(w, 'name_servers') and w.name_servers else [],
                "status": w.status if hasattr(w, 'status') and w.status else None,
            }
    except Exception as e:
        logger.debug(f"WHOIS lookup failed for {domain}: {e}")
    
    return result


@retry_with_backoff(max_retries=2, base_delay=1.0)
def enrich_ip_location(ip_address: str) -> Dict:
    """Enrich IP address with location and hosting data using FREE APIs."""
    result = {
        "host_name": None,
        "asn": None,
        "isp": None,
        "country": None,
        "city": None
    }
    
    if not ip_address:
        return result
    
    try:
        # Method 1: ip-api.com (FREE - 45 requests/minute, no key required)
        url = f"http://ip-api.com/json/{ip_address}?fields=status,message,country,city,isp,org,as,asname,query"
        response = requests.get(url, timeout=Config.API_TIMEOUT_SECONDS)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success":
                result["country"] = data.get("country")
                result["city"] = data.get("city")
                result["isp"] = data.get("isp") or data.get("org")
                
                as_str = data.get("as", "")
                if as_str:
                    result["asn"] = as_str.replace("AS", "").strip()
                    result["host_name"] = data.get("asname") or data.get("org", "").split()[0]
        
        # Method 2: IPLocate.io (FREE - no key required for basic)
        if not result.get("isp"):
            try:
                url = f"https://www.iplocate.io/api/lookup/{ip_address}"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    result["isp"] = result.get("isp") or data.get("org")
                    result["country"] = result.get("country") or data.get("country")
                    result["asn"] = result.get("asn") or str(data.get("asn", "")).replace("AS", "")
            except:
                pass  # Fallback failed, continue
    
    except Exception as e:
        print(f"IP location lookup failed for {ip_address}: {e}")
    
    return result

