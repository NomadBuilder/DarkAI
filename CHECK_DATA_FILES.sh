#!/bin/bash
# Run this in Render Shell to check if data files are in the build output

echo "=========================================="
echo "🔍 Checking Data Files in Build Output"
echo "=========================================="
echo ""

cd /opt/render/project/src/ledger 2>/dev/null || cd ~/project/src/ledger 2>/dev/null

# Check if out/data/processed exists
echo "1. Checking if data files are in build output..."
if [ -d "out/data/processed" ]; then
    echo "   ✅ out/data/processed/ exists"
    echo ""
    echo "   Files found:"
    ls -lh out/data/processed/*.json 2>/dev/null | awk '{print "   - " $9 " (" $5 ")"}'
    echo ""
    COUNT=$(ls out/data/processed/*.json 2>/dev/null | wc -l)
    echo "   Total JSON files: $COUNT"
else
    echo "   ❌ out/data/processed/ MISSING"
    echo ""
    echo "   This is why data isn't loading!"
    echo ""
    echo "   Checking if public/data/processed exists in source..."
    if [ -d "public/data/processed" ]; then
        echo "   ✅ public/data/processed/ exists in source"
        echo "   Files:"
        ls -lh public/data/processed/*.json 2>/dev/null | awk '{print "   - " $9}'
        echo ""
        echo "   ⚠️  Files exist in source but NOT in build output"
        echo "   Next.js should copy public/ to out/ during build"
        echo "   This might be a build configuration issue"
    else
        echo "   ❌ public/data/processed/ also missing in source"
    fi
fi

echo ""
echo "=========================================="
echo "2. Testing Flask route..."
echo "=========================================="
echo ""
echo "The Flask route should serve files from:"
echo "  /opt/render/project/src/ledger/out/data/processed/"
echo ""
echo "And they should be accessible at:"
echo "  https://darkai.ca/ledger/data/processed/system_composition.json"
echo ""
