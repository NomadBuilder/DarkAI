#!/usr/bin/env python3
"""
Enrich only the new domains from domains.py that aren't already enriched.

This script:
1. Reads all domains from shadowstack/src/data/domains.py
2. Checks which ones exist in the database
3. Checks which ones are already enriched
4. Only enriches domains that are new or not yet enriched
"""

import os
import sys
import warnings
from pathlib import Path
from dotenv import load_dotenv

# Suppress SSL certificate verification warnings
# (Many malicious/sketchy sites have invalid certificates - this is expected)
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
warnings.filterwarnings('ignore', message='Unverified HTTPS request')

# Add shadowstack to path
shadowstack_path = Path(__file__).parent / 'shadowstack'
sys.path.insert(0, str(shadowstack_path))

load_dotenv()

from src.data.domains import SHADOWSTACK_DOMAINS
from src.database.postgres_client import PostgresClient
from src.enrichment.enrichment_pipeline import enrich_domain

def is_domain_enriched(domain_data):
    """Check if a domain has enrichment data."""
    # A domain is considered enriched if it has at least one of these fields
    return bool(
        domain_data.get('ip_address') or 
        domain_data.get('host_name') or 
        domain_data.get('cdn') or
        domain_data.get('registrar') or
        domain_data.get('enriched_at')
    )

def enrich_new_domains():
    """Enrich only new domains that aren't already enriched."""
    
    print("🔍 ShadowStack: Starting enrichment of new domains...")
    print("")
    
    # Connect to database
    postgres = PostgresClient()
    if not postgres or not postgres.conn:
        print("❌ Could not connect to PostgreSQL")
        print("   Make sure your .env has correct POSTGRES_* variables")
        return False
    
    print("✅ Connected to database")
    print("")
    
    # Get all domains from domains.py
    all_domains_list = SHADOWSTACK_DOMAINS
    print(f"📊 Total domains in domains.py: {len(all_domains_list)}")
    
    # Get all domains from database
    print("🔍 Checking database for existing domains...")
    db_domains = postgres.get_all_enriched_domains()
    
    # Create lookup dictionaries
    db_domains_by_name = {d['domain'].lower(): d for d in db_domains if d.get('domain')}
    db_domain_ids = {d['domain'].lower(): d.get('id') for d in db_domains if d.get('domain')}
    
    print(f"📊 Domains in database: {len(db_domains_by_name)}")
    print("")
    
    # Categorize domains
    domains_to_import = []  # Not in database at all
    domains_to_enrich = []   # In database but not enriched
    already_enriched = []    # Already enriched
    not_in_db = []          # Domains from domains.py not in database
    
    for domain in all_domains_list:
        domain_lower = domain.lower()
        
        if domain_lower not in db_domains_by_name:
            # Domain not in database - need to import first
            domains_to_import.append(domain)
            not_in_db.append(domain)
        else:
            # Domain exists in database - check if enriched
            domain_data = db_domains_by_name[domain_lower]
            if is_domain_enriched(domain_data):
                already_enriched.append(domain)
            else:
                domains_to_enrich.append(domain)
    
    print("📊 Analysis:")
    print(f"   ✅ Already enriched: {len(already_enriched)}")
    print(f"   🔄 Need enrichment: {len(domains_to_enrich)}")
    print(f"   📥 Need import + enrichment: {len(domains_to_import)}")
    print("")
    
    if not domains_to_import and not domains_to_enrich:
        print("✅ All domains are already enriched!")
        postgres.close()
        return True
    
    # Step 1: Import domains that don't exist in database
    if domains_to_import:
        print(f"📥 Step 1: Importing {len(domains_to_import)} new domains...")
        imported = 0
        for domain in domains_to_import:
            try:
                domain_id = postgres.insert_domain(
                    domain,
                    source="ShadowStack Master List",
                    notes="From domains.py"
                )
                # Add to lookup for enrichment step
                db_domain_ids[domain.lower()] = domain_id
                imported += 1
                if imported % 10 == 0:
                    print(f"   ✅ Imported {imported}/{len(domains_to_import)}...")
            except Exception as e:
                print(f"   ❌ Error importing {domain}: {e}")
        print(f"   ✅ Imported {imported} domains")
        print("")
    
    # Step 2: Enrich domains that need enrichment
    all_to_enrich = domains_to_enrich + domains_to_import
    if all_to_enrich:
        print(f"🔍 Step 2: Enriching {len(all_to_enrich)} domains...")
        print("   (This may take a while - ~2-5 minutes per domain)")
        print("")
        
        enriched = 0
        errors = []
        
        for i, domain in enumerate(all_to_enrich, 1):
            try:
                # Get domain ID
                domain_id = db_domain_ids.get(domain.lower())
                if not domain_id:
                    # Query database for ID
                    cursor = postgres.conn.cursor()
                    cursor.execute("SELECT id FROM domains WHERE domain = %s", (domain,))
                    result = cursor.fetchone()
                    cursor.close()
                    if result:
                        domain_id = result[0]
                    else:
                        print(f"   ⚠️  Could not find domain ID for {domain}, skipping")
                        continue
                
                # Enrich the domain
                print(f"   [{i}/{len(all_to_enrich)}] Enriching {domain}...")
                enrichment_data = enrich_domain(domain)
                
                # Store enrichment
                postgres.insert_enrichment(domain_id, enrichment_data)
                enriched += 1
                
                if enriched % 5 == 0:
                    print(f"   ✅ Enriched {enriched}/{len(all_to_enrich)} domains...")
                    print("")
                
            except Exception as e:
                error_msg = f"Error enriching {domain}: {str(e)}"
                errors.append(error_msg)
                print(f"   ❌ {error_msg}")
                continue
        
        print("")
        print(f"✅ Enrichment complete!")
        print(f"   Enriched: {enriched} domains")
        if errors:
            print(f"   Errors: {len(errors)}")
            for error in errors[:5]:  # Show first 5 errors
                print(f"     - {error}")
    
    postgres.close()
    
    print("")
    print("📊 Final Summary:")
    print(f"   ✅ Already enriched: {len(already_enriched)}")
    print(f"   ✅ Newly enriched: {enriched if all_to_enrich else 0}")
    print(f"   📊 Total enriched: {len(already_enriched) + (enriched if all_to_enrich else 0)}/{len(all_domains_list)}")
    
    return True

if __name__ == "__main__":
    print("🚀 ShadowStack: Enriching new domains from domains.py")
    print("=" * 60)
    print("")
    
    try:
        success = enrich_new_domains()
        
        if success:
            print("")
            print("✅ Process completed successfully!")
            print("   Visit http://localhost:5000/shadowstack/dashboard to see the data")
        else:
            print("")
            print("❌ Process failed. Check the errors above.")
            sys.exit(1)
    except KeyboardInterrupt:
        print("")
        print("⚠️  Process interrupted by user")
        sys.exit(1)
    except Exception as e:
        import traceback
        print("")
        print(f"❌ Unexpected error: {e}")
        traceback.print_exc()
        sys.exit(1)

