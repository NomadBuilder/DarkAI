#!/usr/bin/env python3
"""
Show top vendors by total spend for classification
"""

import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data" / "processed"
VENDORS_FILE = DATA_DIR / "vendors_master.json"

def main():
    with open(VENDORS_FILE, 'r') as f:
        vendors = json.load(f)
    
    # Calculate total paid from yearly_payments and sort
    for vendor in vendors:
        yearly = vendor.get('yearly_payments', {})
        vendor['_total_calculated'] = sum(float(amt) for amt in yearly.values() if amt)
    
    vendors_sorted = sorted(vendors, key=lambda v: v.get('_total_calculated', 0), reverse=True)
    
    print("Top 50 vendors by total spend (need classification):\n")
    print(f"{'Rank':<6} {'Vendor Name':<50} {'Total Paid':<20} {'Years':<10} {'Growth':<10}")
    print("-" * 100)
    
    for i, vendor in enumerate(vendors_sorted[:50], 1):
        total = vendor.get('_total_calculated', 0)
        name = vendor.get('name', vendor.get('vendor_name_normalized', 'Unknown'))[:48]
        yearly = vendor.get('yearly_payments', {})
        years_list = [int(y) for y in yearly.keys() if yearly.get(y, 0) > 0]
        years = f"{min(years_list)}-{max(years_list)}" if years_list else "?"
        
        # Calculate growth rate
        if len(years_list) >= 2:
            first_amt = yearly.get(str(min(years_list)), 0)
            last_amt = yearly.get(str(max(years_list)), 0)
            growth = ((last_amt - first_amt) / first_amt) if first_amt > 0 else 0
            growth_str = f"{growth*100:+.1f}%"
        else:
            growth_str = "N/A"
        
        total_str = f"${total:,.0f}" if total else "$0"
        
        print(f"{i:<6} {name:<50} {total_str:<20} {years:<10} {growth_str:<10}")
    
    print(f"\n\nTotal vendors: {len(vendors)}")
    print(f"Unclassified vendors: {sum(1 for v in vendors if v.get('vendor_type') == 'unknown')}")

if __name__ == "__main__":
    main()
