# Exact Fix for "Ledger not built yet" Error

## The Problem

The Flask route in `darkai-consolidated/app.py` has error checking that returns:
```json
{
  "error": "Ledger not built yet",
  "ledger_dir": "/opt/render/project/src/ledger/out",
  "message": "The ledger build may still be in progress. Please check Render build logs."
}
```

This happens because the route checks `if not ledger_dir:` or `if not os.path.exists(ledger_dir)` BEFORE trying to serve files.

## The Solution

**Replace the entire `serve_ledger` function** in `darkai-consolidated/app.py` with this minimal version:

```python
# Serve Ledger static files at /ledger path
@app.route('/ledger')
@app.route('/ledger/')
@app.route('/ledger/<path:path>')
def serve_ledger(path='index.html'):
    """Serve the Ledger static files at /ledger path"""
    import os
    from flask import send_from_directory, abort
    
    ledger_dir = os.path.join(os.path.dirname(__file__), 'ledger', 'out')
    
    # Handle index.html or root path
    if path == 'index.html' or not path or path == '':
        try:
            return send_from_directory(ledger_dir, 'index.html')
        except:
            abort(404)
    
    # Handle .html files (Next.js static export creates .html files)
    if path.endswith('.html'):
        try:
            return send_from_directory(ledger_dir, path)
        except:
            abort(404)
    
    # For paths without .html, try adding .html extension (Next.js routes)
    html_path = path + '.html'
    try:
        return send_from_directory(ledger_dir, html_path)
    except:
        pass  # Continue to SPA fallback
    
    # For client-side routing (SPA), return index.html
    # This handles routes like /ledger/healthcare, /ledger/receipts, /ledger/data/healthcare_costs.json, etc.
    try:
        return send_from_directory(ledger_dir, 'index.html')
    except:
        # If index.html doesn't exist, try serving the path directly (for data files, etc.)
        try:
            return send_from_directory(ledger_dir, path)
        except:
            abort(404)
```

## Key Differences from Broken Version

1. **NO `os.path.exists()` checks** - Doesn't check if directory exists upfront
2. **NO JSON error returns** - Uses Flask's `abort(404)` instead
3. **Try/except blocks** - Catches errors and tries alternatives
4. **Serves data files** - The final `try` block serves files like `data/healthcare_costs.json` directly

## Steps to Fix

1. Open `darkai-consolidated/app.py`
2. Find the `serve_ledger` function (around line 1056)
3. **Delete the entire function** (including all the error checking code)
4. **Replace it** with the code above
5. Save and commit
6. Push to trigger deployment

## Why This Works

- Doesn't check directory existence before serving
- Tries multiple strategies (html extension, SPA fallback, direct file)
- Serves data files from subdirectories (like `data/healthcare_costs.json`)
- Returns proper 404 if file truly doesn't exist (instead of JSON error)

## Testing

After deploying:
- `darkai.ca/ledger` should load (or show 404 if build failed)
- `darkai.ca/ledger/thetradeoff` should load and show data
- `darkai.ca/ledger/data/healthcare_costs.json` should return the JSON file
