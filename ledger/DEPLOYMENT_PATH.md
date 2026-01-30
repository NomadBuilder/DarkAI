# Deployment to darkai.ca/ledger

This guide covers deploying The Ledger to `darkai.ca/ledger` (path-based deployment).

## Configuration

The project is now configured for path-based deployment:

- ✅ `next.config.js` - Supports `BASE_PATH` environment variable
- ✅ `render.yaml` - Configured for static export with `/ledger` base path
- ✅ All assets will be served from `/ledger/` path

## Deployment Steps

### 1. Verify Configuration

The `render.yaml` is already configured for static deployment at `/ledger`:

```yaml
buildCommand: npm install && BASE_PATH=/ledger STATIC_EXPORT=true npm run build
```

### 2. Deploy to Render

1. **Push to Git:**
   ```bash
   git add render.yaml next.config.js
   git commit -m "Configure for darkai.ca/ledger deployment"
   git push
   ```

2. **In Render Dashboard:**
   - Go to your main `darkai.ca` service
   - Or create a new static site service
   - Connect your Git repository
   - Render will auto-detect `render.yaml`

3. **Configure Domain:**
   - If deploying as separate service: Add custom domain `darkai.ca`
   - Configure routing to serve at `/ledger` path
   - Or use reverse proxy in your main darkai.ca service

### 3. Routing Options

#### Option A: Separate Static Site Service

1. Deploy as static site on Render
2. In your main darkai.ca service, add reverse proxy:
   ```
   /ledger/* → your-static-service.onrender.com/*
   ```

#### Option B: Serve from Main Service

1. Build the static files locally:
   ```bash
   BASE_PATH=/ledger STATIC_EXPORT=true npm run build
   ```

2. Copy `out/` contents to your main darkai.ca service's static directory:
   ```bash
   cp -r out/* /path/to/darkai.ca/public/ledger/
   ```

3. Configure your main service to serve static files from `/ledger`

### 4. Verify Deployment

After deployment, verify:

- [ ] `darkai.ca/ledger` loads correctly
- [ ] All assets load (CSS, JS, images)
- [ ] Data files load from `/ledger/data/processed/`
- [ ] Navigation works
- [ ] No 404 errors in console

## Important Notes

### Base Path Configuration

- All internal links automatically use `/ledger` prefix
- Static assets are served from `/ledger/_next/`
- Data files are served from `/ledger/data/processed/`

### Testing Locally

To test the path-based deployment locally:

```bash
# Build with base path
BASE_PATH=/ledger STATIC_EXPORT=true npm run build

# Serve the static files (using a simple HTTP server)
cd out
python3 -m http.server 3000

# Visit: http://localhost:3000/ledger
```

### Troubleshooting

**Assets not loading:**
- Verify `BASE_PATH=/ledger` is set in build command
- Check that all paths are relative (they should be)
- Ensure reverse proxy is configured correctly

**404 errors:**
- Verify routing configuration
- Check that static files are in correct directory
- Ensure base path is set correctly

**Data files not loading:**
- Verify JSON files are in `public/data/processed/`
- Check browser console for fetch errors
- Ensure paths include `/ledger` prefix

## Alternative: Subdomain

If you prefer a subdomain (`ledger.darkai.ca`) instead:

1. Remove `BASE_PATH=/ledger` from build command
2. Deploy as separate service
3. Add subdomain in Render: `ledger.darkai.ca`

This is simpler but requires a separate service.
