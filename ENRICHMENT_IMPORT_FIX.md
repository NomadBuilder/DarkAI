# Enrichment Pipeline Import Fix - Testing & Production Notes

## Problem
The ShadowStack `/api/check` endpoint was returning "Enrichment pipeline not available" error because the `enrich_domain` function wasn't being imported correctly at module load time.

## Solution
Created a robust `get_enrich_domain_function()` helper that:
1. **First tries** the global import (if it worked at module load)
2. **Falls back** to dynamic import using proper module import (handles relative imports)
3. **Final fallback** to file-based import with package structure setup

## Testing Results

### Local Environment ✅
```
Global import:        ✅ PASS
Dynamic import:        ✅ PASS (using module import)
Helper function:       ✅ PASS
Function callable:     ✅ PASS
```

**Key Finding**: In local environment, the global import typically works because:
- `sys.path` is set up correctly at module load time
- Relative imports resolve correctly
- Working directory matches expected structure

### Production (Render) Environment

**Expected Behavior**: 
- Global import **may fail** due to:
  - Different working directory
  - Different `sys.path` initialization order
  - Blueprint import order in `app.py`
  
- Dynamic import **should work** because:
  - Uses absolute paths (`blueprint_dir`)
  - Properly sets up package structure for relative imports
  - Uses `import src.enrichment.enrichment_pipeline` which handles relative imports correctly

## Differences: Local vs Production

### Import Path Resolution

**Local:**
```python
# Working directory: /path/to/DarkAI-consolidated
# sys.path includes: /path/to/DarkAI-consolidated/shadowstack
# Global import works: ✅
```

**Production (Render):**
```python
# Working directory: /opt/render/project/src (or similar)
# sys.path may not include blueprint directory initially
# Global import may fail: ⚠️
# Dynamic import works: ✅ (uses absolute paths)
```

### Why Dynamic Import Works Better

1. **Absolute Paths**: Uses `blueprint_dir` which is always correct regardless of working directory
2. **Proper Module Import**: Uses `import src.enrichment.enrichment_pipeline` which:
   - Respects Python's import system
   - Handles relative imports correctly (`.whois_enrichment`, etc.)
   - Sets up package structure automatically
3. **Fallback Safety**: If module import fails, tries file-based import with package setup

## Code Changes

### Before
```python
if not enrich_domain:
    return jsonify({"error": "Enrichment pipeline not available"}), 500
```

### After
```python
enrich_func = get_enrich_domain_function()
if not enrich_func:
    return jsonify({
        "error": "Enrichment pipeline not available",
        "message": "Could not load enrichment pipeline. Please check server logs."
    }), 500
```

## Testing the Fix

Run the test script:
```bash
python3 test_enrichment_import.py
```

This will verify:
- ✅ Global import works (local)
- ✅ Dynamic import works (fallback)
- ✅ Helper function works (actual implementation)
- ✅ Function is callable

## Production Deployment Notes

1. **No Code Changes Needed**: The fix is already in place
2. **Should Work in Both Environments**: 
   - Local: Uses global import (faster)
   - Production: Falls back to dynamic import (more robust)
3. **Error Handling**: If both methods fail, returns clear error message

## Verification

After deployment, test the endpoint:
```bash
curl -X POST https://your-domain.com/shadowstack/api/check \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'
```

Expected response (success):
```json
{
  "message": "Domain analyzed successfully (not stored)",
  "domain": "example.com",
  "data": {...},
  "status": "checked"
}
```

Expected response (if still failing):
```json
{
  "error": "Enrichment pipeline not available",
  "message": "Could not load enrichment pipeline. Please check server logs."
}
```

## Files Modified

1. `shadowstack/blueprint.py`:
   - Added `get_enrich_domain_function()` helper
   - Updated `/api/check` endpoint to use helper
   - Updated `/api/enrich` endpoint to use helper

2. `test_enrichment_import.py`:
   - Created test script to verify imports work
   - Tests both local and production scenarios

