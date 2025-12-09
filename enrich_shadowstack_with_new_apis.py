#!/usr/bin/env python3
"""
Enrich all ShadowStack domains with SecurityTrails and WhoisXML APIs.

This script:
1. Gets all ShadowStack domains from the database
2. Checks if they already have SecurityTrails/WhoisXML data
3. Only enriches domains that need it (not enriched recently)
4. Preserves existing enrichment data
5. Keeps historical data even if current DNS returns nothing
6. Handles rate limiting and errors gracefully
"""

import os
import sys
import json
import time
from pathlib import Path
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Add shadowstack to path
sys.path.insert(0, str(Path(__file__).parent / 'shadowstack'))
sys.path.insert(0, str(Path(__file__).parent))

load_dotenv()

from shadowstack.src.database.postgres_client import PostgresClient
from shadowstack.src.enrichment.securitytrails_enrichment import enrich_with_securitytrails, get_securitytrails_ip_data
from shadowstack.src.enrichment.whoisxml_enrichment import enrich_with_whoisxml, get_whoisxml_history
from psycopg2.extras import RealDictCursor, Json

# Rate limiting
SECURITYTRAILS_DELAY = 2.0  # 2 seconds between requests (more conservative)
WHOISXML_DELAY = 2.0  # 2 seconds between requests (more conservative)
RECENT_ENRICHMENT_HOURS = 0  # Enrich all domains (set to 0 to force re-enrichment)
FORCE_REENRICH = False  # Don't force re-enrichment - only enrich domains that need it

def should_enrich_domain(domain_data: dict) -> bool:
    """
    Check if domain should be enriched.
    Returns True if:
    - No enrichment record exists, OR
    - Enrichment is older than RECENT_ENRICHMENT_HOURS, OR
    - Doesn't have SecurityTrails/WhoisXML data yet
    """
    enriched_at = domain_data.get('enriched_at')
    
    # If never enriched, definitely enrich
    if not enriched_at:
        return True
    
    # Check if enriched recently (skip if enriched in last 24 hours)
    try:
        if isinstance(enriched_at, str):
            # Handle different datetime formats
            enriched_at = enriched_at.replace('Z', '+00:00')
            if '+' not in enriched_at and enriched_at.count(':') == 1:
                enriched_at = enriched_at.replace(' ', 'T') + '+00:00'
            enriched_dt = datetime.fromisoformat(enriched_at)
        else:
            enriched_dt = enriched_at
        
        # Remove timezone for comparison
        if enriched_dt.tzinfo:
            enriched_dt = enriched_dt.replace(tzinfo=None)
        
        hours_since_enrichment = (datetime.now() - enriched_dt).total_seconds() / 3600
        
        # If enriched very recently, skip
        if hours_since_enrichment < RECENT_ENRICHMENT_HOURS:
            return False
    except Exception as e:
        # If we can't parse the date, assume it's old and should be enriched
        print(f"  ⚠️  Could not parse enriched_at: {e}, will enrich")
        pass
    
    # Check if we already have SecurityTrails/WhoisXML data
    whois_data = domain_data.get('whois_data')
    dns_records = domain_data.get('dns_records')
    
    # Parse JSONB if it's a string
    if isinstance(whois_data, str):
        try:
            whois_data = json.loads(whois_data)
        except:
            whois_data = {}
    
    if isinstance(dns_records, str):
        try:
            dns_records = json.loads(dns_records)
        except:
            dns_records = {}
    
    # If force re-enrich is enabled, always enrich
    if FORCE_REENRICH:
        return True
    
    # Check if we have VALID new API data (not just empty keys)
    has_securitytrails = False
    has_whoisxml = False
    
    if isinstance(dns_records, dict) and 'securitytrails' in dns_records:
        st = dns_records['securitytrails']
        # Check if it has actual data (subdomains, historical_dns, or available=true with data)
        if isinstance(st, dict):
            has_subdomains = st.get('subdomains') and len(st.get('subdomains', [])) > 0
            has_historical = st.get('historical_dns') and len(st.get('historical_dns', [])) > 0
            has_available = st.get('available') == True
            has_securitytrails = has_available and (has_subdomains or has_historical or st.get('subdomain_count', 0) > 0)
    
    if isinstance(whois_data, dict) and 'whoisxml' in whois_data:
        wx = whois_data['whoisxml']
        # Check if it has actual data
        if isinstance(wx, dict):
            has_whois_data = wx.get('whois_data') and wx.get('whois_data', {}).get('registrar')
            has_available = wx.get('available') == True
            has_whoisxml = has_available and (has_whois_data or wx.get('history') or wx.get('ssl_certificates'))
    
    # If we have both valid data and enrichment is recent (within 7 days), skip
    if has_securitytrails and has_whoisxml:
        try:
            if hours_since_enrichment < (RECENT_ENRICHMENT_HOURS * 7 if RECENT_ENRICHMENT_HOURS > 0 else 0):  # 7 days
                return False
        except:
            pass  # If we couldn't calculate hours, enrich anyway
    
    return True

