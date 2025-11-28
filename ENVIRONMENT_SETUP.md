# Environment Setup: Local vs Remote

## How It Works

The app automatically detects whether it's running **locally** or on **Render** and uses the appropriate database configuration.

### Detection Logic

```python
# 1. Check for DATABASE_URL (Render sets this automatically)
database_url = os.getenv("DATABASE_URL")

if database_url:
    # REMOTE: Use Render's database
    connect_params = parse_database_url(database_url)
else:
    # LOCAL: Use .env file or defaults
    connect_params = {
        "host": os.getenv("POSTGRES_HOST", "localhost"),
        "port": os.getenv("POSTGRES_PORT", "5432"),
        # ... etc
    }
```

### Local Development

**When running locally:**
- `DATABASE_URL` is **NOT set**
- App uses `.env` file or defaults
- Connects to `localhost:5432` (Docker PostgreSQL)
- Connects to `localhost:7687` (Docker Neo4j)

**Setup:**
1. Run `./setup_local.sh` (starts Docker containers)
2. Run `python3 app.py`
3. App automatically uses local databases

### Remote (Render)

**When running on Render:**
- `DATABASE_URL` **IS set** (automatically by Render)
- App uses `DATABASE_URL` for PostgreSQL
- Uses environment variables for Neo4j
- Connects to Render's managed database

**Setup:**
1. Link database in Render dashboard
2. Render automatically sets `DATABASE_URL`
3. Deploy - app automatically uses Render's database

## Configuration Files

### `.env` (Local Development)

```bash
# Local PostgreSQL (used when DATABASE_URL is not set)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=darkai_user
POSTGRES_PASSWORD=darkai123password
POSTGRES_DB=darkai

# Local Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4j123password
```

### Render Environment Variables

Render automatically sets:
- `DATABASE_URL` - PostgreSQL connection string

You manually set:
- `NEO4J_URI` - Your Neo4j Aura instance
- `NEO4J_USERNAME` - Neo4j username
- `NEO4J_PASSWORD` - Neo4j password
- API keys (optional)

## Important Notes

1. **Never commit `.env`** - It contains local credentials
2. **`.env.example`** - Template for local setup
3. **Render uses `DATABASE_URL`** - Don't set individual `POSTGRES_*` vars on Render
4. **Local uses individual vars** - Set `POSTGRES_HOST`, `POSTGRES_PORT`, etc. in `.env`

## Testing Both Environments

### Test Local
```bash
# Make sure DATABASE_URL is not set
unset DATABASE_URL

# Start local databases
docker-compose up -d

# Run app
python3 app.py
```

### Test Remote (Simulate Render)
```bash
# Set DATABASE_URL (like Render does)
export DATABASE_URL="postgresql://user:pass@host:port/db"

# Run app
python3 app.py
```

## Troubleshooting

### "App connects to wrong database"

**Check what's being used:**
```python
import os
print("DATABASE_URL:", os.getenv("DATABASE_URL"))
print("POSTGRES_HOST:", os.getenv("POSTGRES_HOST"))
```

**Local should show:**
- `DATABASE_URL`: `None`
- `POSTGRES_HOST`: `localhost`

**Remote should show:**
- `DATABASE_URL`: `postgresql://...`
- `POSTGRES_HOST`: (may be None or from DATABASE_URL)

### "Can't connect to local database"

1. Check Docker containers: `docker-compose ps`
2. Check `.env` file matches `docker-compose.yml`
3. Verify ports aren't in use: `lsof -i :5432`

### "Works locally but not on Render"

1. Verify `DATABASE_URL` is set in Render dashboard
2. Check database is linked to service
3. Verify SSL is enabled (Render requires it)

