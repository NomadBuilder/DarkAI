#!/usr/bin/env python3
"""Import DNS history from JSON to database using direct psycopg2 connection."""

import json
import os
import psycopg2
from psycopg2.extras import Json
from dotenv import load_dotenv

load_dotenv()

# Read JSON
with open('shadowstack_ip_history.json', 'r') as f:
    dns_data = json.load(f)

print(f"📄 Loaded {len(dns_data)} domains from JSON")
print()

# Connect directly
conn = psycopg2.connect(
    host=os.getenv("POSTGRES_HOST", "localhost"),
    port=os.getenv("POSTGRES_PORT", "5432"),
    user=os.getenv("POSTGRES_USER", "ncii_user"),
    password=os.getenv("POSTGRES_PASSWORD", "ncii123password"),
    database=os.getenv("POSTGRES_DB", "ncii_infra")
)

cursor = conn.cursor()

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
        if not result:
            skipped += 1
            continue
        
        try:
            domain_id = result[0]
        except (IndexError, TypeError) as e:
            print(f"  ⚠️  Error extracting domain_id for {domain}: {e}, result type: {type(result)}, result: {result}")
            skipped += 1
            continue
        
        # Get existing dns_records
        cursor.execute('''
            SELECT dns_records
            FROM domain_enrichment
            WHERE domain_id = %s
        ''', (domain_id,))
        
        result = cursor.fetchone()
        if result and result[0] is not None:
            existing_dns_records = result[0]
            if isinstance(existing_dns_records, str):
                existing_dns_records = json.loads(existing_dns_records)
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
        
        # Add viewdns_ip_history
        existing_dns_records['viewdns_ip_history'] = {
            'historical_ips': formatted_ips,
            'source': 'ViewDNS.info',
            'total_ips': len(formatted_ips)
        }
        
        # Update or insert
        cursor.execute('''
            SELECT id FROM domain_enrichment WHERE domain_id = %s
        ''', (domain_id,))
        
        exists = cursor.fetchone()
        
        if exists:
            # Update
            cursor.execute('''
                UPDATE domain_enrichment
                SET dns_records = %s
                WHERE domain_id = %s
            ''', (Json(existing_dns_records), domain_id))
        else:
            # Insert
            cursor.execute('''
                INSERT INTO domain_enrichment (domain_id, dns_records)
                VALUES (%s, %s)
            ''', (domain_id, Json(existing_dns_records)))
        
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
print(f"✅ Import complete!")
print(f"   Updated: {updated}")
print(f"   Skipped: {skipped}")
print("="*60)

