#!/usr/bin/env python3
"""
Test SecurityTrails and WhoisXML APIs with real domain: celebfakes.net
"""

import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv

# Add shadowstack to path
sys.path.insert(0, str(Path(__file__).parent / 'shadowstack'))
sys.path.insert(0, str(Path(__file__).parent))

load_dotenv()

# Import the enrichment functions
from shadowstack.src.enrichment.securitytrails_enrichment import enrich_with_securitytrails, get_securitytrails_ip_data
from shadowstack.src.enrichment.whoisxml_enrichment import enrich_with_whoisxml, get_whoisxml_history

def test_domain(domain: str):
    """Test enrichment APIs for a domain."""
    print(f"\n{'='*60}")
    print(f"Testing: {domain}")
    print(f"{'='*60}\n")
    
    # First, get basic info to find IP
    print("Step 1: Getting basic DNS info to find IP...")
    try:
        import dns.resolver
        a_records = dns.resolver.resolve(domain, 'A')
        ip_address = str(a_records[0])
        print(f"   Found IP: {ip_address}\n")
    except Exception as e:
        print(f"   Could not resolve IP: {e}\n")
        ip_address = None
    
    # Test SecurityTrails
    print("Step 2: SecurityTrails API...")
    print("-" * 60)
    try:
        st_data = enrich_with_securitytrails(domain)
        print(json.dumps(st_data, indent=2, default=str))
        
        if ip_address:
            print(f"\n   Getting IP data for {ip_address}...")
            st_ip_data = get_securitytrails_ip_data(ip_address)
            print(json.dumps(st_ip_data, indent=2, default=str))
    except Exception as e:
        print(f"   Error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*60 + "\n")
    
    # Test WhoisXML
    print("Step 3: WhoisXML API...")
    print("-" * 60)
    try:
        wx_data = enrich_with_whoisxml(domain)
        print(json.dumps(wx_data, indent=2, default=str))
        
        print(f"\n   Getting WHOIS history...")
        wx_history = get_whoisxml_history(domain)
        print(json.dumps(wx_history, indent=2, default=str))
    except Exception as e:
        print(f"   Error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*60 + "\n")

if __name__ == '__main__':
    # Test with both domains
    test_domain("deep-nude.co")  # Active domain
    test_domain("celebfakes.net")  # Inactive domain (to see historical data)

