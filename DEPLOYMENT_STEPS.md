# 🚀 Step-by-Step Deployment Guide

## Step 1: Push Code to GitHub

```bash
cd /Users/aazir/Desktop/AIModules/DarkAI/DarkAI-consolidated

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Consolidated DarkAI platform"

# Create new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/darkai-consolidated.git
git branch -M main
git push -u origin main
```

## Step 2: Create New Web Service in Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account (if not already connected)
4. Select your repository: `darkai-consolidated`
5. Render will automatically detect `render.yaml`

## Step 3: Render Will Auto-Create

✅ **PostgreSQL Database** - Will use existing `ncii-postgres` database
- Render checks if `ncii-postgres` exists
- If it exists: Uses it
- If it doesn't exist: Creates it
- **You don't need to do anything** - it's automatic

## Step 4: Add Environment Variables

1. Go to your new web service in Render dashboard
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Copy each line from `RENDER_ENV_VARS_IMPORT.txt` and paste:
   - Key = left side of `=`
   - Value = right side of `=`

**Keys to add (9 total):**
- `FLASK_ENV=production`
- `OPENAI_API_KEY=...`
- `IPAPI_KEY=...`
- `NEO4J_PASSWORD=...`
- `NEO4J_URI=...`
- `NEO4J_USERNAME=neo4j`
- `NUMLOOKUP_API_KEY=...`
- `SERPAPI_API_KEY=...`
- `SECRET_KEY=...`
- `VIRUSTOTAL_API_KEY=...`

**⚠️ DO NOT ADD:**
- `POSTGRES_*` variables - These are auto-set by Render from the database connection

## Step 5: Deploy

1. Render will automatically:
   - Connect to `ncii-postgres` database
   - Set `POSTGRES_*` environment variables automatically
   - Build your app
   - Deploy to production

2. Wait for deployment (5-10 minutes)

3. Your app will be live at: `https://your-app-name.onrender.com`

## Step 6: Test

Visit these URLs:
- `https://your-app-name.onrender.com/` - Homepage
- `https://your-app-name.onrender.com/about` - About page
- `https://your-app-name.onrender.com/personaforge` - PersonaForge
- `https://your-app-name.onrender.com/blackwire` - BlackWire
- `https://your-app-name.onrender.com/shadowstack` - ShadowStack

---

## 📋 What Gets Created vs. Reused

### ✅ REUSED (No Action Needed)
- **PostgreSQL Database:** `ncii-postgres` (ShadowStack's existing database)
- **Neo4j:** BlackWire's Neo4j Aura instance (already exists)

### 🆕 CREATED (Automatic)
- **Web Service:** New service for consolidated app
- **Database Connection:** Auto-configured by Render

### ⚠️ IMPORTANT
- All three services share the same PostgreSQL database (`ncii-postgres`)
- They use different table names, so no conflicts
- Your existing ShadowStack and BlackWire deployments continue to work independently
- The consolidated app is a separate deployment

---

## 🎯 Quick Checklist

- [ ] Code pushed to GitHub
- [ ] New web service created in Render
- [ ] Environment variables added (9 keys)
- [ ] Deployment successful
- [ ] All URLs tested and working

---

**Estimated Time:** 15-20 minutes

