#!/usr/bin/env python3
"""
Migration script to import ShadowStack data into the consolidated blackwire database.

This script can:
1. Import from CSV file
2. Export from original ShadowStack database (if accessible)
3. Import into the current blackwire database
"""

import os
import sys
import csv
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from urllib.parse import urlparse
from dotenv import load_dotenv
from pathlib import Path

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


def get_target_db_connection():
    """Get connection to target database (blackwire)."""
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
    
    return psycopg2.connect(**connect_params)


def get_source_db_connection(source_db_url=None):
    """Get connection to source database (original ShadowStack)."""
    if source_db_url:
        connect_params = parse_database_url(source_db_url)
    else:
        # Try to connect to original ShadowStack database
        connect_params = {
            "host": os.getenv("SHADOWSTACK_POSTGRES_HOST") or os.getenv("POSTGRES_HOST", "localhost"),
            "port": os.getenv("SHADOWSTACK_POSTGRES_PORT") or os.getenv("POSTGRES_PORT", "5432"),
            "user": os.getenv("SHADOWSTACK_POSTGRES_USER") or os.getenv("POSTGRES_USER", "ncii_user"),
            "password": os.getenv("SHADOWSTACK_POSTGRES_PASSWORD") or os.getenv("POSTGRES_PASSWORD", "ncii123password"),
            "database": os.getenv("SHADOWSTACK_POSTGRES_DB") or os.getenv("POSTGRES_DB", "ncii_infra")
        }
    
    if connect_params["host"] and ("render.com" in connect_params["host"]):
        connect_params["sslmode"] = "require"
    
    try:
        return psycopg2.connect(**connect_params)
    except psycopg2.OperationalError as e:
        print(f"⚠️  Could not connect to source database: {e}")
        return None


def import_from_csv(csv_path: str, target_conn):
    """Import domains from CSV file."""
    print(f"📄 Reading domains from CSV: {csv_path}")
    
    if not os.path.exists(csv_path):
        print(f"❌ CSV file not found: {csv_path}")
        return 0
    
    cursor = target_conn.cursor()
    imported = 0
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            domain = row.get('domain') or row.get('Domain') or row.get('url') or row.get('URL')
            if not domain:
                continue
            
            # Clean domain
            domain = domain.strip().lower()
            if domain.startswith('http://') or domain.startswith('https://'):
                from urllib.parse import urlparse
                domain = urlparse(domain).netloc or domain.replace('http://', '').replace('https://', '').split('/')[0]
            
            source = row.get('source', 'CSV Import')
            notes = row.get('notes', '') or row.get('Notes', '')
            
            try:
                cursor.execute("""
                    INSERT INTO domains (domain, source, notes, updated_at)
                    VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (domain) 
                    DO UPDATE SET 
                        source = EXCLUDED.source,
                        notes = EXCLUDED.notes,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING id
                """, (domain, source, notes))
                
                domain_id = cursor.fetchone()[0]
                imported += 1
                print(f"  ✅ Imported: {domain} (ID: {domain_id})")
            except Exception as e:
                print(f"  ⚠️  Error importing {domain}: {e}")
    
    target_conn.commit()
    cursor.close()
    print(f"\n✅ Imported {imported} domains from CSV")
    return imported


def export_from_source_db(source_conn, target_conn):
    """Export domains and enrichment data from source database to target."""
    print("📤 Exporting data from source database...")
    
    source_cursor = source_conn.cursor(cursor_factory=RealDictCursor)
    target_cursor = target_conn.cursor()
    
    # Export domains
    source_cursor.execute("SELECT * FROM domains")
    domains = source_cursor.fetchall()
    print(f"  Found {len(domains)} domains in source database")
    
    imported_domains = 0
    domain_id_mapping = {}  # Map old domain_id to new domain_id
    
    for domain_row in domains:
        try:
            target_cursor.execute("""
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
            
            new_domain_id = target_cursor.fetchone()[0]
            old_domain_id = domain_row['id']
            domain_id_mapping[old_domain_id] = new_domain_id
            imported_domains += 1
            print(f"  ✅ Imported domain: {domain_row['domain']} (old ID: {old_domain_id} -> new ID: {new_domain_id})")
        except Exception as e:
            print(f"  ⚠️  Error importing domain {domain_row.get('domain')}: {e}")
    
    # Export enrichment data
    source_cursor.execute("SELECT * FROM domain_enrichment")
    enrichments = source_cursor.fetchall()
    print(f"\n  Found {len(enrichments)} enrichment records")
    
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
                return Json(value) if isinstance(value, (dict, list)) else value
            
            target_cursor.execute("""
                INSERT INTO domain_enrichment (
                    domain_id, ip_address, ip_addresses, ipv6_addresses, host_name, asn, isp,
                    cdn, cms, payment_processor, registrar, creation_date, expiration_date, updated_date,
                    name_servers, mx_records, whois_status, web_server, frameworks, analytics, languages,
                    tech_stack, http_headers, ssl_info, whois_data, dns_records, enriched_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
        except Exception as e:
            print(f"  ⚠️  Error importing enrichment for domain_id {new_domain_id}: {e}")
    
    target_conn.commit()
    source_cursor.close()
    target_cursor.close()
    
    print(f"\n✅ Migration complete:")
    print(f"   - Imported {imported_domains} domains")
    print(f"   - Imported {imported_enrichments} enrichment records")
    
    return imported_domains, imported_enrichments


def main():
    """Main migration function."""
    print("🔄 ShadowStack Data Migration Tool")
    print("=" * 50)
    
    # Connect to target database (blackwire)
    print("\n1. Connecting to target database (blackwire)...")
    try:
        target_conn = get_target_db_connection()
        print("   ✅ Connected to target database")
    except Exception as e:
        print(f"   ❌ Failed to connect to target database: {e}")
        print("\n   Make sure DATABASE_URL or POSTGRES_* environment variables are set")
        return
    
    # Check for CSV file
    csv_paths = [
        "/Users/aazir/Desktop/AIModules/DarkAI/AIPornTracker/ncii-infra-mapping/data/input/domains.csv",
        "./domains.csv",
        "../AIPornTracker/ncii-infra-mapping/data/input/domains.csv"
    ]
    
    csv_path = None
    for path in csv_paths:
        if os.path.exists(path):
            csv_path = path
            break
    
    # Try to connect to source database
    print("\n2. Checking for source database...")
    source_conn = get_source_db_connection()
    
    if source_conn:
        print("   ✅ Connected to source database")
        print("\n3. Exporting from source database...")
        export_from_source_db(source_conn, target_conn)
        source_conn.close()
    elif csv_path:
        print("   ⚠️  Could not connect to source database")
        print(f"\n3. Importing from CSV file: {csv_path}")
        import_from_csv(csv_path, target_conn)
    else:
        print("   ⚠️  Could not connect to source database")
        print("   ⚠️  CSV file not found")
        print("\n   Options:")
        print("   1. Set SHADOWSTACK_POSTGRES_* environment variables to connect to original database")
        print("   2. Place domains.csv file in the current directory")
        print("   3. Provide CSV path as argument: python migrate_shadowstack_data.py /path/to/domains.csv")
        return
    
    target_conn.close()
    print("\n✅ Migration complete!")


if __name__ == "__main__":
    # Allow CSV path as command line argument
    if len(sys.argv) > 1:
        csv_path = sys.argv[1]
        target_conn = get_target_db_connection()
        import_from_csv(csv_path, target_conn)
        target_conn.close()
    else:
        main()

