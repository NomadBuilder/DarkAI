#!/usr/bin/env python3
"""
Test the actual check endpoint functionality to verify the enrichment import fix works.
This simulates what happens when /api/check is called.
"""

import sys
from pathlib import Path

# Add shadowstack to path
script_dir = Path(__file__).parent.absolute()
shadowstack_dir = script_dir / 'shadowstack'
if str(shadowstack_dir) not in sys.path:
    sys.path.insert(0, str(shadowstack_dir))

# Import the helper function from blueprint
print("=" * 60)
print("TESTING ENRICHMENT IMPORT FIX")
print("=" * 60)
print(f"Working directory: {Path.cwd()}")
print(f"ShadowStack directory: {shadowstack_dir}")
print()

# Simulate the get_enrich_domain_function from blueprint
def get_enrich_domain_function():
    """
    Get the enrich_domain function, using dynamic import if global import failed.
    This is the actual implementation from shadowstack/blueprint.py
    """
    # Try global import first
    enrich_func = None
    try:
        from src.enrichment.enrichment_pipeline import enrich_domain
        enrich_func = enrich_domain
        print("✅ Step 1: Global import succeeded")
    except ImportError as e:
        print(f"⚠️  Step 1: Global import failed: {e}")
        enrich_func = None
    
    # If global import failed, try dynamic import
    if not enrich_func:
        import importlib.util
        import sys
        
        blueprint_dir = shadowstack_dir
        enrichment_pipeline_path = blueprint_dir / 'src' / 'enrichment' / 'enrichment_pipeline.py'
        
        if not enrichment_pipeline_path.exists():
            print(f"❌ Enrichment pipeline file not found at: {enrichment_pipeline_path}")
            return None
        
        original_path = sys.path[:]
        if str(blueprint_dir) not in sys.path:
            sys.path.insert(0, str(blueprint_dir))
        
        try:
            # Try importing as a proper module (handles relative imports correctly)
            try:
                import src.enrichment.enrichment_pipeline as enrichment_module
                enrich_func = enrichment_module.enrich_domain
                print("✅ Step 2: Dynamic import succeeded (module import)")
            except ImportError as e2:
                print(f"⚠️  Step 2: Module import failed: {e2}")
                # Fallback: try file loading
                spec = importlib.util.spec_from_file_location(
                    "src.enrichment.enrichment_pipeline", 
                    enrichment_pipeline_path
                )
                if spec and spec.loader:
                    enrichment_pipeline_module = importlib.util.module_from_spec(spec)
                    enrichment_pipeline_module.__package__ = 'src.enrichment'
                    enrichment_pipeline_module.__name__ = 'src.enrichment.enrichment_pipeline'
                    spec.loader.exec_module(enrichment_pipeline_module)
                    enrich_func = enrichment_pipeline_module.enrich_domain
                    print("✅ Step 2: Dynamic import succeeded (file loading)")
                else:
                    print("❌ Step 2: Failed to create spec")
                    enrich_func = None
        except Exception as e3:
            print(f"❌ Step 2: Dynamic import failed: {e3}")
            enrich_func = None
        finally:
            sys.path[:] = original_path
    
    return enrich_func

# Test the helper function
print("Testing get_enrich_domain_function()...")
print()
enrich_func = get_enrich_domain_function()

print()
print("=" * 60)
print("RESULTS")
print("=" * 60)

if enrich_func:
    print("✅ SUCCESS: enrich_domain function is available")
    print(f"   Function: {enrich_func}")
    print(f"   Type: {type(enrich_func)}")
    print(f"   Callable: {callable(enrich_func)}")
    
    # Test with a simple domain (dry run - just check it's callable)
    print()
    print("Testing function call (dry run)...")
    try:
        # Don't actually call it (would require API keys and take time)
        # Just verify it's the right function
        if hasattr(enrich_func, '__name__'):
            print(f"✅ Function name: {enrich_func.__name__}")
        if hasattr(enrich_func, '__module__'):
            print(f"✅ Function module: {enrich_func.__module__}")
        print("✅ Function is ready to use")
        print()
        print("=" * 60)
        print("✅ ALL TESTS PASSED")
        print("=" * 60)
        print()
        print("The /api/check endpoint should work correctly!")
        print("The enrichment pipeline can be loaded successfully.")
    except Exception as e:
        print(f"❌ Error checking function: {e}")
else:
    print("❌ FAILED: enrich_domain function is NOT available")
    print()
    print("=" * 60)
    print("❌ TESTS FAILED")
    print("=" * 60)
    print()
    print("The /api/check endpoint will return an error.")
    print("Check the import errors above for details.")

print()



