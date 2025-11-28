# 🔧 Fix Git Credentials Issue

## The Problem

**Error:** `could not read Username for 'https://github.com': terminal prompts disabled`

Render is trying to use authenticated HTTPS access for a **public repository**, which isn't needed.

## Solution: Update Repository Connection

### Option 1: Use Public Repository URL (Recommended)

1. Go to Render → **DarkAI** service → **Settings** → **Build & Deploy**
2. Click **"Edit"** next to **Repository**
3. In the repository URL field, make sure it's:
   ```
   https://github.com/NomadBuilder/DarkAI.git
   ```
4. **Important:** Don't use any authentication - just the public URL
5. Click **"Save changes"**

### Option 2: Remove Git Credentials

1. Go to **Settings** → **Build & Deploy** → **Git Credentials**
2. If it shows your email, try:
   - Click **"Edit"** on Git Credentials
   - Select **"No credentials"** or **"Public repository"** option
   - Save

### Option 3: Disconnect and Reconnect

1. Go to **Settings** → **Build & Deploy** → **Repository**
2. Click **"Edit"** → **"Disconnect"**
3. Click **"Connect GitHub"** again
4. Select **`NomadBuilder / DarkAI`**
5. Make sure it's using the **public URL** (not authenticated)
6. Select branch **`main`**
7. **Don't set Git Credentials** - leave it as public
8. Save

## Why This Happens

For **public repositories**, Render doesn't need credentials. If Git Credentials are set, Render tries to use authenticated HTTPS, which fails in the build environment.

## After Fixing

1. **Trigger new deploy:**
   - Go to **"Deploys"** tab
   - Click **"Manual Deploy"** → **"Deploy latest commit"**

2. **The build should now:**
   - Clone the public repo without credentials
   - Find `requirements.txt`
   - Build successfully

---

**Key:** For public repos, don't use Git Credentials. Let Render clone it as a public repository.

