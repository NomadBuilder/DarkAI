#!/usr/bin/env python3
"""
Sync enriched domains from local database to production (Render).

Workflow:
1. Run enrichment locally: python3 enrich_new_domains.py
2. Run this script to sync to production: python3 sync_enriched_to_production.py

This script:
- Exports enriched domains from local database
- Imports them to production database (via DATABASE_URL or env vars)
- Only syncs domains that are enriched (skips unenriched ones)
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from urllib.parse import urlparse

# Add shadowstack to path
shadowstack_path = Path(__file__).parent / 'shadowstack'
sys.path.insert(0, str(shadowstack_path))

load_dotenv()

from src.data.domains import SHADOWSTACK_DOMAINS
from src.database.postgres_client import PostgresClient

def get_local_db_connection():
    """Get connection to local database."""
    # Temporarily unset DATABASE_URL to force local connection
    original_db_url = os.environ.pop('DATABASE_URL', None)
    
    try:
        # Use local PostgresClient to get connection
        client = PostgresClient()
        if not client or not client.conn:
            print("❌ Could not connect to local database")
            print("   Make sure your local .env has correct POSTGRES_* variables")
            return None
        conn = client.conn
        # Don't close the client, we need the connection
        return conn
    finally:
        # Restore DATABASE_URL if it was set
        if original_db_url:
            os.environ['DATABASE_URL'] = original_db_url

def get_production_db_connection():
    """Get connection to production database."""
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not set")
        print("   For production sync, set DATABASE_URL to your Render database")
        print("   Or set individual POSTGRES_* variables")
        return None
    
    try:
        parsed = urlparse(database_url)
        
        # Render databases need the full hostname with .render.com
        hostname = parsed.hostname
        if hostname and not hostname.endswith('.render.com') and not '.' in hostname.split('-')[-1]:
            # If it's a Render internal hostname, try adding the domain
            # But first, let's try the connection as-is since the URL might be correct
            pass
        
        conn = psycopg2.connect(
            host=hostname,
            port=parsed.port or 5432,
            user=parsed.username,
            password=parsed.password,
            database=parsed.path.lstrip('/'),
            sslmode='require'  # Always require SSL for external connections
        )
        print(f"✅ Connected to production database: {parsed.path.lstrip('/')}")
        return conn
    except Exception as e:
        print(f"❌ Could not connect to production database: {e}")
        print(f"   Hostname: {parsed.hostname if 'parsed' in locals() else 'unknown'}")
        print(f"   Database: {parsed.path.lstrip('/') if 'parsed' in locals() else 'unknown'}")
        print(f"   Tip: Make sure the DATABASE_URL is the external connection string from Render")
        return None

def is_domain_enriched(domain_data):
    """Check if a domain has enrichment data."""
    return bool(
        domain_data.get('ip_address') or 
        domain_data.get('host_name') or 
        domain_data.get('cdn') or
        domain_data.get('registrar')
    )

def sync_enriched_domains():
    """Sync enriched domains from local to production."""
    
    print("🔄 ShadowStack: Syncing enriched domains to production...")
    print("")
    
    # Connect to local database
    local_conn = get_local_db_connection()
    if not local_conn:
        return False
    
    # Connect to production database
    prod_conn = get_production_db_connection()
    if not prod_conn:
        return False
    
    try:
        # Get enriched domains from local
        local_cursor = local_conn.cursor(cursor_factory=RealDictCursor)
        local_cursor.execute("""
            SELECT 
                d.id as domain_id,
                d.domain,
                d.source,
                d.notes,
                de.ip_address,
                de.ip_addresses,
                de.ipv6_addresses,
                de.host_name,
                de.asn,
                de.isp,
                de.cdn,
                de.cms,
                de.payment_processor,
                de.registrar,
                de.creation_date,
                de.expiration_date,
                de.updated_date,
                de.name_servers,
                de.mx_records,
                de.whois_status,
                de.web_server,
                de.frameworks,
                de.analytics,
                de.languages,
                de.tech_stack,
                de.http_headers,
                de.ssl_info,
                de.whois_data,
                de.dns_records,
                de.enriched_at
            FROM domains d
            LEFT JOIN domain_enrichment de ON d.id = de.domain_id
            WHERE d.domain = ANY(%s)
            ORDER BY d.domain
        """, (list(SHADOWSTACK_DOMAINS),))
        
        local_domains = local_cursor.fetchall()
        local_cursor.close()
        
        print(f"📊 Found {len(local_domains)} domains in local database")
        
        # Filter to only enriched domains
        enriched_domains = [d for d in local_domains if is_domain_enriched(d)]
        print(f"📊 Found {len(enriched_domains)} enriched domains to sync")
        
        if not enriched_domains:
            print("✅ No enriched domains to sync")
            return True
        
        # Sync to production
        prod_cursor = prod_conn.cursor()
        
        synced_domains = 0
        synced_enrichments = 0
        errors = []
        
        for domain_data in enriched_domains:
            domain = domain_data['domain']
            
            try:
                # Insert or update domain
                # Use SHADOWSTACK prefix so domains show up in dashboard (filters by source LIKE 'SHADOWSTACK%')
                source = domain_data.get('source', 'SHADOWSTACK_SYNC')
                if not source.startswith('SHADOWSTACK'):
                    source = f'SHADOWSTACK_{source}'
                
                prod_cursor.execute("""
                    INSERT INTO domains (domain, source, notes, updated_at)
                    VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (domain) 
                    DO UPDATE SET 
                        source = EXCLUDED.source,
                        notes = EXCLUDED.notes,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING id
                """, (
                    domain,
                    source,
                    domain_data.get('notes', '')
                ))
                
                prod_domain_id = prod_cursor.fetchone()[0]
                
                # Insert or update enrichment
                def to_json(value):
                    if value is None:
                        return None
                    return Json(value) if isinstance(value, (dict, list)) else value
                
                prod_cursor.execute("""
                    INSERT INTO domain_enrichment (
                        domain_id, ip_address, ip_addresses, ipv6_addresses, host_name, asn, isp,
                        cdn, cms, payment_processor, registrar, creation_date, expiration_date, updated_date,
                        name_servers, mx_records, whois_status, web_server, frameworks, analytics, languages,
                        tech_stack, http_headers, ssl_info, whois_data, dns_records, enriched_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (domain_id)
                    DO UPDATE SET
                        ip_address = EXCLUDED.ip_address,
                        ip_addresses = EXCLUDED.ip_addresses,
                        ipv6_addresses = EXCLUDED.ipv6_addresses,
                        host_name = EXCLUDED.host_name,
                        asn = EXCLUDED.asn,
                        isp = EXCLUDED.isp,
                        cdn = EXCLUDED.cdn,
                        cms = EXCLUDED.cms,
                        payment_processor = EXCLUDED.payment_processor,
                        registrar = EXCLUDED.registrar,
                        creation_date = EXCLUDED.creation_date,
                        expiration_date = EXCLUDED.expiration_date,
                        updated_date = EXCLUDED.updated_date,
                        name_servers = EXCLUDED.name_servers,
                        mx_records = EXCLUDED.mx_records,
                        whois_status = EXCLUDED.whois_status,
                        web_server = EXCLUDED.web_server,
                        frameworks = EXCLUDED.frameworks,
                        analytics = EXCLUDED.analytics,
                        languages = EXCLUDED.languages,
                        tech_stack = EXCLUDED.tech_stack,
                        http_headers = EXCLUDED.http_headers,
                        ssl_info = EXCLUDED.ssl_info,
                        whois_data = EXCLUDED.whois_data,
                        dns_records = EXCLUDED.dns_records,
                        enriched_at = EXCLUDED.enriched_at
                """, (
                    prod_domain_id,
                    domain_data.get('ip_address'),
                    to_json(domain_data.get('ip_addresses')),
                    to_json(domain_data.get('ipv6_addresses')),
                    domain_data.get('host_name'),
                    domain_data.get('asn'),
                    domain_data.get('isp'),
                    domain_data.get('cdn'),
                    domain_data.get('cms'),
                    domain_data.get('payment_processor'),
                    domain_data.get('registrar'),
                    domain_data.get('creation_date'),
                    domain_data.get('expiration_date'),
                    domain_data.get('updated_date'),
                    to_json(domain_data.get('name_servers')),
                    to_json(domain_data.get('mx_records')),
                    domain_data.get('whois_status'),
                    domain_data.get('web_server'),
                    to_json(domain_data.get('frameworks')),
                    to_json(domain_data.get('analytics')),
                    to_json(domain_data.get('languages')),
                    to_json(domain_data.get('tech_stack')),
                    to_json(domain_data.get('http_headers')),
                    to_json(domain_data.get('ssl_info')),
                    to_json(domain_data.get('whois_data')),
                    to_json(domain_data.get('dns_records')),
                    domain_data.get('enriched_at')
                ))
                
                synced_domains += 1
                synced_enrichments += 1
                
                if synced_domains % 10 == 0:
                    print(f"  ✅ Synced {synced_domains}/{len(enriched_domains)} domains...")
                
            except Exception as e:
                error_msg = f"Error syncing {domain}: {str(e)}"
                errors.append(error_msg)
                print(f"  ❌ {error_msg}")
                continue
        
        prod_conn.commit()
        prod_cursor.close()
        
        print("")
        print("✅ Sync complete!")
        print(f"   Synced {synced_domains} domains")
        print(f"   Synced {synced_enrichments} enrichment records")
        if errors:
            print(f"   Errors: {len(errors)}")
            for error in errors[:5]:
                print(f"     - {error}")
        
        return True
        
    except Exception as e:
        import traceback
        print(f"❌ Sync failed: {e}")
        traceback.print_exc()
        return False
    finally:
        local_conn.close()
        prod_conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("ShadowStack: Sync Enriched Domains to Production")
    print("=" * 60)
    print("")
    print("⚠️  Make sure you have:")
    print("   1. Run enrichment locally: python3 enrich_new_domains.py")
    print("   2. Set DATABASE_URL to your production database")
    print("")
    
    success = sync_enriched_domains()
    
    if success:
        print("")
        print("✅ Sync completed successfully!")
        print("   Visit your production dashboard to verify")
    else:
        print("")
        print("❌ Sync failed. Check the errors above.")
        sys.exit(1)

