#!/usr/bin/env python3
"""
Data processing pipeline for The Ledger
Processes Ontario Public Accounts CSV files into structured JSON datasets
"""

import json
import csv
import os
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Any, Optional
import re

# Configuration
DATA_DIR = Path(__file__).parent.parent / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"

# Ensure directories exist
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
RAW_DIR.mkdir(parents=True, exist_ok=True)


def normalize_vendor_name(name: str) -> str:
    """
    Normalize vendor names by:
    - Removing common suffixes (Inc, Ltd, LP, etc.)
    - Standardizing whitespace
    - Converting to title case
    """
    if not name:
        return ""
    
    # Remove common legal suffixes
    suffixes = [
        r'\s+Inc\.?$', r'\s+Ltd\.?$', r'\s+LLC\.?$', r'\s+LP\.?$',
        r'\s+Corp\.?$', r'\s+Corporation$', r'\s+Incorporated$',
        r'\s+Limited$', r'\s+LP$', r'\s+LLP$'
    ]
    
    normalized = name.strip()
    for suffix in suffixes:
        normalized = re.sub(suffix, '', normalized, flags=re.IGNORECASE)
    
    # Normalize whitespace
    normalized = ' '.join(normalized.split())
    
    return normalized.title()


def load_vendor_master() -> Dict[str, Dict[str, Any]]:
    """Load or create vendor master table"""
    master_path = PROCESSED_DIR / "vendors_master.json"
    
    if master_path.exists():
        with open(master_path, 'r') as f:
            data = json.load(f)
            return {v['vendor_id']: v for v in data}
    
    return {}


def save_vendor_master(vendors: Dict[str, Dict[str, Any]]):
    """Save vendor master table"""
    master_path = PROCESSED_DIR / "vendors_master.json"
    vendor_list = list(vendors.values())
    
    with open(master_path, 'w') as f:
        json.dump(vendor_list, f, indent=2)


def parse_amount(amount_str: str) -> float:
    """Parse amount string, handling commas, quotes, and currency symbols"""
    if not amount_str:
        return 0.0
    
    # Remove currency symbols, quotes, and whitespace
    cleaned = str(amount_str).strip().replace('$', '').replace(',', '').replace('"', '').replace("'", '')
    
    # Handle negative amounts in parentheses
    if cleaned.startswith('(') and cleaned.endswith(')'):
        cleaned = '-' + cleaned[1:-1]
    
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def extract_fiscal_year(filename: str) -> Optional[int]:
    """Extract fiscal year from filename"""
    # Patterns: 2014-15, 2014-2015, 2014_15, 2014, etc.
    patterns = [
        r'(\d{4})-(\d{2})',  # 2014-15, 2014-15
        r'(\d{4})_(\d{2})',  # 2014_15
        r'(\d{4})-(\d{4})',  # 2014-2015
        r'20(\d{2})',        # 2014
    ]
    
    for pattern in patterns:
        match = re.search(pattern, filename)
        if match:
            year1 = int(match.group(1))
            if year1 >= 2000 and year1 <= 2100:
                return year1
    
    return None


