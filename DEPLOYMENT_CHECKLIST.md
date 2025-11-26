# Deployment Checklist for DarkAI Consolidated Platform

## ✅ Completed
- [x] Consolidated all three services (PersonaForge, BlackWire, ShadowStack)
- [x] Fixed module import conflicts
- [x] Installed all dependencies
- [x] Merged API keys from original projects
- [x] Created render.yaml configuration
- [x] All functional pieces tested and working

## 🔧 Before Deployment

### 1. Git Repository Setup
- [ ] Initialize Git repository (if not already done)
- [ ] Add all files to Git
- [ ] Create initial commit
- [ ] Push to GitHub/GitLab/Bitbucket
- [ ] Connect repository to Render

### 2. Environment Variables (Set in Render Dashboard)
These should NOT be in .env file - set them in Render dashboard:

#### Database Connections
- `POSTGRES_HOST` - PostgreSQL database host
- `POSTGRES_PORT` - PostgreSQL port (usually 5432)
- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DB` - Database name
- `NEO4J_URI` - Neo4j connection URI (optional, for graphs)
- `NEO4J_USER` - Neo4j username
- `NEO4J_PASSWORD` - Neo4j password

#### API Keys (Optional - services work without them)
- `SERPAPI_API_KEY` - For search engine scraping
- `OPENAI_API_KEY` - For AI-powered features
- `IPAPI_KEY` - For IP geolocation
- `VIRUSTOTAL_API_KEY` - For threat intelligence
- `NUMLOOKUP_API_KEY` - For phone number enrichment
- `ETHERSCAN_API_KEY` - For blockchain analysis

#### Flask Configuration
- `SECRET_KEY` - Flask secret key (generate a secure random string)
- `FLASK_ENV` - Set to "production"
- `FLASK_DEBUG` - Set to "False" or "0"

### 3. Database Setup on Render
- [ ] Create PostgreSQL database on Render
- [ ] (Optional) Create Neo4j database on Render or Neo4j Aura
- [ ] Note database connection strings
- [ ] Update environment variables with database credentials

### 4. Render Service Configuration
- [ ] Connect Git repository to Render
- [ ] Select render.yaml for service configuration
- [ ] Verify service name and URL prefix
- [ ] Set build command (if needed)
- [ ] Set start command (if needed)

### 5. Testing
- [ ] Test all three services after deployment:
  - PersonaForge: `/personaforge`
  - BlackWire: `/blackwire`
  - ShadowStack: `/shadowstack`
- [ ] Test API endpoints
- [ ] Verify database connections
- [ ] Check error handling

## 📝 Notes
- The consolidated app uses a single PostgreSQL database (can be shared or separate)
- Neo4j is optional - app works without it (graph features disabled)
- API keys are optional - services degrade gracefully without them
- All three services are accessible under their respective URL prefixes
