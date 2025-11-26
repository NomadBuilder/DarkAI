# 🔄 Restore ShadowStack Data

## The Problem

Your consolidated app is connected to the **"blackwire"** database, but your original ShadowStack data is in a **different database** (likely `ncii-postgres` with database name `ncii_infra`).

## Solution: Link to Your Original Database

### Step 1: Find Your Original ShadowStack Database

1. **Go to Render dashboard** → **"Databases"** section
2. **Look for:**
   - `ncii-postgres` (most likely - your original ShadowStack database)
   - Or check your original ShadowStack service's environment variables

### Step 2: Link the Correct Database

**Option A: If `ncii-postgres` exists (Recommended)**

1. **Go to DarkAI service** → **"Environment"** tab
2. **Unlink blackwire** (if you want to switch):
   - Find `DATABASE_URL` in environment variables
   - Click "Edit" → Remove/delete `DATABASE_URL`
3. **Link ncii-postgres:**
   - Click **"+ Add"** → **"Add Datastore"**
   - Select **`ncii-postgres`**
   - This sets `DATABASE_URL` to point to ncii-postgres

4. **Set ShadowStack database name:**
   - Click **"Edit"** on Environment Variables
   - Add: `SHADOWSTACK_POSTGRES_DB=ncii_infra`
   - (This tells ShadowStack to use the `ncii_infra` database inside ncii-postgres)

5. **Save and redeploy**

**Option B: Keep Both Databases**

If you want to keep blackwire for other services:

1. **Link ncii-postgres** (sets `DATABASE_URL`)
2. **Add ShadowStack-specific variables:**
   - `SHADOWSTACK_POSTGRES_HOST` → from ncii-postgres connection info
   - `SHADOWSTACK_POSTGRES_PORT` → `5432`
   - `SHADOWSTACK_POSTGRES_USER` → from ncii-postgres
   - `SHADOWSTACK_POSTGRES_PASSWORD` → from ncii-postgres
   - `SHADOWSTACK_POSTGRES_DB` → `ncii_infra`
3. **Keep `DATABASE_URL`** pointing to blackwire for other services

### Step 3: Verify Data

After redeploying:

1. **Go to:** `https://darkai-6otc.onrender.com/shadowstack/dashboard`
2. **Check if your domains appear**
3. **If still empty**, check the database name:
   - The database name inside ncii-postgres might be different
   - Check your original ShadowStack's `POSTGRES_DB` environment variable

## Quick Check: What's Your Database Name?

1. **Go to your original ShadowStack service** (if still running)
2. **Check Environment variables:**
   - Look for `POSTGRES_DB` or `POSTGRES_DATABASE`
   - This is the database name inside the PostgreSQL server

3. **Or check Render:**
   - Go to `ncii-postgres` database → "Info" or "Connections" tab
   - Look for the database name

## After Setup

Your ShadowStack should now show all your original domain data! 🎉

---

**Note:** If you can't find `ncii-postgres`, your data might be in a different database. Check all your Render databases to find which one has your ShadowStack data.

