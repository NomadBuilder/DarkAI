#!/usr/bin/env python3
"""
Test script to verify enrichment pipeline import works correctly.
Run this to test both local and production import scenarios.

Usage:
    python3 test_enrichment_import.py
"""

import sys
import os
from pathlib import Path
import importlib.util

def test_global_import():
    """Test the global import method (what happens at module load)."""
    print("=" * 60)
    print("TEST 1: Global Import (Module Load Time)")
    print("=" * 60)
    
    script_dir = Path(__file__).parent.absolute()
    shadowstack_dir = script_dir / 'shadowstack'
    
    if str(shadowstack_dir) not in sys.path:
        sys.path.insert(0, str(shadowstack_dir))
    
    try:
        from src.enrichment.enrichment_pipeline import enrich_domain
        print("✅ Global import SUCCESS")
        return enrich_domain
    except ImportError as e:
        print(f"❌ Global import FAILED: {e}")
        return None

def test_dynamic_import():
    """Test the dynamic import method (fallback) - FIXED VERSION."""
    print("\n" + "=" * 60)
    print("TEST 2: Dynamic Import (Fallback Method - FIXED)")
    print("=" * 60)
    
    script_dir = Path(__file__).parent.absolute()
    blueprint_dir = script_dir / 'shadowstack'
    enrichment_pipeline_path = blueprint_dir / 'src' / 'enrichment' / 'enrichment_pipeline.py'
    
    print(f"Looking for: {enrichment_pipeline_path}")
    print(f"Exists: {enrichment_pipeline_path.exists()}")
    
    if not enrichment_pipeline_path.exists():
        print("❌ Enrichment pipeline file not found!")
        return None
    
    original_path = sys.path[:]
    if str(blueprint_dir) not in sys.path:
        sys.path.insert(0, str(blueprint_dir))
    
    try:
        # Try importing as a proper module (handles relative imports correctly)
        try:
            import src.enrichment.enrichment_pipeline as enrichment_module
            enrich_func = enrichment_module.enrich_domain
            print("✅ Dynamic import SUCCESS (using module import)")
            return enrich_func
        except ImportError as e:
            print(f"⚠️  Module import failed: {e}")
            return None
    except Exception as e:
        print(f"❌ Dynamic import FAILED: {e}")
        return None
    finally:
        sys.path[:] = original_path

def test_helper_function():
    """Test the helper function (simulates actual usage)."""
    print("\n" + "=" * 60)
    print("TEST 3: Helper Function (Actual Implementation)")
    print("=" * 60)
    
    script_dir = Path(__file__).parent.absolute()
    blueprint_dir = script_dir / 'shadowstack'
    
    # Simulate the global import (might fail)
    enrich_func = None
    try:
        if str(blueprint_dir) not in sys.path:
            sys.path.insert(0, str(blueprint_dir))
        from src.enrichment.enrichment_pipeline import enrich_domain
        enrich_func = enrich_domain
        print("✅ Global import worked")
    except ImportError:
        print("⚠️  Global import failed (expected in some scenarios)")
        enrich_func = None
    
    # Try dynamic import if global failed
    if not enrich_func:
        original_path = sys.path[:]
        if str(blueprint_dir) not in sys.path:
            sys.path.insert(0, str(blueprint_dir))
        
        try:
            import src.enrichment.enrichment_pipeline as enrichment_module
            enrich_func = enrichment_module.enrich_domain
            print("✅ Dynamic import worked (fallback)")
        except Exception as e:
            print(f"❌ Dynamic import also failed: {e}")
            enrich_func = None
        finally:
            sys.path[:] = original_path
    
    if enrich_func:
        print(f"✅ Helper function would return: {enrich_func}")
        return enrich_func
    else:
        print("❌ Helper function would return None")
        return None

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("ENRICHMENT PIPELINE IMPORT TEST")
    print("=" * 60)
    print(f"Working directory: {os.getcwd()}")
    print(f"Script location: {Path(__file__).parent.absolute()}")
    print()
    
    # Run tests
    result1 = test_global_import()
    result2 = test_dynamic_import()
    result3 = test_helper_function()
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Global import:        {'✅ PASS' if result1 else '❌ FAIL'}")
    print(f"Dynamic import:        {'✅ PASS' if result2 else '❌ FAIL'}")
    print(f"Helper function:       {'✅ PASS' if result3 else '❌ FAIL'}")
    
    if result3:
        print("\n✅ The fix should work! Helper function can load enrichment pipeline.")
        print("   In production, if global import fails, dynamic import will work.")
    else:
        print("\n❌ The fix may not work. Check the errors above.")
    
    print("\n" + "=" * 60)



