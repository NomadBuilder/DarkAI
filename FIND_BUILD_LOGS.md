# How to Find Build Logs in Render

## The Issue

Clicking "Deploy started" in Events just goes to GitHub. We need the **actual build output**.

## Where to Find Build Logs

### Option 1: Logs Tab (During/After Build)

1. Go to **Render Dashboard** → Your Service (`darkai-consolidated`)
2. Click **"Logs"** tab (in the left sidebar under MONITOR)
3. **Scroll up** - build logs appear at the top when a build is running
4. Look for lines starting with:
   - `🚀 Starting build process`
   - `📦 Building Ledger`
   - `==========================================`

**Note**: Build logs only show while the build is running or immediately after. If the build finished, they might be at the top of the logs.

### Option 2: Manual Trigger (See Build Output)

1. Go to **Render Dashboard** → Your Service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Watch the **Logs** tab in real-time
4. You'll see the full build output as it happens

### Option 3: Shell (Check Build Status)

1. Go to **Render Dashboard** → Your Service → **Shell**
2. Run:
```bash
cd /opt/render/project/src
bash QUICK_BUILD_CHECK.sh
```

Or manually:
```bash
cd /opt/render/project/src
ls -la ledger/out/ 2>&1 || echo "❌ Build never completed - out/ missing"
```

## What You're Looking For

The build logs should show something like:

```
==========================================
🚀 Starting build process
==========================================
Current directory: /opt/render/project/src
Directory contents:
...
📦 Installing Python dependencies...
...
==========================================
📦 Building Ledger
==========================================
Checking for ledger directory...
✅ ledger/ directory found!
✅ Node.js: v22.16.0
✅ npm: 10.9.2
📦 Running npm install...
🔨 Running build...
```

## If You Don't See Build Logs

**Possible reasons:**

1. **Build command isn't running** → Check `render.yaml` is correct
2. **Build logs scrolled past** → Try manual deploy to see them
3. **Build failed immediately** → Check for errors at the start
4. **Wrong service** → Make sure you're looking at `darkai-consolidated`

## Quick Test

Run this in Render Shell to see if build ran:

```bash
cd /opt/render/project/src/ledger
test -d out && echo "✅ Build completed" || echo "❌ Build failed - no out/"
test -d .next && echo "✅ Build ran" || echo "❌ Build never ran"
```

## Next Steps

1. **Check Logs tab** - scroll to the top, look for build output
2. **If nothing there** - trigger a manual deploy and watch logs in real-time
3. **If build logs show errors** - fix those specific errors
4. **If no build logs at all** - the build command isn't running (check render.yaml)
