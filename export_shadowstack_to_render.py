#!/usr/bin/env python3
"""
Export ShadowStack enriched data from local database and import to Render database.

This script:
1. Connects to local ShadowStack database
2. Exports all domains and their enrichment data
3. Imports them into Render database (via DATABASE_URL or POSTGRES_* env vars)

Usage:
    python export_shadowstack_to_render.py
"""

import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from urllib.parse import urlparse

load_dotenv()


def parse_database_url(database_url: str) -> dict:
    """Parse DATABASE_URL into connection parameters."""
    parsed = urlparse(database_url)
    return {
        "host": parsed.hostname,
        "port": parsed.port or 5432,
        "user": parsed.username,
        "password": parsed.password,
        "database": parsed.path.lstrip('/')
    }


def get_local_db_connection():
    """Get connection to local ShadowStack database."""
    connect_params = {
        "host": os.getenv("POSTGRES_HOST", "localhost"),
        "port": os.getenv("POSTGRES_PORT", "5432"),
        "user": os.getenv("POSTGRES_USER", "ncii_user"),
        "password": os.getenv("POSTGRES_PASSWORD", "ncii123password"),
        "database": os.getenv("POSTGRES_DB", "ncii_infra")
    }
    
    try:
        return psycopg2.connect(**connect_params)
    except psycopg2.OperationalError as e:
        print(f"❌ Could not connect to local database: {e}")
        print(f"   Connection params: {connect_params}")
        return None


def get_render_db_connection():
    """Get connection to Render database."""
    database_url = os.getenv("DATABASE_URL")
    
    if database_url:
        connect_params = parse_database_url(database_url)
    else:
        connect_params = {
            "host": os.getenv("POSTGRES_HOST", "localhost"),
            "port": os.getenv("POSTGRES_PORT", "5432"),
            "user": os.getenv("POSTGRES_USER", "blackwire_user"),
            "password": os.getenv("POSTGRES_PASSWORD", "blackwire123password"),
            "database": os.getenv("POSTGRES_DB", "blackwire")
        }
    
    # Add SSL for Render PostgreSQL
    if connect_params["host"] and ("render.com" in connect_params["host"]):
        connect_params["sslmode"] = "require"
        print(f"🔒 Using SSL for Render database connection")
    
    try:
        conn = psycopg2.connect(**connect_params)
        print(f"✅ Connected to Render database: {connect_params.get('database', 'unknown')}")
        return conn
    except psycopg2.OperationalError as e:
        print(f"❌ Could not connect to Render database: {e}")
        print(f"   Connection params: host={connect_params.get('host')}, database={connect_params.get('database')}")
        return None


