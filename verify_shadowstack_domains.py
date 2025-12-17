#!/usr/bin/env python3
"""
Verify and update ShadowStack domain source values in the database.

This script:
1. Checks how many domains match the ILIKE query
2. Lists all source values for ShadowStack domains
3. Optionally updates source values to ensure they match the expected pattern
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add shadowstack to path
sys.path.insert(0, str(Path(__file__).parent / 'shadowstack'))
sys.path.insert(0, str(Path(__file__).parent))

load_dotenv()

from shadowstack.src.database.postgres_client import PostgresClient

def verify_domains():
    """Verify ShadowStack domains in the database."""
    print("="*60)
    print("ShadowStack Domain Verification")
    print("="*60)
    print()
    
    postgres = PostgresClient()
    if not postgres or not postgres.conn:
        print("❌ Failed to connect to database")
        return False
    
    cursor = postgres.conn.cursor()
    
    # Check all source values
    cursor.execute("""
        SELECT source, COUNT(*) as count
        FROM domains
        WHERE source IS NOT NULL
          AND source != 'DUMMY_DATA_FOR_TESTING'
        GROUP BY source
        ORDER BY count DESC
    """)
    
    all_sources = cursor.fetchall()
    print("📊 All source values in database:")
    for source, count in all_sources:
        print(f"  {source}: {count}")
    print()
    
    # Check ShadowStack domains with ILIKE
    cursor.execute("""
        SELECT COUNT(*) 
        FROM domains
        WHERE (source ILIKE 'SHADOWSTACK%' OR source ILIKE 'ShadowStack%')
    """)
    total_ilike = cursor.fetchone()[0]
    print(f"✅ Total domains matching ILIKE query: {total_ilike}")
    print()
    
    # Check individual patterns
    cursor.execute("""
        SELECT source, COUNT(*) as count
        FROM domains
        WHERE (source ILIKE 'SHADOWSTACK%' OR source ILIKE 'ShadowStack%')
        GROUP BY source
        ORDER BY count DESC
    """)
    
    shadowstack_sources = cursor.fetchall()
    print("📊 ShadowStack source breakdown:")
    for source, count in shadowstack_sources:
        print(f"  {source}: {count}")
    print()
    
    # Check if we need to update any sources
    cursor.execute("""
        SELECT source, COUNT(*) as count
        FROM domains
        WHERE source IS NOT NULL
          AND source != 'DUMMY_DATA_FOR_TESTING'
          AND source NOT ILIKE 'SHADOWSTACK%'
          AND source NOT ILIKE 'ShadowStack%'
          AND (
            source ILIKE '%shadow%' OR
            source ILIKE '%stack%' OR
            source = 'IMPORT' OR
            source = 'CSV Import'
          )
        GROUP BY source
    """)
    
    potential_updates = cursor.fetchall()
    if potential_updates:
        print("⚠️  Potential domains that might need source updates:")
        for source, count in potential_updates:
            print(f"  {source}: {count}")
        print()
        print("These domains might be ShadowStack domains with different source values.")
        print("You may want to update them to match the expected pattern.")
    else:
        print("✅ All ShadowStack domains have correct source values")
    print()
    
    cursor.close()
    postgres.close()
    
    return True

if __name__ == '__main__':
    success = verify_domains()
    sys.exit(0 if success else 1)

