# Fixes Needed to Match Working Commit 95f8371

## Issue Summary

1. **Flask route error checking** - Added error checking that returns JSON error instead of serving files
2. **Data file loading** - `healthcare_costs.json` not loading (shows "Unable to load comparison data")

## Fix 1: Revert Flask Route to Simple Version

The working commit had a simple Flask route without error checking. The current version checks for directory existence and returns JSON errors.

**Replace the Flask route in `darkai-consolidated/app.py` with:**

```python
# Serve Ledger static files at /ledger path
@app.route('/ledger')
@app.route('/ledger/')
@app.route('/ledger/<path:path>')
def serve_ledger(path='index.html'):
    """Serve the Ledger static files at /ledger path"""
    import os
    from flask import send_from_directory
    
    ledger_dir = os.path.join(os.path.dirname(__file__), 'ledger', 'out')
    
    # Handle index.html or root path
    if path == 'index.html' or not path or path == '':
        return send_from_directory(ledger_dir, 'index.html')
    
    # Handle .html files (Next.js static export creates .html files)
    if path.endswith('.html'):
        return send_from_directory(ledger_dir, path)
    
    # For paths without .html, try adding .html extension (Next.js routes)
    html_path = path + '.html'
    html_file_path = os.path.join(ledger_dir, html_path)
    if os.path.exists(html_file_path) and os.path.isfile(html_file_path):
        return send_from_directory(ledger_dir, html_path)
    
    # For client-side routing (SPA), return index.html
    # This handles routes like /ledger/healthcare, /ledger/receipts, etc.
    return send_from_directory(ledger_dir, 'index.html')
```

**Key differences:**
- No `os.path.exists()` checks that return JSON errors
- Just serves files directly
- Handles `.html` extensions for Next.js static export
- Falls back to `index.html` for SPA routing
- Serves files from subdirectories (like `data/healthcare_costs.json`) automatically via Flask's `send_from_directory`

## Why This Works

1. **No premature error checking** - Doesn't check if directory exists before trying to serve
2. **Flask handles subdirectories** - `send_from_directory(ledger_dir, path)` automatically handles paths like `data/healthcare_costs.json`
3. **Natural error handling** - If file doesn't exist, Flask returns 404 naturally
4. **SPA routing support** - Falls back to `index.html` for client-side routes

## Files to Update

1. `darkai-consolidated/app.py` - Replace the `serve_ledger` function with the simple version above

## Testing

After updating:
1. Deploy to Render
2. Visit `darkai.ca/ledger` - should load
3. Visit `darkai.ca/ledger/thetradeoff` - should load and show comparison data (not "Unable to load comparison data")
4. Check browser console - should see successful fetch of `/ledger/data/healthcare_costs.json`
