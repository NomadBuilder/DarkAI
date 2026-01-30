# Integration Steps: Add Ledger to darkai-consolidated

## Quick Integration Guide

### Step 1: Copy Ledger Project

```bash
# From FFord directory
cd /Users/aazir/Desktop/Coding/personalprojects/FFord

# Copy to darkai-consolidated
cp -r . /Users/aazir/Desktop/Coding/DarkAI/DarkAI-consolidated/ledger
```

### Step 2: Update render.yaml

Add ledger build to the build command:

```yaml
buildCommand: |
  pip install --disable-pip-version-check --upgrade pip && pip install --disable-pip-version-check -r requirements.txt
  # Build ledger
  cd ledger && npm install && BASE_PATH=/ledger STATIC_EXPORT=true npm run build && cd ..
```

### Step 3: Add Flask Route

Add this to `app.py` (around line 870, after the static route):

```python
@app.route('/ledger')
@app.route('/ledger/')
@app.route('/ledger/<path:path>')
def serve_ledger(path='index.html'):
    """Serve the Ledger static files at /ledger path"""
    ledger_dir = os.path.join(os.path.dirname(__file__), 'ledger', 'out')
    if path == 'index.html' or not path:
        return send_from_directory(ledger_dir, 'index.html')
    return send_from_directory(ledger_dir, path)
```

### Step 4: Test Locally

```bash
cd /Users/aazir/Desktop/Coding/DarkAI/DarkAI-consolidated
cd ledger
npm install
BASE_PATH=/ledger STATIC_EXPORT=true npm run build
cd ..
python3 app.py
```

Visit: `http://localhost:5001/ledger`

### Step 5: Deploy

```bash
git add ledger/ app.py render.yaml
git commit -m "Add Ledger project at /ledger path"
git push
```

## File Structure After Integration

```
DarkAI-consolidated/
├── app.py                    # Updated with /ledger route
├── render.yaml               # Updated build command
├── ledger/                   # The Ledger project
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── out/                  # Built static files
│   └── package.json
└── static/                   # Existing static files
```

## Verification

After deployment:
- [ ] `darkai.ca/ledger` loads
- [ ] All CSS/JS assets load
- [ ] Data files load from `/ledger/data/processed/`
- [ ] Navigation works
- [ ] No 404 errors
