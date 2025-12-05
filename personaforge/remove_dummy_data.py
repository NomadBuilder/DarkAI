#!/usr/bin/env python3
"""
Remove all dummy data from PersonaForge database.

⚠️ This script ONLY removes PersonaForge dummy data.
It will NOT touch data from ShadowStack, BlackWire, or other tools.

Usage:
    # Local database (uses .env POSTGRES_* variables)
    python personaforge/remove_dummy_data.py

    # Production database (uses DATABASE_URL)
    DATABASE_URL="postgresql://..." python personaforge/remove_dummy_data.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import psycopg2
from urllib.parse import urlparse

# Add personaforge to path
script_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(script_dir))

# Load environment variables
consolidated_root = script_dir.parent.parent
load_dotenv(dotenv_path=consolidated_root / '.env')
load_dotenv(dotenv_path=script_dir / '.env', override=False)

# Import PersonaForge PostgresClient for connection logic
try:
    from src.database.postgres_client import PostgresClient, _parse_database_url
except ImportError:
    print("❌ Could not import PostgresClient")
    print("   Make sure you're running from the project root")
    sys.exit(1)


def get_database_connection():
    """Get database connection (local or production based on DATABASE_URL)."""
    database_url = os.getenv("DATABASE_URL")
    
    if database_url:
        # Production database (Render)
        print("🔗 Connecting to PRODUCTION database (from DATABASE_URL)...")
        try:
            parsed = urlparse(database_url)
            conn = psycopg2.connect(
                host=parsed.hostname,
                port=parsed.port or 5432,
                user=parsed.username,
                password=parsed.password,
                database=parsed.path.lstrip('/'),
                sslmode='require'
            )
            print(f"✅ Connected to production database: {parsed.path.lstrip('/')}")
            return conn
        except Exception as e:
            print(f"❌ Could not connect to production database: {e}")
            return None
    else:
        # Local database (from .env POSTGRES_* variables)
        print("🔗 Connecting to LOCAL database (from .env POSTGRES_* variables)...")
        try:
            client = PostgresClient()
            if client and client.conn:
                print("✅ Connected to local database")
                return client.conn
            else:
                print("❌ Could not connect to local database")
                print("   Make sure your .env has correct POSTGRES_* variables")
                return None
        except Exception as e:
            print(f"❌ Could not connect to local database: {e}")
            return None


def remove_dummy_data(conn, dry_run=False):
    """
    Remove all PersonaForge dummy data.
    
    Only touches tables prefixed with 'personaforge_'.
    Will NOT touch ShadowStack, BlackWire, or other tools' data.
    """
    cursor = conn.cursor()
    
    try:
        print("\n" + "="*60)
        print("🔍 Scanning for PersonaForge dummy data...")
        print("="*60)
        
        # 1. Count dummy domains
        cursor.execute("""
            SELECT COUNT(*) 
            FROM personaforge_domains 
            WHERE source = 'DUMMY_DATA_FOR_TESTING'
        """)
        dummy_domain_count = cursor.fetchone()[0]
        
        if dummy_domain_count == 0:
            print("✅ No dummy data found in personaforge_domains")
            return 0
        
        print(f"\n📊 Found {dummy_domain_count} dummy domains")
        
        # 2. Count related enrichment data
        cursor.execute("""
            SELECT COUNT(*) 
            FROM personaforge_domain_enrichment 
            WHERE domain_id IN (
                SELECT id FROM personaforge_domains 
                WHERE source = 'DUMMY_DATA_FOR_TESTING'
            )
        """)
        enrichment_count = cursor.fetchone()[0]
        print(f"📊 Found {enrichment_count} related enrichment records")
        
        # 3. Count related vendor domain links
        cursor.execute("""
            SELECT COUNT(*) 
            FROM personaforge_vendor_domains 
            WHERE domain_id IN (
                SELECT id FROM personaforge_domains 
                WHERE source = 'DUMMY_DATA_FOR_TESTING'
            )
        """)
        vendor_domain_links = cursor.fetchone()[0]
        print(f"📊 Found {vendor_domain_links} vendor-domain links to remove")
        
        # 4. Check for vendors that might only reference dummy domains
        cursor.execute("""
            SELECT v.id, v.vendor_name, COUNT(vd.domain_id) as domain_count
            FROM personaforge_vendors v
            LEFT JOIN personaforge_vendor_domains vd ON v.id = vd.vendor_id
            WHERE vd.domain_id IN (
                SELECT id FROM personaforge_domains 
                WHERE source = 'DUMMY_DATA_FOR_TESTING'
            )
            GROUP BY v.id, v.vendor_name
            HAVING COUNT(vd.domain_id) = (
                SELECT COUNT(*) FROM personaforge_vendor_domains 
                WHERE vendor_id = v.id
            )
        """)
        orphaned_vendors = cursor.fetchall()
        orphaned_vendor_count = len(orphaned_vendors)
        
        if orphaned_vendor_count > 0:
            print(f"📊 Found {orphaned_vendor_count} vendors that only reference dummy domains")
            for vendor_id, vendor_name, domain_count in orphaned_vendors[:5]:
                print(f"   - {vendor_name} (ID: {vendor_id}, {domain_count} dummy domains)")
            if orphaned_vendor_count > 5:
                print(f"   ... and {orphaned_vendor_count - 5} more")
        
        total_records = dummy_domain_count + enrichment_count + vendor_domain_links + orphaned_vendor_count
        
        if dry_run:
            print("\n" + "="*60)
            print("🔍 DRY RUN - No changes will be made")
            print("="*60)
            print(f"\nWould remove:")
            print(f"  - {dummy_domain_count} dummy domains")
            print(f"  - {enrichment_count} enrichment records")
            print(f"  - {vendor_domain_links} vendor-domain links")
            print(f"  - {orphaned_vendor_count} orphaned vendors")
            print(f"\nTotal: {total_records} records")
            return total_records
        
        # Confirm deletion
        print("\n" + "="*60)
        print("⚠️  ABOUT TO DELETE DUMMY DATA")
        print("="*60)
        print(f"\nWill remove:")
        print(f"  - {dummy_domain_count} dummy domains")
        print(f"  - {enrichment_count} enrichment records")
        print(f"  - {vendor_domain_links} vendor-domain links")
        if orphaned_vendor_count > 0:
            print(f"  - {orphaned_vendor_count} orphaned vendors")
        print(f"\nTotal: {total_records} records")
        print("\n⚠️  This will ONLY affect PersonaForge tables (personaforge_*)")
        print("⚠️  ShadowStack, BlackWire, and other tools' data will NOT be touched")
        
        response = input("\n❓ Continue? (yes/no): ").strip().lower()
        if response not in ['yes', 'y']:
            print("❌ Cancelled. No data was removed.")
            return 0
        
        print("\n🗑️  Removing dummy data...")
        
        # Delete in correct order (respecting foreign keys)
        
        # 1. Delete vendor-domain links for dummy domains
        if vendor_domain_links > 0:
            cursor.execute("""
                DELETE FROM personaforge_vendor_domains 
                WHERE domain_id IN (
                    SELECT id FROM personaforge_domains 
                    WHERE source = 'DUMMY_DATA_FOR_TESTING'
                )
            """)
            print(f"✅ Removed {vendor_domain_links} vendor-domain links")
        
        # 2. Delete orphaned vendors (vendors that only reference dummy domains)
        if orphaned_vendor_count > 0:
            for vendor_id, vendor_name, _ in orphaned_vendors:
                cursor.execute("DELETE FROM personaforge_vendors WHERE id = %s", (vendor_id,))
            print(f"✅ Removed {orphaned_vendor_count} orphaned vendors")
        
        # 3. Delete enrichment data (foreign key constraint)
        if enrichment_count > 0:
            cursor.execute("""
                DELETE FROM personaforge_domain_enrichment 
                WHERE domain_id IN (
                    SELECT id FROM personaforge_domains 
                    WHERE source = 'DUMMY_DATA_FOR_TESTING'
                )
            """)
            print(f"✅ Removed {enrichment_count} enrichment records")
        
        # 4. Delete dummy domains
        cursor.execute("""
            DELETE FROM personaforge_domains 
            WHERE source = 'DUMMY_DATA_FOR_TESTING'
        """)
        print(f"✅ Removed {dummy_domain_count} dummy domains")
        
        # Commit transaction
        conn.commit()
        
        print("\n" + "="*60)
        print("✅ SUCCESS: All PersonaForge dummy data removed!")
        print("="*60)
        print(f"\nRemoved {total_records} total records")
        print("✅ PersonaForge tables cleaned")
        print("✅ Other tools' data untouched")
        
        return total_records
        
    except Exception as e:
        print(f"\n❌ Error removing dummy data: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()


def main():
    """Main entry point."""
    print("="*60)
    print("🧹 PersonaForge Dummy Data Removal")
    print("="*60)
    print("\n⚠️  This script will remove ALL dummy data from PersonaForge")
    print("⚠️  Only affects tables prefixed with 'personaforge_'")
    print("⚠️  Will NOT touch ShadowStack, BlackWire, or other tools\n")
    
    # Check for dry run flag
    dry_run = '--dry-run' in sys.argv or '-n' in sys.argv
    
    # Get database connection
    conn = get_database_connection()
    if not conn:
        print("\n❌ Could not connect to database")
        print("\nFor local database:")
        print("  - Make sure .env has POSTGRES_* variables set")
        print("\nFor production database:")
        print("  - Set DATABASE_URL environment variable")
        print("  - Example: DATABASE_URL='postgresql://...' python personaforge/remove_dummy_data.py")
        sys.exit(1)
    
    try:
        # Run removal
        removed_count = remove_dummy_data(conn, dry_run=dry_run)
        
        if dry_run:
            print("\n💡 Run without --dry-run to actually remove the data")
        
        return 0 if removed_count >= 0 else 1
        
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user")
        return 1
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        conn.close()
        print("\n🔌 Database connection closed")


if __name__ == "__main__":
    sys.exit(main())

