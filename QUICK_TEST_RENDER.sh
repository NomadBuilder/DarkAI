#!/bin/bash
# Quick test commands for Render shell

echo "=== QUICK BUILD TEST ==="
echo ""

# 1. Check TypeScript errors
echo "1. Checking TypeScript errors..."
cd ledger
./node_modules/.bin/tsc --noEmit 2>&1 | head -30
cd ..

echo ""
echo "2. If no TypeScript errors, try disabling new pages:"
echo "   cd ledger/app"
echo "   mv about about.disabled"
echo "   mv water water.disabled"
echo "   mv water_billcalculator water_billcalculator.disabled"
echo ""
echo "3. Then try build:"
echo "   cd ledger"
echo "   NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build"
