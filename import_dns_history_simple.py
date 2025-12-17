#!/usr/bin/env python3
"""
Simple script to import DNS history from JSON to database.
"""

import json
from shadowstack.src.database.postgres_client import PostgresClient
from psycopg2.extras import Json

# Read JSON
with open('shadowstack_ip_history.json', 'r') as f:
    dns_data = json.load(f)

print(f"📄 Loaded {len(dns_data)} domains from JSON")
print()

postgres = PostgresClient()
cursor = postgres.conn.cursor()

imported = 0
updated = 0
skipped = 0

for domain, domain_data in dns_data.items():
    historical_ips = domain_data.get('historical_ips', [])
    if not historical_ips:
        skipped += 1
        continue
    
    try:
        # Find domain
        cursor.execute('''
            SELECT d.id
            FROM domains d
            WHERE d.domain = %s
              AND (d.source ILIKE 'SHADOWSTACK%' OR d.source ILIKE 'ShadowStack%')
            LIMIT 1
        ''', (domain,))
        
        result = cursor.fetchone()
        if not result or len(result) == 0:
            skipped += 1
            continue
        
        try:
            domain_id = result[0]
        except (IndexError, TypeError) as e:
            print(f"  ⚠️  Error getting domain_id for {domain}: {e}, result: {result}")
            skipped += 1
            continue
        
        # Get existing dns_records
        cursor.execute('''
            SELECT dns_records
            FROM domain_enrichment
            WHERE domain_id = %s
        ''', (domain_id,))
        
        result = cursor.fetchone()
        if result is not None and len(result) > 0 and result[0] is not None:
            existing_dns_records = result[0]
        else:
            existing_dns_records = {}
        
        if isinstance(existing_dns_records, str):
            existing_dns_records = json.loads(existing_dns_records)
        elif existing_dns_records is None:
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
        
        # Add viewdns_ip_history
        existing_dns_records['viewdns_ip_history'] = {
            'historical_ips': formatted_ips,
            'source': 'ViewDNS.info',
            'total_ips': len(formatted_ips)
        }
        
        # Update or insert
        cursor.execute('''
            INSERT INTO domain_enrichment (domain_id, dns_records)
            VALUES (%s, %s)
            ON CONFLICT (domain_id)
            DO UPDATE SET dns_records = EXCLUDED.dns_records
        ''', (domain_id, Json(existing_dns_records)))
        
        updated += 1
        if updated % 20 == 0:
            print(f"  ✅ Processed {updated} domains...")
    
    except Exception as e:
        print(f"  ⚠️  Error processing {domain}: {e}")
        skipped += 1

postgres.conn.commit()
cursor.close()
postgres.close()

print()
print("="*60)
print(f"✅ Import complete!")
print(f"   Updated: {updated}")
print(f"   Skipped: {skipped}")
print("="*60)

