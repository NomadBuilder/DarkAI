#!/bin/bash
# Quick check script - run this in Render Shell to see if build ran

echo "=========================================="
echo "🔍 Quick Build Status Check"
echo "=========================================="
echo ""

# Check if ledger directory exists
echo "1. Checking ledger directory..."
cd /opt/render/project/src 2>/dev/null || cd ~/project/src 2>/dev/null || pwd
if [ -d "ledger" ]; then
    echo "   ✅ ledger/ exists"
else
    echo "   ❌ ledger/ MISSING - This is the problem!"
    echo "   Current directory: $(pwd)"
    echo "   Contents:"
    ls -la | head -10
    exit 1
fi

# Check if build ran
echo ""
echo "2. Checking if build ran..."
cd ledger
if [ -d ".next" ]; then
    echo "   ✅ Build ran (.next/ exists)"
else
    echo "   ❌ Build NEVER RAN (.next/ missing)"
fi

# Check if output exists
echo ""
echo "3. Checking build output..."
if [ -d "out" ]; then
    echo "   ✅ out/ exists"
    if [ -f "out/index.html" ]; then
        echo "   ✅ out/index.html exists"
        echo "   Size: $(ls -lh out/index.html | awk '{print $5}')"
    else
        echo "   ❌ out/index.html MISSING"
    fi
else
    echo "   ❌ out/ MISSING - Build didn't complete"
fi

# Check node_modules
echo ""
echo "4. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules/ exists"
else
    echo "   ❌ node_modules/ MISSING - npm install never ran"
fi

echo ""
echo "=========================================="
echo "Summary:"
echo "=========================================="
if [ -d "out" ] && [ -f "out/index.html" ]; then
    echo "✅ Build completed successfully!"
    echo ""
    echo "If you're still getting 503 errors, check:"
    echo "1. Flask route is correct in app.py"
    echo "2. Route is before catch-all routes"
    echo "3. Flask is serving from correct path"
else
    echo "❌ Build did NOT complete"
    echo ""
    echo "Next steps:"
    echo "1. Check Render Dashboard → Events/Builds for build logs"
    echo "2. Look for '🚀 Starting build process' in build logs"
    echo "3. If no build logs, the build command isn't running"
    echo "4. Check render.yaml is correct"
fi
