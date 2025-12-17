#!/usr/bin/env python3
"""
Check what's actually in Render's database for ShadowStack domains.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse

load_dotenv()

def parse_database_url(database_url: str) -> dict:
    """Parse DATABASE_URL into connection parameters."""
    parsed = urlparse(database_url)
    return {
        "host": parsed.hostname,
        "port": parsed.port or 5432,
        "user": parsed.username,
        "password": parsed.password,
        "database": parsed.path.lstrip('/')
    }

def check_render_database():
    """Check Render database for ShadowStack domains."""
    print("="*60)
    print("Checking Render Database for ShadowStack Domains")
    print("="*60)
    print()
    
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not set")
        print("   Please set DATABASE_URL in your .env file or environment")
        return False
    
    # Parse connection
    connect_params = parse_database_url(database_url)
    
    # Add SSL for Render PostgreSQL
    if connect_params["host"] and ("render.com" in connect_params["host"]):
        connect_params["sslmode"] = "require"
        print(f"🔒 Using SSL for Render database connection")
    
    try:
        conn = psycopg2.connect(**connect_params)
        print(f"✅ Connected to Render database: {connect_params.get('database', 'unknown')}")
        print(f"   Host: {connect_params.get('host', 'unknown')}")
        print()
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
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
        print("📊 All source values in Render database:")
        for row in all_sources:
            print(f"  {row['source']}: {row['count']}")
        print()
        
        # Check ShadowStack domains with ILIKE (what the API uses)
        cursor.execute("""
            SELECT COUNT(*) 
            FROM domains
            WHERE source IS NOT NULL
              AND source != 'DUMMY_DATA_FOR_TESTING'
              AND source != ''
              AND (source ILIKE 'SHADOWSTACK%' OR source ILIKE 'ShadowStack%')
        """)
        total_ilike = cursor.fetchone()['count']
        print(f"✅ Total domains matching ILIKE query (what API uses): {total_ilike}")
        print()
        
        # Check individual patterns
        cursor.execute("""
            SELECT source, COUNT(*) as count
            FROM domains
            WHERE source IS NOT NULL
              AND source != 'DUMMY_DATA_FOR_TESTING'
              AND source != ''
              AND (source ILIKE 'SHADOWSTACK%' OR source ILIKE 'ShadowStack%')
            GROUP BY source
            ORDER BY count DESC
        """)
        
        shadowstack_sources = cursor.fetchall()
        print("📊 ShadowStack source breakdown:")
        for row in shadowstack_sources:
            print(f"  {row['source']}: {row['count']}")
        print()
        
        # Check what the old LIKE query would return (case-sensitive)
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM domains
            WHERE source LIKE 'SHADOWSTACK%'
        """)
        total_like = cursor.fetchone()['count']
        print(f"⚠️  Total domains matching old LIKE query (case-sensitive): {total_like}")
        print()
        
        if total_ilike != total_like:
            print(f"💡 Difference: {total_ilike - total_like} domains would be missed by old LIKE query")
            print()
        
        # Check if there are domains that should match but don't
        cursor.execute("""
            SELECT source, COUNT(*) as count
            FROM domains
            WHERE source IS NOT NULL
              AND source != 'DUMMY_DATA_FOR_TESTING'
              AND source != ''
              AND source NOT ILIKE 'SHADOWSTACK%'
              AND source NOT ILIKE 'ShadowStack%'
              AND (
                source ILIKE '%shadow%' OR
                source ILIKE '%stack%'
              )
            GROUP BY source
        """)
        
        potential_matches = cursor.fetchall()
        if potential_matches:
            print("⚠️  Potential ShadowStack domains with different source values:")
            for row in potential_matches:
                print(f"  {row['source']}: {row['count']}")
            print()
        
        cursor.close()
        conn.close()
        
        print("="*60)
        if total_ilike == 200:
            print("✅ Render database has 200 ShadowStack domains - API should show 200")
        elif total_ilike == 167:
            print("⚠️  Render database only has 167 ShadowStack domains")
            print("   Need to sync more domains from local database")
        else:
            print(f"⚠️  Render database has {total_ilike} ShadowStack domains (expected 200)")
        print("="*60)
        
        return True
        
    except psycopg2.OperationalError as e:
        print(f"❌ Could not connect to Render database: {e}")
        print(f"   Connection params: host={connect_params.get('host')}, database={connect_params.get('database')}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = check_render_database()
    sys.exit(0 if success else 1)

