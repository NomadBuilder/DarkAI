#!/usr/bin/env python3
"""Test APIs with raw responses to see actual data structure."""

import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

SECURITYTRAILS_API_KEY = os.getenv("SECURITYTRAILS_API_KEY", "")
WHOISXML_API_KEY = os.getenv("WHOISXML_API_KEY", "")

# Test with both .co and .com domains
domains_to_test = ["deep-nude.co", "adultdeepfakes.com"]
domain = domains_to_test[1]  # Start with .com for better WHOIS data

print(f"\n{'='*60}")
print(f"Testing APIs for: {domain}")
print(f"{'='*60}\n")

# Test SecurityTrails - Domain Details
if SECURITYTRAILS_API_KEY:
    print("1. SecurityTrails - Domain Details:")
    print("-" * 60)
    try:
        url = f"https://api.securitytrails.com/v1/domain/{domain}"
        headers = {"APIKEY": SECURITYTRAILS_API_KEY}
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=2, default=str)[:2000])  # First 2000 chars
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n2. SecurityTrails - Subdomains:")
    print("-" * 60)
    try:
        url = f"https://api.securitytrails.com/v1/domain/{domain}/subdomains"
        headers = {"APIKEY": SECURITYTRAILS_API_KEY}
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=2, default=str))
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n3. SecurityTrails - Historical DNS:")
    print("-" * 60)
    try:
        url = f"https://api.securitytrails.com/v1/history/{domain}/dns/a"
        headers = {"APIKEY": SECURITYTRAILS_API_KEY}
        response = requests.get(url, headers=headers, params={"page": 1}, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=2, default=str)[:1500])  # First 1500 chars
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

# Test WhoisXML
if WHOISXML_API_KEY:
    print("\n4. WhoisXML - WHOIS Data:")
    print("-" * 60)
    try:
        url = "https://www.whoisxmlapi.com/whoisserver/WhoisService"
        params = {
            "apiKey": WHOISXML_API_KEY,
            "domainName": domain,
            "outputFormat": "JSON"
        }
        response = requests.get(url, params=params, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=2, default=str)[:2000])  # First 2000 chars
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

print("\n" + "="*60)

