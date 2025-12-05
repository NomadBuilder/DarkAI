#!/bin/bash
# Test commands for Render shell to verify enrichment import fix

echo "=========================================="
echo "TESTING ENRICHMENT IMPORT FIX"
echo "=========================================="
echo ""

echo "Test 1: Test get_enrich_domain_function() with Flask app loaded"
echo "------------------------------------------------------------"
python3 << 'PYTHON_EOF'
import sys
sys.path.insert(0, '/opt/render/project/src')

# Import Flask app (this loads all blueprints)
print("Loading Flask app...")
from app import app

# Now test the helper function
print("\nTesting get_enrich_domain_function()...")
from shadowstack.blueprint import get_enrich_domain_function

func = get_enrich_domain_function()
if func:
    print('✅ SUCCESS: get_enrich_domain_function() works!')
    print(f'   Function: {func}')
    print(f'   Callable: {callable(func)}')
else:
    print('❌ FAILED: get_enrich_domain_function() returned None')
PYTHON_EOF

echo ""
echo "Test 2: Simulate /api/check endpoint call"
echo "------------------------------------------------------------"
python3 << 'PYTHON_EOF'
import sys
sys.path.insert(0, '/opt/render/project/src')

from app import app
from shadowstack.blueprint import get_enrich_domain_function

# This is exactly what the endpoint does
print("Simulating /api/check endpoint...")
enrich_func = get_enrich_domain_function()

if enrich_func:
    print('✅ Endpoint would work!')
    print(f'   Function available: {enrich_func}')
    print(f'   Callable: {callable(enrich_func)}')
    print('\n✅ The /api/check endpoint should work now!')
else:
    print('❌ Endpoint would fail - function not available')
    print('   Check the logs above for errors')
PYTHON_EOF

echo ""
echo "=========================================="
echo "TESTING COMPLETE"
echo "=========================================="



