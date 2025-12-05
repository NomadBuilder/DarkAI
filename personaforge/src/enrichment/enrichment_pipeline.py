"""Main enrichment pipeline that orchestrates all enrichment steps."""

from typing import Dict
import logging
from .whois_enrichment import enrich_whois, enrich_dns
from .ip_enrichment import enrich_ip_location
from .cms_enrichment import detect_cms
from .payment_detection import detect_payment_processors
from .vendor_detection import detect_vendor_type, extract_vendor_name, calculate_vendor_risk_score

logger = logging.getLogger(__name__)

# Parallel processing utilities
try:
    from .parallel_enrichment import (
        parallel_execute,
        retry_with_backoff,
        rate_limit,
        timeout_handler,
        group_parallel_tasks
    )
    PARALLEL_AVAILABLE = True
except ImportError:
    PARALLEL_AVAILABLE = False
    def parallel_execute(*args, **kwargs): return {}
    def retry_with_backoff(*args, **kwargs): return lambda f: f
    def rate_limit(*args, **kwargs): return lambda f: f
    def timeout_handler(*args, **kwargs): return lambda f: f
    def group_parallel_tasks(*args, **kwargs): return []

# Enhanced tech stack detection (reuse ShadowStack's comprehensive detection)
try:
    from .shadowstack_imports import get_shadowstack_function
    detect_full_tech_stack = get_shadowstack_function('tech_stack_enrichment', 'detect_full_tech_stack')
    TECH_STACK_AVAILABLE = detect_full_tech_stack.__name__ != '<lambda>'  # Check if we got the real function
except ImportError:
    TECH_STACK_AVAILABLE = False
    def detect_full_tech_stack(domain: str) -> Dict: return {}

# Optional threat intelligence
try:
    from .threat_intel import enrich_with_crtsh, enrich_with_urlhaus
    THREAT_INTEL_AVAILABLE = True
except ImportError:
    THREAT_INTEL_AVAILABLE = False
    def enrich_with_crtsh(domain): return {}
    def enrich_with_urlhaus(domain): return {}

# Enhanced threat intelligence (reuse ShadowStack's security enrichment)
try:
    from .shadowstack_imports import get_shadowstack_function
    check_threat_intelligence = get_shadowstack_function('security_enrichment', 'check_threat_intelligence')
    ENHANCED_THREAT_INTEL_AVAILABLE = check_threat_intelligence.__name__ != '<lambda>'
except ImportError:
    ENHANCED_THREAT_INTEL_AVAILABLE = False
    def check_threat_intelligence(domain: str, ip_address: str = None) -> Dict: return {}

# Public content analysis (legitimate sources only)
try:
    from .content_analysis import analyze_public_website
    CONTENT_ANALYSIS_AVAILABLE = True
except ImportError:
    CONTENT_ANALYSIS_AVAILABLE = False
    def analyze_public_website(domain): return {}

# Enhanced web scraping (Phase 1)
try:
    from .web_scraping import scrape_homepage, extract_main_content, extract_headings
    from .content_extraction import extract_pricing_information, extract_contact_information, extract_service_descriptions, extract_faqs
    WEB_SCRAPING_AVAILABLE = True
except ImportError:
    WEB_SCRAPING_AVAILABLE = False
    def scrape_homepage(domain): return {}
    def extract_main_content(html): return ""
    def extract_headings(html): return {}
    def extract_pricing_information(text): return []
    def extract_contact_information(text, html=None): return {}
    def extract_service_descriptions(text): return []
    def extract_faqs(html): return []

# NLP analysis (Phase 2)
try:
    from .nlp_analysis import analyze_content_with_nlp
    NLP_ANALYSIS_AVAILABLE = True
except ImportError:
    NLP_ANALYSIS_AVAILABLE = False
    def analyze_content_with_nlp(html, text): return {}

# SSL/TLS and Security Headers (Phase 4)
try:
    from .ssl_analysis import analyze_ssl_certificate, get_certificate_transparency
    from .security_headers import analyze_security_headers
    SSL_ANALYSIS_AVAILABLE = True
except ImportError:
    SSL_ANALYSIS_AVAILABLE = False
    def analyze_ssl_certificate(domain): return {}
    def get_certificate_transparency(domain): return {}
    def analyze_security_headers(domain): return {}

