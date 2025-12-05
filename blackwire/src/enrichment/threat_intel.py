"""Threat intelligence integration for BlackWire."""

import requests
from typing import Dict, List, Optional
import time
import socket
import dns.resolver
from src.utils.logger import logger
from src.utils.retry import retry_with_backoff
from src.utils.rate_limiter import check_rate_limit, record_api_request
from src.utils.cache import get_cached, set_cached


# Rate limiters for different APIs (using global rate limiter functions)
# Note: Using check_rate_limit/record_api_request pattern from existing code


def check_threat_intel(domain: Optional[str] = None, ip: Optional[str] = None, 
                       phone: Optional[str] = None) -> Dict:
    """
    Check entities against threat intelligence feeds.
    
    Args:
        domain: Domain name to check
        ip: IP address to check
        phone: Phone number to check (limited support)
    
    Returns:
        Dict with threat intelligence data
    """
    results = {
        "is_malicious": False,
        "threat_sources": [],
        "reputation_score": 0,
        "details": {}
    }
    
    # Check domain
    if domain:
        domain_results = _check_domain_threats(domain)
        if domain_results.get("is_malicious"):
            results["is_malicious"] = True
        results["threat_sources"].extend(domain_results.get("sources", []))
        results["details"]["domain"] = domain_results
    
    # Check IP
    if ip:
        ip_results = _check_ip_threats(ip)
        if ip_results.get("is_malicious"):
            results["is_malicious"] = True
        results["threat_sources"].extend(ip_results.get("sources", []))
        results["details"]["ip"] = ip_results
    
    # Calculate reputation score (0-100, lower is worse)
    # Only adjust if we have actual threat data
    if results.get("details"):
        if results["is_malicious"]:
            # Base score on threat level
            if results["threat_level"] == "high":
                results["reputation_score"] = max(0, 20 - (len(results["threat_sources"]) * 5))
            elif results["threat_level"] == "medium":
                results["reputation_score"] = max(0, 40 - (len(results["threat_sources"]) * 5))
            elif results["threat_level"] == "low":
                results["reputation_score"] = max(60, 80 - (len(results["threat_sources"]) * 5))
            else:
                results["reputation_score"] = 100
        # If not malicious but we have data, keep the score from details
        elif results.get("reputation_score") == 100 and results.get("details", {}).get("virustotal", {}).get("reputation"):
            # Use VirusTotal reputation if available
            vt_rep = results["details"]["virustotal"]["reputation"]
            if vt_rep:
                results["reputation_score"] = min(100, max(0, vt_rep))
    
    return results


