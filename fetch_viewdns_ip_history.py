#!/usr/bin/env python3
"""
Fetch IP history data from ViewDNS.info API for ShadowStack domains.

This script:
1. Gets all real ShadowStack domains from the database
2. Fetches IP history from ViewDNS.info API
3. Stores the data locally in a JSON file (not committed to git)
4. Skips domains that already have data to avoid wasting API calls

API Key: ea4caf6bd889b86e123ab5d04cecb3a6dd2f814f
API Limit: 250 calls (free plan)
"""

import os
import sys
import json
import time
import requests
from pathlib import Path
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Add shadowstack to path
sys.path.insert(0, str(Path(__file__).parent / 'shadowstack'))
sys.path.insert(0, str(Path(__file__).parent))

load_dotenv()

# ViewDNS API configuration
VIEWDNS_API_KEY = "ea4caf6bd889b86e123ab5d04cecb3a6dd2f814f"
VIEWDNS_API_BASE = "https://api.viewdns.info"
IP_HISTORY_ENDPOINT = f"{VIEWDNS_API_BASE}/iphistory/"

# Local storage file (not in git)
DATA_FILE = Path(__file__).parent / "shadowstack_ip_history.json"


def get_shadowstack_domains() -> List[str]:
    """Get all real ShadowStack domains from the database."""
    try:
        from shadowstack.src.database.postgres_client import PostgresClient
        
        postgres = PostgresClient()
        if not postgres or not postgres.conn:
            print("❌ Failed to connect to database")
            return []
        
        # Get all domains with SHADOWSTACK source (real domains, not dummy)
        # Include both 'SHADOWSTACK%' and 'ShadowStack%' patterns to catch all variations
        cursor = postgres.conn.cursor()
        cursor.execute("""
            SELECT DISTINCT domain 
            FROM domains 
            WHERE (source ILIKE 'SHADOWSTACK%' OR source ILIKE 'ShadowStack%')
            AND source != 'DUMMY_DATA_FOR_TESTING'
            ORDER BY domain
        """)
        
        domains = [row[0] for row in cursor.fetchall()]
        cursor.close()
        
        print(f"✅ Found {len(domains)} ShadowStack domains in database")
        return domains
    except Exception as e:
        print(f"❌ Error getting domains from database: {e}")
        import traceback
        traceback.print_exc()
        return []


def load_existing_data() -> Dict[str, Dict]:
    """Load existing IP history data from local file."""
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, 'r') as f:
                data = json.load(f)
                print(f"✅ Loaded existing data for {len(data)} domains")
                return data
        except Exception as e:
            print(f"⚠️  Error loading existing data: {e}")
            return {}
    return {}


def save_data(data: Dict[str, Dict]):
    """Save IP history data to local JSON file."""
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        print(f"✅ Saved data to {DATA_FILE}")
    except Exception as e:
        print(f"❌ Error saving data: {e}")
        raise


