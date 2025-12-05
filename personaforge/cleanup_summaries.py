#!/usr/bin/env python3
"""
Script to clean up and format all vendor intelligence summaries in the database.
This makes summaries more professional and readable.
"""

import os
import sys
from pathlib import Path

# Add personaforge to path
script_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(script_dir))

# Load environment variables
consolidated_root = script_dir.parent.parent
from dotenv import load_dotenv
load_dotenv(dotenv_path=consolidated_root / '.env')
load_dotenv(dotenv_path=script_dir / '.env', override=False)

from src.database.postgres_client import PostgresClient
from src.utils.summary_formatter import format_summary
from src.utils.logger import setup_logger

logger = setup_logger("personaforge.cleanup_summaries", "INFO")


def cleanup_all_summaries(dry_run: bool = False):
    """Clean up and format all vendor intelligence summaries."""
    client = PostgresClient()
    if not client or not client.conn:
        logger.error("❌ Could not connect to database")
        return
    
    try:
        cursor = client.conn.cursor()
        
        # Get all vendors with summaries
        cursor.execute("""
            SELECT id, vendor_name, summary, telegram_description
            FROM personaforge_vendors_intel
            WHERE summary IS NOT NULL OR telegram_description IS NOT NULL
        """)
        
        vendors = cursor.fetchall()
        logger.info(f"📊 Found {len(vendors)} vendors with summaries")
        
        updated_count = 0
        skipped_count = 0
        
        for vendor_id, vendor_name, summary, telegram_description in vendors:
            original_summary = summary or telegram_description or ''
            formatted_summary = format_summary(original_summary)
            
            # Only update if changed
            if formatted_summary != original_summary:
                if dry_run:
                    logger.info(f"\n📝 Would update: {vendor_name[:50]}")
                    logger.info(f"   Before: {original_summary[:100]}...")
                    logger.info(f"   After:  {formatted_summary[:100]}...")
                    updated_count += 1
                else:
                    # Update summary field (prefer summary over telegram_description)
                    if summary:
                        cursor.execute("""
                            UPDATE personaforge_vendors_intel
                            SET summary = %s, updated_at = CURRENT_TIMESTAMP
                            WHERE id = %s
                        """, (formatted_summary, vendor_id))
                    elif telegram_description:
                        # If only telegram_description exists, update it
                        cursor.execute("""
                            UPDATE personaforge_vendors_intel
                            SET telegram_description = %s, updated_at = CURRENT_TIMESTAMP
                            WHERE id = %s
                        """, (formatted_summary, vendor_id))
                    
                    updated_count += 1
                    if updated_count % 10 == 0:
                        logger.info(f"  ✅ Updated {updated_count} summaries...")
            else:
                skipped_count += 1
        
        if not dry_run:
            client.conn.commit()
            logger.info(f"\n✅ Successfully updated {updated_count} summaries")
            logger.info(f"⏭️  Skipped {skipped_count} (already formatted)")
        else:
            logger.info(f"\n📊 Would update {updated_count} summaries")
            logger.info(f"⏭️  Would skip {skipped_count} (already formatted)")
            logger.info("\n💡 Run without --dry-run to apply changes")
        
        cursor.close()
        
    except Exception as e:
        logger.error(f"❌ Error cleaning up summaries: {e}", exc_info=True)
        if client.conn:
            client.conn.rollback()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Clean up vendor intelligence summaries.")
    parser.add_argument('--dry-run', action='store_true', help="Show what would be changed without making changes.")
    args = parser.parse_args()
    
    cleanup_all_summaries(dry_run=args.dry_run)
    logger.info("🔌 Done!\n")

