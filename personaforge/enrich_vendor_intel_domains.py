#!/usr/bin/env python3
"""
Enrich domains extracted from vendor intelligence CSV.

This script enriches all domains that were imported from the CSV but haven't been enriched yet.

Usage:
    python personaforge/enrich_vendor_intel_domains.py
"""

import os
import sys
import signal
from pathlib import Path
from dotenv import load_dotenv

# Disable Neo4j connection attempts to prevent hanging
os.environ['SKIP_NEO4J'] = '1'

# Add personaforge to path
script_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(script_dir))

# Load environment variables
consolidated_root = script_dir.parent.parent
load_dotenv(dotenv_path=consolidated_root / '.env')
load_dotenv(dotenv_path=script_dir / '.env', override=False)

print("🔧 Initializing...")

# Import with error handling and immediate output
try:
    from src.database.postgres_client import PostgresClient
    print("✅ Database client imported")
except Exception as e:
    print(f"❌ Failed to import database client: {e}")
    sys.exit(1)

try:
    # Suppress Neo4j connection attempts during import
    import warnings
    warnings.filterwarnings('ignore')
    
    from src.enrichment.enrichment_pipeline import enrich_domain
    ENRICHMENT_AVAILABLE = True
    print("✅ Enrichment pipeline imported")
except ImportError as e:
    ENRICHMENT_AVAILABLE = False
    enrich_domain = None
    print(f"❌ Enrichment pipeline not available: {e}")
    sys.exit(1)
except Exception as e:
    ENRICHMENT_AVAILABLE = False
    enrich_domain = None
    print(f"❌ Error importing enrichment pipeline: {e}")
    sys.exit(1)


def enrich_vendor_intel_domains():
    """Enrich all unenriched domains from vendor intelligence."""
    print("="*60)
    print("🔍 PersonaForge Vendor Intelligence Domain Enrichment")
    print("="*60)
    sys.stdout.flush()
    
    if not ENRICHMENT_AVAILABLE:
        print("❌ Enrichment pipeline not available")
        return
    
    print("📡 Connecting to database...")
    sys.stdout.flush()
    
    try:
        client = PostgresClient()
        if not client or not client.conn:
            print("❌ Could not connect to database")
            print("   Start PostgreSQL with: docker-compose up -d")
            return
        print("✅ Connected to database")
        sys.stdout.flush()
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        print("   Start PostgreSQL with: docker-compose up -d")
        return
    
    # Get unenriched domains
    print("🔍 Checking for unenriched domains...")
    sys.stdout.flush()
    
    try:
        unenriched = client.get_unenriched_vendor_intel_domains()
    except Exception as e:
        print(f"❌ Error fetching domains: {e}")
        return
    
    if not unenriched:
        print("✅ All vendor intelligence domains are already enriched!")
        return
    
    print(f"📊 Found {len(unenriched)} unenriched domains")
    print("🔍 Starting enrichment...\n")
    sys.stdout.flush()
    
    enriched_count = 0
    error_count = 0
    errors = []
    
    # Handle Ctrl+C gracefully
    def signal_handler(sig, frame):
        print("\n\n⚠️  Interrupted by user")
        print(f"📊 Progress: {enriched_count}/{len(unenriched)} enriched")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    for i, domain_data in enumerate(unenriched, 1):
        domain_id = domain_data['id']
        domain = domain_data['domain']
        vendor_intel_id = domain_data.get('vendor_intel_id')
        
        try:
            print(f"[{i}/{len(unenriched)}] Enriching {domain}...", end=" ", flush=True)
            
            enrichment_data = enrich_domain(domain)
            
            if enrichment_data:
                client.insert_enrichment(domain_id, enrichment_data)
                enriched_count += 1
                print("✅")
            else:
                print("⚠️  No data")
                error_count += 1
                errors.append(f"{domain}: No enrichment data returned")
                
        except KeyboardInterrupt:
            raise
        except Exception as e:
            print(f"❌ Error: {e}")
            error_count += 1
            errors.append(f"{domain}: {e}")
            continue
        
        sys.stdout.flush()
    
    print("\n" + "="*60)
    print("✅ Enrichment Complete!")
    print("="*60)
    print(f"\n📊 Statistics:")
    print(f"  ✅ Enriched: {enriched_count}")
    print(f"  ❌ Errors: {error_count}")
    print(f"  📊 Total: {len(unenriched)}")
    
    if errors:
        print(f"\n⚠️  Errors ({len(errors)}):")
        for error in errors[:10]:
            print(f"  - {error}")
        if len(errors) > 10:
            print(f"  ... and {len(errors) - 10} more")
    
    print("\n✅ Visit /personaforge/vendors-intel to see enriched domains")


if __name__ == "__main__":
    enrich_vendor_intel_domains()

