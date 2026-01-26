# Render Build Diagnostics Commands

Run these commands in the Render shell to diagnose build issues.

## Quick Diagnostic Commands

### 1. Check Current State
```bash
pwd
ls -la | head -20
```

### 2. Check Ledger Directory
```bash
ls -la ledger/ | head -20
test -d ledger && echo "✅ ledger exists" || echo "❌ ledger NOT FOUND"
```

### 3. Check Build Output
```bash
test -d ledger/out && echo "✅ out/ exists" || echo "❌ out/ NOT FOUND"
ls -la ledger/out/ 2>&1 | head -10
test -f ledger/out/index.html && echo "✅ index.html exists" || echo "❌ index.html missing"
```

### 4. Check Build Log
```bash
tail -100 /tmp/ledger-build-diagnostic.log 2>&1
```

### 5. Check Node.js Setup
```bash
echo "NODE_VERSION=$NODE_VERSION"
ls -d /opt/render/project/nodes/node-* 2>&1 | head -3
if [ -n "$NODE_VERSION" ]; then
  NODE_DIR="/opt/render/project/nodes/node-$NODE_VERSION"
  test -d "$NODE_DIR" && echo "✅ Node.js dir exists" || echo "❌ Node.js dir missing"
  $NODE_DIR/bin/node --version 2>&1
fi
```

### 6. Check Next.js Config
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

### 7. Check TypeScript Errors
```bash
cd ledger
if [ -f "node_modules/.bin/tsc" ]; then
  ./node_modules/.bin/tsc --noEmit 2>&1 | head -50
else
  echo "TypeScript not installed - need npm install first"
fi
cd ..
```

### 8. Check New Pages Exist
```bash
test -f ledger/app/about/page.tsx && echo "✅ about page" || echo "❌ about page MISSING"
test -f ledger/app/water/page.tsx && echo "✅ water page" || echo "❌ water page MISSING"
test -f ledger/app/water_billcalculator/page.tsx && echo "✅ water_billcalculator page" || echo "❌ water_billcalculator page MISSING"
```

### 9. Check Critical Files
```bash
cd ledger
test -f package.json && echo "✅ package.json" || echo "❌ package.json"
test -f tsconfig.json && echo "✅ tsconfig.json" || echo "❌ tsconfig.json"
test -f next.config.js && echo "✅ next.config.js" || echo "❌ next.config.js"
test -f app/layout.tsx && echo "✅ app/layout.tsx" || echo "❌ app/layout.tsx"
cd ..
```

### 10. Check Dependencies
```bash
cd ledger
if [ -d "node_modules" ]; then
  echo "✅ node_modules exists"
  test -d node_modules/next && echo "✅ next installed" || echo "❌ next missing"
  test -d node_modules/react && echo "✅ react installed" || echo "❌ react missing"
  test -d node_modules/typescript && echo "✅ typescript installed" || echo "❌ typescript missing"
else
  echo "❌ node_modules NOT FOUND"
fi
cd ..
```

### 11. Try Manual Build
```bash
cd ledger
export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH"
NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build 2>&1 | tail -100
cd ..
```

### 12. Check for Import Errors
```bash
cd ledger
grep -r "from.*@/" app/about app/water app/water_billcalculator 2>/dev/null | head -10
grep -r "React\." app/about components/sections/SectionWater*.tsx 2>/dev/null | head -10
cd ..
```

## Full Diagnostic Script

Run this complete diagnostic:

```bash
#!/bin/bash
echo "=== RENDER BUILD DIAGNOSTICS ==="
echo ""
echo "1. Directory structure:"
pwd
ls -la | head -20
echo ""
echo "2. Ledger directory:"
ls -la ledger/ | head -20
echo ""
echo "3. Build output:"
test -d ledger/out && echo "✅ out/ exists" || echo "❌ out/ NOT FOUND"
ls -la ledger/out/ 2>&1 | head -10
echo ""
echo "4. Build log:"
tail -100 /tmp/ledger-build-diagnostic.log 2>&1
echo ""
echo "5. Node.js:"
echo "NODE_VERSION=$NODE_VERSION"
ls -d /opt/render/project/nodes/node-* 2>&1 | head -3
echo ""
echo "6. Next.js config:"
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
echo ""
echo "7. TypeScript check:"
cd ledger
if [ -f "node_modules/.bin/tsc" ]; then
  ./node_modules/.bin/tsc --noEmit 2>&1 | head -50
fi
cd ..
echo ""
echo "8. New pages:"
test -f ledger/app/about/page.tsx && echo "✅ about" || echo "❌ about"
test -f ledger/app/water/page.tsx && echo "✅ water" || echo "❌ water"
test -f ledger/app/water_billcalculator/page.tsx && echo "✅ water_billcalculator" || echo "❌ water_billcalculator"
```

## Common Issues to Check

1. **Build log shows TypeScript errors** → Check for missing React imports
2. **out/ directory missing** → Check if static export is enabled
3. **Node.js not found** → Verify NODE_VERSION is set in Render dashboard
4. **npm install failed** → Check for dependency conflicts
5. **Import errors** → Verify all imports use correct paths
