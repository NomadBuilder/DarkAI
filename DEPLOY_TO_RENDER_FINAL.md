# 🚀 Final Deployment Steps to Render

## ✅ STEP 1: Push Code to GitHub (DONE)

Your code is now at: **https://github.com/NomadBuilder/DarkAI.git**

---

## STEP 2: Create Web Service in Render

### 2.1 Go to Render Dashboard
1. Visit https://dashboard.render.com
2. Make sure you're logged in

### 2.2 Create New Web Service
1. Click **"New +"** button (top right)
2. Click **"Web Service"**

### 2.3 Connect Repository
1. You'll see "Connect a repository" section
2. If GitHub isn't connected, click **"Connect account"** and authorize
3. **Search for:** `DarkAI` in the repository search box
4. **Click on:** `NomadBuilder / DarkAI` from the list

### 2.4 Configure Service Settings
1. **Name:** `darkai-consolidated` (or any name you prefer)
2. **Region:** Choose closest to you
3. **Branch:** `main`
4. **Root Directory:** (leave empty)
5. **Environment:** `Python 3`
6. **Build Command:** `pip install -r requirements.txt`
7. **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 2 --timeout 120`

### 2.5 Add PostgreSQL Database
1. Scroll down to **"Add Database"** section
2. Click **"Add"** next to PostgreSQL
3. **Name:** `ncii-postgres` ⚠️ **MUST match render.yaml**
4. **Plan:** Free
5. Click **"Create Database"**

**Note:** If `ncii-postgres` already exists from ShadowStack, Render will use the existing one automatically.

### 2.6 Add Environment Variables
1. Scroll to **"Environment Variables"** section
2. Click **"Add Environment Variable"** for each one

**Copy these 10 variables:**

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
- **Key:** Left side of `=` (e.g., `FLASK_ENV`)
- **Value:** Right side of `=` (e.g., `production`)
- Click **"Save"**

**⚠️ DO NOT ADD:**
- `POSTGRES_*` variables - These are auto-set by Render when you link the database

### 2.7 Link Database
1. In the **"Add Database"** section, you should see `ncii-postgres`
2. Make sure it's **linked** to your web service
3. This automatically sets all `POSTGRES_*` environment variables

### 2.8 Deploy
1. Scroll to bottom of page
2. Click **"Create Web Service"**
3. Render will start building and deploying (5-10 minutes)

---

## STEP 3: Verify Deployment

### 3.1 Check Build Logs
1. Go to your service in Render dashboard
2. Click **"Logs"** tab
3. Look for:
   - ✅ `PostgreSQL connection established`
   - ✅ `PersonaForge blueprint registered`
   - ✅ `BlackWire blueprint registered`
   - ✅ `ShadowStack blueprint registered`

### 3.2 Test URLs
Your app will be at: `https://darkai-consolidated.onrender.com` (or your service name)

Test these:
- `https://your-app-name.onrender.com/` - Homepage
- `https://your-app-name.onrender.com/about` - About page
- `https://your-app-name.onrender.com/personaforge` - PersonaForge
- `https://your-app-name.onrender.com/blackwire` - BlackWire
- `https://your-app-name.onrender.com/shadowstack` - ShadowStack

---

## 📋 What Gets Created vs. Reused

### ✅ REUSED (No Action Needed)
- **PostgreSQL:** `ncii-postgres` (ShadowStack's existing database)
- **Neo4j:** BlackWire's Neo4j Aura instance (already exists)

### 🆕 CREATED
- **Web Service:** New service for consolidated app
- **Database Connection:** Auto-configured by Render

---

## 🎯 Final Checklist

- [x] Code pushed to GitHub (https://github.com/NomadBuilder/DarkAI.git)
- [ ] Web service created in Render
- [ ] Repository connected (`NomadBuilder / DarkAI`)
- [ ] Database created/linked (`ncii-postgres`)
- [ ] 10 environment variables added
- [ ] Deployment successful
- [ ] All URLs tested

---

**Ready to deploy!** 🚀
