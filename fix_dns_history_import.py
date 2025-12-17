#!/usr/bin/env python3
"""Fix DNS history import - simple and robust approach."""

import json
import os
import psycopg2
from psycopg2.extras import Json
from dotenv import load_dotenv

load_dotenv()

# Read JSON
print("📄 Reading DNS history JSON file...")
with open('shadowstack_ip_history.json', 'r') as f:
    dns_data = json.load(f)

print(f"✅ Loaded {len(dns_data)} domains")
print()

# Connect
print("🔌 Connecting to database...")
conn = psycopg2.connect(
    host=os.getenv("POSTGRES_HOST", "localhost"),
    port=os.getenv("POSTGRES_PORT", "5432"),
    user=os.getenv("POSTGRES_USER", "ncii_user"),
    password=os.getenv("POSTGRES_PASSWORD", "ncii123password"),
    database=os.getenv("POSTGRES_DB", "ncii_infra")
)
print("✅ Connected")
print()

cursor = conn.cursor()

updated = 0
skipped = 0
errors = 0

for domain, domain_data in dns_data.items():
    historical_ips = domain_data.get('historical_ips', [])
    if not historical_ips:
        skipped += 1
        continue
    
    try:
        # Step 1: Find domain ID
        cursor.execute('''
            SELECT id FROM domains
            WHERE domain = %s
              AND (source ILIKE 'SHADOWSTACK%' OR source ILIKE 'ShadowStack%')
        ''', (domain,))
        
        domain_result = cursor.fetchone()
        if not domain_result or len(domain_result) == 0:
            skipped += 1
            continue
        
        try:
            domain_id = domain_result[0] if len(domain_result) > 0 else None
            if not domain_id:
                skipped += 1
                continue
        except (IndexError, TypeError) as e:
            print(f"  ⚠️  Error extracting domain_id for {domain}: {e}, result: {domain_result}")
            skipped += 1
            continue
        
        # Step 2: Get existing dns_records (handle NULL)
        cursor.execute('''
            SELECT dns_records FROM domain_enrichment WHERE domain_id = %s
        ''', (domain_id,))
        
        enrich_result = cursor.fetchone()
        if enrich_result is not None and len(enrich_result) > 0 and enrich_result[0] is not None:
            dns_records = enrich_result[0]
            if isinstance(dns_records, str):
                dns_records = json.loads(dns_records)
        else:
            dns_records = {}
        
        # Step 3: Format IPs
        formatted_ips = []
        for ip_data in historical_ips:
            formatted_ips.append({
                'ip': str(ip_data.get('ip', '')),
                'country': str(ip_data.get('country', 'Unknown')),
                'asn': str(ip_data.get('asn', 'Unknown')),
                'location': str(ip_data.get('location', ip_data.get('country', 'Unknown'))),
                'last_seen': ip_data.get('last_seen')
            })
        
        # Step 4: Add to dns_records
        dns_records['viewdns_ip_history'] = {
            'historical_ips': formatted_ips,
            'source': 'ViewDNS.info',
            'total_ips': len(formatted_ips)
        }
        
        # Step 5: Update or insert
        cursor.execute('''
            INSERT INTO domain_enrichment (domain_id, dns_records)
            VALUES (%s, %s)
            ON CONFLICT (domain_id)
            DO UPDATE SET dns_records = %s
        ''', (domain_id, Json(dns_records), Json(dns_records)))
        
        updated += 1
        if updated % 20 == 0:
            print(f"  ✅ Updated {updated} domains...")
    
    except Exception as e:
        print(f"  ❌ Error with {domain}: {type(e).__name__}: {e}")
        errors += 1
        conn.rollback()  # Rollback this transaction
        continue

conn.commit()
cursor.close()
conn.close()

print()
print("="*60)
print(f"✅ Import complete!")
print(f"   Updated: {updated}")
print(f"   Skipped: {skipped}")
print(f"   Errors: {errors}")
print("="*60)