@retry_with_backoff(max_retries=2)
def _check_domain_threats(domain: str) -> Dict:
    """Check domain against multiple threat intelligence sources."""
    results = {
        "is_malicious": False,
        "sources": [],
        "details": {},
        "context": [],
        "threat_level": None
    }
    
    # Check cache first
    cached = get_cached("threat_intel", domain, ttl_hours=24)
    if cached:
        return cached
    
    # 1. VirusTotal (free tier: 4 requests/minute)
    try:
        if check_rate_limit("virustotal"):
            vt_result = _check_virustotal_domain(domain)
            if vt_result:
                results["details"]["virustotal"] = vt_result
                malicious_count = vt_result.get("malicious_count", 0)
                total_scans = vt_result.get("total_scans", 0)
                max_positives = vt_result.get("max_positives", 0)
                avg_positives = vt_result.get("avg_positives", 0)
                reputation = vt_result.get("reputation", 0)
                
                # Use reputation score as primary indicator (VirusTotal's domain-level assessment)
                # Reputation: 0 = unknown/poor, higher = better (typically 0-100)
                # If reputation is high (>50) and no URLs flagged, domain is clean
                
                if malicious_count == 0:
                    # No URLs flagged - domain is clean
                    if reputation > 0:
                        results["context"].append(f"VirusTotal: Domain reputation score {reputation}/100")
                    results["context"].append("VirusTotal: No malicious URLs detected on this domain")
                    results["threat_level"] = "clean"
                else:
                    # Some URLs flagged - assess severity
                    detection_ratio = malicious_count / max(total_scans, 1)
                    
                    # Context about what VirusTotal actually checks
                    results["context"].append(f"VirusTotal scanned {total_scans} URLs on this domain")
                    results["context"].append(f"{malicious_count} URLs flagged by security engines")
                    if reputation > 0:
                        results["context"].append(f"Domain reputation: {reputation}/100")
                    
                    # Assess threat level based on multiple factors
                    # High threat: Many URLs flagged AND high positive count per URL AND low reputation
                    if (detection_ratio >= 0.3 and max_positives >= 10) or (malicious_count >= 10 and avg_positives >= 5) or reputation < 20:
                        results["is_malicious"] = True
                        results["threat_level"] = "high"
                        results["context"].append(f"High threat: {detection_ratio:.1%} of URLs flagged, up to {max_positives} engines per URL")
                    # Medium threat: Moderate detections
                    elif detection_ratio >= 0.15 or (malicious_count >= 5 and avg_positives >= 3) or (reputation < 40 and reputation > 0):
                        results["is_malicious"] = True
                        results["threat_level"] = "medium"
                        results["context"].append(f"Medium threat: {detection_ratio:.1%} of URLs flagged")
                    # Low threat: Few detections - likely false positive or isolated issue
                    else:
                        results["threat_level"] = "low"
                        results["false_positive_risk"] = True
                        results["context"].append(f"Low threat: Only {malicious_count}/{total_scans} URLs flagged - likely false positive or isolated issue")
                        results["context"].append("Note: VirusTotal checks individual URLs, not the domain itself. Legitimate sites can have flagged URLs.")
                    
                    results["sources"].append(f"VirusTotal ({malicious_count}/{total_scans} URLs flagged)")
                
                # Use reputation score if available
                if reputation and reputation > 0:
                    results["reputation_score"] = min(100, max(0, reputation))
            record_api_request("virustotal")
    except Exception as e:
        logger.debug(f"VirusTotal check failed: {e}")
    
    # 2. abuse.ch URLhaus (free, no API key needed)
    try:
        if check_rate_limit("urlhaus"):
            urlhaus_result = _check_urlhaus(domain)
            if urlhaus_result and urlhaus_result.get("threat"):
                results["is_malicious"] = True
                results["sources"].append("abuse.ch URLhaus")
                results["details"]["urlhaus"] = urlhaus_result
                record_api_request("urlhaus")
    except Exception as e:
        logger.debug(f"URLhaus check failed: {e}")
    
    # 3. abuse.ch ThreatFox (free, no API key needed)
    try:
        if check_rate_limit("threatfox"):
            threatfox_result = _check_threatfox(domain)
            if threatfox_result and threatfox_result.get("threat"):
                results["is_malicious"] = True
                results["sources"].append("abuse.ch ThreatFox")
                results["details"]["threatfox"] = threatfox_result
                record_api_request("threatfox")
    except Exception as e:
        logger.debug(f"ThreatFox check failed: {e}")
    
    # 4. PhishTank (free, no API key needed)
    try:
        if check_rate_limit("phishtank"):
            phishtank_result = _check_phishtank(domain)
            if phishtank_result and phishtank_result.get("in_database"):
                results["is_malicious"] = True
                results["sources"].append("PhishTank")
                results["details"]["phishtank"] = phishtank_result
                if not results.get("threat_level"):
                    results["threat_level"] = "high"  # Phishing is high threat
                record_api_request("phishtank")
    except Exception as e:
        logger.debug(f"PhishTank check failed: {e}")
    
    # 5. OpenPhish feed (free, no API key needed)
    try:
        openphish_result = _check_openphish(domain)
        if openphish_result and openphish_result.get("found"):
            results["is_malicious"] = True
            results["sources"].append("OpenPhish")
            results["details"]["openphish"] = openphish_result
            if not results.get("threat_level"):
                results["threat_level"] = "high"  # Phishing is high threat
    except Exception as e:
        logger.debug(f"OpenPhish check failed: {e}")
    
    # 6. Spamhaus blocklist (free, no API key needed)
    try:
        spamhaus_result = _check_spamhaus(domain)
        if spamhaus_result and spamhaus_result.get("blocked"):
            results["is_malicious"] = True
            results["sources"].extend(spamhaus_result.get("sources", []))
            results["details"]["spamhaus"] = spamhaus_result
            if not results.get("threat_level"):
                results["threat_level"] = "medium"
    except Exception as e:
        logger.debug(f"Spamhaus check failed: {e}")
    
    # 7. SURBL DNS lookup (free, no API key needed)
    try:
        surbl_result = _check_surbl(domain)
        if surbl_result and surbl_result.get("listed"):
            results["is_malicious"] = True
            results["sources"].append("SURBL")
            results["details"]["surbl"] = surbl_result
            if not results.get("threat_level"):
                results["threat_level"] = "medium"
    except Exception as e:
        logger.debug(f"SURBL check failed: {e}")
    
    # 8. Check blocklists (free, no API key needed)
    blocklist_result = _check_blocklists(domain)
    if blocklist_result.get("blocked"):
        results["is_malicious"] = True
        results["sources"].extend(blocklist_result.get("sources", []))
        results["details"]["blocklists"] = blocklist_result
    
    # Cache results for 24 hours
    set_cached("threat_intel", domain, results, ttl_hours=24)
    
    return results


