#!/usr/bin/env python3
"""
Seed and enrich ShadowStack domains locally.
This script:
1. Seeds all 110 ShadowStack domains into local database
2. Enriches all domains with infrastructure data
3. Exports the enriched data to a JSON file for import to Render

Run this locally, then the data will be automatically imported on Render startup.
"""

import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv

# Add shadowstack to path
shadowstack_dir = Path(__file__).parent / 'shadowstack'
sys.path.insert(0, str(shadowstack_dir))

load_dotenv()

from src.database.postgres_client import PostgresClient
from src.enrichment.enrichment_pipeline import enrich_domain
from src.data.domains import SHADOWSTACK_DOMAINS
from psycopg2.extras import RealDictCursor

def seed_and_enrich():
    """Seed domains and enrich them locally."""
    print("🔍 ShadowStack: Starting local seed and enrich...")
    
    # Connect to local database
    client = PostgresClient()
    if not client or not client.conn:
        print("❌ Could not connect to local PostgreSQL database")
        print("   Make sure your local .env has correct POSTGRES_* variables")
        return False
    
    print(f"✅ Connected to local database")
    
    # Get existing domains
    existing = client.get_all_enriched_domains()
    existing_domains = {d.get('domain') for d in existing if d.get('domain')}
    print(f"📊 Found {len(existing_domains)} existing domains in database")
    
    # Filter out domains that already exist
    domains_to_seed = [d for d in SHADOWSTACK_DOMAINS if d not in existing_domains]
    
    if not domains_to_seed:
        print("✅ All domains already exist in database")
        domains_to_seed = SHADOWSTACK_DOMAINS  # Re-enrich existing ones
    
    print(f"📊 Seeding and enriching {len(domains_to_seed)} domains...")
    
    seeded = 0
    enriched = 0
    errors = []
    
    for i, domain in enumerate(domains_to_seed, 1):
        domain = domain.strip()
        if not domain:
            continue
        
        try:
            # Check if domain exists
            cursor = client.conn.cursor()
            cursor.execute("SELECT id FROM domains WHERE domain = %s", (domain,))
            existing = cursor.fetchone()
            
            if existing:
                domain_id = existing[0]
                print(f"  [{i}/{len(domains_to_seed)}] Domain exists: {domain}")
            else:
                # Insert domain
                domain_id = client.insert_domain(
                    domain=domain,
                    source="SHADOWSTACK_LOCAL_SEED",
                    notes="Seeded and enriched locally"
                )
                seeded += 1
                print(f"  [{i}/{len(domains_to_seed)}] Seeded: {domain}")
            
            # Check if enrichment exists
            cursor.execute("SELECT domain_id FROM domain_enrichment WHERE domain_id = %s", (domain_id,))
            has_enrichment = cursor.fetchone()
            cursor.close()
            
            if not has_enrichment:
                # Enrich domain
                print(f"  🔍 Enriching {domain}...")
                enrichment_data = enrich_domain(domain)
                client.insert_enrichment(domain_id, enrichment_data)
                enriched += 1
                print(f"  ✅ Enriched: {domain}")
            else:
                print(f"  ⏭️  Already enriched: {domain}")
            
            if (i % 10 == 0):
                print(f"  📊 Progress: {i}/{len(domains_to_seed)} domains processed")
                
        except Exception as e:
            error_msg = f"Error processing {domain}: {e}"
            errors.append(error_msg)
            print(f"  ❌ {error_msg}")
    
    client.conn.commit()
    client.close()
    
    print(f"\n✅ Local seed and enrich complete!")
    print(f"   Seeded: {seeded} new domains")
    print(f"   Enriched: {enriched} domains")
    print(f"   Errors: {len(errors)}")
    
    if errors:
        print(f"\n⚠️  Errors encountered:")
        for error in errors[:10]:
            print(f"   - {error}")
    
    return True


def export_enriched_data():
    """Export enriched data to JSON file for import to Render."""
    print("\n📤 Exporting enriched data to JSON...")
    
    client = PostgresClient()
    if not client or not client.conn:
        print("❌ Could not connect to database")
        return False
    
    # Get all domains directly from database (bypass filter)
    cursor = client.conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("""
        SELECT 
            d.id,
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
        WHERE d.domain IN %s
        ORDER BY d.domain
    """, (tuple(SHADOWSTACK_DOMAINS),))
    
    domains = cursor.fetchall()
    cursor.close()
    
    # Convert to list of dicts
    shadowstack_domains = [dict(row) for row in domains]
    
    print(f"📊 Found {len(shadowstack_domains)} ShadowStack domains with enrichment data")
    
    # Export to JSON
    export_file = Path(__file__).parent / 'shadowstack_enriched_data.json'
    
    export_data = {
        'domains': [],
        'enrichment': []
    }
    
    for domain_data in shadowstack_domains:
        domain_id = domain_data.get('id')
        domain = domain_data.get('domain')
        
        if not domain:
            continue
        
        # Domain record
        domain_record = {
            'domain': domain,
            'source': domain_data.get('source', 'SHADOWSTACK_IMPORT'),
            'notes': domain_data.get('notes', '')
        }
        export_data['domains'].append(domain_record)
        
        # Enrichment data (if exists)
        if domain_data.get('ip_address') or domain_data.get('host_name') or domain_data.get('cdn'):
            enrichment_record = {
                'domain': domain,  # Use domain name as key for matching
                'ip_address': domain_data.get('ip_address'),
                'ip_addresses': domain_data.get('ip_addresses'),
                'ipv6_addresses': domain_data.get('ipv6_addresses'),
                'host_name': domain_data.get('host_name'),
                'asn': domain_data.get('asn'),
                'isp': domain_data.get('isp'),
                'cdn': domain_data.get('cdn'),
                'cms': domain_data.get('cms'),
                'payment_processor': domain_data.get('payment_processor'),
                'registrar': domain_data.get('registrar'),
                'creation_date': str(domain_data.get('creation_date')) if domain_data.get('creation_date') else None,
                'expiration_date': domain_data.get('expiration_date'),
                'updated_date': domain_data.get('updated_date'),
                'name_servers': domain_data.get('name_servers'),
                'mx_records': domain_data.get('mx_records'),
                'whois_status': domain_data.get('whois_status'),
                'web_server': domain_data.get('web_server'),
                'frameworks': domain_data.get('frameworks'),
                'analytics': domain_data.get('analytics'),
                'languages': domain_data.get('languages'),
                'tech_stack': domain_data.get('tech_stack'),
                'http_headers': domain_data.get('http_headers'),
                'ssl_info': domain_data.get('ssl_info'),
                'whois_data': domain_data.get('whois_data'),
                'dns_records': domain_data.get('dns_records'),
            }
            export_data['enrichment'].append(enrichment_record)
    
    # Write to file
    with open(export_file, 'w') as f:
        json.dump(export_data, f, indent=2, default=str)
    
    print(f"✅ Exported {len(export_data['domains'])} domains and {len(export_data['enrichment'])} enrichment records")
    print(f"   File: {export_file}")
    
    client.close()
    return True


if __name__ == '__main__':
    print("=" * 60)
    print("ShadowStack Local Seed & Enrich")
    print("=" * 60)
    
    # Step 1: Seed and enrich
    if not seed_and_enrich():
        print("\n❌ Seed and enrich failed")
        sys.exit(1)
    
    # Step 2: Export enriched data
    if not export_enriched_data():
        print("\n❌ Export failed")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ All done! Enriched data exported to shadowstack_enriched_data.json")
    print("   This file will be automatically imported on Render startup")
    print("=" * 60)