def fetch_ip_history(domain: str) -> Optional[Dict]:
    """
    Fetch IP history for a domain from ViewDNS.info API.
    
    Returns:
        {
            "domain": "example.com",
            "historical_ips": [
                {"ip": "1.2.3.4", "country": "US", "asn": "AS12345 Example Inc"},
                ...
            ]
        }
    """
    try:
        params = {
            "domain": domain,
            "apikey": VIEWDNS_API_KEY,
            "output": "json"
        }
        
        print(f"  🔍 Fetching IP history for {domain}...")
        response = requests.get(IP_HISTORY_ENDPOINT, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        # Check for API errors
        if data.get("response", {}).get("error"):
            error_msg = data["response"]["error"]
            print(f"  ⚠️  API error for {domain}: {error_msg}")
            return None
        
        # Parse the response
        records = data.get("response", {}).get("records", [])
        if not records:
            print(f"  ⚠️  No IP history found for {domain}")
            return {
                "domain": domain,
                "historical_ips": []
            }
        
        historical_ips = []
        for record in records:
            ip = record.get("ip", "")
            # API may return location, owner, lastseen, or last_seen
            location = record.get("location", "") or record.get("Location", "")
            owner = record.get("owner", "") or record.get("Owner", "") or record.get("asn", "")
            last_seen = record.get("lastseen", "") or record.get("last_seen", "") or record.get("Last Seen", "")
            
            # Extract country code from location (e.g., "Kyiv - Ukraine" -> "UA")
            country = "Unknown"
            if location:
                # Try to extract country code
                location_parts = location.split(" - ")
                if len(location_parts) > 1:
                    country_name = location_parts[-1].strip()
                    # Simple country name to code mapping (can be expanded)
                    country_map = {
                        "Ukraine": "UA",
                        "United States": "US",
                        "USA": "US",
                        "United Kingdom": "GB",
                        "UK": "GB",
                        "Canada": "CA",
                        "Germany": "DE",
                        "France": "FR",
                        "Netherlands": "NL",
                        "Russia": "RU",
                        "China": "CN",
                        "Japan": "JP",
                        "Australia": "AU",
                        "Brazil": "BR",
                        "India": "IN",
                    }
                    country = country_map.get(country_name, country_name)
                else:
                    country = location
            
            historical_ips.append({
                "ip": ip,
                "country": country,
                "asn": owner,
                "location": location,
                "last_seen": last_seen
            })
        
        print(f"  ✅ Found {len(historical_ips)} historical IPs for {domain}")
        return {
            "domain": domain,
            "historical_ips": historical_ips
        }
        
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Network error for {domain}: {e}")
        return None
    except Exception as e:
        print(f"  ❌ Error fetching IP history for {domain}: {e}")
        import traceback
        traceback.print_exc()
        return None


def main():
    """Main function to fetch and store IP history data."""
    print("=" * 60)
    print("ViewDNS.info IP History Fetcher for ShadowStack")
    print("=" * 60)
    print(f"API Key: {VIEWDNS_API_KEY[:20]}...")
    print(f"Data file: {DATA_FILE}")
    print()
    
    # Load existing data
    existing_data = load_existing_data()
    existing_domains = set(existing_data.keys())
    
    # Get all ShadowStack domains
    all_domains = get_shadowstack_domains()
    if not all_domains:
        print("❌ No domains found. Exiting.")
        return
    
    # Filter to domains we don't have data for yet
    domains_to_fetch = [d for d in all_domains if d not in existing_domains]
    
    print(f"📊 Total domains: {len(all_domains)}")
    print(f"✅ Already have data: {len(existing_domains)}")
    print(f"🔄 Need to fetch: {len(domains_to_fetch)}")
    print()
    
    if not domains_to_fetch:
        print("✅ All domains already have IP history data!")
        return
    
    # Check API call limit
    if len(domains_to_fetch) > 250:
        print(f"⚠️  WARNING: Need to fetch {len(domains_to_fetch)} domains, but API limit is 250!")
        print(f"   Will only fetch first 250 domains.")
        domains_to_fetch = domains_to_fetch[:250]
    
    print(f"🚀 Starting to fetch IP history for {len(domains_to_fetch)} domains...")
    print()
    
    # Fetch data for each domain
    fetched_count = 0
    error_count = 0
    
    for i, domain in enumerate(domains_to_fetch, 1):
        print(f"[{i}/{len(domains_to_fetch)}] Processing {domain}...")
        
        ip_history = fetch_ip_history(domain)
        
        if ip_history:
            existing_data[domain] = ip_history
            fetched_count += 1
            
            # Save after each successful fetch (in case we hit rate limits)
            save_data(existing_data)
        else:
            error_count += 1
        
        # Rate limiting: wait 1 second between requests to be respectful
        if i < len(domains_to_fetch):
            time.sleep(1)
        
        print()
    
    # Final summary
    print("=" * 60)
    print("Summary:")
    print(f"  ✅ Successfully fetched: {fetched_count}")
    print(f"  ❌ Errors: {error_count}")
    print(f"  📁 Total domains with data: {len(existing_data)}")
    print(f"  💾 Data saved to: {DATA_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()

