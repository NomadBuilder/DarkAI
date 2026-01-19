#!/bin/bash
# Run this in Render Shell to diagnose why build isn't running

echo "=========================================="
echo "🔍 Diagnosing Why Build Isn't Running"
echo "=========================================="
echo ""

# Step 1: Check current directory and ledger existence
echo "1. Checking ledger directory..."
cd /opt/render/project/src 2>/dev/null || cd ~/project/src 2>/dev/null
echo "Current directory: $(pwd)"
echo ""

if [ -d "ledger" ]; then
    echo "✅ ledger/ directory EXISTS"
    echo "Contents:"
    ls -la ledger/ | head -10
else
    echo "❌ ledger/ directory MISSING!"
    echo "This is why the build isn't running."
    echo ""
    echo "Current directory contents:"
    ls -la | head -15
    echo ""
    echo "Checking if it's in a different location..."
    find /opt/render/project -name "ledger" -type d 2>/dev/null | head -5
    exit 1
fi

# Step 2: Check render.yaml
echo ""
echo "2. Checking render.yaml..."
if [ -f "render.yaml" ]; then
    echo "✅ render.yaml exists"
    echo "Checking if buildCommand includes ledger:"
    if grep -q "ledger" render.yaml; then
        echo "✅ render.yaml mentions 'ledger'"
        echo "Build command snippet:"
        grep -A 5 "buildCommand" render.yaml | head -10
    else
        echo "❌ render.yaml does NOT mention 'ledger'"
        echo "The build command might not be building the ledger!"
    fi
else
    echo "❌ render.yaml MISSING"
fi

# Step 3: Check if build command would find ledger
echo ""
echo "3. Simulating build command check..."
cd /opt/render/project/src 2>/dev/null || cd ~/project/src 2>/dev/null
if [ -d "ledger" ]; then
    echo "✅ If build command runs, it SHOULD find ledger/"
    echo "   (ledger/ exists in expected location)"
else
    echo "❌ Build command WON'T find ledger/"
    echo "   (ledger/ doesn't exist where build command expects it)"
fi

# Step 4: Check Node.js availability
echo ""
echo "4. Checking Node.js..."
export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH"
if command -v node > /dev/null 2>&1; then
    echo "✅ Node.js available: $(node --version)"
    echo "✅ npm available: $(npm --version)"
else
    echo "❌ Node.js NOT in PATH"
    echo "Trying to find Node.js..."
    find /opt/render/project/nodes -name "node" -type f 2>/dev/null | head -3
fi

# Step 5: Check package.json
echo ""
echo "5. Checking ledger/package.json..."
if [ -f "ledger/package.json" ]; then
    echo "✅ ledger/package.json exists"
    echo "Checking critical dependencies:"
    for dep in typescript tailwindcss postcss; do
        if grep -q "\"$dep\"" ledger/package.json; then
            echo "  ✅ $dep in package.json"
        else
            echo "  ❌ $dep MISSING from package.json"
        fi
    done
else
    echo "❌ ledger/package.json MISSING"
fi

echo ""
echo "=========================================="
echo "Summary:"
echo "=========================================="
if [ -d "ledger" ] && [ -f "ledger/package.json" ]; then
    echo "✅ Ledger directory and package.json exist"
    echo ""
    echo "The build command should be running but isn't."
    echo "Possible reasons:"
    echo "1. Build command failing before it reaches ledger build"
    echo "2. Python dependencies failing and stopping the build"
    echo "3. Build command syntax error in render.yaml"
    echo ""
    echo "Next steps:"
    echo "1. Check Render Logs tab (scroll to top) for build output"
    echo "2. Look for errors before '📦 Building Ledger'"
    echo "3. Check if Python pip install is failing"
else
    echo "❌ Ledger directory or package.json missing"
    echo "This is why the build can't run."
fi
