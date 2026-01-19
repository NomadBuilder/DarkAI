#!/usr/bin/env python3
"""
Fetch real Ontario Public Accounts data from the open data portal
Uses the CKAN API to find and download resources
"""

import requests
import json
import csv
from pathlib import Path
import time
from urllib.parse import urljoin

DATA_DIR = Path(__file__).parent.parent / "data"
RAW_DIR = DATA_DIR / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# Ontario Open Data Portal CKAN API
CKAN_BASE = "https://data.ontario.ca"
CKAN_API = f"{CKAN_BASE}/api/3/action"

def search_datasets(query: str, limit: int = 10):
    """Search for datasets using CKAN API"""
    try:
        url = f"{CKAN_API}/package_search"
        params = {
            'q': query,
            'rows': limit,
        }
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        return response.json().get('result', {}).get('results', [])
    except Exception as e:
        print(f"⚠️  Error searching datasets: {e}")
        return []

def get_dataset_resources(package_id: str):
    """Get all resources for a dataset"""
    try:
        url = f"{CKAN_API}/package_show"
        params = {'id': package_id}
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        package = response.json().get('result', {})
        return package.get('resources', [])
    except Exception as e:
        print(f"⚠️  Error getting resources: {e}")
        return []

def download_resource(resource_url: str, output_path: Path):
    """Download a resource file"""
    try:
        print(f"  📥 Downloading {resource_url}...")
        response = requests.get(resource_url, timeout=60, stream=True)
        response.raise_for_status()
        
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"  ✅ Saved to {output_path.name}")
        return True
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def fetch_public_accounts_data():
    """Fetch Public Accounts Detailed Schedule of Payments"""
    print("🔍 Searching for Public Accounts datasets...")
    
    # Search for relevant datasets
    queries = [
        "public accounts detailed schedule payments",
        "public accounts payments",
        "public accounts schedule",
    ]
    
    all_datasets = []
    for query in queries:
        datasets = search_datasets(query)
        all_datasets.extend(datasets)
        time.sleep(0.5)  # Be polite
    
    # Remove duplicates
    seen = set()
    unique_datasets = []
    for ds in all_datasets:
        if ds['id'] not in seen:
            seen.add(ds['id'])
            unique_datasets.append(ds)
    
    print(f"Found {len(unique_datasets)} relevant datasets")
    
    downloaded = 0
    for dataset in unique_datasets[:5]:  # Limit to first 5
        print(f"\n📦 Dataset: {dataset.get('title', 'Unknown')}")
        resources = get_dataset_resources(dataset['id'])
        
        for resource in resources:
            if resource.get('format', '').upper() in ['CSV', 'XLSX', 'XLS']:
                resource_url = resource.get('url', '')
                if resource_url:
                    # Extract year from name or title
                    name = resource.get('name', '') or resource.get('title', '')
                    filename = f"public_accounts_{name.replace(' ', '_')}.csv"
                    # Clean filename
                    filename = ''.join(c for c in filename if c.isalnum() or c in '._-')[:100]
                    
                    output_path = RAW_DIR / filename
                    if download_resource(resource_url, output_path):
                        downloaded += 1
                    time.sleep(1)  # Be polite
    
    return downloaded

def main():
    print("🔄 Fetching Ontario Public Accounts data from open data portal...")
    print()
    
    downloaded = fetch_public_accounts_data()
    
    if downloaded == 0:
        print("\n⚠️  No data files downloaded automatically")
        print("   Using sample data that was already generated")
    else:
        print(f"\n✅ Downloaded {downloaded} data files")
    
    print(f"\n📋 Data files in {RAW_DIR}:")
    for f in sorted(RAW_DIR.glob("*.csv")):
        size = f.stat().st_size / 1024  # KB
        print(f"   {f.name} ({size:.1f} KB)")

if __name__ == "__main__":
    main()
