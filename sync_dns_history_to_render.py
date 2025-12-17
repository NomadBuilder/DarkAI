#!/usr/bin/env python3
"""
Sync DNS history data to Render database.
Reads from local JSON file and stores in Render's database.
"""

import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import Json
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

def sync_dns_history(database_url):
    """Sync DNS history from local JSON to Render database."""
    print("="*60)
    print("Syncing DNS History to Render Database")
    print("="*60)
    print()
    
    # Read JSON file
    json_file = Path(__file__).parent / 'shadowstack_ip_history.json'
    if not json_file.exists():
        print(f"❌ DNS history file not found: {json_file}")
        return False
    
    print(f"📄 Reading DNS history from: {json_file}")
    with open(json_file, 'r', encoding='utf-8') as f:
        dns_history_data = json.load(f)
    
    print(f"✅ Loaded DNS history for {len(dns_history_data)} domains")
    print()
    
    # Connect to Render database
    connect_params = parse_database_url(database_url)
    if connect_params["host"] and ("render.com" in connect_params["host"]):
        connect_params["sslmode"] = "require"
    
    try:
        conn = psycopg2.connect(**connect_params)
        print(f"✅ Connected to Render database: {connect_params.get('database', 'unknown')}")
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        return False
    
    cursor = conn.cursor()
    
    imported = 0
    updated = 0
    skipped = 0
    
    for domain, domain_data in dns_history_data.items():
        historical_ips = domain_data.get('historical_ips', [])
        
        if not historical_ips:
            skipped += 1
            continue
        
        try:
            # Find domain
            cursor.execute("""
                SELECT d.id, de.dns_records
                FROM domains d
                LEFT JOIN domain_enrichment de ON d.id = de.domain_id
                WHERE d.domain = %s
                  AND (d.source ILIKE 'SHADOWSTACK%' OR d.source ILIKE 'ShadowStack%')
                LIMIT 1
            """, (domain,))
            
            result = cursor.fetchone()
            if not result:
                # Try without www prefix
                domain_variant = domain[4:] if domain.startswith('www.') else f'www.{domain}'
                cursor.execute("""
                    SELECT d.id, de.dns_records
                    FROM domains d
                    LEFT JOIN domain_enrichment de ON d.id = de.domain_id
                    WHERE d.domain = %s
                      AND (d.source ILIKE 'SHADOWSTACK%' OR d.source ILIKE 'ShadowStack%')
                    LIMIT 1
                """, (domain_variant,))
                result = cursor.fetchone()
            
            if not result or len(result) < 1:
                skipped += 1
                continue
            
            domain_id = result[0]
            # Handle case where enrichment doesn't exist (LEFT JOIN may return None for dns_records)
            if len(result) > 1:
                existing_dns_records = result[1] if result[1] is not None else {}
            else:
                existing_dns_records = {}
            
            # Format IPs
            formatted_ips = []
            for ip_data in historical_ips:
                formatted_ips.append({
                    'ip': ip_data.get('ip', ''),
                    'country': ip_data.get('country', 'Unknown'),
                    'asn': ip_data.get('asn', 'Unknown'),
                    'location': ip_data.get('location', ip_data.get('country', 'Unknown')),
                    'last_seen': ip_data.get('last_seen')
                })
            
            # Prepare dns_records dict
            if existing_dns_records is None:
                dns_records_dict = {}
            elif isinstance(existing_dns_records, str):
                try:
                    dns_records_dict = json.loads(existing_dns_records)
                except:
                    dns_records_dict = {}
            else:
                # It's already a dict (from JSONB)
                dns_records_dict = dict(existing_dns_records) if existing_dns_records else {}
            
            # Add viewdns_ip_history
            dns_records_dict['viewdns_ip_history'] = {
                'historical_ips': formatted_ips,
                'source': 'ViewDNS.info',
                'total_ips': len(formatted_ips)
            }
            
            # Check if enrichment record exists
            cursor.execute("SELECT id FROM domain_enrichment WHERE domain_id = %s", (domain_id,))
            enrichment_exists = cursor.fetchone()
            
            if enrichment_exists:
                # Update existing enrichment
                cursor.execute("""
                    UPDATE domain_enrichment
                    SET dns_records = %s
                    WHERE domain_id = %s
                """, (Json(dns_records_dict), domain_id))
            else:
                # Create new enrichment record
                cursor.execute("""
                    INSERT INTO domain_enrichment (domain_id, dns_records)
                    VALUES (%s, %s)
                """, (domain_id, Json(dns_records_dict)))
            
            updated += 1
            if updated % 20 == 0:
                print(f"  ✅ Processed {updated} domains...")
        
        except Exception as e:
            print(f"  ⚠️  Error processing {domain}: {e}")
            skipped += 1
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print()
    print("="*60)
    print(f"✅ Sync complete!")
    print(f"   Updated: {updated}")
    print(f"   Skipped: {skipped}")
    print("="*60)
    
    return True

if __name__ == '__main__':
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not set")
        print("Usage: DATABASE_URL='your_url' python3 sync_dns_history_to_render.py")
        sys.exit(1)
    
    success = sync_dns_history(database_url)
    sys.exit(0 if success else 1)

