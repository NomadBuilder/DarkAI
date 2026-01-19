#!/usr/bin/env python3
"""
Fix data classification issues identified in audit
- Payment processors/pass-throughs
- Misclassified public institutions
- Aggregate categories
"""

import json
from pathlib import Path

# Load vendors
vendors_file = Path('public/data/processed/vendors_master.json')
with open(vendors_file, 'r') as f:
    vendors = json.load(f)

print("Fixing data classification issues...\n")

# 1. Payment processors and pass-throughs (should be unknown)
payment_processors = [
    'Odb',  # Ontario Drug Benefit - $9.6B pass-through
    'Rbc-Ontaxrebat',  # Tax rebate processor
    'Student Loan Receivable',  # Student loan pass-through
    'Student Loan Receivabl',  # Variant
    'Canada Pension Plan Investment Board',  # Pension investment pass-through
    'Canada Pension Plan Investment Board.',  # Variant with period
    'Opseu Pension Trust',  # Pension trust pass-through
    'Ontario Student Loan Trust',  # Student loan trust
    'Defaulted Student Loans',  # Student loan related
    'Robinson Huron Treaty Litigation Fund',  # Settlement fund pass-through
    'Ari Financial Services',  # Financial services processor
    'Ari Financial Services Inc',  # Variant
    'Ari Financial Services Inc T46163',  # Variant
    'Ari Financial Services Inc. T46163',  # Variant
]

# 2. Public institutions misclassified as for-profit
public_institutions = [
    'St Joseph\'S Care Group',  # Public hospital
    'St. Joseph\'s Care Group',  # Variant
    'Royal Ottawa Health Care Group',  # Public hospital
    'Royal Ottawa Health Care Group /Services De Sante Royal Ottawa',  # Variant
    'Corporation Of The County Of Simcoe',  # Municipality
    'Corporation Of The County Of Wellington',  # Municipality
    'Cmhc (Canada Mortgage & Housing Corp)',  # Federal crown corporation
    'Canada Mortgage & Housing Corp',  # Variant
]

# 3. Trusts and "In Trust" entities (usually pass-throughs)
trust_patterns = [
    ' In Trust',
    ' In Trust)',
    'In Trust',
    ' Llp In Trust',
    ' Professional Corporation In Trust',
    ' Trust',
    ' Trust Company',
    ' Trust Fund',
]

# 4. Aggregate categories
aggregate_categories = [
    'Accounts Under',
    'Comptes Inf',
    'Payments Made For',
    'Interest On',
    'Interest Payment',
]

fixes_applied = {
    'payment_processors': 0,
    'public_institutions': 0,
    'trusts': 0,
    'aggregates': 0,
}

for vendor in vendors:
    name = vendor.get('name', '')
    original_type = vendor.get('type', 'unknown')
    
    # Check for payment processors (fix regardless of current type if it's a known processor)
    if any(proc.lower() in name.lower() for proc in payment_processors):
        if vendor.get('type') != 'unknown':
            vendor['type'] = 'unknown'
            vendor['category'] = None
            vendor['exclusion_reason'] = 'Payment processor/pass-through - funds flow through to end recipients'
            fixes_applied['payment_processors'] += 1
            print(f"✅ Fixed payment processor: {name}")
            print(f"   Changed from {original_type} to unknown")
    
    # Check for misclassified public institutions
    if any(inst.lower() in name.lower() for inst in public_institutions):
        if vendor.get('type') == 'for_profit':
            vendor['type'] = 'public'
            vendor['category'] = None
            vendor['exclusion_reason'] = 'Public institution (hospital/municipality/crown corporation)'
            fixes_applied['public_institutions'] += 1
            print(f"✅ Fixed public institution: {name}")
            print(f"   Changed from {original_type} to public")
    
    # Check for trusts (usually pass-throughs, but be careful)
    if any(pattern in name for pattern in trust_patterns):
        # Only fix if it's a large amount and classified as for-profit
        total = sum(vendor.get('yearly_payments', {}).values())
        if vendor.get('type') == 'for_profit' and total > 10_000_000:
            # Check if it's a known trust that should be excluded
            trust_keywords = ['pension', 'student loan', 'settlement', 'litigation', 'remediation']
            if any(kw in name.lower() for kw in trust_keywords):
                vendor['type'] = 'unknown'
                vendor['category'] = None
                vendor['exclusion_reason'] = 'Trust/pass-through entity - funds flow through to beneficiaries'
                fixes_applied['trusts'] += 1
                print(f"✅ Fixed trust/pass-through: {name}")
                print(f"   Changed from {original_type} to unknown")
    
    # Check for aggregate categories
    if any(agg.lower() in name.lower() for agg in aggregate_categories):
        if vendor.get('type') != 'unknown':
            vendor['type'] = 'unknown'
            vendor['category'] = None
            vendor['exclusion_reason'] = 'Aggregate category - not a specific vendor'
            fixes_applied['aggregates'] += 1
            print(f"✅ Fixed aggregate category: {name}")
            print(f"   Changed from {original_type} to unknown")

# Save updated vendors
with open(vendors_file, 'w') as f:
    json.dump(vendors, f, indent=2)

# Also update data/processed version
data_vendors_file = Path('data/processed/vendors_master.json')
if data_vendors_file.exists():
    with open(data_vendors_file, 'r') as f:
        data_vendors = json.load(f)
    
    for vendor in data_vendors:
        name = vendor.get('name', '')
        
        # Apply same fixes
        if any(proc.lower() in name.lower() for proc in payment_processors):
            if vendor.get('vendor_type') == 'for_profit' or vendor.get('type') == 'for_profit':
                vendor['vendor_type'] = 'unknown'
                vendor['type'] = 'unknown'
                vendor['service_category'] = None
                vendor['category'] = None
        
        if any(inst.lower() in name.lower() for inst in public_institutions):
            if vendor.get('vendor_type') == 'for_profit' or vendor.get('type') == 'for_profit':
                vendor['vendor_type'] = 'public'
                vendor['type'] = 'public'
                vendor['service_category'] = None
                vendor['category'] = None
    
    with open(data_vendors_file, 'w') as f:
        json.dump(data_vendors, f, indent=2)

print(f"\n{'='*80}")
print("FIXES APPLIED:")
print(f"  Payment processors: {fixes_applied['payment_processors']}")
print(f"  Public institutions: {fixes_applied['public_institutions']}")
print(f"  Trusts/pass-throughs: {fixes_applied['trusts']}")
print(f"  Aggregate categories: {fixes_applied['aggregates']}")
print(f"{'='*80}")
print("\n⚠️  Next step: Re-run process_data.py to regenerate system_composition.json")
