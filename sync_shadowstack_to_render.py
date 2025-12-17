#!/usr/bin/env python3
"""
Sync ShadowStack domains from local to Render database.
This ensures all 200 domains are in Render's database.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor, Json
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

def get_local_db_connection():
    """Get connection to local ShadowStack database."""
    connect_params = {
        "host": os.getenv("POSTGRES_HOST", "localhost"),
        "port": os.getenv("POSTGRES_PORT", "5432"),
        "user": os.getenv("POSTGRES_USER", "ncii_user"),
        "password": os.getenv("POSTGRES_PASSWORD", "ncii123password"),
        "database": os.getenv("POSTGRES_DB", "ncii_infra")
    }
    
    try:
        return psycopg2.connect(**connect_params)
    except psycopg2.OperationalError as e:
        print(f"❌ Could not connect to local database: {e}")
        return None

def get_render_db_connection():
    """Get connection to Render database."""
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not set")
        return None
    
    connect_params = parse_database_url(database_url)
    
    if connect_params["host"] and ("render.com" in connect_params["host"]):
        connect_params["sslmode"] = "require"
    
    try:
        conn = psycopg2.connect(**connect_params)
        print(f"✅ Connected to Render database: {connect_params.get('database', 'unknown')}")
        return conn
    except psycopg2.OperationalError as e:
        print(f"❌ Could not connect to Render database: {e}")
        return None

def sync_domains():
    """Sync ShadowStack domains from local to Render."""
    print("="*60)
    print("Syncing ShadowStack Domains to Render")
    print("="*60)
    print()
    
    local_conn = get_local_db_connection()
    if not local_conn:
        return False
    
    render_conn = get_render_db_connection()
    if not render_conn:
        local_conn.close()
        return False
    
    try:
        local_cursor = local_conn.cursor(cursor_factory=RealDictCursor)
        render_cursor = render_conn.cursor()
        
        # Get all ShadowStack domains from local
        local_cursor.execute("""
            SELECT id, domain, source, notes, created_at, updated_at 
            FROM domains 
            WHERE (source ILIKE 'SHADOWSTACK%' OR source ILIKE 'ShadowStack%')
            ORDER BY domain
        """)
        local_domains = local_cursor.fetchall()
        print(f"📊 Found {len(local_domains)} ShadowStack domains in local database")
        
        # Get existing domains from Render
        render_cursor.execute("""
            SELECT domain, source
            FROM domains
            WHERE (source ILIKE 'SHADOWSTACK%' OR source ILIKE 'ShadowStack%')
        """)
        render_domains = {row[0]: row[1] for row in render_cursor.fetchall()}
        print(f"📊 Found {len(render_domains)} ShadowStack domains in Render database")
        print()
        
        # Sync domains
        added = 0
        updated = 0
        skipped = 0
        
        for domain_row in local_domains:
            domain = domain_row['domain']
            source = domain_row.get('source')
            
            if domain in render_domains:
                # Domain exists - update if source changed
                if render_domains[domain] != source:
                    render_cursor.execute("""
                        UPDATE domains
                        SET source = %s, updated_at = CURRENT_TIMESTAMP
                        WHERE domain = %s
                    """, (source, domain))
                    updated += 1
                    print(f"  ✅ Updated: {domain} (source: {source})")
                else:
                    skipped += 1
            else:
                # Domain doesn't exist - insert it
                render_cursor.execute("""
                    INSERT INTO domains (domain, source, notes, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    domain,
                    source,
                    domain_row.get('notes', ''),
                    domain_row.get('created_at'),
                    domain_row.get('updated_at')
                ))
                added += 1
                print(f"  ✅ Added: {domain} (source: {source})")
        
        render_conn.commit()
        
        print()
        print("="*60)
        print(f"✅ Sync complete!")
        print(f"   Added: {added}")
        print(f"   Updated: {updated}")
        print(f"   Skipped: {skipped}")
        print(f"   Total in Render: {len(render_domains) + added}")
        print("="*60)
        
        return True
        
    except Exception as e:
        import traceback
        print(f"\n❌ Error: {e}")
        traceback.print_exc()
        render_conn.rollback()
        return False
    finally:
        local_cursor.close()
        render_cursor.close()
        local_conn.close()
        render_conn.close()

if __name__ == '__main__':
    success = sync_domains()
    sys.exit(0 if success else 1)