def merge_enrichment_data(existing_data: dict, new_data: dict) -> dict:
    """
    Merge new API data with existing enrichment data.
    Preserves all existing data, only adds/updates SecurityTrails and WhoisXML data.
    """
    merged = existing_data.copy()
    
    # Merge SecurityTrails data
    if new_data.get('securitytrails'):
        # Store in a way that doesn't conflict with existing fields
        if 'securitytrails' not in merged:
            merged['securitytrails'] = {}
        merged['securitytrails'].update(new_data['securitytrails'])
    
    if new_data.get('securitytrails_ip'):
        if 'securitytrails' not in merged:
            merged['securitytrails'] = {}
        merged['securitytrails']['ip_data'] = new_data['securitytrails_ip']
    
    # Merge WhoisXML data
    if new_data.get('whoisxml'):
        if 'whoisxml' not in merged:
            merged['whoisxml'] = {}
        merged['whoisxml'].update(new_data['whoisxml'])
    
    if new_data.get('whoisxml_history'):
        if 'whoisxml' not in merged:
            merged['whoisxml'] = {}
        merged['whoisxml']['history'] = new_data['whoisxml_history'].get('history', [])
    
    # Preserve historical DNS even if current is empty
    if new_data.get('securitytrails', {}).get('historical_dns'):
        historical = new_data['securitytrails']['historical_dns']
        if historical:  # Only if we have historical data
            if 'securitytrails' not in merged:
                merged['securitytrails'] = {}
            # Keep existing historical if it exists, otherwise use new
            if 'historical_dns' not in merged['securitytrails'] or not merged['securitytrails']['historical_dns']:
                merged['securitytrails']['historical_dns'] = historical
            else:
                # Merge and deduplicate
                existing_historical = merged['securitytrails']['historical_dns']
                if isinstance(existing_historical, list):
                    merged['securitytrails']['historical_dns'] = list(set(existing_historical + historical))
                else:
                    merged['securitytrails']['historical_dns'] = historical
    
    return merged

