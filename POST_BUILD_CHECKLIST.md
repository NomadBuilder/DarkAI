# Post-Build Verification Checklist

Run these commands in Render shell AFTER the build completes:

## 1. Check if Build Succeeded

```bash
# Check if out/ directory was created
cd ledger
if [ -d "out" ]; then
  echo "✅ SUCCESS! out/ directory exists"
  ls -la out/ | head -10
else
  echo "❌ FAILED: out/ directory missing"
  exit 1
fi
cd ..
```

## 2. Verify Critical Files

```bash
cd ledger

# Check for index.html (most important!)
if [ -f "out/index.html" ]; then
  echo "✅ index.html exists"
  echo "File size: $(ls -lh out/index.html | awk '{print $5}')"
else
  echo "❌ index.html MISSING"
  exit 1
fi

# Check for _next directory (static assets)
if [ -d "out/_next" ]; then
  echo "✅ _next directory exists (static assets)"
  ls -la out/_next/ | head -5
else
  echo "⚠️  _next directory missing (might be okay if basePath is set)"
fi

# Check for data directory
if [ -d "out/data" ]; then
  echo "✅ data directory exists"
  ls -la out/data/ | head -5
else
  echo "⚠️  data directory missing (check if data files are in public/)"
fi

cd ..
```

## 3. Check Build Output Structure

```bash
cd ledger/out

# List all top-level files/directories
echo "=== Top-level structure ==="
ls -la | head -15

# Check for pages
echo ""
echo "=== Pages ==="
find . -name "index.html" -type f | head -10

# Check for app routes
echo ""
echo "=== App routes ==="
find . -type d -name "app" | head -5

cd ../..
```

## 4. Verify from Parent Directory

```bash
# Check that Flask can see the files
if [ -d "ledger/out" ]; then
  echo "✅ ledger/out/ accessible from parent directory"
  if [ -f "ledger/out/index.html" ]; then
    echo "✅ ledger/out/index.html accessible"
    echo "File size: $(ls -lh ledger/out/index.html | awk '{print $5}')"
  else
    echo "❌ ledger/out/index.html NOT accessible"
  fi
else
  echo "❌ ledger/out/ NOT accessible from parent directory"
fi
```

## 5. Test Flask Route (if possible)

```bash
# Check if Flask app can serve the files
# This will only work if Flask is running
curl -s http://localhost:$PORT/ledger 2>&1 | head -20 || echo "Flask not running or port not set"
```

## 6. Quick Summary Command

```bash
echo "=== BUILD VERIFICATION SUMMARY ==="
echo ""
echo "1. out/ directory:"
test -d ledger/out && echo "   ✅ EXISTS" || echo "   ❌ MISSING"
echo ""
echo "2. index.html:"
test -f ledger/out/index.html && echo "   ✅ EXISTS ($(ls -lh ledger/out/index.html | awk '{print $5}'))" || echo "   ❌ MISSING"
echo ""
echo "3. _next/ directory:"
test -d ledger/out/_next && echo "   ✅ EXISTS" || echo "   ⚠️  MISSING (might be okay)"
echo ""
echo "4. Accessible from parent:"
test -f ledger/out/index.html && echo "   ✅ YES" || echo "   ❌ NO"
echo ""
if [ -d "ledger/out" ] && [ -f "ledger/out/index.html" ]; then
  echo "🎉 BUILD SUCCESSFUL! Ready to serve."
else
  echo "❌ BUILD FAILED - Check errors above"
fi
```

## What to Look For

✅ **SUCCESS Indicators:**
- `ledger/out/` directory exists
- `ledger/out/index.html` exists (should be > 1KB)
- `ledger/out/_next/` directory exists (static assets)
- Files are accessible from parent directory

❌ **FAILURE Indicators:**
- `out/` directory missing
- `index.html` missing
- Build log shows TypeScript errors
- Build log shows timeout/killed messages

