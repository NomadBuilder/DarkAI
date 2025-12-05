# Production Deployment Checklist for Render

## Pre-Deployment Verification

### 1. Database Configuration ✅
- [x] PostgreSQL client supports both `DATABASE_URL` and individual `POSTGRES_*` variables
- [x] Database connection uses environment variables (no hardcoded values)
- [x] Connection timeout configured (5 seconds)
- [x] Transaction error handling with rollback
- [x] Table creation includes `IF NOT EXISTS` and `ALTER TABLE` for schema updates

**Status**: ✅ Ready - `postgres_client.py` handles both local and production database URLs

### 2. Environment Variables
**Required in Render Dashboard:**
- [x] `POSTGRES_HOST` (auto-set from database link)
- [x] `POSTGRES_PORT` (auto-set from database link)
- [x] `POSTGRES_USER` (auto-set from database link)
- [x] `POSTGRES_PASSWORD` (auto-set from database link)
- [x] `POSTGRES_DB` (auto-set from database link)
- [x] `FLASK_ENV=production` (set in render.yaml)
- [x] `SECRET_KEY` (auto-generated in render.yaml)
- [x] `SKIP_NEO4J=1` (set in render.yaml - can be changed to 0 if Neo4j available)
- [ ] `API_TIMEOUT_SECONDS=25` (optional - defaults to 25s, already configured)

**Optional API Keys** (set manually if needed):
- `BUILTWITH_API_KEY`
- `IPLOCATE_API_KEY`
- `OPENAI_API_KEY`
- `SERPAPI_API_KEY`
- `RESEND_API_KEY` (for contact form)
- `SMTP_USERNAME` / `SMTP_PASSWORD` (alternative to Resend)

### 3. Port Configuration ✅
- [x] Uses `os.getenv('PORT', 5000)` - Render sets PORT automatically
- [x] Gunicorn configured in render.yaml with `--bind 0.0.0.0:$PORT`

### 4. Neo4j Configuration ✅
- [x] Neo4j is optional - can be skipped with `SKIP_NEO4J=1`
- [x] No hardcoded Neo4j connection strings
- [x] Graceful fallback if Neo4j unavailable

### 5. File Paths ✅
- [x] No hardcoded `/tmp/` paths in production code
- [x] Logging uses environment-based paths
- [x] Static files served via Flask's static folder
- [x] Templates use relative paths

### 6. API Endpoints ✅
- [x] All routes use relative paths (no hardcoded localhost)
- [x] API endpoints work with both local and production domains
- [x] CORS configured for cross-origin requests

### 7. Enrichment Pipeline ✅
- [x] Timeouts configured (25s default, 30s for slow operations)
- [x] Error handling with graceful fallbacks
- [x] No blocking operations that would hang in production
- [x] Date serialization fixed for JSON storage

### 8. Static Assets ✅
- [x] Chart.js loaded from CDN
- [x] All static files in `/static/` directory
- [x] Favicon configured

## Deployment Steps

### Step 1: Pre-Deployment Checks
```bash
# 1. Verify no hardcoded localhost references
grep -r "localhost:5000\|localhost:5001\|127.0.0.1" --exclude-dir=node_modules --exclude="*.log" .

# 2. Check for any .env files that shouldn't be committed
git status | grep .env

# 3. Verify requirements.txt is up to date
pip freeze > requirements_check.txt
```

### Step 2: Environment Variables in Render
1. Go to Render Dashboard → Your Service → Environment
2. **Set these manually:**
   - `SKIP_NEO4J=1` (if Neo4j not available)
   - `API_TIMEOUT_SECONDS=25` (optional, already default)
   - Any API keys you want to use

3. **Verify auto-set variables** (from database link):
   - `POSTGRES_HOST`
   - `POSTGRES_PORT`
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DB`

### Step 3: Database Migration
**IMPORTANT**: The database schema will be created automatically on first connection, but you may need to:

1. **If tables already exist**: The `ALTER TABLE` statements in `postgres_client.py` will add new columns automatically
2. **If starting fresh**: Tables will be created with all new columns included

**To verify schema after deployment:**
```sql
-- Check if new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'personaforge_domain_enrichment' 
AND column_name IN ('web_scraping', 'extracted_content', 'nlp_analysis', 'ssl_certificate');
```

### Step 4: Post-Deployment Verification

1. **Health Check:**
   - Visit: `https://your-domain.com/`
   - Should show Dark AI homepage

2. **PersonaForge:**
   - Visit: `https://your-domain.com/personaforge`
   - Check dashboard loads
   - Verify database connection (should show stats)

3. **Reports:**
   - Visit: `https://your-domain.com/reports/vendor-intelligence-report`
   - Verify charts load
   - Check data displays correctly

4. **API Endpoints:**
   - Test: `https://your-domain.com/personaforge/api/homepage-stats`
   - Should return JSON with stats

5. **Database Connection:**
   - Check Render logs for any database connection errors
   - Verify tables are created/updated

### Step 5: Data Migration (if needed)

If you have local data to migrate:

1. **Export from local:**
   ```bash
   python3 personaforge/export_to_production.py
   ```

2. **Import to production:**
   - Use Render's database connection
   - Or use the sync script with production DATABASE_URL

## Common Issues & Solutions

### Issue: "PostgreSQL database not connected"
**Solution**: 
- Verify database is linked in Render dashboard
- Check `POSTGRES_*` environment variables are set
- Check Render logs for connection errors

### Issue: "Neo4j connection failed"
**Solution**: 
- Set `SKIP_NEO4J=1` in Render environment variables
- Neo4j is optional - PersonaForge works without it

### Issue: "Module not found" errors
**Solution**: 
- Verify `requirements.txt` includes all dependencies
- Check Render build logs for missing packages

### Issue: "Timeout errors during enrichment"
**Solution**: 
- Timeouts are already increased (25s default, 30s for slow ops)
- This is expected for slow/unresponsive domains
- Enrichment continues even if some operations timeout

### Issue: "Tables don't exist"
**Solution**: 
- Tables are created automatically on first connection
- Check `_create_tables()` is being called
- Verify database user has CREATE TABLE permissions

## Testing Checklist

- [ ] Homepage loads
- [ ] PersonaForge dashboard loads
- [ ] Vendor Intelligence Directory loads
- [ ] Vendor Intelligence Report loads with data
- [ ] Charts display correctly
- [ ] API endpoints return data
- [ ] Database connection works
- [ ] No console errors in browser
- [ ] Navigation menu works
- [ ] Mobile responsive design works

## Rollback Plan

If something goes wrong:

1. **Revert to previous commit:**
   ```bash
   git revert HEAD
   git push
   ```

2. **Or redeploy previous version:**
   - Render dashboard → Deploys → Select previous successful deploy → Redeploy

3. **Database rollback** (if schema changes caused issues):
   - Restore from backup
   - Or manually drop/recreate tables

## Notes

- All database operations use transactions with rollback on errors
- Enrichment pipeline has timeout protection
- Date serialization is handled correctly
- No hardcoded paths or localhost references
- Environment variables properly configured
- Static assets served correctly
- API endpoints work with relative paths

**Status**: ✅ Ready for production deployment

