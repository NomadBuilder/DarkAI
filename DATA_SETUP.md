# Data Setup: What You'll See Locally

## Overview

When you run the local setup, here's what data will be available for each service:

## ✅ PersonaForge - Dummy Data (Automatic)

**What:** 50 dummy domains with realistic vendor data for visualization testing

**How it works:**
- Automatically seeded on first app startup if database is empty
- Runs in background thread after 7 seconds
- Only seeds if database is empty (won't duplicate)

**To see it:**
1. Start app: `python3 app.py`
2. Wait ~10 seconds for seeding
3. Visit: http://localhost:5000/personaforge/dashboard

**To remove dummy data:**
```python
from personaforge.src.database.seed_dummy_data import remove_dummy_data
remove_dummy_data()
```

**Note:** Dummy data is clearly marked with `source='DUMMY_DATA_FOR_TESTING'`

## ✅ ShadowStack - Real Data (110 Domains)

**What:** 110 real NCII/Deepfake domains from the original ShadowStack dataset

**How to import:**
```bash
# Option 1: Use the complete setup script
./setup_with_data.sh

# Option 2: Import manually
python3 import_shadowstack_data_local.py
```

**Source:** `/AIPornTracker/ncii-infra-mapping/data/input/domains.csv`

**To see it:**
1. Import data: `python3 import_shadowstack_data_local.py`
2. Visit: http://localhost:5000/shadowstack/dashboard

**Note:** Domains are imported without enrichment by default (to save time). To enrich them:
- Use the `/shadowstack/api/enrich` endpoint
- Or uncomment the enrichment code in `import_shadowstack_data_local.py`

## ✅ BlackWire - Trace Functionality (Neo4j Ready)

**What:** Full trace functionality with Neo4j graph database

**How it works:**
- Neo4j is running locally on `localhost:7687`
- Trace entities (phone, domain, wallet, handle) and see relationships
- Data is stored in Neo4j as you trace

**To use it:**
1. Start app: `python3 app.py`
2. Visit: http://localhost:5000/blackwire/trace
3. Enter entities to trace (phone, domain, wallet, or handle)
4. View graph: http://localhost:5000/blackwire/dashboard

**Neo4j Browser:**
- URL: http://localhost:7474
- Username: `neo4j`
- Password: `neo4j123password`

**Note:** BlackWire starts with an empty Neo4j database. You populate it by tracing entities.

## Summary

| Service | Data Type | How to Get | Status |
|---------|-----------|------------|--------|
| **PersonaForge** | Dummy data (50 domains) | Automatic on startup | ✅ Ready |
| **ShadowStack** | Real data (110 domains) | Run `import_shadowstack_data_local.py` | ✅ Ready |
| **BlackWire** | Trace functionality | Use trace page, stores in Neo4j | ✅ Ready |

## Quick Start with All Data

```bash
# Complete setup with all data
./setup_with_data.sh

# Start the app
python3 app.py

# Visit:
# - PersonaForge: http://localhost:5000/personaforge (dummy data auto-seeded)
# - ShadowStack: http://localhost:5000/shadowstack (110 real domains)
# - BlackWire: http://localhost:5000/blackwire (trace to populate)
```

## Remote (Render) Data

On Render, each service uses its own data:
- **PersonaForge**: Uses data from Render database (or seeds dummy if empty)
- **ShadowStack**: Uses data from Render database (imported via `/api/import`)
- **BlackWire**: Uses data from Neo4j Aura instance (traced entities)

The app automatically detects local vs remote and uses the appropriate database!

