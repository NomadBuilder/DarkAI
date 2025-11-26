# DarkAI Consolidated Platform - Deployment Guide

## Overview

This is the consolidated Flask application combining all three DarkAI services:
- **PersonaForge** at `/personaforge`
- **BlackWire** at `/blackwire`
- **ShadowStack** at `/shadowstack`
- **Dark-AI Homepage** at `/`

## Structure

```
DarkAI-consolidated/
├── app.py                 # Main Flask app with blueprints
├── personaforge/          # PersonaForge blueprint
├── blackwire/             # BlackWire blueprint
├── shadowstack/           # ShadowStack blueprint
├── static/                # Shared static files
├── templates/             # Shared templates (Dark-AI homepage)
├── requirements.txt       # Combined dependencies
└── render.yaml            # Render.com deployment config
```

## Local Testing

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally (use different port if 5000 is in use)
PORT=5001 python app.py

# Or with gunicorn
gunicorn app:app --bind 0.0.0.0:5001 --workers 2 --threads 2
```

## Routes

- `/` - Dark-AI homepage
- `/about` - About page
- `/personaforge/*` - PersonaForge application (22 routes)
- `/blackwire/*` - BlackWire application (12 routes)
- `/shadowstack/*` - ShadowStack application (12 routes)

## Database Configuration

**Important**: The current `render.yaml` uses separate databases for each service:
- `personaforge-postgres` (uses `POSTGRES_*` env vars)
- `blackwire-postgres` (uses `BLACKWIRE_POSTGRES_*` env vars)
- `shadowstack-postgres` (uses `SHADOWSTACK_POSTGRES_*` env vars)

**Note**: The database clients in `blackwire` and `shadowstack` blueprints may need to be updated to read from the prefixed environment variables (`BLACKWIRE_POSTGRES_*`, `SHADOWSTACK_POSTGRES_*`) when running in the consolidated app. Currently, they expect standard `POSTGRES_*` variables.

**Options**:
1. Update the database clients to check for prefixed variables first, then fall back to standard ones
2. Use the same `POSTGRES_*` variables for all services (requires separate databases anyway)
3. Use a single database with table prefixes (requires code changes)

## Deployment to Render.com

1. Push code to GitHub
2. Connect repository to Render
3. Create new Web Service from `render.yaml`
4. Set custom domain to `darkai.ca`
5. Configure environment variables in Render dashboard

## Environment Variables

Set these in Render dashboard:

**PersonaForge API Keys:**
- `BUILTWITH_API_KEY`
- `IPLOCATE_API_KEY`
- `SHODAN_API_KEY`
- `OPENAI_API_KEY`
- `SERPAPI_API_KEY`

**BlackWire API Keys:**
- `IPAPI_KEY`
- `VIRUSTOTAL_API_KEY`
- `NUMLOOKUP_API_KEY`
- `ETHERSCAN_API_KEY`

**Neo4j (Optional):**
- `NEO4J_URI`
- `NEO4J_USER`
- `NEO4J_PASSWORD`

## Safety

- ✅ Original projects untouched
- ✅ All changes in `DarkAI-consolidated/` directory
- ✅ Can be deleted if needed
- ✅ Test locally before deploying

## Next Steps

1. Test locally to ensure all routes work
2. Update database clients if needed for prefixed env vars
3. Deploy to Render.com
4. Configure custom domain `darkai.ca`
5. Test all three services under the new domain

