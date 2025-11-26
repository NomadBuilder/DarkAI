# 🔍 Finding Your ShadowStack Data

## The Problem

Your consolidated app is using the **"blackwire"** database, but your original ShadowStack data is in a **different database**.

## Where is Your Original ShadowStack Data?

Your original ShadowStack deployment likely used one of these databases:
- **`ncii-postgres`** (most likely - mentioned in deployment docs)
- **`ncii_infra`** (default database name in code)

## Solution: Link to the Correct Database

You have two options:

### Option 1: Link to ncii-postgres (if it exists)

1. **Check if `ncii-postgres` exists in Render:**
   - Go to Render dashboard
   - Look in your services list for a database named `ncii-postgres`
   - Or go to "Databases" section

2. **If it exists, link it:**
   - Go to your **DarkAI** web service → **"Environment"** tab
   - Click **"+ Add"** → **"Add Datastore"**
   - Select **`ncii-postgres`** (instead of blackwire)
   - This will set `DATABASE_URL` to point to ncii-postgres

3. **Update ShadowStack to use ncii-postgres:**
   - ShadowStack will automatically use `DATABASE_URL` if set
   - Or you can manually set `POSTGRES_DB=ncii_infra` (the database name inside ncii-postgres)

### Option 2: Use Separate Databases

If you want to keep data separate:

1. **Link both databases:**
   - Link `ncii-postgres` for ShadowStack
   - Keep `blackwire` for BlackWire/PersonaForge

2. **Set service-specific environment variables:**
   - `SHADOWSTACK_POSTGRES_HOST` → from ncii-postgres
   - `SHADOWSTACK_POSTGRES_DB` → `ncii_infra` (or whatever the database name is)
   - Keep `DATABASE_URL` pointing to blackwire for other services

## Quick Check: What Database Has Your Data?

1. **Go to your original ShadowStack deployment** (if still running)
2. **Check its Environment variables:**
   - Look for `POSTGRES_HOST`, `POSTGRES_DB`
   - Note the database name

3. **Or check Render databases:**
   - Go to Render → "Databases"
   - Look for databases with data
   - Check which one has your domain data

## After Linking the Correct Database

1. **Redeploy** your DarkAI service
2. **Check the dashboard** - your data should appear!

---

**The key is finding which database has your original ShadowStack data and linking to that one instead of (or in addition to) blackwire.**

