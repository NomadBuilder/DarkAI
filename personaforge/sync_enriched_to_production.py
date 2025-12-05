#!/usr/bin/env python3
"""
Sync enriched PersonaForge domains from local database to production (Render).

This script:
- Exports enriched domains from local PersonaForge database
- Imports them to production database (via DATABASE_URL)
- Includes all enhanced enrichment data (web_scraping, NLP, SSL, etc.)
- Only syncs domains that are enriched (skips unenriched ones)

Usage:
    DATABASE_URL=postgresql://user:pass@host:port/db python3 personaforge/sync_enriched_to_production.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from urllib.parse import urlparse
import json
import datetime

# Add personaforge to path
personaforge_path = Path(__file__).parent
sys.path.insert(0, str(personaforge_path.parent))

load_dotenv()

def serialize_dates_recursive(obj):
    """Recursively convert date/datetime objects to strings."""
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: serialize_dates_recursive(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_dates_recursive(item) for item in obj]
    else:
        return obj

def to_json(value):
    """Convert value to JSON-compatible format."""
    if value is None:
        return None
    if isinstance(value, (dict, list)):
        # Serialize dates before converting to Json
        cleaned = serialize_dates_recursive(value)
        return Json(cleaned)
    return value

def get_local_db_connection():
    """Get connection to local PersonaForge database."""
    # Temporarily unset DATABASE_URL to force local connection
    original_db_url = os.environ.pop('DATABASE_URL', None)
    
    try:
        from personaforge.src.database.postgres_client import PostgresClient
        client = PostgresClient()
        if not client or not client.conn:
            print("❌ Could not connect to local database")
            print("   Make sure your local .env has correct POSTGRES_* variables")
            return None
        conn = client.conn
        return conn
    except Exception as e:
        print(f"❌ Error connecting to local database: {e}")
        return None
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
        print("   Example: DATABASE_URL=postgresql://user:pass@host:port/db")
        return None
    
    try:
        parsed = urlparse(database_url)
        
        conn = psycopg2.connect(
            host=parsed.hostname,
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
        print(f"   Tip: Use the external connection string from Render dashboard")
        return None

def is_domain_enriched(domain_data):
    """Check if a domain has enrichment data."""
    # Check basic infrastructure
    has_basic = bool(
        domain_data.get('ip_address') or 
        domain_data.get('host_name') or 
        domain_data.get('cdn') or
        domain_data.get('registrar')
    )
    
    # Check enhanced enrichment
    has_enhanced = bool(
        domain_data.get('web_scraping') or
        domain_data.get('nlp_analysis') or
        domain_data.get('ssl_certificate') or
        domain_data.get('security_headers')
    )
    
    return has_basic or has_enhanced

def sync_enriched_domains():
    """Sync enriched PersonaForge domains from local to production."""
    
    print("=" * 60)
    print("PersonaForge: Sync Enriched Domains to Production")
    print("=" * 60)
    print()
    
    # Connect to local database
    print("📥 Connecting to local database...")
    local_conn = get_local_db_connection()
    if not local_conn:
        return False
    
    print("✅ Connected to local database")
    
    # Connect to production database
    print("\n📤 Connecting to production database...")
    prod_conn = get_production_db_connection()
    if not prod_conn:
        local_conn.close()
        return False
    
    print("✅ Connected to production database")
    
    try:
        # Get enriched domains from local
        local_cursor = local_conn.cursor(cursor_factory=RealDictCursor)
        local_cursor.execute("""
            SELECT 
                d.id as domain_id,
                d.domain,
                d.source,
                d.notes,
                d.vendor_type,
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
                de.web_scraping,
                de.extracted_content,
                de.nlp_analysis,
                de.ssl_certificate,
                de.certificate_transparency,
                de.security_headers,
                de.threat_intel,
                de.enrichment_data,
                de.enriched_at
            FROM personaforge_domains d
            LEFT JOIN personaforge_domain_enrichment de ON d.id = de.domain_id
            ORDER BY d.domain
        """)
        
        local_domains = local_cursor.fetchall()
        local_cursor.close()
        
        print(f"\n📊 Found {len(local_domains)} domains in local database")
        
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
                source = domain_data.get('source', 'PERSONAFORGE_SYNC')
                if not source.startswith('PERSONAFORGE'):
                    source = f'PERSONAFORGE_{source}'
                
                prod_cursor.execute("""
                    INSERT INTO personaforge_domains (domain, source, notes, vendor_type, updated_at)
                    VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (domain) 
                    DO UPDATE SET 
                        source = EXCLUDED.source,
                        notes = EXCLUDED.notes,
                        vendor_type = EXCLUDED.vendor_type,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING id
                """, (
                    domain,
                    source,
                    domain_data.get('notes', ''),
                    domain_data.get('vendor_type')
                ))
                
                prod_domain_id = prod_cursor.fetchone()[0]
                
                # Insert or update enrichment (with all enhanced fields)
                prod_cursor.execute("""
                    INSERT INTO personaforge_domain_enrichment (
                        domain_id, ip_address, ip_addresses, ipv6_addresses, host_name, asn, isp,
                        cdn, cms, payment_processor, registrar, creation_date, expiration_date, updated_date,
                        name_servers, mx_records, whois_status, web_server, frameworks, analytics, languages,
                        tech_stack, http_headers, ssl_info, whois_data, dns_records,
                        web_scraping, extracted_content, nlp_analysis, ssl_certificate,
                        certificate_transparency, security_headers, threat_intel, enrichment_data, enriched_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
                        web_scraping = EXCLUDED.web_scraping,
                        extracted_content = EXCLUDED.extracted_content,
                        nlp_analysis = EXCLUDED.nlp_analysis,
                        ssl_certificate = EXCLUDED.ssl_certificate,
                        certificate_transparency = EXCLUDED.certificate_transparency,
                        security_headers = EXCLUDED.security_headers,
                        threat_intel = EXCLUDED.threat_intel,
                        enrichment_data = EXCLUDED.enrichment_data,
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
                    str(domain_data.get('creation_date')) if domain_data.get('creation_date') else None,
                    str(domain_data.get('expiration_date')) if domain_data.get('expiration_date') else None,
                    str(domain_data.get('updated_date')) if domain_data.get('updated_date') else None,
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
                    to_json(domain_data.get('web_scraping')),
                    to_json(domain_data.get('extracted_content')),
                    to_json(domain_data.get('nlp_analysis')),
                    to_json(domain_data.get('ssl_certificate')),
                    to_json(domain_data.get('certificate_transparency')),
                    to_json(domain_data.get('security_headers')),
                    to_json(domain_data.get('threat_intel')),
                    to_json(domain_data.get('enrichment_data')),
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
        print("=" * 60)
        print("✅ Sync Complete!")
        print("=" * 60)
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
        if local_conn:
            local_conn.close()
        if prod_conn:
            prod_conn.close()

if __name__ == "__main__":
    print("⚠️  Make sure you have:")
    print("   1. Enriched domains locally (run: python3 personaforge/enrich_vendor_intel_domains.py)")
    print("   2. Set DATABASE_URL to your production database")
    print("")
    
    # Check if running non-interactively (e.g., from Render terminal)
    import sys
    if not sys.stdin.isatty():
        print("⚠️  Running non-interactively. Proceeding automatically...")
        print()
    else:
        try:
            input("Press Enter to continue or Ctrl+C to cancel...")
        except (EOFError, KeyboardInterrupt):
            print("\n❌ Cancelled by user")
            sys.exit(0)
        print()
    
    success = sync_enriched_domains()
    
    if success:
        print("")
        print("✅ Sync completed successfully!")
        print("   Visit your production PersonaForge dashboard to verify")
    else:
        print("")
        print("❌ Sync failed. Check the errors above.")
        sys.exit(1)

