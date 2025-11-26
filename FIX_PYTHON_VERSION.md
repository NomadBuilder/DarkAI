# 🔧 Fix Python Version in Render

## The Problem
Render is using Python 3.13 by default, but `greenlet` (a dependency) doesn't build on Python 3.13 with older versions.

## Solution Applied
1. ✅ Added `runtime.txt` with `python-3.11.0`
2. ✅ Pinned `greenlet>=3.1.0` in `requirements.txt` (supports Python 3.13)
3. ✅ Updated `lxml>=5.0.0` (supports Python 3.13)

## If Build Still Fails

### Option 1: Check Render Service Settings
1. Go to your **DarkAI** web service in Render
2. Go to **Settings** tab
3. Look for **"Python Version"** or **"Runtime"** setting
4. Manually set it to **Python 3.11** (if available)
5. Save and redeploy

### Option 2: Force Python 3.11 via Environment Variable
In Render dashboard → Environment tab, add:
```
PYTHON_VERSION=3.11.0
```

### Option 3: Use Python 3.13 Compatible Versions
If Render insists on Python 3.13, the pinned versions should work:
- `greenlet>=3.1.0` ✅ (supports Python 3.13)
- `lxml>=5.0.0` ✅ (supports Python 3.13)

The build should now succeed with either Python 3.11 (via runtime.txt) or Python 3.13 (with updated packages).

