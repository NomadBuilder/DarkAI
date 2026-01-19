# How to Check Render Build Logs

## The Problem

You're seeing **runtime logs** (the Flask app running), but the build is failing silently. The 503 errors mean `ledger/out/` doesn't exist.

## How to View Build Logs

### Option 1: Render Dashboard (Easiest)

1. Go to **Render Dashboard** → Your Service (`darkai-consolidated`)
2. Click on **"Events"** or **"Builds"** tab (not "Logs")
3. Click on the most recent build
4. Look for the **"Building Ledger"** section

You should see output like:
```
==========================================
🚀 Starting build process
==========================================
📦 Building Ledger
...
```

### Option 2: Render Shell (Most Detailed)

1. Go to **Render Dashboard** → Your Service → **Shell**
2. Run:
```bash
# Check if build ran at all
ls -la /opt/render/project/src/ledger/out/ 2>&1 || echo "out/ does not exist"

# Check build logs (if they exist)
cat /tmp/ledger-build-diagnostic.log 2>&1 || echo "No diagnostic log found"

# Check if ledger directory exists
ls -la /opt/render/project/src/ledger/ | head -10
```

## What to Look For

### ✅ Good Build Log Should Show:
```
==========================================
🚀 Starting build process
==========================================
📦 Installing Python dependencies...
📦 Building Ledger
✅ ledger/ directory found!
✅ Node.js: v22.16.0
✅ npm: 10.9.2
📦 Running npm install...
🔨 Running build...
✅ Build command completed
✅ out/ directory exists
✅ out/index.html exists
```

### ❌ Bad Build Log Will Show:
- `❌ ERROR: ledger directory not found` → Ledger not in repo
- `❌ ERROR: Node.js not found` → NODE_VERSION not set
- `❌ npm install failed` → Dependency issues
- `❌ Build failed` → Build errors
- `❌ out/ directory NOT found` → Static export failed

## Quick Diagnostic Commands

Run these in Render Shell:

```bash
# 1. Check if ledger exists
cd /opt/render/project/src
test -d ledger && echo "✅ ledger exists" || echo "❌ ledger missing"

# 2. Check if build ran
cd ledger
test -d .next && echo "✅ Build ran (.next exists)" || echo "❌ Build never ran"
test -d out && echo "✅ out/ exists" || echo "❌ out/ missing"

# 3. Check Node.js
export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH"
node --version || echo "❌ Node.js not found"

# 4. Try manual build
rm -rf .next out node_modules
npm install 2>&1 | tail -10
NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build 2>&1 | tail -30
```

## Most Likely Issues

Based on the 503 errors, the build is probably:

1. **Not running at all** → Check if `ledger/` directory exists in repo
2. **Failing silently** → Check build logs for errors
3. **Succeeding but output in wrong place** → Check if `out/` is in `ledger/` or root

## Next Steps

1. **Check Build Logs** in Render Dashboard → Events/Builds
2. **If no build logs exist** → The build command isn't running (check `render.yaml`)
3. **If build logs show errors** → Fix those specific errors
4. **If build succeeds but no output** → Check `next.config.js` static export setting