def ingest_raw_data() -> List[Dict[str, Any]]:
    """
    Load all raw CSV files from /data/raw/
    Handles Ontario Public Accounts CSV formats (French and English)
    """
    all_payments = []
    
    # Filter to only Detailed Schedule of Payments files
    # Exclude ministry statements, revenue, capital assets, etc.
    exclude_keywords = [
        'ministry_statements', 'revenue', 'capital', 'operating', 'spending_',
        'expense', 'statement_of_operations', 'economic_accounts', 'sample',
        'assets', 'revenue_by'
    ]
    
    # Include files that are payment schedules
    # Pattern: files with "payment"/"paiement"/"schedule" OR year-based files (2014-15, 2018-19, etc.)
    csv_files = []
    for f in RAW_DIR.glob("*.csv"):
        name_lower = f.name.lower()
        
        # Exclude if it matches exclude keywords
        if any(keyword in name_lower for keyword in exclude_keywords):
            continue
        
        # Include if it has payment/paiement/schedule keywords
        if any(kw in name_lower for kw in ['payment', 'paiement', 'schedule']):
            csv_files.append(f)
        # OR if it's a year-based file (pattern: 20XX-XX or 20XX_XX)
        elif re.search(r'20\d{2}[-_]\d{2}', f.name) or re.search(r'20\d{2}-20\d{2}', f.name):
            csv_files.append(f)
    
    csv_files.sort()
    
    if not csv_files:
        print(f"⚠️  No payment schedule CSV files found in {RAW_DIR}")
        print(f"   Looking for files with 'payment', 'paiement', or 'schedule' in name")
        return []
    
    print(f"Found {len(csv_files)} payment schedule files")
    
    for csv_file in csv_files:
        print(f"📄 Processing {csv_file.name}...")
        
        # Extract fiscal year from filename
        fiscal_year = extract_fiscal_year(csv_file.name)
        if not fiscal_year:
            print(f"   ⚠️  Could not extract year from filename, skipping")
            continue
        
        print(f"   Detected fiscal year: {fiscal_year}")
        
        try:
            # Try different encodings
            encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
            file_opened = False
            
            for encoding in encodings:
                try:
                    with open(csv_file, 'r', encoding=encoding) as f:
                        # Read first line to detect delimiter
                        first_line = f.readline()
                        f.seek(0)
                        
                        # Detect delimiter
                        delimiter = ',' if ',' in first_line else ';' if ';' in first_line else '\t'
                        
                        reader = csv.DictReader(f, delimiter=delimiter)
                        rows_processed = 0
                        
                        # Get fieldnames and strip BOM if present
                        fieldnames = reader.fieldnames
                        if fieldnames and fieldnames[0].startswith('\ufeff'):
                            fieldnames[0] = fieldnames[0].lstrip('\ufeff')
                            reader.fieldnames = fieldnames
                        
                        for row in reader:
                            # Try multiple column name variations (French and English)
                            vendor_name = (
                                row.get('Bénéficiaire') or 
                                row.get('Beneficiaire') or 
                                row.get('Recipient') or
                                row.get('Vendor') or
                                row.get('vendor_name') or
                                row.get('vendor') or
                                row.get('recipient') or
                                ''
                            ).strip()
                            
                            # Try multiple amount column variations
                            amount_str = (
                                row.get('Montant $') or
                                row.get('Montant') or
                                row.get('Amount $') or
                                row.get('Amount') or
                                row.get('amount') or
                                row.get('amount_paid') or
                                row.get('total') or
                                '0'
                            )
                            
                            amount = parse_amount(amount_str)
                            
                            # Try multiple ministry column variations
                            ministry = (
                                row.get('Ministère') or
                                row.get('Ministère') or
                                row.get('Nom du ministere') or
                                row.get('Ministry') or
                                row.get('ministry') or
                                row.get('department') or
                                ''
                            ).strip()
                            
                            # Skip if no vendor name or invalid amount
                            if not vendor_name or vendor_name.lower() in ['aucune valeur', 'none', 'n/a', '']:
                                continue
                            
                            if amount <= 0:
                                continue
                            
                            # Skip aggregate rows and irrelevant categories
                            vendor_lower = vendor_name.lower()
                            if any(skip in vendor_lower for skip in [
                                'accounts under', 'comptes inf', 
                                'payments made for services',  # Aggregate category
                                'interest on',  # Interest payments (not service delivery)
                                'aucune valeur', 'no value'
                            ]):
                                continue
                            
                            # Skip if category suggests it's not service delivery
                            category = row.get('Categorie', row.get('Category', row.get('category', ''))).lower()
                            if any(skip in category for skip in [
                                'interest', 'interet',  # Interest payments
                                'salary', 'traitements',  # Internal salaries
                                'travel', 'deplacement',  # Travel expenses (not service delivery)
                            ]):
                                continue
                            
                            all_payments.append({
                                'fiscal_year': fiscal_year,
                                'vendor_name_raw': vendor_name,
                                'amount_paid': amount,
                                'ministry': ministry,
                            })
                            rows_processed += 1
                        
                        print(f"   ✅ Processed {rows_processed} payment records")
                        file_opened = True
                        break
                        
                except UnicodeDecodeError:
                    continue
            
            if not file_opened:
                print(f"   ❌ Could not read file with any encoding")
        
        except Exception as e:
            print(f"   ❌ Error processing {csv_file.name}: {e}")
            import traceback
            traceback.print_exc()
            continue
    
    print(f"\n✅ Total: Loaded {len(all_payments)} payment records")
    return all_payments


