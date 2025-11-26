"""DNS security records enrichment (SPF, DMARC, DKIM)."""

import dns.resolver
from typing import Dict, List


def enrich_dns_security(domain: str) -> Dict:
    """
    Enrich domain with DNS security records (SPF, DMARC, DKIM).
    
    Returns:
        Dictionary with DNS security information
    """
    result = {
        "spf_record": None,
        "dmarc_record": None,
        "dkim_records": [],
        "txt_records": [],
        "has_spf": False,
        "has_dmarc": False,
        "has_dkim": False
    }
    
    try:
        # SPF record (usually in TXT record)
        try:
            txt_records = dns.resolver.resolve(domain, 'TXT')
            for txt in txt_records:
                txt_str = str(txt).strip('"')
                result["txt_records"].append(txt_str)
                
                # Check for SPF
                if txt_str.startswith("v=spf1"):
                    result["spf_record"] = txt_str
                    result["has_spf"] = True
                
                # Check for DMARC
                if txt_str.startswith("v=DMARC1"):
                    result["dmarc_record"] = txt_str
                    result["has_dmarc"] = True
        except:
            pass
        
        # DMARC record (usually at _dmarc subdomain)
        try:
            dmarc_domain = f"_dmarc.{domain}"
            dmarc_records = dns.resolver.resolve(dmarc_domain, 'TXT')
            for dmarc in dmarc_records:
                dmarc_str = str(dmarc).strip('"')
                if dmarc_str.startswith("v=DMARC1"):
                    result["dmarc_record"] = dmarc_str
                    result["has_dmarc"] = True
        except:
            pass
        
        # DKIM records (usually at selector._domainkey subdomain)
        # Common selectors: default, mail, google, selector1, selector2
        common_selectors = ['default', 'mail', 'google', 'selector1', 'selector2', 'dkim']
        for selector in common_selectors:
            try:
                dkim_domain = f"{selector}._domainkey.{domain}"
                dkim_records = dns.resolver.resolve(dkim_domain, 'TXT')
                for dkim in dkim_records:
                    dkim_str = str(dkim).strip('"')
                    if dkim_str.startswith("v=DKIM1"):
                        result["dkim_records"].append({
                            "selector": selector,
                            "record": dkim_str
                        })
                        result["has_dkim"] = True
            except:
                pass
        
    except Exception as e:
        print(f"DNS security record lookup failed for {domain}: {e}")
    
    return result