def update_domain_enrichment(domain_id: int, domain: str, new_api_data: dict, postgres: PostgresClient):
    """
    Update domain enrichment with new API data.
    Preserves all existing enrichment data.
    """
    try:
        # Get existing enrichment data
        cursor = postgres.conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT * FROM domain_enrichment WHERE domain_id = %s
        """, (domain_id,))
        
        existing = cursor.fetchone()
        cursor.close()
        
        # Build enrichment data dict from existing record
        existing_data = {}
        if existing:
            # Convert existing data to dict format
            existing_data = {
                'ip_address': existing.get('ip_address'),
                'ip_addresses': existing.get('ip_addresses'),
                'ipv6_addresses': existing.get('ipv6_addresses'),
                'host_name': existing.get('host_name'),
                'asn': existing.get('asn'),
                'isp': existing.get('isp'),
                'cdn': existing.get('cdn'),
                'cms': existing.get('cms'),
                'payment_processor': existing.get('payment_processor'),
                'registrar': existing.get('registrar'),
                'creation_date': str(existing.get('creation_date')) if existing.get('creation_date') else None,
                'expiration_date': str(existing.get('expiration_date')) if existing.get('expiration_date') else None,
                'updated_date': str(existing.get('updated_date')) if existing.get('updated_date') else None,
                'name_servers': existing.get('name_servers'),
                'mx_records': existing.get('mx_records'),
                'whois_status': existing.get('whois_status'),
                'web_server': existing.get('web_server'),
                'frameworks': existing.get('frameworks'),
                'analytics': existing.get('analytics'),
                'languages': existing.get('languages'),
                'tech_stack': existing.get('tech_stack'),
                'http_headers': existing.get('http_headers'),
                'ssl_info': existing.get('ssl_info'),
                'whois_data': existing.get('whois_data'),
                'dns_records': existing.get('dns_records')
            }
        
        # Merge new API data
        merged_data = merge_enrichment_data(existing_data, new_api_data)
        
        # Update the database - store SecurityTrails/WhoisXML in JSONB fields
        # Merge with existing whois_data and dns_records JSONB columns
        cursor = postgres.conn.cursor()
        
        # Prepare new JSONB data to merge
        # Save data if there's meaningful content, not just if 'available' is True
        whoisxml_to_add = None
        if new_api_data.get('whoisxml'):
            wx_data = new_api_data['whoisxml']
            # Check if we have any meaningful data (registrar, whois_data, dns_records, etc.)
            has_whois_data = (
                (wx_data.get('whois_data', {}).get('registrar') and wx_data['whois_data']['registrar']) or
                (wx_data.get('whois_data', {}).get('registrant_name') and wx_data['whois_data']['registrant_name']) or
                (wx_data.get('whois_data', {}).get('name_servers') and len(wx_data['whois_data']['name_servers']) > 0) or
                (wx_data.get('dns_records', {}).get('a') and len(wx_data['dns_records']['a']) > 0) or
                (wx_data.get('ssl_certificates') and len(wx_data['ssl_certificates']) > 0)
            )
            if has_whois_data or wx_data.get('available'):
                whoisxml_to_add = wx_data.copy()
                if new_api_data.get('whoisxml_history'):
                    whoisxml_to_add['history'] = new_api_data['whoisxml_history'].get('history', [])
        
        securitytrails_to_add = None
        if new_api_data.get('securitytrails'):
            st_data = new_api_data['securitytrails']
            # Check if we have any meaningful data (subdomains, historical_dns, dns_records, tags)
            has_st_data = (
                (st_data.get('subdomains') and len(st_data['subdomains']) > 0) or
                (st_data.get('historical_dns') and len(st_data['historical_dns']) > 0) or
                (st_data.get('dns_records', {}).get('a') and len(st_data['dns_records']['a']) > 0) or
                (st_data.get('tags') and len(st_data['tags']) > 0) or
                (st_data.get('whois_history') and len(st_data['whois_history']) > 0)
            )
            if has_st_data or st_data.get('available'):
                securitytrails_to_add = st_data.copy()
                if new_api_data.get('securitytrails_ip'):
                    securitytrails_to_add['ip_data'] = new_api_data['securitytrails_ip']
        
        # Update JSONB fields by merging (not overwriting)
        # Use PostgreSQL JSONB merge operator || to combine with existing data
        # We need to ensure we're adding the keys correctly even if the JSONB already has other keys
        
        # Build the update with proper JSONB merging
        update_parts = []
        params = []
        
        if whoisxml_to_add:
            # Merge whoisxml into existing whois_data
            update_parts.append("whois_data = COALESCE(whois_data, '{}'::jsonb) || jsonb_build_object('whoisxml', %s::jsonb)")
            params.append(Json(whoisxml_to_add))
        
        if securitytrails_to_add:
            # Merge securitytrails into existing dns_records
            update_parts.append("dns_records = COALESCE(dns_records, '{}'::jsonb) || jsonb_build_object('securitytrails', %s::jsonb)")
            params.append(Json(securitytrails_to_add))
        
        # Always update timestamp
        update_parts.append("enriched_at = CURRENT_TIMESTAMP")
        params.append(domain_id)
        
        if len(update_parts) > 1:  # More than just timestamp
            query = f"""
                UPDATE domain_enrichment
                SET {', '.join(update_parts)}
                WHERE domain_id = %s
            """
            cursor.execute(query, tuple(params))
        else:
            # Only timestamp update
            cursor.execute("""
                UPDATE domain_enrichment
                SET enriched_at = CURRENT_TIMESTAMP
                WHERE domain_id = %s
            """, (domain_id,))
        
        postgres.conn.commit()
        cursor.close()
        
        return True
        
    except Exception as e:
        print(f"  ❌ Error updating enrichment for {domain}: {e}")
        postgres.conn.rollback()
        return False

def enrich_all_domains():
    """Enrich all ShadowStack domains with new APIs."""
    print("="*60)
    print("ShadowStack API Enrichment Script")
    print("APIs: SecurityTrails + WhoisXML")
    print("="*60)
    print()
    
    postgres = PostgresClient()
    if not postgres or not postgres.conn:
        print("❌ Failed to connect to database")
        return
    
    # Get all ShadowStack domains
    cursor = postgres.conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("""
        SELECT 
            d.id,
            d.domain,
            d.source,
            de.enriched_at,
            de.whois_data,
            de.dns_records,
            de.ip_address
        FROM domains d
        LEFT JOIN domain_enrichment de ON d.id = de.domain_id
        WHERE d.source != 'DUMMY_DATA_FOR_TESTING'
          AND d.source IS NOT NULL
          AND d.source != ''
          AND (d.source ILIKE 'SHADOWSTACK%' OR d.source ILIKE 'ShadowStack%')
        ORDER BY d.domain
    """)
    
    all_domains = cursor.fetchall()
    cursor.close()
    
    print(f"📊 Found {len(all_domains)} ShadowStack domains")
    print()
    
    # Filter domains that need enrichment
    domains_to_enrich = []
    if FORCE_REENRICH:
        # Force enrich all domains
        domains_to_enrich = all_domains
        print(f"⚠️  FORCE_REENRICH enabled - will enrich all {len(domains_to_enrich)} domains")
    else:
        for domain_data in all_domains:
            if should_enrich_domain(dict(domain_data)):
                domains_to_enrich.append(domain_data)
    
    print(f"🎯 Domains to enrich: {len(domains_to_enrich)}")
    print(f"⏭️  Domains to skip: {len(all_domains) - len(domains_to_enrich)} (recently enriched or already have API data)")
    print()
    
    if not domains_to_enrich:
        print("✅ All domains are up to date!")
        postgres.close()
        return
    
    # Enrich domains
    success_count = 0
    error_count = 0
    skipped_count = 0
    
    for i, domain_data in enumerate(domains_to_enrich, 1):
        domain = domain_data['domain']
        domain_id = domain_data['id']
        ip_address = domain_data.get('ip_address')
        
        print(f"[{i}/{len(domains_to_enrich)}] Enriching: {domain}")
        
        try:
            # Collect new API data
            new_data = {}
            
            # SecurityTrails
            print(f"  → SecurityTrails...")
            time.sleep(SECURITYTRAILS_DELAY)
            st_data = enrich_with_securitytrails(domain)
            if st_data:
                new_data.update(st_data)
            
            # SecurityTrails IP data (if we have IP)
            if ip_address:
                time.sleep(SECURITYTRAILS_DELAY)
                try:
                    st_ip_data = get_securitytrails_ip_data(ip_address)
                    if st_ip_data:
                        new_data.update(st_ip_data)
                except Exception as e:
                    print(f"     ⚠️  IP lookup failed: {e}")
            
            # WhoisXML
            print(f"  → WhoisXML...")
            time.sleep(WHOISXML_DELAY)
            wx_data = enrich_with_whoisxml(domain)
            if wx_data:
                new_data.update(wx_data)
            
            # WhoisXML history
            time.sleep(WHOISXML_DELAY)
            try:
                wx_history = get_whoisxml_history(domain)
                if wx_history:
                    new_data.update(wx_history)
            except Exception as e:
                print(f"     ⚠️  WHOIS history failed: {e}")
            
            # Update database
            if update_domain_enrichment(domain_id, domain, new_data, postgres):
                success_count += 1
                print(f"  ✅ Enriched successfully")
                
                # Show what we got
                st_info = new_data.get('securitytrails', {})
                wx_info = new_data.get('whoisxml', {})
                
                if st_info.get('subdomains'):
                    sub_count = len(st_info['subdomains'])
                    print(f"     - Found {sub_count} subdomains")
                if st_info.get('historical_dns'):
                    hist_count = len(st_info['historical_dns'])
                    print(f"     - Found {hist_count} historical IPs (preserved even if current DNS empty)")
                if st_info.get('dns_records', {}).get('a'):
                    print(f"     - Current DNS records retrieved")
                if wx_info.get('whois_data', {}).get('registrar'):
                    print(f"     - WHOIS data retrieved")
                if wx_info.get('history'):
                    hist_count = len(wx_info['history'])
                    print(f"     - WHOIS history: {hist_count} records")
            else:
                error_count += 1
                print(f"  ❌ Failed to update database")
        
        except Exception as e:
            error_count += 1
            print(f"  ❌ Error: {e}")
            import traceback
            traceback.print_exc()
        
        print()
        
        # Progress update every 10 domains
        if i % 10 == 0:
            print(f"📊 Progress: {i}/{len(domains_to_enrich)} | ✅ {success_count} | ❌ {error_count}")
            print()
    
    print("="*60)
    print("Enrichment Complete!")
    print(f"✅ Success: {success_count}")
    print(f"❌ Errors: {error_count}")
    print(f"⏭️  Skipped: {len(all_domains) - len(domains_to_enrich)}")
    print("="*60)
    
    postgres.close()

if __name__ == '__main__':
    enrich_all_domains()

