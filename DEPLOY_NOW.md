# 🚀 DEPLOY TO RENDER - FINAL STEPS

## ✅ STEP 1: Code is on GitHub (DONE)
**Repository:** https://github.com/NomadBuilder/DarkAI.git

---

## STEP 2: Create Web Service in Render

### 2.1 Go to Render Dashboard
1. Visit https://dashboard.render.com
2. Log in

### 2.2 Create New Web Service
1. Click **"New +"** (top right)
2. Click **"Web Service"**

### 2.3 Connect Repository
1. In "Connect a repository" section:
   - If GitHub not connected: Click **"Connect account"** → Authorize
   - **Search:** Type `DarkAI` in the search box
   - **Select:** Click on `NomadBuilder / DarkAI` from the list

### 2.4 Configure Service
Fill in these fields:
- **Name:** `darkai-consolidated`
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** (leave empty)
- **Environment:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 2 --timeout 120`

### 2.5 Add PostgreSQL Database
1. Scroll to **"Add Database"** section
2. Click **"Add"** next to PostgreSQL
3. **Name:** `ncii-postgres` ⚠️ **MUST be exactly this name**
4. **Plan:** Free
5. Click **"Create Database"**

**Note:** If `ncii-postgres` already exists (from ShadowStack), Render will use it automatically.

### 2.6 Add Environment Variables
1. Scroll to **"Environment Variables"** section
2. Click **"Add Environment Variable"** for each line below

**Copy and paste these 10 variables:**

```
FLASK_ENV=production
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
IPAPI_KEY=YOUR_IPAPI_KEY_HERE
NEO4J_PASSWORD=YOUR_NEO4J_PASSWORD_HERE
NEO4J_URI=YOUR_NEO4J_URI_HERE
NEO4J_USERNAME=neo4j
NUMLOOKUP_API_KEY=YOUR_NUMLOOKUP_API_KEY_HERE
SERPAPI_API_KEY=YOUR_SERPAPI_API_KEY_HERE
SECRET_KEY=YOUR_SECRET_KEY_HERE
VIRUSTOTAL_API_KEY=YOUR_VIRUSTOTAL_API_KEY_HERE
```

**For each variable:**
- Click **"Add Environment Variable"**
- **Key:** Left side of `=` (e.g., `FLASK_ENV`)
- **Value:** Right side of `=` (e.g., `production`)
- Click **"Save"**

**⚠️ DO NOT ADD:**
- `POSTGRES_*` variables - These are auto-set by Render from the database

### 2.7 Link Database
1. Make sure `ncii-postgres` is **linked** to your web service
2. This automatically sets: `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

### 2.8 Deploy
1. Scroll to bottom
2. Click **"Create Web Service"**
3. Wait 5-10 minutes for deployment

---

## STEP 3: Verify Deployment

### Check Logs
1. Go to your service → **"Logs"** tab
2. Look for:
   - ✅ `PostgreSQL connection established`
   - ✅ `PersonaForge blueprint registered`
   - ✅ `BlackWire blueprint registered`
   - ✅ `ShadowStack blueprint registered`

### Test URLs
Your app: `https://darkai-consolidated.onrender.com` (or your service name)

- `/` - Homepage
- `/about` - About page
- `/personaforge` - PersonaForge
- `/blackwire` - BlackWire
- `/shadowstack` - ShadowStack

---

## 📋 What Gets Created vs. Reused

| Resource | Action | Details |
|----------|--------|---------|
| **PostgreSQL** | ✅ REUSE | ShadowStack's `ncii-postgres` (auto-configured) |
| **Neo4j** | ✅ REUSE | BlackWire's Neo4j Aura instance |
| **Web Service** | 🆕 CREATE | New service for consolidated app |

---

## 🎯 Checklist

- [x] Code pushed to GitHub
- [ ] Web service created in Render
- [ ] Repository connected (`NomadBuilder / DarkAI`)
- [ ] Database created/linked (`ncii-postgres`)
- [ ] 10 environment variables added
- [ ] Deployment successful
- [ ] All URLs tested

---

**Ready!** 🚀

