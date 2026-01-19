#!/bin/bash
# Run this in Render Shell after deploy to verify the build worked

echo "=========================================="
echo "🔍 Verifying Ledger Build"
echo "=========================================="
echo ""

# Step 1: Check if build ran
echo "1. Did the build run?"
cd /opt/render/project/src/ledger 2>/dev/null || cd ~/project/src/ledger 2>/dev/null
if [ -d ".next" ]; then
    echo "   ✅ YES - .next/ exists (build ran)"
else
    echo "   ❌ NO - .next/ missing (build never ran)"
fi

# Step 2: Check if output exists
echo ""
echo "2. Did the build complete?"
if [ -d "out" ]; then
    echo "   ✅ YES - out/ directory exists"
    
    # Check for index.html
    if [ -f "out/index.html" ]; then
        echo "   ✅ YES - out/index.html exists"
        SIZE=$(ls -lh out/index.html | awk '{print $5}')
        echo "   📄 File size: $SIZE"
        
        # Check for _next directory (static assets)
        if [ -d "out/_next" ]; then
            echo "   ✅ YES - out/_next/ exists (static assets built)"
        else
            echo "   ⚠️  out/_next/ missing (may be normal for static export)"
        fi
        
        # Check for data files
        if [ -d "out/data/processed" ]; then
            DATA_COUNT=$(ls out/data/processed/*.json 2>/dev/null | wc -l)
            echo "   ✅ YES - out/data/processed/ exists ($DATA_COUNT JSON files)"
        else
            echo "   ⚠️  out/data/processed/ missing"
        fi
        
        echo ""
        echo "=========================================="
        echo "✅ BUILD SUCCESSFUL!"
        echo "=========================================="
        echo ""
        echo "The ledger should now be available at:"
        echo "  https://darkai.ca/ledger"
        echo ""
        echo "If you still get 503 errors, check:"
        echo "  1. Flask route in app.py is correct"
        echo "  2. Route is before catch-all routes"
        
    else
        echo "   ❌ NO - out/index.html missing"
        echo "   Build ran but static export failed"
    fi
else
    echo "   ❌ NO - out/ directory missing"
    echo "   Build did not complete successfully"
    echo ""
    echo "Check the build logs for errors:"
    echo "  Render Dashboard → Logs tab (scroll to top)"
fi

echo ""
echo "=========================================="
