#!/usr/bin/env python3
"""
Import vendor intelligence from CSV into PersonaForge database.

Usage:
    python personaforge/import_vendor_intelligence.py /path/to/PersonaForge.csv
    
    # With domain enrichment (optional)
    python personaforge/import_vendor_intelligence.py /path/to/PersonaForge.csv --enrich
"""

import os
import sys
import csv
import re
from pathlib import Path
from typing import Dict, List, Set
from urllib.parse import urlparse
from dotenv import load_dotenv

# Add personaforge to path
script_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(script_dir))

# Load environment variables
consolidated_root = script_dir.parent.parent
load_dotenv(dotenv_path=consolidated_root / '.env')
load_dotenv(dotenv_path=script_dir / '.env', override=False)

from src.database.postgres_client import PostgresClient
from src.utils.logger import logger

try:
    from src.enrichment.enrichment_pipeline import enrich_domain
    ENRICHMENT_AVAILABLE = True
except ImportError:
    ENRICHMENT_AVAILABLE = False
    enrich_domain = None


def clean_domain(domain_or_url: str) -> str:
    """Extract clean domain from URL or domain string."""
    if not domain_or_url or not domain_or_url.strip():
        return None
    
    domain = domain_or_url.strip()
    
    # Remove protocol
    domain = re.sub(r'^https?://', '', domain)
    domain = re.sub(r'^www\.', '', domain)
    
    # Remove path, query, fragment
    domain = domain.split('/')[0]
    domain = domain.split('?')[0]
    domain = domain.split('#')[0]
    
    # Remove trailing slash
    domain = domain.rstrip('/')
    
    # Basic validation
    if '.' not in domain or len(domain) < 3:
        return None
    
    return domain.lower()


def extract_domains_from_field(field_value: str) -> List[str]:
    """Extract domains from a CSV field (can contain multiple domains)."""
    if not field_value or not field_value.strip():
        return []
    
    domains = []
    
    # Split by common separators
    parts = re.split(r'[,;\n]', field_value)
    
    for part in parts:
        part = part.strip()
        if not part:
            continue
        
        # Try to extract domain from URL or text
        domain = clean_domain(part)
        if domain:
            domains.append(domain)
    
    return domains


def parse_services(services_str: str) -> List[str]:
    """Parse services field into list."""
    if not services_str or not services_str.strip():
        return []
    
    # Split by comma, newline, or semicolon
    services = re.split(r'[,;\n]', services_str)
    
    # Clean and filter
    cleaned = []
    for service in services:
        service = service.strip()
        if service and len(service) > 1:
            cleaned.append(service)
    
    return cleaned


def parse_operator_identifiers(operators_str: str) -> List[str]:
    """Parse operator identifiers field."""
    if not operators_str or not operators_str.strip():
        return []
    
    # Split by comma, newline, @, or space
    operators = re.split(r'[,;\n@\s]+', operators_str)
    
    # Clean and filter
    cleaned = []
    for op in operators:
        op = op.strip()
        if op and len(op) > 1:
            # Remove @ if present
            op = op.lstrip('@')
            cleaned.append(op)
    
    return cleaned


def parse_social_media(social_str: str) -> Dict:
    """Parse other social media field."""
    if not social_str or not social_str.strip():
        return {}
    
    # Simple parsing - can be enhanced
    social_links = []
    parts = re.split(r'[,;\n]', social_str)
    
    for part in parts:
        part = part.strip()
        if part and ('http' in part or '@' in part or 't.me' in part):
            social_links.append(part)
    
    return {'links': social_links} if social_links else {}


