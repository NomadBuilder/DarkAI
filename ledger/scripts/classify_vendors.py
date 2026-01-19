#!/usr/bin/env python3
"""
Automated vendor classification using heuristics
Classifies vendors as public, non-profit, or for-profit based on name patterns
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any

DATA_DIR = Path(__file__).parent.parent / "data" / "processed"
PUBLIC_DIR = Path(__file__).parent.parent / "public" / "data" / "processed"
VENDORS_FILE = DATA_DIR / "vendors_master.json"
PUBLIC_VENDORS_FILE = PUBLIC_DIR / "vendors_master.json"

# Classification patterns
PUBLIC_PATTERNS = [
    r'\b(hospital|health sciences|health centre|health center)\b',
    r'\b(school board|district school board|school district)\b',
    r'\b(city of|town of|municipality of|region of)\b',
    r'\b(university|college)\b',
    r'\b(ontario|government|ministry|crown)\b',
    r'\b(metrolinx|hydro one|ontario power|infrastructure and lands)\b',
    r'\b(public health|health unit)\b',
    r'\b(children\'s aid|childrens aid)\b',
    r'\b(conservation authority)\b',
    r'\b(pension plan board)\b',
    r'\b(independent electricity system operator)\b',
    r'\b(ontario health|sante ontario)\b',
    r'\b(cancer care ontario)\b',
    r'\b(trillium|london health|hamilton health)\b',
]

NONPROFIT_PATTERNS = [
    r'\b(united way|red cross|ymca|ywca)\b',
    r'\b(community living|non-profit|nonprofit)\b',
    r'\b(foundation|foundation)\b',
    r'\b(association|society)\b',
    r'\b(institute|institution)\b',
    r'\b(charity|charitable)\b',
]

FORPROFIT_PATTERNS = [
    r'\b(inc\.?|ltd\.?|llc\.?|corp\.?|corporation|incorporated)\b',
    r'\b(staffing|recruitment|hr|human resources)\b',
    r'\b(consulting|consultants?|advisory)\b',
    r'\b(deloitte|kpmg|pwc|pwc|ernst|mckinsey|accenture|ibm)\b',
    r'\b(lifelabs|dynacare|medcan|shouldice)\b',
    r'\b(microsoft|oracle|sap|salesforce)\b',
    r'\b(altis|randstad|adecco|kelly|manpower)\b',
    r'\b(group|holdings|partners?)\b',
]

STAFFING_KEYWORDS = [
    'staffing', 'recruitment', 'hr', 'human resources', 'temporary', 'temp',
    'altis', 'randstad', 'adecco', 'kelly', 'manpower', 'express employment',
    'robert half', 'aerotek', 'personnel', 'employment services', 'workforce',
    'talent', 'recruiting', 'placement', 'staff solutions', 'employment agency',
    'temporary help', 'temp agency', 'staffing solutions', 'workforce solutions'
]

CONSULTING_KEYWORDS = [
    'consulting', 'consultants', 'advisory', 'deloitte', 'kpmg', 'pwc', 'ernst',
    'mckinsey', 'accenture', 'ibm', 'cgi', 'pwc', 'strategy', 'management consulting'
]

HEALTHCARE_KEYWORDS = [
    'lifelabs', 'dynacare', 'medcan', 'shouldice', 'clinic', 'diagnostic',
    'healthcare', 'health care', 'health services', 'medical', 'laboratory', 'lab',
    'health group', 'health centre', 'health center', 'health system'
]

IT_KEYWORDS = [
    'microsoft', 'oracle', 'sap', 'salesforce', 'ibm', 'accenture', 'cgi',
    'software', 'technology', 'it services', 'systems', 'tech'
]


def classify_vendor(name: str) -> Dict[str, Any]:
    """
    Classify a vendor based on name patterns
    Returns: {vendor_type, service_category, confidence, evidence_note}
    """
    name_lower = name.lower()
    
    # Check for public institutions
    for pattern in PUBLIC_PATTERNS:
        if re.search(pattern, name_lower, re.IGNORECASE):
            return {
                'vendor_type': 'public',
                'service_category': None,
                'confidence': 'high',
                'evidence_note': f'Matches public institution pattern: {pattern}'
            }
    
    # Check for non-profit
    for pattern in NONPROFIT_PATTERNS:
        if re.search(pattern, name_lower, re.IGNORECASE):
            return {
                'vendor_type': 'non_profit',
                'service_category': None,
                'confidence': 'medium',
                'evidence_note': f'Matches non-profit pattern: {pattern}'
            }
    
    # Check for healthcare organizations (before for-profit patterns)
    # If name contains healthcare keywords, classify as healthcare
    if any(kw in name_lower for kw in HEALTHCARE_KEYWORDS):
        # Check if it's for-profit (has inc/ltd/corp/etc)
        is_for_profit = any(re.search(pattern, name_lower, re.IGNORECASE) for pattern in [
            r'\b(inc\.?|ltd\.?|llc\.?|corp\.?|corporation|incorporated)\b',
            r'\b(group|holdings|partners?)\b'
        ])
        
        if is_for_profit:
            return {
                'vendor_type': 'for_profit',
                'service_category': 'healthcare_delivery',
                'confidence': 'high',
                'evidence_note': 'Healthcare organization (for-profit)'
            }
        else:
            # Could be non-profit healthcare, but default to unknown if unclear
            return {
                'vendor_type': 'unknown',
                'service_category': 'healthcare_delivery',
                'confidence': 'medium',
                'evidence_note': 'Healthcare organization (needs manual review for type)'
            }
    
    # Check for for-profit
    for pattern in FORPROFIT_PATTERNS:
        if re.search(pattern, name_lower, re.IGNORECASE):
            # Determine service category
            category = None
            if any(kw in name_lower for kw in STAFFING_KEYWORDS):
                category = 'staffing'
            elif any(kw in name_lower for kw in CONSULTING_KEYWORDS):
                category = 'consulting'
            elif any(kw in name_lower for kw in IT_KEYWORDS):
                category = 'IT'
            else:
                category = 'other'
            
            return {
                'vendor_type': 'for_profit',
                'service_category': category,
                'confidence': 'high' if 'inc' in name_lower or 'ltd' in name_lower else 'medium',
                'evidence_note': f'Matches for-profit pattern: {pattern}'
            }
    
    # Special cases - known entities
    special_cases = {
        'payments made for services': {'vendor_type': 'unknown', 'note': 'Aggregate category'},
        'interest on ontario securities': {'vendor_type': 'unknown', 'note': 'Interest payment'},
        'accounts under': {'vendor_type': 'unknown', 'note': 'Aggregate category'},
        # Payment processors/pass-throughs - funds flow through to end recipients, not retained by processor
        'dh corporation': {'vendor_type': 'unknown', 'note': 'Payment processor for OSAP - funds pass through to students'},
        'd+h': {'vendor_type': 'unknown', 'note': 'Payment processor - funds pass through to end recipients'},
        'davis + henderson': {'vendor_type': 'unknown', 'note': 'Payment processor - funds pass through to end recipients'},
        'davis & henderson': {'vendor_type': 'unknown', 'note': 'Payment processor - funds pass through to end recipients'},
    }
    
    for key, value in special_cases.items():
        if key in name_lower:
            return {
                'vendor_type': 'unknown',
                'service_category': None,
                'confidence': 'high',
                'evidence_note': value['note']
            }
    
    # Default: unknown
    return {
        'vendor_type': 'unknown',
        'service_category': None,
        'confidence': 'low',
        'evidence_note': 'No pattern match - needs manual review'
    }


def main():
    print("🔄 Loading vendors from public directory...")
    
    # Load from public directory (has 'name' field)
    if PUBLIC_VENDORS_FILE.exists():
        with open(PUBLIC_VENDORS_FILE, 'r') as f:
            vendors = json.load(f)
    elif VENDORS_FILE.exists():
        with open(VENDORS_FILE, 'r') as f:
            vendors = json.load(f)
    else:
        print("❌ No vendors file found!")
        return
    
    print(f"📊 Classifying {len(vendors)} vendors...")
    
    # Calculate totals for sorting
    for vendor in vendors:
        yearly = vendor.get('yearly_payments', {})
        vendor['_total_calculated'] = sum(float(amt) for amt in yearly.values() if amt)
    
    # Sort by total (descending)
    vendors_sorted = sorted(vendors, key=lambda v: v.get('_total_calculated', 0), reverse=True)
    
    # Classify top 2000 vendors (expanded for better coverage)
    classified_count = 0
    for vendor in vendors_sorted[:2000]:
        # Try different name fields
        name = vendor.get('name') or vendor.get('vendor_name_normalized', '')
        if not name:
            continue
        
        # Always classify (overwrite existing if needed for top vendors)
        classification = classify_vendor(name)
        
        # Update both 'type' (for public file) and 'vendor_type' (for data file)
        vendor['type'] = classification['vendor_type']
        vendor['vendor_type'] = classification['vendor_type']  # For compatibility
        vendor['category'] = classification['service_category']
        vendor['service_category'] = classification['service_category']  # For compatibility
        vendor['confidence'] = classification['confidence']
        vendor['evidence_note'] = classification['evidence_note']
        
        if classification['vendor_type'] != 'unknown':
            classified_count += 1
    
    print(f"✅ Classified {classified_count} vendors (out of 2000 reviewed)")
    
    # Remove internal calculation field
    for v in vendors:
        v.pop('_total_calculated', None)
    
    # Save updated vendors to both locations
    print("💾 Saving classified vendors...")
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(PUBLIC_VENDORS_FILE, 'w') as f:
        json.dump(vendors, f, indent=2)
    
    # Also update the data/processed version if it exists
    if VENDORS_FILE.exists():
        # Load the full version and update matching vendors
        with open(VENDORS_FILE, 'r') as f:
            full_vendors = json.load(f)
        
        # Create lookup by vendor_id
        vendors_by_id = {v.get('vendor_id'): v for v in vendors if v.get('vendor_id')}
        
        # Update matching vendors
        for full_vendor in full_vendors:
            vid = full_vendor.get('vendor_id')
            if vid in vendors_by_id:
                updated = vendors_by_id[vid]
                full_vendor['vendor_type'] = updated.get('vendor_type', 'unknown')
                full_vendor['service_category'] = updated.get('service_category')
                full_vendor['confidence'] = updated.get('confidence', 'low')
                full_vendor['evidence_note'] = updated.get('evidence_note', '')
        
        with open(VENDORS_FILE, 'w') as f:
            json.dump(full_vendors, f, indent=2)
    
    print(f"✅ Saved {len(vendors)} vendors")
    
    # Print summary
    print("\n📊 Classification Summary (top 2000):")
    type_counts = {}
    for vendor in vendors_sorted[:2000]:
        vtype = vendor.get('type', vendor.get('vendor_type', 'unknown'))
        type_counts[vtype] = type_counts.get(vtype, 0) + 1
    
    for vtype, count in sorted(type_counts.items(), key=lambda x: -x[1]):
        print(f"   {vtype}: {count}")
    
    # Show some examples
    print("\n📋 Sample Classifications:")
    shown = 0
    for vendor in vendors_sorted:
        vtype = vendor.get('type', vendor.get('vendor_type', 'unknown'))
        if vtype != 'unknown' and shown < 30:
            name = vendor.get('name', 'Unknown')[:50]
            category = vendor.get('category', vendor.get('service_category', ''))
            conf = vendor.get('confidence', 'low')
            print(f"   {name:<50} → {vtype:12} {f'({category})' if category else '':<20} [{conf}]")
            shown += 1
    
    print("\n✅ Classification complete!")
    print("   Re-run process_data.py to regenerate system composition with classifications")


if __name__ == "__main__":
    main()
