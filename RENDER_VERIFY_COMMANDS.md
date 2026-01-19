# Render Shell Verification Commands

Run these commands in the Render shell to verify the ledger deployment:

## 1. Check if ledger directory exists
```bash
ls -la ledger/
```

## 2. Check if built files exist
```bash
ls -la ledger/out/
```

## 3. Check if index.html exists
```bash
test -f ledger/out/index.html && echo "✅ index.html exists" || echo "❌ index.html missing"
```

## 4. Check file sizes (should be substantial)
```bash
ls -lh ledger/out/index.html
ls -lh ledger/out/_next/static/chunks/ | head -5
```

## 5. Check if data files exist
```bash
ls -la ledger/out/data/processed/
```

## 6. Verify the route in Python
```bash
python3 -c "
import os
ledger_dir = os.path.join(os.getcwd(), 'ledger', 'out')
print(f'Ledger dir: {ledger_dir}')
print(f'Exists: {os.path.exists(ledger_dir)}')
if os.path.exists(ledger_dir):
    index_path = os.path.join(ledger_dir, 'index.html')
    print(f'Index.html exists: {os.path.exists(index_path)}')
    print(f'Files in out/: {len(os.listdir(ledger_dir))} files')
"
```

## 7. Test Flask route directly (if Flask is running)
```bash
python3 -c "
from app import app
with app.test_client() as client:
    response = client.get('/ledger')
    print(f'Status: {response.status_code}')
    print(f'Content-Type: {response.content_type}')
    if response.status_code == 200:
        print('✅ Route works!')
    else:
        print(f'Response: {response.get_data(as_text=True)[:200]}')
"
```

## 8. Check build logs for errors
```bash
# Check if npm build completed
grep -i "ledger" /var/log/render-build.log 2>/dev/null || echo "Check Render dashboard for build logs"
```

## 9. Quick file count check
```bash
echo "Files in ledger/out:"
find ledger/out -type f | wc -l
echo "Directories:"
find ledger/out -type d | wc -l
```

## 10. Check if _next directory exists (critical for Next.js)
```bash
test -d ledger/out/_next && echo "✅ _next directory exists" || echo "❌ _next directory missing"
ls -la ledger/out/_next/static/chunks/ 2>/dev/null | head -3 || echo "No chunks found"
```

## Most Important Checks (run these first):
```bash
# Quick verification
echo "=== Quick Verification ==="
echo "1. Ledger dir exists:"
test -d ledger && echo "✅ YES" || echo "❌ NO"

echo "2. Out dir exists:"
test -d ledger/out && echo "✅ YES" || echo "❌ NO"

echo "3. Index.html exists:"
test -f ledger/out/index.html && echo "✅ YES" || echo "❌ NO"

echo "4. _next dir exists:"
test -d ledger/out/_next && echo "✅ YES" || echo "❌ NO"

echo "5. Data files exist:"
test -d ledger/out/data/processed && echo "✅ YES" || echo "❌ NO"
```
