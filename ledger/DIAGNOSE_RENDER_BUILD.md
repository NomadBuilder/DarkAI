# Diagnosing Render Build Issues

## The Problem

The Flask route is returning:
```json
{
  "error": "Ledger not built yet",
  "ledger_dir": "/opt/render/project/src/ledger/out",
  "message": "The ledger build may still be in progress. Please check Render build logs."
}
```

This means the `ledger/out` directory doesn't exist after the build.

## Likely Causes

1. **Build command failing silently** - The `|| echo "❌ Ledger build failed"` only catches the last command
2. **npm install flag issue** - `npm install --include=dev` might not be recognized
3. **Build succeeding but wrong directory** - Build might be creating output elsewhere

## Quick Fix Options

### Option 1: Fix the Build Command (Recommended)

Even though you said the build command won't change, the issue is likely here. The current command:

```bash
pip install -r requirements.txt && if [ -d "ledger" ]; then export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH" && cd ledger && rm -rf .next out node_modules && npm install --include=dev && NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build && cd .. && echo "✅ Ledger build completed" || echo "❌ Ledger build failed";
```

**Problems:**
- `npm install --include=dev` - This flag doesn't exist. Should be `npm install` or `npm ci`
- Error handling only catches the last command
- If `cd ledger` fails, the rest still runs (wrong directory)

**Fixed version:**
```bash
pip install -r requirements.txt && if [ -d "ledger" ]; then export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH" && (cd ledger && rm -rf .next out node_modules && npm install && NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build && echo "✅ Ledger build completed" || (echo "❌ Ledger build failed" && exit 1)) || echo "❌ Ledger directory not found or build failed";
```

**Key changes:**
- Removed `--include=dev` flag (npm install includes dev deps by default)
- Wrapped ledger build in subshell `(...)` so errors propagate
- Added `exit 1` on failure so Render knows the build failed

### Option 2: Update Flask Route (Works with current build)

Use the improved Flask route in `FLASK_ROUTE_IMPROVED.txt` which:
- Checks multiple possible paths
- Provides diagnostic information
- Helps identify where the build actually created files

### Option 3: Add Build Verification

Add this to the end of your build command to verify the build:

```bash
&& (test -d ledger/out && test -f ledger/out/index.html && echo "✅ Ledger build verified" || (echo "❌ Ledger build verification failed - out/ directory or index.html missing" && exit 1))
```

## How to Debug on Render

1. **Check Render build logs** - Look for:
   - "✅ Ledger build completed" or "❌ Ledger build failed"
   - Any npm errors
   - Any Next.js build errors

2. **SSH into Render** (if possible) and run:
   ```bash
   cd /opt/render/project/src
   ls -la ledger/
   ls -la ledger/out/  # Check if this exists
   ```

3. **Check the Flask route** - The improved route will show diagnostic info

## Recommended Action

**Update the build command in darkai-consolidated/render.yaml** to use the fixed version above. This will:
- Properly install npm dependencies
- Fail the build if ledger build fails (so you know immediately)
- Verify the build output exists

The build command change is necessary because the current one can fail silently.
