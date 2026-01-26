# Commands to Complete the Build

## The Situation
- ✅ Static assets generated (.next/static/ exists)
- ❌ out/ directory not created (static export didn't finish)
- Build is timing out during the export phase

## Try to Complete the Build Manually

```bash
cd ledger
export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH"

# Check what we have
echo "=== Current State ==="
ls -la .next/ | head -10
echo ""
echo "Static assets:"
ls -la .next/static/ | head -5
echo ""

# Try to complete the build
echo "=== Attempting to complete build ==="
NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build 2>&1 | tee /tmp/manual-build.log | tail -100

# Check if out/ was created
if [ -d "out" ]; then
  echo "✅ SUCCESS! out/ directory created"
  ls -la out/ | head -10
  echo ""
  echo "Checking for index.html:"
  test -f out/index.html && echo "✅ index.html exists" || echo "❌ index.html missing"
else
  echo "❌ Build still didn't create out/"
  echo "Checking .next for clues:"
  find .next -name "*.json" -type f | head -5
fi
cd ..
```

## Check Build Progress

```bash
cd ledger

# Check if pages were generated
if [ -d ".next/server/app" ]; then
  echo "✅ Server pages generated"
  find .next/server/app -name "*.html" -type f | head -10
fi

# Check build manifest
if [ -f ".next/build-manifest.json" ]; then
  echo "✅ Build manifest exists"
  head -20 .next/build-manifest.json
fi

# Check routes manifest
if [ -f ".next/routes-manifest.json" ]; then
  echo "✅ Routes manifest exists"
  cat .next/routes-manifest.json
fi

cd ..
```

## Alternative: Check Render Dashboard

The build log might be in Render Dashboard:
1. Go to Render Dashboard
2. Click your service
3. Go to "Events" tab
4. Click the latest deploy
5. Look for build logs there