def import_vendor_intelligence(csv_path: str, enrich_domains: bool = False) -> Dict:
    """
    Import vendor intelligence from CSV.
    
    Returns:
        Dict with import statistics
    """
    print("="*60)
    print("📥 PersonaForge Vendor Intelligence Import")
    print("="*60)
    
    # Initialize database client
    client = PostgresClient()
    if not client or not client.conn:
        print("❌ Could not connect to database")
        return {'error': 'Database connection failed'}
    
    print(f"✅ Connected to database")
    print(f"📄 Reading CSV: {csv_path}\n")
    
    # Read CSV
    vendors_imported = 0
    vendors_updated = 0
    domains_imported = 0
    domains_linked = 0
    domains_enriched = 0
    errors = []
    
    all_domains = set()  # Track all unique domains
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        
        print(f"📊 Found {len(rows)} vendors in CSV\n")
        
        for i, row in enumerate(rows, 1):
            try:
                # Parse vendor data
                vendor_name = row.get('Title', '').strip()
                if not vendor_name:
                    print(f"⚠️  Row {i}: Skipping (no Title)")
                    continue
                
                # Extract domains
                primary_domain = None
                if row.get('Website'):
                    domains = extract_domains_from_field(row['Website'])
                    if domains:
                        primary_domain = domains[0]
                        all_domains.update(domains)
                
                mentioned_domains = []
                if row.get('Mentioned_Domains'):
                    mentioned = extract_domains_from_field(row['Mentioned_Domains'])
                    mentioned_domains = mentioned
                    all_domains.update(mentioned)
                
                # Parse services
                services = parse_services(row.get('Services', ''))
                
                # Parse operators
                operators = parse_operator_identifiers(row.get('Operator_identifiers', ''))
                
                # Parse social media
                social_media = parse_social_media(row.get('Other social media', ''))
                
                # Build vendor data
                vendor_data = {
                    'vendor_name': vendor_name,
                    'title': vendor_name,
                    'platform_type': row.get('Platform Type', '').strip() or None,
                    'category': row.get('Category', '').strip() or None,
                    'region': row.get('Region', '').strip() or None,
                    'summary': row.get('Summary', '').strip() or None,
                    'telegram_description': row.get('telegram Description', '').strip() or None,
                    'services': services,
                    'telegram_channel': row.get('Telegram channel link', '').strip() or None,
                    'other_social_media': social_media if social_media else None,
                    'operator_identifiers': operators if operators else None,
                    'source_found_at': row.get('Source_found_at', '').strip() or None,
                    'primary_domain': primary_domain,
                    'mentioned_domains': mentioned_domains,
                    'domain_headline': row.get('Domain Headline', '').strip() or None,
                    'active': True
                }
                
                # Check if vendor already exists
                existing = client.get_all_vendors_intel({'search': vendor_name, 'limit': 1})
                is_update = len(existing) > 0 and existing[0].get('vendor_name') == vendor_name
                
                # Insert/update vendor
                vendor_id = client.insert_vendor_intel(vendor_data)
                
                if is_update:
                    vendors_updated += 1
                    if i % 10 == 0:
                        print(f"  ✅ Updated vendor {i}/{len(rows)}: {vendor_name[:50]}")
                else:
                    vendors_imported += 1
                    if i % 10 == 0:
                        print(f"  ✅ Imported vendor {i}/{len(rows)}: {vendor_name[:50]}")
                
                # Import and link domains
                all_vendor_domains = []
                if primary_domain:
                    all_vendor_domains.append((primary_domain, 'primary'))
                for domain in mentioned_domains:
                    if domain != primary_domain:
                        all_vendor_domains.append((domain, 'mentioned'))
                
                for domain, rel_type in all_vendor_domains:
                    # Import domain if not exists
                    domain_id = client.insert_domain(
                        domain=domain,
                        source='PERSONAFORGE_CSV_IMPORT',
                        notes=f'Imported from CSV for vendor: {vendor_name}',
                        vendor_type=vendor_data.get('category')
                    )
                    
                    if domain_id:
                        domains_imported += 1
                        
                        # Link vendor to domain
                        client.link_vendor_to_domain(vendor_id, domain_id, rel_type)
                        domains_linked += 1
                        
                        # Optionally enrich domain
                        if enrich_domains and ENRICHMENT_AVAILABLE:
                            try:
                                print(f"    🔍 Enriching {domain}...")
                                enrichment_data = enrich_domain(domain)
                                if enrichment_data:
                                    client.insert_enrichment(domain_id, enrichment_data)
                                    domains_enriched += 1
                            except Exception as e:
                                errors.append(f"Enrichment error for {domain}: {e}")
                
            except Exception as e:
                error_msg = f"Row {i} ({vendor_name if 'vendor_name' in locals() else 'unknown'}): {e}"
                errors.append(error_msg)
                print(f"  ❌ Error: {error_msg}")
                continue
        
        print("\n" + "="*60)
        print("✅ Import Complete!")
        print("="*60)
        print(f"\n📊 Statistics:")
        print(f"  ✅ Vendors imported: {vendors_imported}")
        print(f"  🔄 Vendors updated: {vendors_updated}")
        print(f"  🌐 Domains imported: {domains_imported}")
        print(f"  🔗 Domain links created: {domains_linked}")
        if enrich_domains:
            print(f"  🔍 Domains enriched: {domains_enriched}")
        if errors:
            print(f"  ⚠️  Errors: {len(errors)}")
        
        return {
            'vendors_imported': vendors_imported,
            'vendors_updated': vendors_updated,
            'domains_imported': domains_imported,
            'domains_linked': domains_linked,
            'domains_enriched': domains_enriched,
            'total_domains': len(all_domains),
            'errors': errors
        }
        
    except FileNotFoundError:
        print(f"❌ CSV file not found: {csv_path}")
        return {'error': 'File not found'}
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        return {'error': str(e)}


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python personaforge/import_vendor_intelligence.py <csv_path> [--enrich]")
        print("\nExample:")
        print("  python personaforge/import_vendor_intelligence.py PersonaForge.csv")
        print("  python personaforge/import_vendor_intelligence.py PersonaForge.csv --enrich")
        sys.exit(1)
    
    csv_path = sys.argv[1]
    enrich_domains = '--enrich' in sys.argv
    
    if not os.path.exists(csv_path):
        print(f"❌ CSV file not found: {csv_path}")
        sys.exit(1)
    
    result = import_vendor_intelligence(csv_path, enrich_domains=enrich_domains)
    
    if result.get('error'):
        sys.exit(1)
    
    print("\n✅ Import completed successfully!")
    print(f"   Visit /personaforge/vendors-intel to see the data")


if __name__ == "__main__":
    main()

