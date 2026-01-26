# Render Shell Diagnostic Commands

Run these commands in the Render shell if the build still fails.

## Quick Diagnostic (Run First)

```bash
# 1. Check current state
pwd
ls -la | head -20

# 2. Check if ledger exists
test -d ledger && echo "✅ ledger exists" || echo "❌ ledger NOT FOUND"
ls -la ledger/ | head -15

# 3. Check if build ran
test -d ledger/.next && echo "✅ .next exists (build started)" || echo "❌ .next missing"
test -d ledger/out && echo "✅ out exists (build succeeded)" || echo "❌ out missing"

# 4. Check NODE_VERSION
echo "NODE_VERSION=$NODE_VERSION"
ls -d /opt/render/project/nodes/node-* 2>&1 | head -3
```

## Check Build Log

```bash
# Most important - check the actual build error
tail -100 /tmp/ledger-build-diagnostic.log 2>&1 || echo "Log file not found"
```

## Check TypeScript Errors

```bash
cd ledger
./node_modules/.bin/tsc --noEmit 2>&1 | head -50
cd ..
```

## Check Next.js Config

```bash
cd ledger
NODE_ENV=production STATIC_EXPORT=true BASE_PATH=/ledger node -e "
  process.env.NODE_ENV='production';
  process.env.STATIC_EXPORT='true';
  process.env.BASE_PATH='/ledger';
  const config = require('./next.config.js');
  console.log('output:', config.output || 'NOT SET');
  console.log('basePath:', config.basePath || 'NOT SET');
"
cd ..
```

## Check New Pages Exist

```bash
test -f ledger/app/about/page.tsx && echo "✅ about page" || echo "❌ about MISSING"
test -f ledger/app/water/page.tsx && echo "✅ water page" || echo "❌ water MISSING"
test -f ledger/app/water_billcalculator/page.tsx && echo "✅ water_billcalculator page" || echo "❌ water_billcalculator MISSING"
```

## Try Manual Build

```bash
cd ledger
export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH"
NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build 2>&1 | tail -100
cd ..
```

## Check for Import Errors

```bash
cd ledger
# Check if components exist
test -f components/TopNavigation.tsx && echo "✅ TopNavigation" || echo "❌ TopNavigation"
test -f components/sections/SectionWaterOverview.tsx && echo "✅ SectionWaterOverview" || echo "❌ SectionWaterOverview"

# Check for React import issues
grep -r "import React" app/about app/water components/sections/SectionWater*.tsx 2>/dev/null | head -5
cd ..
```

## Check File Structure

```bash
# Verify all pages are in app/ directory
find ledger -name "page.tsx" -type f ! -path "*/node_modules/*" | sort

# Check for duplicate files
find ledger -name "page.tsx" -type f ! -path "*/node_modules/*" ! -path "*/app/*"
```

## Full Diagnostic Script

```bash
#!/bin/bash
echo "=== RENDER BUILD DIAGNOSTICS ==="
echo ""
echo "1. Current directory:"
pwd
echo ""
echo "2. Ledger directory:"
test -d ledger && echo "✅ ledger exists" || echo "❌ ledger NOT FOUND"
ls -la ledger/ | head -15
echo ""
echo "3. Build artifacts:"
test -d ledger/.next && echo "✅ .next exists" || echo "❌ .next missing"
test -d ledger/out && echo "✅ out exists" || echo "❌ out missing"
echo ""
echo "4. NODE_VERSION:"
echo "NODE_VERSION=$NODE_VERSION"
echo ""
echo "5. Build log:"
tail -100 /tmp/ledger-build-diagnostic.log 2>&1 || echo "Log not found"
echo ""
echo "6. New pages:"
test -f ledger/app/about/page.tsx && echo "✅ about" || echo "❌ about"
test -f ledger/app/water/page.tsx && echo "✅ water" || echo "❌ water"
test -f ledger/app/water_billcalculator/page.tsx && echo "✅ water_billcalculator" || echo "❌ water_billcalculator"
echo ""
echo "7. TypeScript check:"
cd ledger
./node_modules/.bin/tsc --noEmit 2>&1 | head -30
cd ..
```

## Most Common Issues

1. **NODE_VERSION not set** → Set `NODE_VERSION=22.16.0` in Render dashboard
2. **TypeScript errors** → Check output of `tsc --noEmit` command
3. **Missing out/ directory** → Check build log for errors
4. **Import errors** → Verify all components exist
