# 📥 Import ShadowStack Data into Blackwire Database

## Quick Import via API

Your original ShadowStack data (112 domains) is in a CSV file. Here's how to import it:

### Method 1: Using curl (from terminal)

```bash
curl -X POST https://darkai-6otc.onrender.com/shadowstack/api/import \
  -H "Content-Type: application/json" \
  -d '{
    "domains": [
      "undress.app",
      "www.deep-nude.ai",
      "www.nudify.online",
      "promptchan.ai",
      "pornx.ai",
      "undress.love",
      "clothoff.io",
      "undress.cc",
      "www.soulgen.net",
      "pornworks.ai"
      // ... add all 112 domains
    ],
    "source": "CSV Import - Original ShadowStack Data",
    "auto_enrich": false
  }'
```

### Method 2: Upload CSV file

```bash
curl -X POST https://darkai-6otc.onrender.com/shadowstack/api/import \
  -F "file=@/path/to/domains.csv"
```

### Method 3: Use Python script (local)

```python
import requests
import csv

# Read CSV
domains = []
with open('/Users/aazir/Desktop/AIModules/DarkAI/AIPornTracker/ncii-infra-mapping/data/input/domains.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        domain = row.get('domain') or row.get('Domain')
        if domain:
            domains.append(domain.strip().lower())

# Import via API
response = requests.post(
    'https://darkai-6otc.onrender.com/shadowstack/api/import',
    json={
        'domains': domains,
        'source': 'CSV Import - Original ShadowStack Data',
        'auto_enrich': False
    }
)

print(response.json())
```

## After Import

1. **Check the dashboard:** `https://darkai-6otc.onrender.com/shadowstack/dashboard`
2. **You should see:** All 112 domains listed
3. **To enrich them:** Use the `/api/enrich` endpoint or the "Check URL" page

## Full Domain List

The CSV file contains 112 domains. You can find it at:
`/Users/aazir/Desktop/AIModules/DarkAI/AIPornTracker/ncii-infra-mapping/data/input/domains.csv`

---

**Note:** The import endpoint accepts:
- JSON array of domains
- CSV file upload
- Optional `auto_enrich` flag to automatically enrich domains after import

