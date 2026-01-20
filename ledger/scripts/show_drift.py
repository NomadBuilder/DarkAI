#!/usr/bin/env python3
"""
Show the privatization (Americanization) drift over time
"""

import json
from pathlib import Path

PUBLIC_DIR = Path(__file__).parent.parent / "public" / "data" / "processed"
COMPOSITION_FILE = PUBLIC_DIR / "system_composition.json"

def main():
    with open(COMPOSITION_FILE, 'r') as f:
        composition = json.load(f)
    
    # Sort by year
    composition.sort(key=lambda x: x['year'])
    
    print("📊 Privatization (Americanization) Drift Analysis\n")
    print(f"{'Year':<8} {'Public':<20} {'Non-Profit':<20} {'For-Profit':<20} {'Unknown':<20} {'For-Profit %':<15}")
    print("-" * 110)
    
    first_year = composition[0]
    first_total = sum([first_year.get('public_total', 0), first_year.get('non_profit_total', 0), 
                       first_year.get('for_profit_total', 0), first_year.get('unknown_total', 0)])
    
    for year_data in composition:
        year = year_data['year']
        public = year_data.get('public_total', 0)
        nonprofit = year_data.get('non_profit_total', 0)
        forprofit = year_data.get('for_profit_total', 0)
        unknown = year_data.get('unknown_total', 0)
        
        total = public + nonprofit + forprofit + unknown
        
        if total > 0:
            forprofit_pct = (forprofit / total) * 100
        else:
            forprofit_pct = 0
        
        print(f"{year:<8} ${public/1e9:>8.2f}B{'':<8} ${nonprofit/1e9:>8.2f}B{'':<8} ${forprofit/1e9:>8.2f}B{'':<8} ${unknown/1e9:>8.2f}B{'':<8} {forprofit_pct:>6.2f}%")
    
    # Calculate growth rates
    print("\n📈 Growth Rates (2014-2024):")
    first = composition[0]
    last = composition[-1]
    
    first_public = first.get('public_total', 0)
    last_public = last.get('public_total', 0)
    first_forprofit = first.get('for_profit_total', 0)
    last_forprofit = last.get('for_profit_total', 0)
    
    if first_public > 0:
        public_growth = ((last_public - first_public) / first_public) * 100
        print(f"   Public: {public_growth:+.1f}% (${first_public/1e9:.2f}B → ${last_public/1e9:.2f}B)")
    else:
        print(f"   Public: N/A (no data in first year)")
    
    if first_forprofit > 0:
        forprofit_growth = ((last_forprofit - first_forprofit) / first_forprofit) * 100
        print(f"   For-Profit: {forprofit_growth:+.1f}% (${first_forprofit/1e9:.2f}B → ${last_forprofit/1e9:.2f}B)")
    elif last_forprofit > 0:
        print(f"   For-Profit: NEW (appeared, now ${last_forprofit/1e9:.2f}B)")
    else:
        print(f"   For-Profit: N/A")
    
    # Show top for-profit vendors
    print("\n💰 Top For-Profit Vendors:")
    vendors_file = PUBLIC_DIR / "vendors_master.json"
    if vendors_file.exists():
        with open(vendors_file, 'r') as f:
            vendors = json.load(f)
        
        forprofit_vendors = [v for v in vendors if v.get('type') == 'for_profit']
        
        # Calculate totals
        for v in forprofit_vendors:
            yearly = v.get('yearly_payments', {})
            v['_total'] = sum(float(amt) for amt in yearly.values() if amt)
        
        forprofit_vendors.sort(key=lambda x: x.get('_total', 0), reverse=True)
        
        print(f"{'Vendor':<50} {'Total':<20} {'Category':<20}")
        print("-" * 90)
        for v in forprofit_vendors[:20]:
            name = v.get('name', 'Unknown')[:48]
            total = v.get('_total', 0)
            category = v.get('category', 'other')
            print(f"{name:<50} ${total/1e6:>10.2f}M{'':<7} {category:<20}")

if __name__ == "__main__":
    main()
