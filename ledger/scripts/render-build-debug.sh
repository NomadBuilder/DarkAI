#!/bin/bash
# Run this in Render shell to get comprehensive diagnostics
# Usage: bash render-build-debug.sh

echo "=========================================="
echo "🔍 Render Build Diagnostic Tool"
echo "=========================================="
echo ""

# Colors (if supported)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Environment check
echo "=== 1. Environment Check ==="
echo "Current directory: $(pwd)"
echo "User: $(whoami)"
echo ""

# Step 2: Check if ledger directory exists
echo "=== 2. Directory Structure ==="
if [ -d "ledger" ]; then
    echo "✅ ledger/ exists"
    echo "Contents:"
    ls -la ledger/ | head -10
else
    echo "❌ ledger/ does NOT exist"
    echo "Current directory contents:"
    ls -la | head -10
    exit 1
fi
echo ""

# Step 3: Check Node.js
echo "=== 3. Node.js Check ==="
export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH"
if command -v node > /dev/null 2>&1; then
    echo "✅ Node.js: $(node --version)"
    echo "✅ npm: $(npm --version)"
    echo "✅ Node path: $(which node)"
else
    echo "❌ Node.js not found in PATH"
    echo "Trying to find Node.js..."
    find /opt/render -name "node" -type f 2>/dev/null | head -3
    exit 1
fi
echo ""

# Step 4: Check critical files
echo "=== 4. Critical Files Check ==="
cd ledger || exit 1
for file in package.json tsconfig.json next.config.js postcss.config.js tailwind.config.js app/layout.tsx; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file MISSING"
    fi
done
echo ""

# Step 5: Check package.json dependencies
echo "=== 5. Dependencies Check ==="
echo "Checking if critical packages are in dependencies..."
for dep in typescript tailwindcss postcss autoprefixer; do
    if grep -q "\"$dep\"" package.json; then
        echo "✅ $dep in package.json"
    else
        echo "❌ $dep NOT in package.json"
    fi
done
echo ""

# Step 6: Check if node_modules exists
echo "=== 6. node_modules Check ==="
if [ -d "node_modules" ]; then
    echo "✅ node_modules/ exists"
    echo "Checking critical packages..."
    for pkg in typescript tailwindcss postcss autoprefixer; do
        if npm list $pkg > /dev/null 2>&1; then
            echo "  ✅ $pkg installed"
        else
            echo "  ❌ $pkg NOT installed"
        fi
    done
else
    echo "❌ node_modules/ does NOT exist"
    echo "Run: npm install"
fi
echo ""

# Step 7: Check PostCSS config
echo "=== 7. PostCSS Config Check ==="
if [ -f "postcss.config.js" ]; then
    echo "postcss.config.js contents:"
    cat postcss.config.js
    echo ""
    if grep -q "plugins: {" postcss.config.js; then
        echo "✅ PostCSS config uses object format"
    else
        echo "❌ PostCSS config should use object format"
    fi
else
    echo "❌ postcss.config.js missing"
fi
echo ""

# Step 8: Try manual build
echo "=== 8. Manual Build Test ==="
echo "Clearing old builds..."
rm -rf .next out

echo ""
echo "Running build with Render environment variables..."
export NODE_ENV=production
export BASE_PATH=/ledger
export STATIC_EXPORT=true

echo "Environment:"
echo "  NODE_ENV=$NODE_ENV"
echo "  BASE_PATH=$BASE_PATH"
echo "  STATIC_EXPORT=$STATIC_EXPORT"
echo ""

# Capture build output
BUILD_LOG="/tmp/render-build-test.log"
npm run build 2>&1 | tee "$BUILD_LOG"
BUILD_EXIT=${PIPESTATUS[0]}

echo ""
if [ $BUILD_EXIT -eq 0 ]; then
    echo "✅ Build command completed"
else
    echo "❌ Build failed with exit code $BUILD_EXIT"
    echo ""
    echo "Last 50 lines of build output:"
    tail -50 "$BUILD_LOG"
fi
echo ""

# Step 9: Verify output
echo "=== 9. Build Output Verification ==="
if [ -d "out" ]; then
    echo "✅ out/ directory exists"
    echo "Contents:"
    ls -la out/ | head -15
    
    if [ -f "out/index.html" ]; then
        echo ""
        echo "✅ out/index.html exists"
        echo "Size: $(ls -lh out/index.html | awk '{print $5}')"
    else
        echo ""
        echo "❌ out/index.html MISSING"
    fi
else
    echo "❌ out/ directory does NOT exist"
    
    if [ -d ".next" ]; then
        echo ""
        echo "⚠️  .next/ exists - build ran but static export failed"
        echo "Checking next.config.js output setting..."
        node -e "
            process.env.NODE_ENV='production';
            process.env.STATIC_EXPORT='true';
            try {
                const config = require('./next.config.js');
                console.log('output:', config.output || 'NOT SET');
                console.log('basePath:', config.basePath || 'NOT SET');
            } catch(e) {
                console.error('Error reading config:', e.message);
            }
        "
    fi
fi

echo ""
echo "=========================================="
echo "Diagnostic complete!"
echo "Full build log saved to: $BUILD_LOG"
echo "=========================================="
