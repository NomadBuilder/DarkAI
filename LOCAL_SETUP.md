# Local Development Setup

This guide explains how to run the DarkAI Consolidated Platform locally with full database support.

## Quick Start

### 1. Run Setup Script

```bash
./setup_local.sh
```

This will:
- ✅ Check Docker installation
- ✅ Create `.env` file from `.env.example`
- ✅ Start PostgreSQL and Neo4j containers
- ✅ Install Python dependencies
- ✅ Verify database connections

### 2. Start the Application

```bash
python3 app.py
```

The app will start on `http://localhost:5000`

## How It Works

### Environment Detection

The app automatically detects whether it's running locally or on Render:

**Local Development:**
- Uses individual `POSTGRES_*` environment variables from `.env`
- Defaults to `localhost:5432` if not set
- Connects to local Docker containers

**Render (Remote):**
- Uses `DATABASE_URL` (set automatically by Render)
- Connects to Render's managed PostgreSQL database

### Database Configuration

**Local PostgreSQL:**
- Host: `localhost:5432`
- User: `darkai_user`
- Password: `darkai123password`
- Database: `darkai`

**Local Neo4j:**
- URI: `bolt://localhost:7687`
- User: `neo4j`
- Password: `neo4j123password`
- Web UI: `http://localhost:7474`

### Manual Setup (if script doesn't work)

1. **Start Databases:**
   ```bash
   docker-compose up -d
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   # Edit .env if needed
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run App:**
   ```bash
   python3 app.py
   ```

## Accessing Services

### Web Application
- **Homepage**: http://localhost:5000
- **PersonaForge**: http://localhost:5000/personaforge
- **BlackWire**: http://localhost:5000/blackwire
- **ShadowStack**: http://localhost:5000/shadowstack

### Databases

**PostgreSQL:**
```bash
docker exec -it darkai-postgres psql -U darkai_user -d darkai
```

**Neo4j Browser:**
- URL: http://localhost:7474
- Username: `neo4j`
- Password: `neo4j123password`

## Troubleshooting

### Databases Not Starting

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs postgres
docker-compose logs neo4j

# Restart containers
docker-compose restart
```

### Port Already in Use

If port 5432 or 7687 is already in use:

1. **Change ports in `docker-compose.yml`:**
   ```yaml
   ports:
     - "5433:5432"  # Use 5433 instead
     - "7688:7687"  # Use 7688 instead
   ```

2. **Update `.env`:**
   ```bash
   POSTGRES_PORT=5433
   NEO4J_URI=bolt://localhost:7688
   ```

### Database Connection Errors

1. **Check if containers are running:**
   ```bash
   docker-compose ps
   ```

2. **Check database logs:**
   ```bash
   docker-compose logs postgres
   ```

3. **Verify .env file:**
   ```bash
   cat .env | grep POSTGRES
   ```

### App Can't Connect to Database

1. **Wait for databases to be ready:**
   ```bash
   # Check PostgreSQL
   docker exec darkai-postgres pg_isready -U darkai_user
   
   # Check Neo4j
   docker exec darkai-neo4j cypher-shell -u neo4j -p neo4j123password "RETURN 1"
   ```

2. **Verify environment variables:**
   ```bash
   python3 -c "from dotenv import load_dotenv; import os; load_dotenv(); print('POSTGRES_HOST:', os.getenv('POSTGRES_HOST'))"
   ```

## Stopping Everything

```bash
# Stop containers (keeps data)
docker-compose stop

# Stop and remove containers (keeps data)
docker-compose down

# Stop and remove everything including data
docker-compose down -v
```

## Data Persistence

Database data is stored in Docker volumes:
- `postgres_data` - PostgreSQL data
- `neo4j_data` - Neo4j data
- `neo4j_logs` - Neo4j logs

Data persists even if you stop containers. To reset:
```bash
docker-compose down -v
docker-compose up -d
```

## Next Steps

Once everything is running:
1. Visit http://localhost:5000
2. Test PersonaForge: http://localhost:5000/personaforge
3. Test BlackWire: http://localhost:5000/blackwire/trace
4. Test ShadowStack: http://localhost:5000/shadowstack/check

All three services will use the same local databases and work independently!

