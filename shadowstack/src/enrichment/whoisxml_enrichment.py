"""WhoisXML API enrichment module."""

import requests
import os
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

WHOISXML_API_KEY = os.getenv("WHOISXML_API_KEY", "")
WHOISXML_BASE_URL = "https://www.whoisxmlapi.com"


def enrich_with_whoisxml(domain: str) -> Dict:
    """
    Enrich domain with WhoisXML API data.
    
    Returns:
        Dictionary with WhoisXML enrichment data
    """
    result = {
        "whoisxml": {
            "available": False,
            "whois_data": {},
            "dns_records": {},
            "ssl_certificates": [],
            "domain_availability": None,
            "registrant_domains": []  # Reverse WHOIS
        }
    }
    
    if not WHOISXML_API_KEY:
        return result
    
    try:
        # 1. Get comprehensive WHOIS data
        url = f"{WHOISXML_BASE_URL}/whoisserver/WhoisService"
        params = {
            "apiKey": WHOISXML_API_KEY,
            "domainName": domain,
            "outputFormat": "JSON"
        }
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            record = data.get("WhoisRecord", {})
            
            # Check if we have actual data (not just error)
            if record and not record.get("dataError") or record.get("dataError") not in ["NO_DATA", "INCOMPLETE_DATA"]:
                result["whoisxml"]["available"] = True
                
                # Get registrar from registryData if not in main record
                registrar = record.get("registrarName") or record.get("registryData", {}).get("registrarName")
                
                registrant = record.get("registrant", {})
                admin = record.get("administrativeContact", {})
                tech = record.get("technicalContact", {})
                
                # Parse name servers
                name_servers = []
                if record.get("nameServers"):
                    if isinstance(record["nameServers"], dict):
                        if record["nameServers"].get("rawText"):
                            name_servers = [ns.strip() for ns in record["nameServers"]["rawText"].split("\n") if ns.strip()]
                        elif record["nameServers"].get("hostNames"):
                            name_servers = record["nameServers"]["hostNames"]
                    elif isinstance(record["nameServers"], list):
                        name_servers = record["nameServers"]
                
                result["whoisxml"]["whois_data"] = {
                    "registrar": registrar,
                    "registrant_name": registrant.get("name"),
                    "registrant_organization": registrant.get("organization"),
                    "registrant_email": registrant.get("email"),
                    "registrant_country": registrant.get("country") or registrant.get("countryCode"),
                    "registrant_city": registrant.get("city"),
                    "admin_email": admin.get("email"),
                    "tech_email": tech.get("email"),
                    "creation_date": record.get("createdDate"),
                    "expiration_date": record.get("expiresDate"),
                    "updated_date": record.get("updatedDate"),
                    "name_servers": name_servers
                }
        
        # 2. Get DNS records
        url = f"{WHOISXML_BASE_URL}/dnsrecord"
        params = {
            "apiKey": WHOISXML_API_KEY,
            "domainName": domain,
            "type": "A,AAAA,MX,NS,TXT"
        }
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("DNSRecord"):
                result["whoisxml"]["dns_records"] = {
                    "a": [r.get("address") for r in data["DNSRecord"].get("A", [])],
                    "aaaa": [r.get("address") for r in data["DNSRecord"].get("AAAA", [])],
                    "mx": [r.get("target") for r in data["DNSRecord"].get("MX", [])],
                    "ns": [r.get("target") for r in data["DNSRecord"].get("NS", [])],
                    "txt": [r.get("text") for r in data["DNSRecord"].get("TXT", [])]
                }
        
        # 3. Get SSL certificate information
        url = f"{WHOISXML_BASE_URL}/sslcheck"
        params = {
            "apiKey": WHOISXML_API_KEY,
            "host": domain
        }
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("certificates"):
                result["whoisxml"]["ssl_certificates"] = [
                    {
                        "issuer": cert.get("issuer"),
                        "valid_from": cert.get("validFrom"),
                        "valid_to": cert.get("validTo"),
                        "serial_number": cert.get("serialNumber")
                    }
                    for cert in data["certificates"][:5]
                ]
        
        # 4. Check domain availability
        url = f"{WHOISXML_BASE_URL}/whoisserver/DomainAvailability"
        params = {
            "apiKey": WHOISXML_API_KEY,
            "domainName": domain
        }
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            result["whoisxml"]["domain_availability"] = data.get("DomainInfo", {}).get("domainAvailability")
        
        # 5. Reverse WHOIS - find domains by registrant email (if we have it)
        whois_data = result["whoisxml"].get("whois_data", {})
        registrant_email = whois_data.get("registrant_email")
        
        if registrant_email:
            url = f"{WHOISXML_BASE_URL}/reverseWhois"
            params = {
                "apiKey": WHOISXML_API_KEY,
                "email": registrant_email,
                "mode": "purchase",
                "rows": 50  # Limit results
            }
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("domainsList"):
                    domains = data["domainsList"].get("domains", [])
                    result["whoisxml"]["registrant_domains"] = [
                        d.get("domainName") for d in domains if d.get("domainName") != domain
                    ][:50]  # Exclude current domain, limit to 50
        
    except Exception as e:
        print(f"WhoisXML enrichment failed for {domain}: {e}")
    
    return result


def get_whoisxml_history(domain: str) -> Dict:
    """
    Get WHOIS history for a domain from WhoisXML.
    
    Returns:
        Dictionary with WHOIS history
    """
    result = {
        "whoisxml_history": {
            "available": False,
            "history": []
        }
    }
    
    if not WHOISXML_API_KEY:
        return result
    
    try:
        url = f"{WHOISXML_BASE_URL}/whoisserver/WhoisHistory"
        params = {
            "apiKey": WHOISXML_API_KEY,
            "domainName": domain,
            "outputFormat": "JSON"
        }
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("records"):
                result["whoisxml_history"]["available"] = True
                result["whoisxml_history"]["history"] = [
                    {
                        "date": r.get("createdDate"),
                        "registrar": r.get("registrarName"),
                        "registrant": r.get("registrant", {}).get("name")
                    }
                    for r in data["records"][:20]  # Last 20 records
                ]
        
    except Exception as e:
        print(f"WhoisXML history lookup failed for {domain}: {e}")
    
    return result

