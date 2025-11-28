#!/usr/bin/env python3
"""
Import ShadowStack data into local database.

This script imports the 110 domains from the original ShadowStack CSV
into the local PostgreSQL database for testing.
"""

import os
import sys
import csv
from pathlib import Path
from dotenv import load_dotenv

# Add shadowstack to path
shadowstack_path = Path(__file__).parent / 'shadowstack'
sys.path.insert(0, str(shadowstack_path))

load_dotenv()

# Import ShadowStack's PostgresClient
from src.database.postgres_client import PostgresClient
from src.enrichment.enrichment_pipeline import enrich_domain

# Path to the original CSV file
CSV_PATH = Path(__file__).parent.parent / 'AIPornTracker' / 'ncii-infra-mapping' / 'data' / 'input' / 'domains.csv'

def import_shadowstack_data():
    """Import domains from CSV into local ShadowStack database."""
    
    if not CSV_PATH.exists():
        print(f"❌ CSV file not found at: {CSV_PATH}")
        print(f"   Please ensure the file exists or update CSV_PATH in the script")
        return False
    
    print(f"📂 Reading domains from: {CSV_PATH}")
    
    # Connect to database
    postgres = PostgresClient()
    if not postgres or not postgres.conn:
        print("❌ Could not connect to PostgreSQL")
        print("   Make sure Docker containers are running: docker-compose up -d")
        return False
    
    print("✅ Connected to PostgreSQL")
    
    # Read CSV
    imported = 0
    errors = []
    
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            domain = row.get('domain', '').strip()
            source = row.get('source', 'CSV Import')
            notes = row.get('notes', '')
            
            if not domain:
                continue
            
            try:
                # Check if domain already exists
                existing = postgres.get_all_enriched_domains()
                existing_domains = [d['domain'] for d in existing if d.get('domain')]
                
                if domain in existing_domains:
                    print(f"  ⏭️  Skipping {domain} (already exists)")
                    continue
                
                # Insert domain
                domain_id = postgres.insert_domain(domain, source, notes)
                
                # Optionally enrich (this takes time, so we'll skip for now)
                # Uncomment if you want to enrich all domains:
                # print(f"  🔍 Enriching {domain}...")
                # enrichment_data = enrich_domain(domain)
                # postgres.insert_enrichment(domain_id, enrichment_data)
                
                imported += 1
                if imported % 10 == 0:
                    print(f"  ✅ Imported {imported} domains...")
                    
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
    
    return True

if __name__ == "__main__":
    print("🚀 Importing ShadowStack data into local database...")
    print("")
    
    success = import_shadowstack_data()
    
    if success:
        print("\n✅ ShadowStack data imported successfully!")
        print("   Visit http://localhost:5000/shadowstack/dashboard to see the data")
    else:
        print("\n❌ Import failed. Check the errors above.")
        sys.exit(1)

