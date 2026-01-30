# Debugging Render Deployment Issue

## The Situation

- ✅ Works on localhost
- ❌ Doesn't work on Render (shows "Ledger not built yet")
- ✅ Build command worked before
- ❌ Latest deploy broke it

## What to Check First

### 1. Check Render Build Logs

Go to Render Dashboard → Your Service → Logs and look for:

- Does it say "✅ Ledger build completed" or "❌ Ledger build failed"?
- Any npm errors?
- Any Next.js build errors?
- Does the build command actually run?

### 2. The Build Command Structure

Your build command:
```bash
pip install -r requirements.txt && if [ -d "ledger" ]; then export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH" && cd ledger && rm -rf .next out node_modules && npm install --include=dev && NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build && cd .. && echo "✅ Ledger build completed" || echo "❌ Ledger build failed";
```

**Potential Issues:**

1. **Working Directory**: The `cd ledger` might fail if you're not in the right directory
2. **Error Handling**: The `|| echo` only catches the LAST command failure, not intermediate ones
3. **Silent Failures**: If `cd ledger` fails, the rest still runs (in wrong directory)

### 3. What Likely Changed

Since it worked before, something must have changed:

- **Flask route updated?** - The route now checks for directory existence (good for diagnostics)
- **Build output location?** - Maybe the build is creating `out/` but Flask is looking in wrong place
- **Working directory?** - Maybe the build runs from a different directory now
- **Node/npm version?** - Render might have updated Node.js version

## Diagnostic Steps

### Step 1: Check if Build Actually Runs

Look in Render logs for:
```
✅ Ledger build completed
```
or
```
❌ Ledger build failed
```

If you see neither, the build command might not be running at all.

### Step 2: Check Build Command Execution

The issue might be that `cd ledger` fails silently. Try this improved version that fails properly:

```bash
pip install -r requirements.txt && if [ -d "ledger" ]; then export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH" && (cd ledger && rm -rf .next out node_modules && npm install --include=dev && NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build && echo "✅ Ledger build completed") || (echo "❌ Ledger build failed" && exit 1); else echo "❌ Ledger directory not found"; fi
```

**Key change**: Wrapped the ledger build in `(...)` so if ANY command fails, the whole thing fails and Render knows.

### Step 3: Verify Build Output Location

The Flask route looks for: `/opt/render/project/src/ledger/out`

But the build might be creating it at a different location. Check:
- Where does `os.path.dirname(__file__)` point in Flask?
- Is the build running from `/opt/render/project/src` or somewhere else?

### Step 4: Use Improved Flask Route

The improved Flask route in `FLASK_ROUTE_IMPROVED.txt` will give you diagnostic info:
- What paths it checked
- Whether `ledger/` directory exists
- Whether `ledger/out/` exists
- What's actually in the ledger directory

This will tell you exactly what's wrong.

## Most Likely Causes (in order)

1. **Build command failing silently** - `cd ledger` fails but error is swallowed
2. **Wrong working directory** - Build runs from different location than expected
3. **Path mismatch** - Build creates `out/` but Flask looks in wrong place
4. **Build actually failing** - npm install or npm run build is failing

## Quick Fix to Try

Update your build command to fail properly:

```bash
pip install -r requirements.txt && if [ -d "ledger" ]; then export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH" && (cd ledger && rm -rf .next out node_modules && npm install --include=dev && NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build && echo "✅ Ledger build completed" || (echo "❌ Ledger build failed" && exit 1)) || echo "❌ Ledger directory not found or build failed"; fi
```

This will:
- Fail properly if any step fails
- Make Render show the build as failed (so you know)
- Give you better error messages

## Next Steps

1. Check Render build logs first - what do they actually say?
2. If build says it completed, check if `out/` directory actually exists
3. Update Flask route to use improved version for diagnostics
4. Fix build command to fail properly so errors are visible
