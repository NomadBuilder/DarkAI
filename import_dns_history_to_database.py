#!/usr/bin/env python3
"""
Import DNS history data from shadowstack_ip_history.json into the database.

This script:
1. Reads the local shadowstack_ip_history.json file
2. Stores the data in the domain_enrichment.dns_records JSONB field
3. Makes it available on Render without needing the JSON file
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

from shadowstack.src.database.postgres_client import PostgresClient
from psycopg2.extras import Json, RealDictCursor

def import_dns_history():
    """Import DNS history from JSON file to database."""
    print("="*60)
    print("Importing DNS History to Database")
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
    
    # Connect to database
    postgres = PostgresClient()
    if not postgres or not postgres.conn:
        print("❌ Failed to connect to database")
        return False
    
    cursor = postgres.conn.cursor(cursor_factory=RealDictCursor)
    
    # Import data for each domain
    imported = 0
    updated = 0
    skipped = 0
    
    for domain, domain_data in dns_history_data.items():
        historical_ips = domain_data.get('historical_ips', [])
        
        if not historical_ips:
            skipped += 1
            continue
        
        try:
            # Find domain in database - try exact match first, then without www prefix
            domain_variants = [domain]
            if domain.startswith('www.'):
                domain_variants.append(domain[4:])  # Remove www.
            else:
                domain_variants.append(f'www.{domain}')  # Add www.
            
            domain_id = None
            existing_dns_records = None
            
            for variant in domain_variants:
                try:
                    cursor.execute("""
                        SELECT d.id, COALESCE(de.dns_records, '{}'::jsonb) as dns_records
                        FROM domains d
                        LEFT JOIN domain_enrichment de ON d.id = de.domain_id
                        WHERE d.domain = %s
                          AND (d.source ILIKE 'SHADOWSTACK%' OR d.source ILIKE 'ShadowStack%')
                        LIMIT 1
                    """, (variant,))
                    
                    result = cursor.fetchone()
                    if result and result.get('id'):  # Check if domain_id exists
                        domain_id = result['id']
                        existing_dns_records = result.get('dns_records') or {}
                        if isinstance(existing_dns_records, str):
                            existing_dns_records = json.loads(existing_dns_records)
                        break
                except Exception as e:
                    # Continue to next variant
                    continue
            
            if not domain_id:
                skipped += 1
                continue
            
            # Prepare historical IPs data in the format expected by the frontend
            # Format: [{ip, country, asn, location, last_seen}]
            formatted_ips = []
            for ip_data in historical_ips:
                formatted_ips.append({
                    'ip': ip_data.get('ip', ''),
                    'country': ip_data.get('country', ''),
                    'asn': ip_data.get('asn', ''),
                    'location': ip_data.get('country', ''),  # Use country as location
                    'last_seen': None  # ViewDNS doesn't provide this
                })
            
            # Merge with existing dns_records
            if existing_dns_records is None:
                existing_dns_records = {}
            elif isinstance(existing_dns_records, str):
                existing_dns_records = json.loads(existing_dns_records)
            
            # Add viewdns_ip_history to dns_records
            if 'viewdns_ip_history' not in existing_dns_records:
                existing_dns_records['viewdns_ip_history'] = {
                    'historical_ips': formatted_ips,
                    'source': 'ViewDNS.info',
                    'total_ips': len(formatted_ips)
                }
                is_new = True
            else:
                # Update existing
                existing_dns_records['viewdns_ip_history']['historical_ips'] = formatted_ips
                existing_dns_records['viewdns_ip_history']['total_ips'] = len(formatted_ips)
                is_new = False
            
            # Update database
            if domain_id:
                # Check if enrichment record exists
                cursor.execute("SELECT id FROM domain_enrichment WHERE domain_id = %s", (domain_id,))
                enrichment_exists = cursor.fetchone()
                
                if enrichment_exists:
                    # Update existing enrichment
                    cursor.execute("""
                        UPDATE domain_enrichment
                        SET dns_records = %s
                        WHERE domain_id = %s
                    """, (Json(existing_dns_records), domain_id))
                else:
                    # Create new enrichment record
                    cursor.execute("""
                        INSERT INTO domain_enrichment (domain_id, dns_records)
                        VALUES (%s, %s)
                    """, (domain_id, Json(existing_dns_records)))
                
                if is_new:
                    imported += 1
                else:
                    updated += 1
                
                if (imported + updated) % 20 == 0:
                    print(f"  ✅ Processed {imported + updated} domains...")
        
        except Exception as e:
            print(f"  ⚠️  Error processing {domain}: {e}")
            skipped += 1
    
    postgres.conn.commit()
    cursor.close()
    postgres.close()
    
    print()
    print("="*60)
    print(f"✅ Import complete!")
    print(f"   Imported: {imported}")
    print(f"   Updated: {updated}")
    print(f"   Skipped: {skipped}")
    print("="*60)
    
    return True

if __name__ == '__main__':
    success = import_dns_history()
    sys.exit(0 if success else 1)

