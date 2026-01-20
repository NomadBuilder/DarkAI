#!/bin/bash
# Test build in a way that mimics Render's environment
# Run this locally to catch issues before deploying

set -e  # Exit on error
set -x  # Print commands

echo "=========================================="
echo "🧪 Testing Build (Render Simulation)"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0

# Function to check and report
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Step 1: Check Node.js
echo ""
echo "Step 1: Checking Node.js..."
NODE_VERSION=$(node --version 2>&1)
check "Node.js available: $NODE_VERSION" || exit 1

NPM_VERSION=$(npm --version 2>&1)
check "npm available: $NPM_VERSION" || exit 1

# Step 2: Check critical files
echo ""
echo "Step 2: Checking critical files..."
test -f "package.json" && check "package.json exists" || ERRORS=$((ERRORS + 1))
test -f "tsconfig.json" && check "tsconfig.json exists" || ERRORS=$((ERRORS + 1))
test -f "next.config.js" && check "next.config.js exists" || ERRORS=$((ERRORS + 1))
test -f "postcss.config.js" && check "postcss.config.js exists" || ERRORS=$((ERRORS + 1))
test -f "tailwind.config.js" && check "tailwind.config.js exists" || ERRORS=$((ERRORS + 1))
test -f "app/layout.tsx" && check "app/layout.tsx exists" || ERRORS=$((ERRORS + 1))

# Step 3: Verify PostCSS config format
echo ""
echo "Step 3: Verifying PostCSS config..."
if grep -q "plugins: {" postcss.config.js; then
    check "PostCSS config uses object format"
else
    echo -e "${RED}❌ PostCSS config should use object format: plugins: { tailwindcss: {}, autoprefixer: {} }${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Step 4: Check package.json dependencies
echo ""
echo "Step 4: Checking critical dependencies in package.json..."
MISSING_DEPS=0
for dep in typescript tailwindcss postcss autoprefixer "@types/node" "@types/react" "@types/react-dom"; do
    if grep -q "\"$dep\"" package.json; then
        check "$dep in dependencies"
    else
        echo -e "${RED}❌ $dep missing from dependencies${NC}"
        MISSING_DEPS=$((MISSING_DEPS + 1))
        ERRORS=$((ERRORS + 1))
    fi
done

# Step 5: Clean install (simulate Render)
echo ""
echo "Step 5: Clean install (simulating Render environment)..."
rm -rf node_modules .next out
echo "Cleared node_modules, .next, and out"

# Install with production=false (Render installs all deps)
npm install --production=false 2>&1 | tail -20
check "npm install completed"

# Step 6: Verify critical packages are installed
echo ""
echo "Step 6: Verifying packages are installed..."
for pkg in typescript tailwindcss postcss autoprefixer; do
    if npm list $pkg > /dev/null 2>&1; then
        check "$pkg is installed"
    else
        echo -e "${RED}❌ $pkg is NOT installed${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

# Step 7: Test build
echo ""
echo "Step 7: Testing build with Render environment variables..."
export NODE_ENV=production
export BASE_PATH=/ledger
export STATIC_EXPORT=true

BUILD_OUTPUT=$(npm run build 2>&1)
BUILD_EXIT=$?

if [ $BUILD_EXIT -eq 0 ]; then
    check "Build completed successfully"
else
    echo -e "${RED}❌ Build failed with exit code $BUILD_EXIT${NC}"
    echo ""
    echo "Last 30 lines of build output:"
    echo "$BUILD_OUTPUT" | tail -30
    ERRORS=$((ERRORS + 1))
fi

# Step 8: Verify build output
echo ""
echo "Step 8: Verifying build output..."
if [ -d "out" ]; then
    check "out/ directory exists"
    
    if [ -f "out/index.html" ]; then
        check "out/index.html exists"
        SIZE=$(ls -lh out/index.html | awk '{print $5}')
        echo "  File size: $SIZE"
    else
        echo -e "${RED}❌ out/index.html missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check for _next directory
    if [ -d "out/_next" ]; then
        check "out/_next/ directory exists"
    else
        echo -e "${YELLOW}⚠️  out/_next/ missing (may be normal for static export)${NC}"
    fi
    
    # Check for data files
    if [ -d "out/data/processed" ]; then
        check "out/data/processed/ exists"
        DATA_FILES=$(ls out/data/processed/*.json 2>/dev/null | wc -l)
        echo "  Found $DATA_FILES JSON files"
    else
        echo -e "${YELLOW}⚠️  out/data/processed/ missing${NC}"
    fi
else
    echo -e "${RED}❌ out/ directory does NOT exist${NC}"
    ERRORS=$((ERRORS + 1))
    
    # Check if .next exists (build ran but export failed)
    if [ -d ".next" ]; then
        echo -e "${YELLOW}⚠️  .next/ exists but out/ doesn't - static export may have failed${NC}"
        echo "Checking next.config.js..."
        node -e "
            process.env.NODE_ENV='production';
            process.env.STATIC_EXPORT='true';
            const config = require('./next.config.js');
            console.log('output:', config.output || 'NOT SET');
            console.log('basePath:', config.basePath || 'NOT SET');
        "
    fi
fi

# Final report
echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Build should work on Render.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Commit and push your changes"
    echo "2. Monitor Render build logs"
    echo "3. If it still fails, check Render-specific issues (Node.js path, etc.)"
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS error(s)${NC}"
    echo ""
    echo "Fix these issues before deploying to Render:"
    echo "1. Check the errors above"
    echo "2. Fix package.json dependencies if needed"
    echo "3. Fix PostCSS config if needed"
    echo "4. Run this script again to verify"
    exit 1
fi
