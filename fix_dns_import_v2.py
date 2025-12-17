#!/usr/bin/env python3
"""Fix DNS history import - use simpler query."""

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

# First, get all ShadowStack domain IDs
print("📋 Getting all ShadowStack domain IDs...")
cursor.execute('''
    SELECT id, domain FROM domains
    WHERE source ILIKE 'SHADOWSTACK%%' OR source ILIKE 'ShadowStack%%'
''')
all_domains = {row[1]: row[0] for row in cursor.fetchall()}
print(f"✅ Found {len(all_domains)} ShadowStack domains")
print()

updated = 0
skipped = 0
errors = 0

for domain, domain_data in dns_data.items():
    historical_ips = domain_data.get('historical_ips', [])
    if not historical_ips:
        skipped += 1
        continue
    
    if domain not in all_domains:
        skipped += 1
        continue
    
    try:
        domain_id = all_domains[domain]
        
        # Get existing dns_records
        cursor.execute('SELECT dns_records FROM domain_enrichment WHERE domain_id = %s', (domain_id,))
        enrich_result = cursor.fetchone()
        
        if enrich_result and enrich_result[0] is not None:
            dns_records = enrich_result[0]
            if isinstance(dns_records, str):
                dns_records = json.loads(dns_records)
        else:
            dns_records = {}
        
        # Format IPs
        formatted_ips = []
        for ip_data in historical_ips:
            formatted_ips.append({
                'ip': str(ip_data.get('ip', '')),
                'country': str(ip_data.get('country', 'Unknown')),
                'asn': str(ip_data.get('asn', 'Unknown')),
                'location': str(ip_data.get('location', ip_data.get('country', 'Unknown'))),
                'last_seen': ip_data.get('last_seen')
            })
        
        # Add to dns_records
        dns_records['viewdns_ip_history'] = {
            'historical_ips': formatted_ips,
            'source': 'ViewDNS.info',
            'total_ips': len(formatted_ips)
        }
        
        # Update or insert
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
        conn.rollback()
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

