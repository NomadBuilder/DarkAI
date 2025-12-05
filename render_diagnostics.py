#!/usr/bin/env python3
"""
Diagnostic script to run in Render shell to check enrichment pipeline import.
Run this in Render shell with: python3 render_diagnostics.py
"""

import sys
from pathlib import Path

print("=" * 60)
print("RENDER ENRICHMENT PIPELINE DIAGNOSTICS")
print("=" * 60)
print()

# Check 1: Environment info
print("1. Environment Information")
print("-" * 60)
print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}")
print(f"Working directory: {Path.cwd()}")
print(f"sys.path (first 10 entries):")
for i, p in enumerate(sys.path[:10]):
    marker = " ← ShadowStack" if "shadowstack" in p.lower() else ""
    marker = marker + " ← BlackWire" if "blackwire" in p.lower() and not marker else marker
    print(f"  {i+1}. {p}{marker}")
print()

# Check 2: File structure
print("2. File Structure Check")
print("-" * 60)
shadowstack_dir = Path("/opt/render/project/src/shadowstack")
enrichment_path = shadowstack_dir / "src" / "enrichment" / "enrichment_pipeline.py"

print(f"ShadowStack directory: {shadowstack_dir}")
print(f"  Exists: {shadowstack_dir.exists()}")
print(f"Enrichment pipeline: {enrichment_path}")
print(f"  Exists: {enrichment_path.exists()}")

if enrichment_path.exists():
    print(f"  File size: {enrichment_path.stat().st_size} bytes")
    # Check if enrich_domain function exists in file
    content = enrichment_path.read_text()
    if "def enrich_domain" in content:
        print("  ✅ enrich_domain function found in file")
    else:
        print("  ❌ enrich_domain function NOT found in file")
print()

# Check 3: Module cache check
print("3. Cached Modules Check")
print("-" * 60)
enrichment_modules = [k for k in sys.modules.keys() if 'enrichment' in k.lower()]
if enrichment_modules:
    print("Cached enrichment-related modules:")
    for mod_name in sorted(enrichment_modules):
        mod = sys.modules[mod_name]
        if hasattr(mod, '__file__') and mod.__file__:
            file_path = str(mod.__file__)
            blueprint = "Unknown"
            if "blackwire" in file_path:
                blueprint = "BlackWire ⚠️"
            elif "shadowstack" in file_path:
                blueprint = "ShadowStack ✅"
            elif "personaforge" in file_path:
                blueprint = "PersonaForge"
            print(f"  {mod_name}: {file_path} ({blueprint})")
        else:
            print(f"  {mod_name}: (no __file__)")
else:
    print("  No enrichment modules cached")
print()

# Check 4: Test import
print("4. Testing Import")
print("-" * 60)

# Simulate what the blueprint does
blueprint_dir = shadowstack_dir
enrichment_pipeline_path = blueprint_dir / 'src' / 'enrichment' / 'enrichment_pipeline.py'

if not enrichment_pipeline_path.exists():
    print(f"❌ Enrichment pipeline file not found at {enrichment_pipeline_path}")
else:
    import importlib.util
    
    # Clear any cached modules
    modules_to_clear = []
    for mod_name in list(sys.modules.keys()):
        if mod_name.startswith('src.enrichment.'):
            mod = sys.modules[mod_name]
            if hasattr(mod, '__file__') and mod.__file__:
                mod_file = str(mod.__file__)
                if ('blackwire' in mod_file or 'personaforge' in mod_file) and 'shadowstack' not in mod_file:
                    modules_to_clear.append(mod_name)
    
    if modules_to_clear:
        print(f"Clearing {len(modules_to_clear)} conflicting modules:")
        for mod_name in modules_to_clear:
            print(f"  - {mod_name}")
            del sys.modules[mod_name]
    else:
        print("No conflicting modules to clear")
    
    # Try file-based import
    print("\nAttempting file-based import...")
    try:
        unique_module_name = f"shadowstack_enrichment_pipeline_test"
        spec = importlib.util.spec_from_file_location(
            unique_module_name,
            enrichment_pipeline_path
        )
        
        if spec and spec.loader:
            enrichment_module = importlib.util.module_from_spec(spec)
            enrichment_module.__package__ = 'src.enrichment'
            enrichment_module.__name__ = 'src.enrichment.enrichment_pipeline'
            enrichment_module.__file__ = str(enrichment_pipeline_path)
            
            # Ensure ShadowStack's src is in path
            shadowstack_src = str(blueprint_dir / 'src')
            if shadowstack_src not in sys.path:
                sys.path.insert(0, shadowstack_src)
                print(f"✅ Added {shadowstack_src} to sys.path")
            
            # Execute module
            spec.loader.exec_module(enrichment_module)
            
            if hasattr(enrichment_module, 'enrich_domain'):
                print("✅ SUCCESS: enrich_domain function found!")
                print(f"   Function: {enrichment_module.enrich_domain}")
                print(f"   Callable: {callable(enrichment_module.enrich_domain)}")
            else:
                print("❌ FAILED: enrich_domain function NOT found")
                print(f"   Available attributes: {[x for x in dir(enrichment_module) if not x.startswith('_')]}")
        else:
            print("❌ Failed to create spec")
    except Exception as e:
        print(f"❌ Import failed: {e}")
        import traceback
        traceback.print_exc()
print()

# Check 5: Blueprint import test
print("5. Testing Blueprint Import")
print("-" * 60)
try:
    # Try importing the blueprint module
    sys.path.insert(0, str(shadowstack_dir))
    from blueprint import get_enrich_domain_function
    
    print("✅ get_enrich_domain_function imported")
    
    # Test it
    func = get_enrich_domain_function()
    if func:
        print("✅ get_enrich_domain_function() returned a function")
        print(f"   Function: {func}")
    else:
        print("❌ get_enrich_domain_function() returned None")
except Exception as e:
    print(f"❌ Failed to import/test: {e}")
    import traceback
    traceback.print_exc()
print()

print("=" * 60)
print("DIAGNOSTICS COMPLETE")
print("=" * 60)