# Clearnet mirror detection (much safer than dark web!)
try:
    from .clearnet_mirrors import enrich_with_clearnet_mirrors
    CLEARNET_MIRRORS_AVAILABLE = True
except ImportError:
    CLEARNET_MIRRORS_AVAILABLE = False
    def enrich_with_clearnet_mirrors(domain): return {}

# Dark web access (OPTIONAL - Use with extreme caution)
try:
    from .darkweb_enrichment import enrich_domain_with_darkweb, is_darkweb_enabled, TOR_AVAILABLE
    from src.utils.config import Config
    DARKWEB_AVAILABLE = TOR_AVAILABLE and (Config.DARKWEB_ENABLED if hasattr(Config, 'DARKWEB_ENABLED') else False)
except ImportError:
    DARKWEB_AVAILABLE = False
    TOR_AVAILABLE = False
    def enrich_domain_with_darkweb(domain): return {}
    def is_darkweb_enabled(): return False

# Import caching
try:
    from src.utils.cache import get_cached, set_cached
    from src.utils.config import Config
    CACHE_AVAILABLE = True
except ImportError:
    CACHE_AVAILABLE = False
    def get_cached(*args, **kwargs): return None
    def set_cached(*args, **kwargs): pass


def enrich_domain(domain: str) -> Dict:
    """
    Enrich a domain with all available data sources.
    
    Args:
        domain: Domain name to enrich
        
    Returns:
        Dictionary containing all enrichment data
    """
    # Validate input first (before any processing)
    if not domain:
        logger.error("No domain provided")
        return {"error": "No domain provided", "domain": None}
    
    if not isinstance(domain, str):
        logger.error(f"Invalid domain type: {type(domain)}")
        return {"error": "Domain must be a string", "domain": str(domain)}
    
    domain = domain.strip().lower()
    if not domain:
        logger.error("Empty domain provided after stripping")
        return {"error": "Empty domain", "domain": ""}
    
    # Basic domain format validation
    if '.' not in domain or len(domain) < 3:
        logger.warning(f"Domain format may be invalid: {domain}")
        # Continue anyway, let DNS resolution handle it
    
    # Check cache first
    if CACHE_AVAILABLE:
        try:
            cached_data = get_cached("domain", domain)
            if cached_data:
                logger.debug(f"Cache hit for domain: {domain}")
                return cached_data
        except Exception as e:
            logger.warning(f"Cache lookup failed for {domain}: {e}")
            # Continue with enrichment
    
    logger.info(f"Enriching domain: {domain}")
    
    result = {
        "domain": domain,
        "ip_address": None,
        "ip_addresses": [],
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
        "whois_data": {},
        "dns_records": {},
        "subdomains": [],
        "threat_intel": {},
        "content_analysis": {},
        "clearnet_mirrors": {},
        "web_scraping": {},
        "extracted_content": {},
        "nlp_analysis": {},
        "ssl_certificate": {},
        "certificate_transparency": {},
        "security_headers": {}
    }
    
    # Step 1: WHOIS enrichment
    logger.debug(f"  → WHOIS lookup for {domain}")
    try:
        whois_data = enrich_whois(domain)
        if whois_data:
            result.update(whois_data)
    except Exception as e:
        logger.warning(f"WHOIS enrichment failed for {domain}: {e}")
        # Continue with other enrichment steps
    
    # Extract additional WHOIS fields
    if whois_data.get("whois_data"):
        whois_info = whois_data["whois_data"]
        if whois_info.get("expiration_date"):
            result["expiration_date"] = str(whois_info["expiration_date"])
        if whois_info.get("updated_date"):
            result["updated_date"] = str(whois_info["updated_date"])
        if whois_info.get("name_servers"):
            result["name_servers"] = whois_info["name_servers"] if isinstance(whois_info["name_servers"], list) else [whois_info["name_servers"]]
        if whois_info.get("status"):
            status_list = whois_info["status"] if isinstance(whois_info["status"], list) else [whois_info["status"]]
            result["whois_status"] = ", ".join(str(s) for s in status_list) if status_list else None
    
    # Step 2: DNS enrichment
    logger.debug(f"  → DNS lookup for {domain}")
    try:
        dns_data = enrich_dns(domain)
        if dns_data:
            result.update(dns_data)
    except Exception as e:
        logger.warning(f"DNS enrichment failed for {domain}: {e}")
    
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
    
    # Step 3: IP location enrichment
    if result.get("ip_address"):
        logger.debug(f"  → IP location lookup for {result['ip_address']}")
        try:
            ip_data = enrich_ip_location(result["ip_address"])
            if ip_data:
                result["host_name"] = ip_data.get("host_name")
                result["asn"] = ip_data.get("asn")
                result["isp"] = ip_data.get("isp")
        except Exception as e:
            logger.warning(f"IP location enrichment failed: {e}")
    
    # Step 4: CMS detection (with timeout protection)
    logger.debug(f"  → CMS detection for {domain}")
    try:
        if PARALLEL_AVAILABLE:
            cms_func = timeout_handler(timeout_seconds=30.0)(detect_cms)  # Add timeout protection
            cms = cms_func(domain)
        else:
            cms = detect_cms(domain)
        if cms:
            result["cms"] = cms
    except (TimeoutError, Exception) as e:
        logger.warning(f"CMS detection failed for {domain}: {e}")
    
    # Step 4b: Full tech stack detection (if available)
    if TECH_STACK_AVAILABLE:
        logger.debug(f"  → Full tech stack detection for {domain}")
        try:
            # Apply timeout to tech stack detection
            if PARALLEL_AVAILABLE:
                tech_stack_func = timeout_handler(timeout_seconds=20.0)(detect_full_tech_stack)
            else:
                tech_stack_func = detect_full_tech_stack
            
            tech_stack_data = tech_stack_func(domain)
            if tech_stack_data and isinstance(tech_stack_data, dict):
                # Merge tech stack data into result
                if tech_stack_data.get("cms") and not result.get("cms"):
                    result["cms"] = tech_stack_data["cms"]
                if tech_stack_data.get("cdn") and not result.get("cdn"):
                    result["cdn"] = tech_stack_data["cdn"]
                if tech_stack_data.get("frameworks"):
                    result["frameworks"] = tech_stack_data["frameworks"]
                if tech_stack_data.get("analytics"):
                    result["analytics"] = tech_stack_data["analytics"]
                if tech_stack_data.get("javascript_frameworks"):
                    result["javascript_frameworks"] = tech_stack_data["javascript_frameworks"]
                if tech_stack_data.get("web_servers"):
                    result["web_servers"] = tech_stack_data["web_servers"]
                if tech_stack_data.get("programming_languages"):
                    result["programming_languages"] = tech_stack_data["programming_languages"]
                # Store full tech stack
                result["tech_stack"] = tech_stack_data
        except (TimeoutError, Exception) as e:
            logger.warning(f"Tech stack detection failed for {domain}: {e}")
            # Don't fail if tech stack detection fails
    
    # Step 5: Payment processor detection
    logger.debug(f"  → Payment processor detection for {domain}")
    try:
        processors = detect_payment_processors(domain)
        if processors and isinstance(processors, list):
            result["payment_processor"] = ", ".join(str(p) for p in processors if p)
    except Exception as e:
        logger.warning(f"Payment processor detection failed for {domain}: {e}")
    
    # Step 6: Vendor detection
    logger.debug(f"  → Vendor detection for {domain}")
    try:
        vendor_type = detect_vendor_type(domain, result)
        if vendor_type:
            result["vendor_type"] = vendor_type
        
        vendor_name = extract_vendor_name(domain, result)
        if vendor_name:
            result["vendor_name"] = vendor_name
        
        risk_score = calculate_vendor_risk_score(domain, result)
        if risk_score is not None:
            result["vendor_risk_score"] = risk_score
    except Exception as e:
        logger.warning(f"Vendor detection failed for {domain}: {e}")
    
    # Step 7: Threat intelligence (optional)
    if THREAT_INTEL_AVAILABLE:
        logger.debug(f"  → Threat intelligence lookup for {domain}")
        try:
            crtsh_data = enrich_with_crtsh(domain)
            if crtsh_data and isinstance(crtsh_data, dict) and crtsh_data.get("subdomains"):
                existing_subs = result.get("subdomains", [])
                new_subs = crtsh_data["subdomains"]
                if isinstance(new_subs, list):
                    result["subdomains"] = list(set(existing_subs + new_subs))
            
            urlhaus_data = enrich_with_urlhaus(domain)
            if urlhaus_data and isinstance(urlhaus_data, dict):
                result["threat_intel"] = urlhaus_data
        except Exception as e:
            logger.warning(f"Threat intelligence lookup failed for {domain}: {e}")
    
    # Step 7b: Enhanced threat intelligence (VirusTotal, SecurityTrails, etc.)
    if ENHANCED_THREAT_INTEL_AVAILABLE and result.get("ip_address"):
        logger.debug(f"  → Enhanced threat intelligence for {domain}")
        try:
            if PARALLEL_AVAILABLE:
                threat_func = retry_with_backoff(max_retries=2, initial_delay=1.0)(
                    timeout_handler(timeout_seconds=15.0)(check_threat_intelligence)
                )
            else:
                threat_func = check_threat_intelligence
            
            enhanced_threat_data = threat_func(domain, result.get("ip_address"))
            if enhanced_threat_data and isinstance(enhanced_threat_data, dict):
                # Merge with existing threat_intel
                if not result.get("threat_intel"):
                    result["threat_intel"] = {}
                result["threat_intel"].update(enhanced_threat_data)
        except (TimeoutError, Exception) as e:
            logger.warning(f"Enhanced threat intelligence failed for {domain}: {e}")
            # Don't fail if threat intel fails
    
    # Step 8: Enhanced web scraping (Phase 1)
    if WEB_SCRAPING_AVAILABLE:
        logger.debug(f"  → Enhanced web scraping for {domain}")
        try:
            if PARALLEL_AVAILABLE:
                scrape_func = retry_with_backoff(max_retries=2, initial_delay=2.0)(
                    timeout_handler(timeout_seconds=30.0)(scrape_homepage)
                )
            else:
                scrape_func = scrape_homepage
            
            scraping_data = scrape_func(domain)
            if scraping_data and isinstance(scraping_data, dict) and not scraping_data.get("error"):
                result["web_scraping"] = scraping_data
                
                # Extract additional content from scraped HTML
                html = scraping_data.get("html", "")
                text = scraping_data.get("text", "")
                
                if html:
                    try:
                        # Extract main content
                        main_content = extract_main_content(html) if extract_main_content else ""
                        
                        # Extract headings
                        headings = extract_headings(html) if extract_headings else {}
                        
                        # Extract pricing
                        pricing = extract_pricing_information(text) if extract_pricing_information else []
                        
                        # Extract contact info
                        contact_info = extract_contact_information(text, html) if extract_contact_information else {}
                        
                        # Extract service descriptions
                        services = extract_service_descriptions(text) if extract_service_descriptions else []
                        
                        # Extract FAQs
                        faqs = extract_faqs(html) if extract_faqs else []
                        
                        result["extracted_content"] = {
                            "main_content": main_content,
                            "headings": headings if isinstance(headings, dict) else {},
                            "pricing": pricing if isinstance(pricing, list) else [],
                            "contact_info": contact_info if isinstance(contact_info, dict) else {},
                            "service_descriptions": services if isinstance(services, list) else [],
                            "faqs": faqs if isinstance(faqs, list) else []
                        }
                        
                        # Step 8a: NLP Analysis (Phase 2)
                        if NLP_ANALYSIS_AVAILABLE and text:
                            logger.debug(f"  → NLP analysis for {domain}")
                            try:
                                nlp_data = analyze_content_with_nlp(html, text)
                                if nlp_data and isinstance(nlp_data, dict):
                                    result["nlp_analysis"] = nlp_data
                            except Exception as e:
                                logger.warning(f"NLP analysis failed for {domain}: {e}")
                    except Exception as e:
                        logger.warning(f"Content extraction failed for {domain}: {e}")
        except (TimeoutError, Exception) as e:
            logger.warning(f"Enhanced web scraping failed for {domain}: {e}")
            # Don't fail entire enrichment if scraping fails
    
    # Step 8b: Public content analysis (legitimate sources only)
    if CONTENT_ANALYSIS_AVAILABLE:
        logger.debug(f"  → Public content analysis for {domain}")
        try:
            if PARALLEL_AVAILABLE:
                content_func = timeout_handler(timeout_seconds=30.0)(analyze_public_website)  # Add timeout protection
                content_data = content_func(domain)
            else:
                content_data = analyze_public_website(domain)
            if content_data and isinstance(content_data, dict):
                result["content_analysis"] = content_data
        except (TimeoutError, Exception) as e:
            logger.warning(f"Public content analysis failed for {domain}: {e}")
    
    # Step 8c: SSL/TLS Certificate Analysis (Phase 4)
    if SSL_ANALYSIS_AVAILABLE:
        logger.debug(f"  → SSL/TLS certificate analysis for {domain}")
        try:
            if PARALLEL_AVAILABLE:
                ssl_func = timeout_handler(timeout_seconds=15.0)(analyze_ssl_certificate)
            else:
                ssl_func = analyze_ssl_certificate
            
            ssl_data = ssl_func(domain)
            if ssl_data and isinstance(ssl_data, dict) and not ssl_data.get("error"):
                result["ssl_certificate"] = ssl_data
            
            # Certificate Transparency logs
            try:
                ct_data = get_certificate_transparency(domain)
                if ct_data and isinstance(ct_data, dict):
                    result["certificate_transparency"] = ct_data
                    # Add subdomains from CT logs
                    if ct_data.get("subdomains") and isinstance(ct_data["subdomains"], list):
                        existing_subdomains = result.get("subdomains", [])
                        if not isinstance(existing_subdomains, list):
                            existing_subdomains = []
                        result["subdomains"] = list(set(existing_subdomains + ct_data["subdomains"]))
            except Exception as e:
                logger.warning(f"Certificate Transparency lookup failed for {domain}: {e}")
        except (TimeoutError, Exception) as e:
            logger.warning(f"SSL analysis failed for {domain}: {e}")
            # Don't fail if SSL analysis fails
    
    # Step 8d: Security Headers Analysis (Phase 4)
    if SSL_ANALYSIS_AVAILABLE:
        logger.debug(f"  → Security headers analysis for {domain}")
        try:
            if PARALLEL_AVAILABLE:
                headers_func = timeout_handler(timeout_seconds=30.0)(analyze_security_headers)  # Increased from 15 to 30
            else:
                headers_func = analyze_security_headers
            
            security_headers_data = headers_func(domain)
            if security_headers_data and isinstance(security_headers_data, dict) and not security_headers_data.get("error"):
                result["security_headers"] = security_headers_data
        except (TimeoutError, Exception) as e:
            logger.warning(f"Security headers analysis failed for {domain}: {e}")
            # Don't fail if security headers analysis fails
    
    # Step 8e: Clearnet mirror detection (much safer than dark web!)
    if CLEARNET_MIRRORS_AVAILABLE:
        logger.debug(f"  → Clearnet mirror detection for {domain}")
        try:
            mirror_data = enrich_with_clearnet_mirrors(domain)
            if mirror_data and isinstance(mirror_data, dict):
                result["clearnet_mirrors"] = mirror_data
        except Exception as e:
            logger.warning(f"Clearnet mirror detection failed for {domain}: {e}")
    
    # Step 9: Dark web access (OPTIONAL - Use with extreme caution)
    # ⚠️ WARNING: Only enabled if DARKWEB_ENABLED=true and Tor is configured
    if DARKWEB_AVAILABLE and is_darkweb_enabled():
        logger.debug(f"  → Dark web lookup for {domain} (experimental)")
        try:
            darkweb_data = enrich_domain_with_darkweb(domain)
            if darkweb_data and isinstance(darkweb_data, dict) and darkweb_data.get("darkweb_available"):
                result["darkweb"] = darkweb_data
        except Exception as e:
            logger.warning(f"Dark web enrichment failed for {domain}: {e}")
            # Don't fail entire enrichment if dark web fails
    
    # Store full enrichment data as backup
    result["enrichment_data"] = result.copy()
    
    # Cache the result
    if CACHE_AVAILABLE:
        try:
            set_cached("domain", domain, result)
        except Exception as e:
            logger.warning(f"Failed to cache enrichment result for {domain}: {e}")
    
    logger.info(f"✅ Enrichment complete for {domain}")
    return result