def export_and_import_data():
    """Export from local and import to Render."""
    print("🚀 Starting ShadowStack data export/import...")
    print("")
    
    # Connect to local database
    print("📥 Connecting to local database...")
    local_conn = get_local_db_connection()
    if not local_conn:
        print("❌ Failed to connect to local database")
        return False
    
    print("✅ Connected to local database")
    
    # Connect to Render database
    print("\n📤 Connecting to Render database...")
    render_conn = get_render_db_connection()
    if not render_conn:
        print("❌ Failed to connect to Render database")
        local_conn.close()
        return False
    
    print("✅ Connected to Render database")
    
    try:
        local_cursor = local_conn.cursor(cursor_factory=RealDictCursor)
        render_cursor = render_conn.cursor()
        
        # Export domains from local
        print("\n📊 Exporting domains from local database...")
        local_cursor.execute("""
            SELECT id, domain, source, notes, created_at, updated_at 
            FROM domains 
            WHERE source != 'DUMMY_DATA_FOR_TESTING'
              AND (source ILIKE 'SHADOWSTACK%' OR source ILIKE 'ShadowStack%' OR source = 'IMPORT' OR source = 'CSV Import')
            ORDER BY id
        """)
        domains = local_cursor.fetchall()
        print(f"  Found {len(domains)} ShadowStack domains")
        
        # Import domains to Render
        print("\n📥 Importing domains to Render database...")
        domain_id_mapping = {}  # Map old domain_id to new domain_id
        imported_domains = 0
        
        for domain_row in domains:
            try:
                render_cursor.execute("""
                    INSERT INTO domains (domain, source, notes, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (domain) 
                    DO UPDATE SET 
                        source = EXCLUDED.source,
                        notes = EXCLUDED.notes,
                        updated_at = EXCLUDED.updated_at
                    RETURNING id
                """, (
                    domain_row['domain'],
                    domain_row.get('source'),
                    domain_row.get('notes', ''),
                    domain_row.get('created_at'),
                    domain_row.get('updated_at')
                ))
                
                new_domain_id = render_cursor.fetchone()[0]
                old_domain_id = domain_row['id']
                domain_id_mapping[old_domain_id] = new_domain_id
                imported_domains += 1
                
                if imported_domains % 20 == 0:
                    print(f"  ✅ Imported {imported_domains} domains...")
                    
            except Exception as e:
                print(f"  ⚠️  Error importing domain {domain_row.get('domain')}: {e}")
        
        print(f"✅ Imported {imported_domains} domains")
        
        # Export enrichment data from local
        print("\n📊 Exporting enrichment data from local database...")
        local_cursor.execute("""
            SELECT * FROM domain_enrichment
        """)
        enrichments = local_cursor.fetchall()
        print(f"  Found {len(enrichments)} enrichment records")
        
        # Import enrichment data to Render
        print("\n📥 Importing enrichment data to Render database...")
        imported_enrichments = 0
        
        for enrichment_row in enrichments:
            old_domain_id = enrichment_row['domain_id']
            new_domain_id = domain_id_mapping.get(old_domain_id)
            
            if not new_domain_id:
                print(f"  ⚠️  Skipping enrichment for domain_id {old_domain_id} (domain not found)")
                continue
            
            try:
                # Convert JSONB fields
                def to_json(value):
                    if value is None:
                        return None
                    if isinstance(value, (dict, list)):
                        return Json(value)
                    return value
                
                render_cursor.execute("""
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
                    new_domain_id,
                    enrichment_row.get('ip_address'),
                    to_json(enrichment_row.get('ip_addresses')),
                    to_json(enrichment_row.get('ipv6_addresses')),
                    enrichment_row.get('host_name'),
                    enrichment_row.get('asn'),
                    enrichment_row.get('isp'),
                    enrichment_row.get('cdn'),
                    enrichment_row.get('cms'),
                    enrichment_row.get('payment_processor'),
                    enrichment_row.get('registrar'),
                    enrichment_row.get('creation_date'),
                    enrichment_row.get('expiration_date'),
                    enrichment_row.get('updated_date'),
                    to_json(enrichment_row.get('name_servers')),
                    to_json(enrichment_row.get('mx_records')),
                    enrichment_row.get('whois_status'),
                    enrichment_row.get('web_server'),
                    to_json(enrichment_row.get('frameworks')),
                    to_json(enrichment_row.get('analytics')),
                    to_json(enrichment_row.get('languages')),
                    to_json(enrichment_row.get('tech_stack')),
                    to_json(enrichment_row.get('http_headers')),
                    to_json(enrichment_row.get('ssl_info')),
                    to_json(enrichment_row.get('whois_data')),
                    to_json(enrichment_row.get('dns_records')),
                    enrichment_row.get('enriched_at')
                ))
                
                imported_enrichments += 1
                
                if imported_enrichments % 20 == 0:
                    print(f"  ✅ Imported {imported_enrichments} enrichment records...")
                    
            except Exception as e:
                print(f"  ⚠️  Error importing enrichment for domain_id {new_domain_id}: {e}")
        
        print(f"✅ Imported {imported_enrichments} enrichment records")
        
        # Commit changes
        render_conn.commit()
        print("\n✅ All data imported successfully!")
        print(f"   - Domains: {imported_domains}")
        print(f"   - Enrichments: {imported_enrichments}")
        
        return True
        
    except Exception as e:
        import traceback
        print(f"\n❌ Error during export/import: {e}")
        traceback.print_exc()
        render_conn.rollback()
        return False
        
    finally:
        local_cursor.close()
        render_cursor.close()
        local_conn.close()
        render_conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("ShadowStack Data Export/Import to Render")
    print("=" * 60)
    print("")
    print("This script will:")
    print("  1. Export domains and enrichment data from local database")
    print("  2. Import them into Render database")
    print("  3. Only affects ShadowStack's 'domains' table")
    print("")
    
    # Confirm
    response = input("Continue? (yes/no): ").strip().lower()
    if response != 'yes':
        print("Cancelled.")
        sys.exit(0)
    
    print("")
    success = export_and_import_data()
    
    if success:
        print("\n✅ Export/import completed successfully!")
        print("   Visit https://darkai-6otc.onrender.com/shadowstack/dashboard to see the data")
    else:
        print("\n❌ Export/import failed. Check the errors above.")
        sys.exit(1)

