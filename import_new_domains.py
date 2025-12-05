#!/usr/bin/env python3
"""
Import new domains from Upwork research into ShadowStack database.

Usage:
    python3 import_new_domains.py new_domains.txt

This script:
1. Reads domains from a text file (one per line)
2. Checks for duplicates against existing database
3. Imports new domains with source "Upwork Research - 2025"
4. Optionally enriches them (set ENRICH=True)
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add shadowstack to path
shadowstack_path = Path(__file__).parent / 'shadowstack'
sys.path.insert(0, str(shadowstack_path))

load_dotenv()

from src.database.postgres_client import PostgresClient

# Set to True if you want to automatically enrich new domains (takes time!)
ENRICH = False

def clean_domain(domain):
    """Clean domain string."""
    domain = domain.strip().lower()
    # Remove http:// or https://
    if domain.startswith('http://') or domain.startswith('https://'):
        from urllib.parse import urlparse
        domain = urlparse(domain).netloc or domain.replace('http://', '').replace('https://', '').split('/')[0]
    # Remove trailing slash
    domain = domain.rstrip('/')
    return domain

def import_new_domains(domains_file):
    """Import new domains from file."""
    
    if not Path(domains_file).exists():
        print(f"❌ File not found: {domains_file}")
        return False
    
    print(f"📄 Reading domains from: {domains_file}")
    
    # Read domains from file
    with open(domains_file, 'r', encoding='utf-8') as f:
        raw_domains = [line.strip() for line in f if line.strip() and not line.strip().startswith('#')]
    
    # Clean domains
    new_domains = [clean_domain(d) for d in raw_domains if clean_domain(d)]
    
    # Remove duplicates
    new_domains = list(set(new_domains))
    
    print(f"📊 Found {len(new_domains)} unique domains in file")
    
    # Connect to database
    postgres = PostgresClient()
    if not postgres or not postgres.conn:
        print("❌ Could not connect to PostgreSQL")
        print("   Make sure your .env has correct POSTGRES_* variables")
        return False
    
    print("✅ Connected to database")
    
    # Get existing domains
    print("🔍 Checking for duplicates...")
    existing = postgres.get_all_enriched_domains()
    existing_domains = {d['domain'].lower() for d in existing if d.get('domain')}
    
    print(f"📊 Found {len(existing_domains)} existing domains in database")
    
    # Filter out duplicates
    domains_to_add = [d for d in new_domains if d.lower() not in existing_domains]
    
    if not domains_to_add:
        print("✅ All domains already exist in database")
        postgres.close()
        return True
    
    print(f"📊 Adding {len(domains_to_add)} new domains...")
    print(f"   Skipping {len(new_domains) - len(domains_to_add)} duplicates")
    
    # Import domains
    imported = 0
    errors = []
    
    for i, domain in enumerate(domains_to_add, 1):
        try:
            domain_id = postgres.insert_domain(
                domain,
                source="Upwork Research - 2025",
                notes="Expanded domain list from research"
            )
            imported += 1
            
            # Optionally enrich
            if ENRICH:
                try:
                    from src.enrichment.enrichment_pipeline import enrich_domain
                    print(f"  🔍 Enriching {domain}...")
                    enrichment_data = enrich_domain(domain)
                    postgres.insert_enrichment(domain_id, enrichment_data)
                except Exception as e:
                    print(f"  ⚠️  Enrichment failed for {domain}: {e}")
            
            if imported % 10 == 0:
                print(f"  ✅ Imported {imported}/{len(domains_to_add)}...")
                
        except Exception as e:
            error_msg = f"Error importing {domain}: {str(e)}"
            errors.append(error_msg)
            print(f"  ❌ {error_msg}")
    
    postgres.conn.commit()
    postgres.close()
    
    print(f"\n✅ Import complete!")
    print(f"   Imported: {imported} domains")
    if errors:
        print(f"   Errors: {len(errors)}")
        for error in errors[:5]:  # Show first 5 errors
            print(f"     - {error}")
    
    if not ENRICH:
        print(f"\n💡 Tip: To enrich these domains, run:")
        print(f"   curl -X POST https://darkai-6otc.onrender.com/shadowstack/api/enrich-all")
        print(f"   Or visit: /shadowstack/dashboard and click 'Enrich All'")
    
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 import_new_domains.py <domains_file.txt>")
        print("\nExample:")
        print("  python3 import_new_domains.py new_domains.txt")
        sys.exit(1)
    
    domains_file = sys.argv[1]
    
    print("🚀 Importing new domains into ShadowStack...")
    print("")
    
    success = import_new_domains(domains_file)
    
    if success:
        print("\n✅ Domains imported successfully!")
        print("   Visit http://localhost:5000/shadowstack/dashboard to see the data")
    else:
        print("\n❌ Import failed. Check the errors above.")
        sys.exit(1)

