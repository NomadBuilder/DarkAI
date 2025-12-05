#!/bin/bash
# Diagnostic script to check enrichment pipeline setup

echo "=========================================="
echo "ENRICHMENT PIPELINE DIAGNOSTICS"
echo "=========================================="
echo ""

# Check 1: File structure
echo "1. Checking file structure..."
if [ -f "shadowstack/src/enrichment/enrichment_pipeline.py" ]; then
    echo "   ✅ enrichment_pipeline.py exists"
else
    echo "   ❌ enrichment_pipeline.py NOT FOUND"
fi

if [ -d "shadowstack/src/enrichment" ]; then
    echo "   ✅ enrichment directory exists"
    echo "   Files in enrichment directory:"
    ls -1 shadowstack/src/enrichment/*.py 2>/dev/null | sed 's/^/      /'
else
    echo "   ❌ enrichment directory NOT FOUND"
fi
echo ""

# Check 2: Python import test
echo "2. Testing Python imports..."
python3 << 'PYTHON_EOF'
import sys
from pathlib import Path

# Add shadowstack to path
shadowstack_dir = Path('shadowstack').absolute()
sys.path.insert(0, str(shadowstack_dir))

print(f"   Working directory: {Path.cwd()}")
print(f"   ShadowStack dir: {shadowstack_dir}")
print(f"   Added to sys.path: {shadowstack_dir in sys.path}")

# Test imports
try:
    import src.enrichment.enrichment_pipeline as ep
    print("   ✅ Module imported successfully")
    
    if hasattr(ep, 'enrich_domain'):
        print("   ✅ enrich_domain function found")
        print(f"   Function: {ep.enrich_domain}")
    else:
        print("   ❌ enrich_domain function NOT FOUND")
        print(f"   Available attributes: {[x for x in dir(ep) if not x.startswith('_')]}")
except ImportError as e:
    print(f"   ❌ Import failed: {e}")
    import traceback
    traceback.print_exc()
except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()
PYTHON_EOF
echo ""

# Check 3: Dependencies
echo "3. Checking dependencies..."
python3 << 'PYTHON_EOF'
import sys
from pathlib import Path

shadowstack_dir = Path('shadowstack').absolute()
sys.path.insert(0, str(shadowstack_dir))

dependencies = [
    'src.enrichment.whois_enrichment',
    'src.enrichment.ip_enrichment',
    'src.enrichment.cms_enrichment',
    'src.enrichment.payment_detection',
    'src.enrichment.tech_stack_enrichment',
]

for dep in dependencies:
    try:
        __import__(dep)
        print(f"   ✅ {dep}")
    except ImportError as e:
        print(f"   ❌ {dep}: {e}")
PYTHON_EOF
echo ""

# Check 4: Test the helper function
echo "4. Testing get_enrich_domain_function() logic..."
python3 << 'PYTHON_EOF'
import sys
from pathlib import Path
import importlib.util

shadowstack_dir = Path('shadowstack').absolute()
blueprint_dir = shadowstack_dir
sys.path.insert(0, str(blueprint_dir))

# Simulate the helper function
enrich_func = None

# Try global import
try:
    from src.enrichment.enrichment_pipeline import enrich_domain
    enrich_func = enrich_domain
    print("   ✅ Global import worked")
except ImportError:
    print("   ⚠️  Global import failed (expected in some scenarios)")

# Try dynamic import if needed
if not enrich_func:
    enrichment_pipeline_path = blueprint_dir / 'src' / 'enrichment' / 'enrichment_pipeline.py'
    print(f"   Trying dynamic import from: {enrichment_pipeline_path}")
    
    try:
        # Import parent package
        import src.enrichment
        print("   ✅ Parent package imported")
        
        # Import dependencies
        try:
            import src.enrichment.whois_enrichment
            import src.enrichment.ip_enrichment
            import src.enrichment.cms_enrichment
            import src.enrichment.payment_detection
            import src.enrichment.tech_stack_enrichment
            print("   ✅ Dependencies imported")
        except ImportError as e:
            print(f"   ⚠️  Some dependencies failed: {e}")
        
        # Import module
        import src.enrichment.enrichment_pipeline as enrichment_module
        if hasattr(enrichment_module, 'enrich_domain'):
            enrich_func = enrichment_module.enrich_domain
            print("   ✅ Dynamic import worked and enrich_domain found")
        else:
            print("   ❌ Dynamic import worked but enrich_domain NOT FOUND")
    except Exception as e:
        print(f"   ❌ Dynamic import failed: {e}")

if enrich_func:
    print("   ✅ SUCCESS: enrich_domain function is available")
else:
    print("   ❌ FAILED: enrich_domain function is NOT available")
PYTHON_EOF
echo ""

# Check 5: Python version and path
echo "5. Environment info..."
python3 << 'PYTHON_EOF'
import sys
from pathlib import Path

print(f"   Python version: {sys.version}")
print(f"   Python executable: {sys.executable}")
print(f"   Working directory: {Path.cwd()}")
print(f"   sys.path entries (first 5):")
for i, p in enumerate(sys.path[:5]):
    print(f"      {i+1}. {p}")
PYTHON_EOF
echo ""

echo "=========================================="
echo "DIAGNOSTICS COMPLETE"
echo "=========================================="



