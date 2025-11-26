# DarkAI Consolidated Platform

A unified Flask application combining all three DarkAI services under a single domain (`darkai.ca`).

## Services

- **PersonaForge** (`/personaforge`) - Synthetic Identity Intelligence
- **BlackWire** (`/blackwire`) - Sextortion & Extortion Infrastructure Map  
- **ShadowStack** (`/shadowstack`) - NCII Infrastructure Mapping
- **Dark-AI Homepage** (`/`) - Main landing page

## Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
PORT=5001 python app.py
```

Visit:
- http://localhost:5001/ - Homepage
- http://localhost:5001/personaforge - PersonaForge
- http://localhost:5001/blackwire - BlackWire
- http://localhost:5001/shadowstack - ShadowStack

### Production Deployment

Deploy to Render.com using the provided `render.yaml`:

1. Push code to GitHub
2. Connect repository to Render
3. Create Web Service from `render.yaml`
4. Configure custom domain `darkai.ca`
5. Set environment variables in Render dashboard

## Structure

```
DarkAI-consolidated/
├── app.py                 # Main Flask app with blueprints
├── personaforge/          # PersonaForge blueprint
├── blackwire/             # BlackWire blueprint
├── shadowstack/           # ShadowStack blueprint
├── static/                # Shared static files
├── templates/             # Shared templates
├── requirements.txt       # Combined dependencies
├── render.yaml            # Render.com deployment config
└── Procfile              # Process file for deployment
```

## Database Configuration

The app uses separate PostgreSQL databases for each service:

- **PersonaForge**: Uses `POSTGRES_*` environment variables
- **BlackWire**: Uses `BLACKWIRE_POSTGRES_*` (with fallback to `POSTGRES_*`)
- **ShadowStack**: Uses `SHADOWSTACK_POSTGRES_*` (with fallback to `POSTGRES_*`)

See `DEPLOYMENT.md` for detailed database setup instructions.

## Environment Variables

Required for production:

**PersonaForge:**
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `BUILTWITH_API_KEY`, `IPLOCATE_API_KEY`, `SHODAN_API_KEY`, `OPENAI_API_KEY`, `SERPAPI_API_KEY`

**BlackWire:**
- `BLACKWIRE_POSTGRES_HOST`, `BLACKWIRE_POSTGRES_PORT`, `BLACKWIRE_POSTGRES_USER`, `BLACKWIRE_POSTGRES_PASSWORD`, `BLACKWIRE_POSTGRES_DB`
- `IPAPI_KEY`, `VIRUSTOTAL_API_KEY`, `NUMLOOKUP_API_KEY`, `ETHERSCAN_API_KEY`

**ShadowStack:**
- `SHADOWSTACK_POSTGRES_HOST`, `SHADOWSTACK_POSTGRES_PORT`, `SHADOWSTACK_POSTGRES_USER`, `SHADOWSTACK_POSTGRES_PASSWORD`, `SHADOWSTACK_POSTGRES_DB`
- `OPENAI_API_KEY`

**Optional:**
- `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD` (for graph features)

## Documentation

- `DEPLOYMENT.md` - Deployment guide
- `TESTING.md` - Local testing guide

## Safety

✅ **Original projects untouched** - All changes are in `DarkAI-consolidated/` directory  
✅ **Fully reversible** - Can delete this directory without affecting original services  
✅ **Testable locally** - Verify everything works before deploying

## License

See individual service licenses in their respective directories.
