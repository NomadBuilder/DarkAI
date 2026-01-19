#!/usr/bin/env python3
"""
Check PersonaForge database connection and data status.

This script helps diagnose why the vendors page shows no data.
"""

import sys
from pathlib import Path

# Add personaforge to path
script_dir = Path(__file__).parent.absolute()
personaforge_path = script_dir / 'personaforge'
sys.path.insert(0, str(personaforge_path))

from src.database.postgres_client import PostgresClient
import psycopg2.extras

def check_personaforge_data():
    """Check database connection and data status."""
    
    print("🔍 Checking PersonaForge database status...\n")
    
    # Check database connection
    try:
        client = PostgresClient()
        if not client or not client.conn:
            print("❌ Database Connection: FAILED")
            print("   PostgreSQL is not connected.")
            print("\n   Solutions:")
            print("   - Local: Run 'docker-compose up -d' to start PostgreSQL")
            print("   - Production: Check POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB env vars")
            return False
        
        print("✅ Database Connection: OK")
        
        # Check for domains
        cursor = client.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Count total domains
        cursor.execute("SELECT COUNT(*) as count FROM personaforge_domains")
        total_domains = cursor.fetchone()['count']
        
        # Count dummy data
        cursor.execute("SELECT COUNT(*) as count FROM personaforge_domains WHERE source = 'DUMMY_DATA_FOR_TESTING'")
        dummy_domains = cursor.fetchone()['count']
        
        # Count real domains
        real_domains = total_domains - dummy_domains
        
        # Count enriched domains
        cursor.execute("""
            SELECT COUNT(DISTINCT d.id) as count 
            FROM personaforge_domains d
            JOIN personaforge_domain_enrichment de ON d.id = de.domain_id
            WHERE d.source != 'DUMMY_DATA_FOR_TESTING'
        """)
        enriched_count = cursor.fetchone()['count']
        
        # Count vendor intelligence
        cursor.execute("SELECT COUNT(*) as count FROM personaforge_vendors_intel")
        vendor_intel_count = cursor.fetchone()['count']
        
        # Count clusters (domains with shared infrastructure)
        cursor.execute("""
            SELECT COUNT(DISTINCT cluster_id) as count
            FROM (
                SELECT 
                    CASE 
                        WHEN cdn IS NOT NULL AND cdn != '' THEN 'cdn:' || cdn
                        WHEN host_name IS NOT NULL AND host_name != '' THEN 'host:' || host_name
                        WHEN registrar IS NOT NULL AND registrar != '' THEN 'registrar:' || registrar
                        WHEN payment_processor IS NOT NULL AND payment_processor != '' THEN 'payment:' || payment_processor
                    END as cluster_id
                FROM personaforge_domain_enrichment
                WHERE enriched_at IS NOT NULL
            ) clusters
            WHERE cluster_id IS NOT NULL
        """)
        cluster_count = cursor.fetchone()['count']
        
        cursor.close()
        
        print(f"\n📊 Data Status:")
        print(f"   Total Domains: {total_domains}")
        print(f"   - Real Domains: {real_domains}")
        print(f"   - Dummy Data: {dummy_domains}")
        print(f"   Enriched Domains: {enriched_count}")
        print(f"   Vendor Intelligence Records: {vendor_intel_count}")
        print(f"   Infrastructure Clusters: {cluster_count}")
        
        if total_domains == 0:
            print("\n❌ No data found in database!")
            print("\n   Solutions:")
            print("   1. Import vendor intelligence CSV:")
            print("      python personaforge/import_vendor_intelligence.py /path/to/PersonaForge.csv")
            print("\n   2. Run manual discovery (if enabled):")
            print("      POST /personaforge/api/discover")
            print("\n   3. Seed dummy data for testing:")
            print("      python -c 'from personaforge.src.database.seed_dummy_data import seed_dummy_data; seed_dummy_data(50)'")
        elif real_domains == 0 and dummy_domains > 0:
            print("\n⚠️  Only dummy data found (for testing)")
            print("   To see real data, import vendor intelligence CSV:")
            print("   python personaforge/import_vendor_intelligence.py /path/to/PersonaForge.csv")
        elif enriched_count == 0:
            print("\n⚠️  Domains exist but are not enriched")
            print("   Enrich domains to see clusters:")
            print("   POST /personaforge/api/vendors-intel/enrich-domains")
        elif cluster_count == 0:
            print("\n⚠️  Domains exist but no clusters detected")
            print("   This may be normal if domains don't share infrastructure")
        else:
            print("\n✅ Data looks good! If vendors page still shows 0, check:")
            print("   - Browser console for API errors")
            print("   - Network tab for failed requests")
            print("   - Server logs for errors")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Error checking database: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    check_personaforge_data()

