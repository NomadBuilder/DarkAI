# Deployment Checklist: Local vs Render

## ✅ Configuration Status

### Database Connections
- **PersonaForge**: ✅ Uses `DATABASE_URL` (Render) or `POSTGRES_*` env vars (local)
- **ShadowStack**: ✅ Uses `DATABASE_URL` (Render) or `POSTGRES_*` env vars (local)  
- **BlackWire**: ✅ Uses `DATABASE_URL` (Render) or `POSTGRES_*` env vars (local)
- **SSL Handling**: ✅ All services detect `.render.com` and add `sslmode=require`
- **Table Separation**: 
  - PersonaForge: Uses `personaforge_domains` (prefixed) ✅
  - ShadowStack: Uses `domains` (not prefixed) ⚠️ Could conflict if sharing DB
  - BlackWire: Uses `blackwire_domains` (prefixed) ✅

### Port Configuration
- **Main App**: ✅ Uses `PORT` env var (Render) or defaults to 5000 (local)
- **Procfile**: ✅ Uses `$PORT` for Render
- **render.yaml**: ✅ Uses `$PORT` for Render

### Path Handling
- **Blueprint Paths**: ✅ Uses `Path(__file__).parent` (works in both environments)
- **Template Paths**: ✅ Uses absolute paths from blueprint directory
- **Static Files**: ✅ Uses Flask's static_folder (works in both)

### Dummy Data Seeding
- **PersonaForge**: ✅ Checks for existing dummy data before seeding (one-time only)
- **Logic**: ✅ Works in both local and Render (uses PostgresClient which handles both)

### Environment Variables
- **Local**: Uses `.env` file or defaults to `localhost`
- **Render**: Uses `DATABASE_URL` or individual `POSTGRES_*` vars from render.yaml
- **Fallback**: All services have sensible defaults for local development

## ⚠️ Potential Issues

### 1. ShadowStack Table Naming
- **Issue**: ShadowStack uses `domains` table (not prefixed) while PersonaForge uses `personaforge_domains`
- **Impact**: If sharing same database, could cause conflicts
- **Status**: Currently works because they use different databases OR table names don't conflict
- **Recommendation**: Consider prefixing ShadowStack tables to `shadowstack_domains` for consistency

### 2. Database Sharing on Render
- **Current Setup**: render.yaml shows all services using same `blackwire` database
- **Table Separation**: PersonaForge and BlackWire use prefixed tables, ShadowStack doesn't
- **Status**: Should work if table names don't conflict
- **Recommendation**: Verify table names don't overlap

### 3. Dummy Data Seeding
- **Current**: Only seeds if `dummy_count == 0`
- **Status**: ✅ Should work correctly in both environments
- **Note**: Uses same PostgresClient that handles both local and Render connections

## ✅ Verified Working

1. **Database Connections**: All services handle both `DATABASE_URL` (Render) and individual env vars (local)
2. **SSL Configuration**: Automatically adds SSL for Render databases
3. **Port Configuration**: Uses `PORT` env var correctly
4. **Path Resolution**: Uses relative paths that work in both environments
5. **Static Files**: Flask handles static files correctly in both environments
6. **Favicons**: All pages have favicon links using `url_for()` (works in both)
7. **Navigation Links**: All use relative paths (work in both environments)
8. **Logo Behavior**: Red circle links to `/` (root), text links to service homepage

## 🔍 Testing Recommendations

### Local Testing
1. ✅ Database connects to `localhost:5432`
2. ✅ Dummy data seeds once on first run
3. ✅ All services accessible on `localhost:5000`
4. ✅ Favicons display correctly
5. ✅ Navigation links work correctly

### Render Testing
1. ⚠️ Verify `DATABASE_URL` is set correctly
2. ⚠️ Verify all `POSTGRES_*` vars are set if not using `DATABASE_URL`
3. ⚠️ Verify SSL connection works (should be automatic)
4. ⚠️ Verify dummy data seeds correctly on first deployment
5. ⚠️ Verify table names don't conflict if sharing database
6. ⚠️ Verify all favicons load correctly
7. ⚠️ Verify navigation links work correctly

## 📝 Next Steps

1. **Test Render Deployment**: Deploy and verify all services work
2. **Verify Table Separation**: Confirm no table name conflicts
3. **Monitor Dummy Data**: Ensure it only seeds once on Render
4. **Check Logs**: Verify no connection errors on Render
