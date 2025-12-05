#!/usr/bin/env python3
"""
Remove legitimate domains that were incorrectly discovered.

These are legitimate sites (news, social media, government) that were
mentioned in discussions but are not actual synthetic identity vendor sites.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from src.database.postgres_client import PostgresClient

# List of legitimate domains that should be removed
LEGITIMATE_DOMAINS = [
    'politico.com', 'youtube.com', 'youtu.be', 'pbs.twimg.com', 
    'preview.redd.it', 'consumer.ftc.gov', 'frbservices.org',
    'deseret.com', 'gundamplanet.com', 'yeezy.com', 'proof.com',
    'nypost.com', 'fliphtml5.com', 'sitefy.co', 'kslawllp.com',
    'raptorx.ai', 'marketwatch.com', 'vanityfair.com', 'abc.ca.gov',
    'pa.gov', 'usatoday.com'
]

def remove_legitimate_domains(dry_run: bool = False):
    """Remove legitimate domains from the database."""
    client = PostgresClient()
    if not client or not client.conn:
        print("❌ Database not connected")
        return 0
    
    cursor = client.conn.cursor()
    
    try:
        # Check which ones exist
        print("🔍 Checking for legitimate domains to remove...")
        found_domains = []
        for domain in LEGITIMATE_DOMAINS:
            cursor.execute("SELECT id, domain, source FROM personaforge_domains WHERE domain = %s", (domain,))
            result = cursor.fetchone()
            if result:
                found_domains.append(result)
        
        if not found_domains:
            print("   ✅ No legitimate domains found - database is clean!")
            return 0
        
        print(f"\n📊 Found {len(found_domains)} legitimate domains to remove:")
        for domain_id, domain_name, source in found_domains:
            print(f"   - {domain_name} (ID: {domain_id}, Source: {source})")
        
        if dry_run:
            print("\n🔍 DRY RUN - No changes will be made")
            return len(found_domains)
        
        # Remove them
        removed_count = 0
        for domain_id, domain_name, source in found_domains:
            try:
                # Delete enrichment data first (foreign key)
                cursor.execute("DELETE FROM personaforge_domain_enrichment WHERE domain_id = %s", (domain_id,))
                # Delete vendor links
                cursor.execute("DELETE FROM personaforge_vendor_intel_domains WHERE domain_id = %s", (domain_id,))
                # Delete domain
                cursor.execute("DELETE FROM personaforge_domains WHERE id = %s", (domain_id,))
                removed_count += 1
                print(f"   ✅ Removed: {domain_name}")
            except Exception as e:
                print(f"   ❌ Error removing {domain_name}: {e}")
        
        client.conn.commit()
        print(f"\n✅ Successfully removed {removed_count} legitimate domains")
        return removed_count
        
    except Exception as e:
        print(f"❌ Error: {e}")
        client.conn.rollback()
        return 0
    finally:
        cursor.close()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Remove legitimate domains from PersonaForge database.")
    parser.add_argument('--dry-run', action='store_true', help="Perform a dry run without making changes.")
    args = parser.parse_args()
    
    remove_legitimate_domains(dry_run=args.dry_run)

