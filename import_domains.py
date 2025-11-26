#!/usr/bin/env python3
"""
Quick script to import ShadowStack domains into the consolidated database.
Run this after the app is deployed to Render.
"""

import requests
import csv
import json

# Read domains from CSV
csv_path = '/Users/aazir/Desktop/AIModules/DarkAI/AIPornTracker/ncii-infra-mapping/data/input/domains.csv'
domains = []

print("📄 Reading domains from CSV...")
with open(csv_path, 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        domain = row.get('domain', '').strip().lower()
        if domain:
            # Clean domain (remove http://, https://, www.)
            if domain.startswith('http://') or domain.startswith('https://'):
                from urllib.parse import urlparse
                domain = urlparse(domain).netloc or domain.replace('http://', '').replace('https://', '').split('/')[0]
            domains.append(domain)

print(f"✅ Found {len(domains)} domains")

# Import via API
api_url = 'https://darkai-6otc.onrender.com/shadowstack/api/import'

print(f"\n📤 Importing to: {api_url}")
print("   This may take a minute...")

try:
    response = requests.post(
        api_url,
        json={
            'domains': domains,
            'source': 'CSV Import - Original ShadowStack Data',
            'auto_enrich': False  # Set to True if you want to auto-enrich
        },
        timeout=120
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n✅ Import successful!")
        print(f"   - Imported: {result.get('imported', 0)} domains")
        print(f"   - Errors: {result.get('errors', 0)}")
        
        if result.get('error_details'):
            print(f"\n⚠️  Errors:")
            for error in result['error_details'][:5]:  # Show first 5 errors
                print(f"   - {error.get('domain')}: {error.get('error')}")
    else:
        print(f"\n❌ Import failed: {response.status_code}")
        print(f"   Response: {response.text}")
        
except requests.exceptions.RequestException as e:
    print(f"\n❌ Error connecting to API: {e}")
    print(f"\n   Make sure the app is deployed and running at: {api_url}")

print("\n✅ Done! Check the dashboard: https://darkai-6otc.onrender.com/shadowstack/dashboard")

