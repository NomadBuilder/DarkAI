# Render Build Debug Commands

## Check Build Diagnostic Log

The build command saves a diagnostic log to `/tmp/ledger-build-diagnostic.log`. Run this in the Render shell:

```bash
# Check if diagnostic log exists
if [ -f /tmp/ledger-build-diagnostic.log ]; then
  echo "=== Full Diagnostic Log ==="
  cat /tmp/ledger-build-diagnostic.log
else
  echo "❌ Diagnostic log not found - build may have failed before creating it"
fi
```

## Check Build Output

```bash
cd /opt/render/project/src/ledger

# Check if out/ exists
echo "=== Checking out/ directory ==="
if [ -d "out" ]; then
  echo "✅ out/ exists"
  ls -la out/ | head -20
  if [ -f "out/index.html" ]; then
    echo "✅ index.html exists"
    echo "Size: $(ls -lh out/index.html | awk '{print $5}')"
  else
    echo "❌ index.html missing"
  fi
else
  echo "❌ out/ does NOT exist"
fi

# Check if .next/ exists (build ran but static export failed)
if [ -d ".next" ]; then
  echo "⚠️  .next/ exists - build ran but static export may have failed"
  echo "Checking next.config.js..."
  node -e "
    process.env.NODE_ENV='production';
    process.env.STATIC_EXPORT='true';
    const config = require('./next.config.js');
    console.log('output:', config.output || 'NOT SET');
    console.log('basePath:', config.basePath || 'NOT SET');
  "
fi
```

## Test Build Manually

```bash
cd /opt/render/project/src/ledger

# Set Node.js path
export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"

# Clear everything
rm -rf .next out node_modules

# Install dependencies
echo "=== Installing dependencies ==="
npm install 2>&1 | tail -20

# Check if TypeScript is installed
echo ""
echo "=== Checking TypeScript ==="
if npm list typescript > /dev/null 2>&1; then
  echo "✅ TypeScript is installed"
  npm list typescript
else
  echo "❌ TypeScript NOT installed"
fi

# Try building
echo ""
echo "=== Running build ==="
NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build 2>&1 | tail -50

# Check result
echo ""
echo "=== Build Result ==="
if [ -d "out" ] && [ -f "out/index.html" ]; then
  echo "✅ Build succeeded!"
  ls -lh out/index.html
else
  echo "❌ Build failed - out/ or index.html missing"
  if [ -d ".next" ]; then
    echo "⚠️  .next/ exists - check build errors above"
  fi
fi
```

## Check Render Build Logs

1. Go to Render Dashboard → Your Service → Logs
2. Look for the "Building Ledger" section
3. Check for any error messages after "🔨 Running build..."
4. Look for the diagnostic log output (last 50 lines should be shown if build fails)

## Common Issues

### Issue: "Cannot find module 'typescript'"
**Fix**: Already fixed - TypeScript is in dependencies ✅

### Issue: "Cannot find module 'tailwindcss'"
**Fix**: Already fixed - Tailwind is in dependencies ✅

### Issue: "PostCSS plugin not found"
**Fix**: Already fixed - PostCSS config uses object format ✅

### Issue: Build succeeds but `out/` doesn't exist
**Possible causes**:
- `STATIC_EXPORT=true` not set correctly
- `next.config.js` output setting not working
- File system sync delay (we have `sleep 2` but might need more)

**Check**:
```bash
cd /opt/render/project/src/ledger
node -e "
  process.env.NODE_ENV='production';
  process.env.STATIC_EXPORT='true';
  const config = require('./next.config.js');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('STATIC_EXPORT:', process.env.STATIC_EXPORT);
  console.log('Config output:', config.output || 'NOT SET');
  console.log('Config basePath:', config.basePath || 'NOT SET');
"
```

### Issue: Build fails silently
**Check**: The diagnostic log at `/tmp/ledger-build-diagnostic.log` should have the full error
