# Complete Integration Guide: Ledger → darkai-consolidated

## Overview

This guide will help you integrate The Ledger project into your existing `darkai-consolidated` Flask app so it's available at `darkai.ca/ledger` without needing a separate Render service.

## Quick Start (Automated)

Run the integration script:

```bash
cd /Users/aazir/Desktop/Coding/personalprojects/FFord
./integrate_to_darkai.sh
```

This will:
1. Copy the ledger project to `darkai-consolidated/ledger/`
2. Build it with the correct base path
3. Update `app.py` with the `/ledger` route
4. Update `render.yaml` with the build command

## Manual Integration Steps

### Step 1: Copy Project

```bash
# Copy FFord to darkai-consolidated
cp -r /Users/aazir/Desktop/Coding/personalprojects/FFord \
      /Users/aazir/Desktop/Coding/DarkAI/DarkAI-consolidated/ledger
```

### Step 2: Build Ledger

```bash
cd /Users/aazir/Desktop/Coding/DarkAI/DarkAI-consolidated/ledger
npm install
BASE_PATH=/ledger STATIC_EXPORT=true npm run build
```

This creates the static files in `ledger/out/` with all paths prefixed with `/ledger`.

### Step 3: Add Flask Route

Edit `/Users/aazir/Desktop/Coding/DarkAI/DarkAI-consolidated/app.py`

Add this code **before** the health check route (around line 1043):

```python
# Serve Ledger static files at /ledger path
@app.route('/ledger')
@app.route('/ledger/')
@app.route('/ledger/<path:path>')
def serve_ledger(path='index.html'):
    """Serve the Ledger static files at /ledger path"""
    ledger_dir = os.path.join(os.path.dirname(__file__), 'ledger', 'out')
    if path == 'index.html' or not path:
        return send_from_directory(ledger_dir, 'index.html')
    return send_from_directory(ledger_dir, path)
```

### Step 4: Update render.yaml

Edit `/Users/aazir/Desktop/Coding/DarkAI/DarkAI-consolidated/render.yaml`

Change the `buildCommand` from:
```yaml
buildCommand: pip install --disable-pip-version-check --upgrade pip && pip install --disable-pip-version-check -r requirements.txt
```

To:
```yaml
buildCommand: |
  pip install --disable-pip-version-check --upgrade pip && pip install --disable-pip-version-check -r requirements.txt
  # Build ledger
  cd ledger && npm install && BASE_PATH=/ledger STATIC_EXPORT=true npm run build && cd ..
```

**Important:** The `|` makes it a multi-line string, so the ledger build runs after Python dependencies.

### Step 5: Test Locally

```bash
cd /Users/aazir/Desktop/Coding/DarkAI/DarkAI-consolidated
python3 app.py
```

Visit: `http://localhost:5000/ledger` (or whatever port it uses)

### Step 6: Deploy

```bash
cd /Users/aazir/Desktop/Coding/DarkAI/DarkAI-consolidated
git add ledger/ app.py render.yaml
git commit -m "Add Ledger project at /ledger path"
git push
```

Render will automatically:
1. Install Python dependencies
2. Build the ledger (npm install + build)
3. Deploy everything
4. Serve `/ledger` through Flask

## File Structure After Integration

```
DarkAI-consolidated/
├── app.py                    # ✅ Updated with /ledger route
├── render.yaml               # ✅ Updated build command
├── ledger/                   # ✅ New directory
│   ├── app/
│   ├── components/
│   ├── public/
│   │   └── data/processed/  # JSON data files
│   ├── out/                  # ✅ Built static files (after build)
│   ├── package.json
│   └── ...
└── static/                   # Existing static files
```

## How It Works

1. **Build Time (Render):**
   - Python dependencies install
   - Ledger builds with `BASE_PATH=/ledger` → creates `ledger/out/` with `/ledger`-prefixed paths

2. **Runtime (Flask):**
   - Flask serves the main site
   - `/ledger` routes serve files from `ledger/out/`
   - All assets (CSS, JS, data) load from `/ledger/...`

## Verification Checklist

After deployment:

- [ ] `darkai.ca/ledger` loads correctly
- [ ] All CSS/JS assets load (check Network tab)
- [ ] Data files load from `/ledger/data/processed/`
- [ ] Navigation works
- [ ] No 404 errors in console
- [ ] Interactive features work

## Troubleshooting

### Assets Not Loading

**Problem:** CSS/JS files return 404

**Solution:** 
- Verify `BASE_PATH=/ledger` was used in build
- Check that files are in `ledger/out/_next/`
- Verify Flask route is serving from `ledger/out/`

### Data Files Not Loading

**Problem:** JSON files return 404

**Solution:**
- Verify `public/data/processed/` files exist
- Check they're copied to `ledger/out/data/processed/` during build
- Verify paths in browser Network tab include `/ledger/`

### Build Fails on Render

**Problem:** Build command fails

**Solution:**
- Check Render build logs
- Verify Node.js is available (may need to install it)
- Check that `ledger/package.json` exists
- Ensure `BASE_PATH=/ledger` is set correctly

### Route Conflicts

**Problem:** `/ledger` route doesn't work

**Solution:**
- Verify route is added before catch-all routes
- Check route order in `app.py`
- Ensure no other route matches `/ledger` first

## Notes

- ✅ No conflicts: All CSS/JS is scoped, no global variables
- ✅ Self-contained: Ledger doesn't interfere with other services
- ✅ Static files: No server-side rendering needed
- ✅ Single service: Uses existing Render service (no extra cost)

## Support Files

Reference files created:
- `FLASK_ROUTE.txt` - Flask route code to add
- `RENDER_BUILD_UPDATE.txt` - render.yaml update
- `INTEGRATION_STEPS.md` - Detailed steps
- `integrate_to_darkai.sh` - Automated script

## Next Steps After Integration

1. Test locally first
2. Commit and push
3. Monitor Render build logs
4. Verify `darkai.ca/ledger` works
5. Update any links/documentation

That's it! The Ledger will be available at `darkai.ca/ledger` using your existing Render service.
