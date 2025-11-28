# Quick Start Guide

## Local Development (5 minutes)

### 1. Run Setup Script
```bash
./setup_local.sh
```

This automatically:
- ✅ Starts PostgreSQL and Neo4j in Docker
- ✅ Creates `.env` file with local settings
- ✅ Installs Python dependencies

### 2. Start the App
```bash
python3 app.py
```

### 3. Visit the App
- **Homepage**: http://localhost:5000
- **PersonaForge**: http://localhost:5000/personaforge
- **BlackWire**: http://localhost:5000/blackwire
- **ShadowStack**: http://localhost:5000/shadowstack

## How It Works

### Automatic Environment Detection

The app automatically detects local vs remote:

**Local (when `DATABASE_URL` is not set):**
- Uses `.env` file or defaults
- Connects to `localhost:5432` (PostgreSQL)
- Connects to `localhost:7687` (Neo4j)

**Remote/Render (when `DATABASE_URL` is set):**
- Uses `DATABASE_URL` from Render
- Connects to Render's managed database
- Uses environment variables for Neo4j

### No Configuration Needed!

- **Local**: Just run `./setup_local.sh` and `python3 app.py`
- **Remote**: Render sets `DATABASE_URL` automatically

## Troubleshooting

### "Database connection failed"
```bash
# Check if Docker containers are running
docker-compose ps

# Start containers if needed
docker-compose up -d
```

### "Port already in use"
```bash
# Stop existing containers
docker-compose down

# Or change ports in docker-compose.yml
```

### Need to Reset Data
```bash
docker-compose down -v
docker-compose up -d
```

## Next Steps

See `LOCAL_SETUP.md` for detailed documentation.