def normalize_vendors(payments: List[Dict[str, Any]]) -> Dict[str, str]:
    """
    Create vendor normalization mapping
    Returns: {vendor_name_normalized: vendor_id}
    """
    vendor_master = load_vendor_master()
    name_to_id: Dict[str, str] = {}
    id_counter = len(vendor_master)
    
    # Group by normalized name
    normalized_groups: Dict[str, List[str]] = defaultdict(list)
    
    for payment in payments:
        raw_name = payment['vendor_name_raw']
        normalized = normalize_vendor_name(raw_name)
        
        if normalized:
            normalized_groups[normalized].append(raw_name)
    
    # Create vendor IDs
    for normalized, aliases in normalized_groups.items():
        # Check if we already have this vendor
        existing_id = None
        for vid, vendor in vendor_master.items():
            if vendor.get('vendor_name_normalized') == normalized:
                existing_id = vid
                break
        
        if not existing_id:
            vendor_id = f"V{id_counter:05d}"
            id_counter += 1
            
            vendor_master[vendor_id] = {
                'vendor_id': vendor_id,
                'vendor_name_normalized': normalized,
                'vendor_name_aliases': list(set(aliases)),
                'vendor_type': 'unknown',
                'service_category': None,
                'confidence': 'low',
                'first_year_paid': None,
                'last_year_paid': None,
                'total_paid_all_years': 0,
                'growth_rate': None,
            }
        else:
            # Update aliases
            existing_aliases = set(vendor_master[existing_id].get('vendor_name_aliases', []))
            existing_aliases.update(aliases)
            vendor_master[existing_id]['vendor_name_aliases'] = list(existing_aliases)
        
        name_to_id[normalized] = existing_id or vendor_id
    
    save_vendor_master(vendor_master)
    return name_to_id


def aggregate_payments(payments: List[Dict[str, Any]], name_to_id: Dict[str, str]) -> Dict[str, Any]:
    """
    Aggregate payments by vendor, year, and ministry
    Returns aggregated data structure
    """
    # Group by vendor_id and year
    vendor_year_totals: Dict[str, Dict[int, float]] = defaultdict(lambda: defaultdict(float))
    vendor_year_ministries: Dict[str, Dict[int, Dict[str, float]]] = defaultdict(
        lambda: defaultdict(lambda: defaultdict(float))
    )
    
    for payment in payments:
        raw_name = payment['vendor_name_raw']
        normalized = normalize_vendor_name(raw_name)
        
        if normalized not in name_to_id:
            continue
        
        vendor_id = name_to_id[normalized]
        year = payment['fiscal_year']
        amount = payment['amount_paid']
        ministry = payment['ministry']
        
        vendor_year_totals[vendor_id][year] += amount
        vendor_year_ministries[vendor_id][year][ministry] += amount
    
    # Build payments_by_year structure (only 2018+)
    payments_by_year: Dict[int, List[Dict[str, Any]]] = defaultdict(list)
    
    for vendor_id, year_totals in vendor_year_totals.items():
        for year, total in year_totals.items():
            # Only include 2018 and later (when Doug Ford took office)
            if year >= 2018:
                payments_by_year[year].append({
                    'fiscal_year': year,
                    'vendor_id': vendor_id,
                    'vendor_name_normalized': '',  # Will be filled from master
                    'ministry': '',  # Could aggregate ministries
                    'total_paid': total,
                })
    
    # Build system composition
    vendor_master = load_vendor_master()
    
    # Also load from public directory to get latest classifications
    PUBLIC_VENDORS_FILE = Path(__file__).parent.parent / "public" / "data" / "processed" / "vendors_master.json"
    public_vendors_by_id = {}
    if PUBLIC_VENDORS_FILE.exists():
        try:
            with open(PUBLIC_VENDORS_FILE, 'r') as f:
                public_vendors = json.load(f)
                public_vendors_by_id = {v.get('vendor_id'): v for v in public_vendors if v.get('vendor_id')}
                print(f"   📋 Loaded {len(public_vendors_by_id)} classified vendors from public directory")
        except Exception as e:
            print(f"   ⚠️  Could not load public vendors: {e}")
    
    system_composition: List[Dict[str, Any]] = []
    
    years = sorted(set(p['fiscal_year'] for p in payments))
    
    # Filter to only 2018 and later (when Doug Ford took office)
    years = [y for y in years if y >= 2018]
    
    for year in years:
        public_total = 0
        nonprofit_total = 0
        forprofit_total = 0
        unknown_total = 0
        
        for vendor_id, year_total in vendor_year_totals.items():
            if year in year_total:
                vendor = vendor_master.get(vendor_id, {})
                
                # Use classification from public vendors if available (more up-to-date)
                if vendor_id in public_vendors_by_id:
                    # Public version uses 'type', data version uses 'vendor_type'
                    vendor_type = public_vendors_by_id[vendor_id].get('type', 'unknown')
                else:
                    vendor_type = vendor.get('vendor_type', 'unknown')
                
                amount = year_total[year]
                
                if vendor_type == 'public':
                    public_total += amount
                elif vendor_type == 'non_profit':
                    nonprofit_total += amount
                elif vendor_type == 'for_profit':
                    forprofit_total += amount
                else:
                    unknown_total += amount
        
        system_composition.append({
            'year': year,
            'public_total': public_total,
            'non_profit_total': nonprofit_total,
            'for_profit_total': forprofit_total,
            'unknown_total': unknown_total,
        })
    
    # Update vendor master with aggregated stats
    for vendor_id, year_totals in vendor_year_totals.items():
        if vendor_id in vendor_master:
            years_paid = sorted(year_totals.keys())
            vendor_master[vendor_id]['first_year_paid'] = years_paid[0] if years_paid else None
            vendor_master[vendor_id]['last_year_paid'] = years_paid[-1] if years_paid else None
            vendor_master[vendor_id]['total_paid_all_years'] = sum(year_totals.values())
            
            # Calculate growth rate (simple year-over-year)
            if len(years_paid) >= 2:
                first_amount = year_totals[years_paid[0]]
                last_amount = year_totals[years_paid[-1]]
                if first_amount > 0:
                    growth = (last_amount - first_amount) / first_amount
                    vendor_master[vendor_id]['growth_rate'] = growth
    
    save_vendor_master(vendor_master)
    
    return {
        'payments_by_year': dict(payments_by_year),
        'system_composition': system_composition,
        'vendor_year_totals': {k: dict(v) for k, v in vendor_year_totals.items()},
    }


