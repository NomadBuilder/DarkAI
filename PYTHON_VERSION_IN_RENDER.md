# 🐍 Python Version in Render

## Why "Python 3" isn't editable

The "Python 3" tag you see in Render is just a **display label** - it's not editable because Render determines the Python version automatically from your code.

## How Render Sets Python Version

Render uses **`runtime.txt`** file in your repository root to determine Python version.

### ✅ We Already Have This!

Your `runtime.txt` file contains:
```
python-3.11.0
```

This tells Render to use Python 3.11.

## If Render Still Uses Python 3.13

Sometimes Render's build system ignores `runtime.txt`. To force Python 3.11:

### Method 1: Check Build Logs
1. Go to your **DarkAI** service → **"Deploys"** tab
2. Click on the latest deploy
3. Check the build logs - it should show: `Using Python 3.11.0`
4. If it shows Python 3.13, Render might not be reading `runtime.txt`

### Method 2: Add Environment Variable
1. Go to **DarkAI** service → **"Environment"** tab
2. Click **"Edit"**
3. Add this variable:
   ```
   PYTHON_VERSION=3.11.0
   ```
4. Save and redeploy

### Method 3: Update Build Command (if needed)
If Render still uses Python 3.13, you can force it in the build command:

In **Settings** → **Build Command**, change to:
```bash
python3.11 -m pip install --upgrade pip && python3.11 -m pip install -r requirements.txt
```

**Note:** This might not work if Python 3.11 isn't available in Render's build environment.

---

## Current Status

✅ `runtime.txt` exists with `python-3.11.0`
✅ Removed `playwright` (was causing dependency conflict)
✅ Build should now work with Python 3.11

**Next:** Trigger a new deploy and check the build logs to confirm Python 3.11 is being used.

