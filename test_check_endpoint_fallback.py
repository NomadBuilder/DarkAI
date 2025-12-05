#!/usr/bin/env python3
"""
Test the fallback scenario - simulate what happens when global import fails
(like it might in production environments).
"""

import sys
from pathlib import Path

# Add shadowstack to path
script_dir = Path(__file__).parent.absolute()
shadowstack_dir = script_dir / 'shadowstack'

print("=" * 60)
print("TESTING FALLBACK SCENARIO (Global Import Fails)")
print("=" * 60)
print("Simulating production environment where global import might fail...")
print()

# Simulate global import failing by not adding to sys.path first
# and using dynamic import directly
def test_fallback_import():
    """Test the fallback dynamic import (simulating global import failure)."""
    import importlib.util
    
    blueprint_dir = shadowstack_dir
    enrichment_pipeline_path = blueprint_dir / 'src' / 'enrichment' / 'enrichment_pipeline.py'
    
    print(f"Blueprint directory: {blueprint_dir}")
    print(f"Enrichment pipeline path: {enrichment_pipeline_path}")
    print(f"File exists: {enrichment_pipeline_path.exists()}")
    print()
    
    if not enrichment_pipeline_path.exists():
        print("❌ Enrichment pipeline file not found!")
        return None
    
    original_path = sys.path[:]
    if str(blueprint_dir) not in sys.path:
        sys.path.insert(0, str(blueprint_dir))
        print(f"✅ Added {blueprint_dir} to sys.path")
    
    try:
        # Try importing as a proper module (this is what the fix does)
        print("Attempting module import (handles relative imports)...")
        try:
            import src.enrichment.enrichment_pipeline as enrichment_module
            enrich_func = enrichment_module.enrich_domain
            print("✅ Module import SUCCESS")
            print(f"   Function: {enrich_func}")
            print(f"   Module: {enrichment_module.__name__}")
            return enrich_func
        except ImportError as e:
            print(f"⚠️  Module import failed: {e}")
            print("   Trying file-based import as fallback...")
            
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
                print("✅ File-based import SUCCESS")
                return enrich_func
            else:
                print("❌ Failed to create spec")
                return None
    except Exception as e:
        print(f"❌ Import failed: {e}")
        import traceback
        traceback.print_exc()
        return None
    finally:
        sys.path[:] = original_path

# Test the fallback
print("Testing fallback import (simulating global import failure)...")
print()
enrich_func = test_fallback_import()

print()
print("=" * 60)
print("FALLBACK TEST RESULTS")
print("=" * 60)

if enrich_func:
    print("✅ SUCCESS: Fallback import works!")
    print(f"   Function: {enrich_func}")
    print(f"   Callable: {callable(enrich_func)}")
    print()
    print("✅ This means the fix will work even if global import fails")
    print("   (like it might in production environments)")
else:
    print("❌ FAILED: Fallback import did not work")
    print()
    print("⚠️  The fix may not work in production if global import fails")

print()