def build_lens_data(vendor_year_totals: Dict[str, Dict[int, float]]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Build lens-specific datasets
    Filters vendors by service_category
    """
    vendor_master = load_vendor_master()
    lenses: Dict[str, List[Dict[str, Any]]] = {
        'staffing': [],
        'consulting': [],
        'healthcare': [],
    }
    
    for vendor_id, year_totals in vendor_year_totals.items():
        vendor = vendor_master.get(vendor_id, {})
        category = vendor.get('service_category')
        
        if category == 'staffing':
            lenses['staffing'].append({
                'vendor_id': vendor_id,
                'name': vendor.get('vendor_name_normalized', ''),
                'type': vendor.get('vendor_type', 'unknown'),
                'category': category,
                'yearly_payments': {str(k): v for k, v in year_totals.items()},
            })
        elif category == 'consulting':
            lenses['consulting'].append({
                'vendor_id': vendor_id,
                'name': vendor.get('vendor_name_normalized', ''),
                'type': vendor.get('vendor_type', 'unknown'),
                'category': category,
                'yearly_payments': {str(k): v for k, v in year_totals.items()},
            })
        elif category == 'healthcare_delivery':
            lenses['healthcare'].append({
                'vendor_id': vendor_id,
                'name': vendor.get('vendor_name_normalized', ''),
                'type': vendor.get('vendor_type', 'unknown'),
                'category': category,
                'yearly_payments': {str(k): v for k, v in year_totals.items()},
            })
    
    return lenses


def save_processed_data(data: Dict[str, Any], lenses: Dict[str, List[Dict[str, Any]]]):
    """Save all processed datasets to JSON files"""
    import shutil
    
    # Also save to public directory for Next.js
    PUBLIC_DIR = Path(__file__).parent.parent / "public" / "data" / "processed"
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    
    # Save payments by year (flattened)
    all_payments = []
    for year, payments in data['payments_by_year'].items():
        all_payments.extend(payments)
    
    payments_path = PROCESSED_DIR / "payments_by_year.json"
    with open(payments_path, 'w') as f:
        json.dump(all_payments, f, indent=2)
    shutil.copy(payments_path, PUBLIC_DIR / "payments_by_year.json")
    
    # Save system composition
    composition_path = PROCESSED_DIR / "system_composition.json"
    with open(composition_path, 'w') as f:
        json.dump(data['system_composition'], f, indent=2)
    shutil.copy(composition_path, PUBLIC_DIR / "system_composition.json")
    
    # Save vendor yearly payments (for visualization)
    vendor_master = load_vendor_master()
    
    # Load classified vendors from public directory to preserve classifications
    PUBLIC_VENDORS_FILE = Path(__file__).parent.parent / "public" / "data" / "processed" / "vendors_master.json"
    public_vendors_by_id = {}
    if PUBLIC_VENDORS_FILE.exists():
        try:
            with open(PUBLIC_VENDORS_FILE, 'r') as f:
                public_vendors = json.load(f)
                public_vendors_by_id = {v.get('vendor_id'): v for v in public_vendors if v.get('vendor_id')}
        except Exception:
            pass
    
    vendors_master_list = []
    
    for vendor_id, year_totals in data['vendor_year_totals'].items():
        vendor = vendor_master.get(vendor_id, {})
        
        # Use classification from public vendors if available, otherwise from vendor_master
        if vendor_id in public_vendors_by_id:
            public_vendor = public_vendors_by_id[vendor_id]
            vendor_type = public_vendor.get('type', public_vendor.get('vendor_type', 'unknown'))
            category = public_vendor.get('category', public_vendor.get('service_category'))
            name = public_vendor.get('name', vendor.get('vendor_name_normalized', ''))
        else:
            vendor_type = vendor.get('vendor_type', 'unknown')
            category = vendor.get('service_category')
            name = vendor.get('vendor_name_normalized', '')
        
        vendors_master_list.append({
            'vendor_id': vendor_id,
            'name': name,
            'type': vendor_type,
            'category': category,
            'yearly_payments': {str(k): v for k, v in year_totals.items()},
        })
    
    vendors_path = PROCESSED_DIR / "vendors_master.json"
    with open(vendors_path, 'w') as f:
        json.dump(vendors_master_list, f, indent=2)
    shutil.copy(vendors_path, PUBLIC_DIR / "vendors_master.json")
    
    # Save lens datasets
    for lens_name, lens_data in lenses.items():
        lens_obj = {
            'lens': lens_name,
            'vendors': lens_data,
            'description': f"Vendors in the {lens_name} category",
            'copy_angle': '',  # To be filled manually
        }
        
        lens_path = PROCESSED_DIR / f"lens_{lens_name}.json"
        with open(lens_path, 'w') as f:
            json.dump(lens_obj, f, indent=2)
        shutil.copy(lens_path, PUBLIC_DIR / f"lens_{lens_name}.json")
    
    print(f"✅ Saved processed data to {PROCESSED_DIR}")
    print(f"✅ Copied data to {PUBLIC_DIR} for Next.js")


def main():
    print("🔄 Starting data processing pipeline...")
    print()
    
    # Step 1: Ingest
    payments = ingest_raw_data()
    if not payments:
        print("\n⚠️  No data to process. Exiting.")
        return
    
    # Step 2: Normalize vendors
    print("\n📝 Normalizing vendor names...")
    name_to_id = normalize_vendors(payments)
    print(f"✅ Normalized {len(name_to_id)} unique vendors")
    
    # Step 3: Aggregate
    print("\n📊 Aggregating payments...")
    aggregated = aggregate_payments(payments, name_to_id)
    print(f"✅ Aggregated data across {len(aggregated['system_composition'])} years")
    
    # Step 4: Build lenses
    print("\n🔍 Building lens datasets...")
    lenses = build_lens_data(aggregated['vendor_year_totals'])
    for lens_name, lens_data in lenses.items():
        print(f"   {lens_name}: {len(lens_data)} vendors")
    
    # Step 5: Save
    print("\n💾 Saving processed data...")
    save_processed_data(aggregated, lenses)
    
    print("\n✅ Data processing complete!")
    print(f"\n📋 Next steps:")
    print(f"   1. Review and classify top vendors in {PROCESSED_DIR / 'vendors_master.json'}")
    print(f"   2. Update vendor_type and service_category fields")
    print(f"   3. Re-run this script to regenerate datasets")


if __name__ == "__main__":
    main()
