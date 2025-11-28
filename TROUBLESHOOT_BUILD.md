# 🔧 Troubleshoot Build Failure

## The Issue

**Error:** `remote: Repository not found` during build, but repository is connected in Render.

## Why This Happens

This is usually a **transient issue** - one of these:

1. **GitHub API rate limiting** - GitHub temporarily blocks requests
2. **Network timeout** - Render's build system can't reach GitHub
3. **GitHub temporary outage** - GitHub was down briefly
4. **Render build cache issue** - Stale cache causing problems

## Solutions

### Solution 1: Trigger New Deploy (Most Common Fix)

1. Go to Render dashboard → Your **DarkAI** service
2. Click **"Deploys"** tab
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. This forces a fresh clone and build

### Solution 2: Clear Build Cache

1. Go to **Settings** → **Build & Deploy**
2. Look for **"Clear build cache"** or **"Rebuild"** option
3. Click it to clear cached build data
4. Trigger new deploy

### Solution 3: Wait and Retry

If it's a temporary GitHub issue:
- Wait 5-10 minutes
- Try deploying again
- GitHub issues usually resolve quickly

### Solution 4: Check GitHub Status

1. Go to: https://www.githubstatus.com/
2. Check if GitHub is experiencing issues
3. If yes, wait for it to resolve

## Verify Repository is Correct

In Render Settings → Build & Deploy:

✅ **Repository:** `https://github.com/NomadBuilder/DarkAI`  
✅ **Branch:** `main`  
✅ **Root Directory:** (empty)  
✅ **Git Credentials:** Your email is set

## If Still Failing

1. **Check build logs** - Look for the exact error message
2. **Try disconnecting and reconnecting:**
   - Settings → Repository → Edit → Disconnect
   - Then reconnect to `NomadBuilder/DarkAI`
3. **Verify repository is public:**
   - Go to: https://github.com/NomadBuilder/DarkAI
   - Should show "Public" badge

---

**Most likely:** This is a transient issue. Try "Manual Deploy" again - it usually works on retry.