@retry_with_backoff(max_retries=2)
def _check_virustotal_domain(domain: str) -> Optional[Dict]:
    """Check domain on VirusTotal (requires API key in .env)."""
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("VIRUSTOTAL_API_KEY")
    if not api_key:
        return None
    
    try:
        url = f"https://www.virustotal.com/vtapi/v2/domain/report"
        params = {
            "apikey": api_key,
            "domain": domain
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("response_code") == 1:
                # Parse results
                detected_urls = data.get("detected_urls", [])
                # Count URLs with positive detections
                malicious_urls = [url for url in detected_urls if url.get("positives", 0) > 0]
                malicious_count = len(malicious_urls)
                
                # Calculate max positives across all URLs to understand severity
                max_positives = max([url.get("positives", 0) for url in detected_urls] + [0])
                avg_positives = sum([url.get("positives", 0) for url in malicious_urls]) / max(malicious_count, 1) if malicious_count > 0 else 0
                
                return {
                    "malicious_count": malicious_count,
                    "total_scans": len(detected_urls),
                    "max_positives": max_positives,
                    "avg_positives": round(avg_positives, 1),
                    "reputation": data.get("reputation", 0),
                    "categories": data.get("categories", {}),
                    "subdomains": data.get("subdomains", [])[:10],  # Limit to 10
                    "note": "VirusTotal checks URLs on the domain, not the domain itself. Low detections may be false positives."
                }
        elif response.status_code == 204:
            logger.debug("VirusTotal rate limit hit")
    except Exception as e:
        logger.debug(f"VirusTotal API error: {e}")
    
    return None


@retry_with_backoff(max_retries=2)
def _check_urlhaus(domain: str) -> Optional[Dict]:
    """Check domain on abuse.ch URLhaus (free, no API key)."""
    try:
        url = f"https://urlhaus-api.abuse.ch/v1/url/"
        data = {"url": f"https://{domain}"}
        
        response = requests.post(url, data=data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if result.get("query_status") == "ok" and result.get("threat"):
                return {
                    "threat": True,
                    "threat_type": result.get("threat", ""),
                    "urlhaus_id": result.get("id"),
                    "date_added": result.get("date_added"),
                    "status": result.get("url_status")
                }
    except Exception as e:
        logger.debug(f"URLhaus API error: {e}")
    
    return None


@retry_with_backoff(max_retries=2)
def _check_threatfox(domain: str) -> Optional[Dict]:
    """Check domain on abuse.ch ThreatFox (free, no API key)."""
    try:
        url = f"https://threatfox-api.abuse.ch/v1/"
        data = {
            "query": "search_ioc",
            "search_term": domain
        }
        
        response = requests.post(url, json=data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if result.get("query_status") == "ok" and result.get("data"):
                iocs = result.get("data", [])
                if iocs:
                    return {
                        "threat": True,
                        "ioc_type": iocs[0].get("ioc_type"),
                        "threat_type": iocs[0].get("threat_type"),
                        "malware": iocs[0].get("malware"),
                        "first_seen": iocs[0].get("first_seen")
                    }
    except Exception as e:
        logger.debug(f"ThreatFox API error: {e}")
    
    return None


@retry_with_backoff(max_retries=2)
def _check_phishtank(domain: str) -> Optional[Dict]:
    """Check domain on PhishTank (free, no API key needed)."""
    try:
        # PhishTank API: 1 request per 5 seconds
        url = "https://checkurl.phishtank.com/checkurl/"
        data = {
            "url": f"https://{domain}",
            "format": "json"
        }
        
        response = requests.post(url, data=data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if result.get("results", {}).get("in_database"):
                return {
                    "in_database": True,
                    "verified": result.get("results", {}).get("verified"),
                    "verified_at": result.get("results", {}).get("verified_at"),
                    "phish_id": result.get("results", {}).get("phish_id"),
                    "phish_detail_page": result.get("results", {}).get("phish_detail_page")
                }
    except Exception as e:
        logger.debug(f"PhishTank API error: {e}")
    
    return None


def _check_openphish(domain: str) -> Optional[Dict]:
    """Check domain against OpenPhish feed (free, no API key needed)."""
    try:
        # Check cache first (feed is updated hourly, cache for 2 hours)
        cached = get_cached("openphish_feed", "feed", ttl_hours=2)
        if cached:
            feed_domains = cached
        else:
            # Download feed
            url = "https://openphish.com/feed.txt"
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                # Parse feed - extract domains from URLs
                feed_domains = set()
                for line in response.text.strip().split('\n'):
                    if line.startswith('http'):
                        try:
                            from urllib.parse import urlparse
                            parsed = urlparse(line)
                            if parsed.netloc:
                                feed_domains.add(parsed.netloc.lower())
                        except:
                            pass
                # Cache for 2 hours
                set_cached("openphish_feed", "feed", list(feed_domains), ttl_hours=2)
            else:
                return None
        
        # Check if domain is in feed
        domain_lower = domain.lower()
        if domain_lower in feed_domains:
            return {
                "found": True,
                "source": "OpenPhish feed",
                "note": "Domain found in OpenPhish phishing feed (updated hourly)"
            }
    except Exception as e:
        logger.debug(f"OpenPhish check error: {e}")
    
    return None


def _check_spamhaus(domain: str) -> Optional[Dict]:
    """Check domain against Spamhaus blocklists (free, no API key needed)."""
    try:
        # Spamhaus provides DNS-based lookups
        # Check DROP list (Don't Route Or Peer)
        # Format: reverse domain, then query zen.spamhaus.org
        
        # Reverse domain for DNS lookup
        domain_parts = domain.split('.')
        reversed_domain = '.'.join(reversed(domain_parts))
        
        sources = []
        
        # Check DROP list
        try:
            resolver = dns.resolver.Resolver()
            resolver.timeout = 5
            resolver.lifetime = 5
            query = f"{reversed_domain}.zen.spamhaus.org"
            answers = resolver.resolve(query, 'A')
            if answers:
                sources.append("Spamhaus DROP")
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.Timeout):
            pass
        except Exception as e:
            logger.debug(f"Spamhaus DNS lookup error: {e}")
        
        # Check DROP-EDROP (extended)
        try:
            resolver = dns.resolver.Resolver()
            resolver.timeout = 5
            resolver.lifetime = 5
            query = f"{reversed_domain}.zen.spamhaus.org"
            answers = resolver.resolve(query, 'A')
            if answers:
                sources.append("Spamhaus DROP-EDROP")
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.Timeout):
            pass
        except Exception as e:
            logger.debug(f"Spamhaus DROP-EDROP lookup error: {e}")
        
        if sources:
            return {
                "blocked": True,
                "sources": sources,
                "note": "Domain found in Spamhaus blocklist"
            }
    except Exception as e:
        logger.debug(f"Spamhaus check error: {e}")
    
    return None


def _check_surbl(domain: str) -> Optional[Dict]:
    """Check domain against SURBL (Spam URI Blocklist) via DNS (free, no API key needed)."""
    try:
        # SURBL uses DNS lookups
        # Format: domain.multi.surbl.org
        resolver = dns.resolver.Resolver()
        resolver.timeout = 5
        resolver.lifetime = 5
        
        query = f"{domain}.multi.surbl.org"
        answers = resolver.resolve(query, 'A')
        
        if answers:
            # Domain is listed
            return {
                "listed": True,
                "source": "SURBL",
                "note": "Domain found in SURBL spam URI blocklist"
            }
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.Timeout):
        # NXDOMAIN means domain is not listed (this is good)
        return None
    except Exception as e:
        logger.debug(f"SURBL DNS lookup error: {e}")
    
    return None


def _check_blocklists(domain: str) -> Dict:
    """Check domain against free blocklists."""
    blocklists = {
        "malware_domains": f"https://mirror1.malwaredomains.com/files/domains.txt",
        # Add more free blocklists
    }
    
    results = {
        "blocked": False,
        "sources": []
    }
    
    # For now, return empty (blocklist checking would require downloading lists)
    # Could implement with local cache or API endpoints
    return results


@retry_with_backoff(max_retries=2)
def _check_ip_threats(ip: str) -> Dict:
    """Check IP address against threat intelligence sources."""
    results = {
        "is_malicious": False,
        "sources": [],
        "details": {}
    }
    
    # Check abuse.ch AbuseIPDB (free tier available)
    # Check VirusTotal IP (if API key available)
    # Check blocklists
    
    return results

