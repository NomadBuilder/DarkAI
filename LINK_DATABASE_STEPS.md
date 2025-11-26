# 🔗 How to Link Database in Render

## Step-by-Step Instructions

### Method 1: Link from Environment Tab (Recommended)

1. **Go to your DarkAI web service** in Render dashboard
2. **Click on "Environment"** in the left sidebar (under "Manage" section)
3. **Scroll down** to find the **"Add Database"** section
4. You should see:
   - A list of existing databases (if any)
   - Or an **"Add PostgreSQL"** button
5. **If `ncii-postgres` exists:**
   - Click **"Link"** next to `ncii-postgres`
6. **If it doesn't exist:**
   - Click **"Add PostgreSQL"**
   - Name: `ncii-postgres` ⚠️ **MUST be exactly this name**
   - Plan: Free
   - Region: Oregon (same as your service)
   - Click **"Create Database"**
7. Render will automatically set all `POSTGRES_*` environment variables

### Method 2: Create Database First, Then Link

1. **Go to main Render dashboard** (click "Projects" in sidebar)
2. **Click "+ New"** button (top right) → **"PostgreSQL"**
3. Fill in:
   - **Name:** `ncii-postgres`
   - **Database:** `ncii`
   - **User:** `ncii_user`
   - **Plan:** Free
   - **Region:** Oregon
4. Click **"Create Database"**
5. **Go back to your DarkAI web service** → **"Environment"** tab
6. Scroll to **"Add Database"** section
7. Click **"Link"** next to `ncii-postgres`

---

## What Happens When You Link

Render automatically sets these environment variables (you don't need to add them manually):

- `POSTGRES_HOST` - Database hostname
- `POSTGRES_PORT` - Database port (usually 5432)
- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DB` - Database name

These are set automatically - **DO NOT add them manually!**

---

## Visual Guide

### In Render Dashboard:

```
┌─────────────────────────────────────┐
│  Your Web Service Settings          │
├─────────────────────────────────────┤
│  ... (other settings) ...            │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Add Database                  │ │
│  ├───────────────────────────────┤ │
│  │                               │ │
│  │  [Existing Databases]         │ │
│  │  ┌─────────────────────────┐ │ │
│  │  │ ncii-postgres           │ │ │
│  │  │ [Link] [View Details]   │ │ │
│  │  └─────────────────────────┘ │ │
│  │                               │ │
│  │  OR                           │ │
│  │                               │ │
│  │  [Add PostgreSQL]             │ │
│  │  Name: ncii-postgres          │ │
│  │  Plan: [Free ▼]               │ │
│  │  [Create Database]             │ │
│  └───────────────────────────────┘ │
│                                     │
│  Environment Variables              │
│  (Add your API keys here)            │
└─────────────────────────────────────┘
```

---

## Verification

After linking, you can verify:

1. Go to your web service → **"Environment"** tab
2. You should see these variables (auto-set by Render):
   - `POSTGRES_HOST`
   - `POSTGRES_PORT`
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DB`

**If you see these, the database is linked correctly!**

---

## Troubleshooting

### "Database not found"
- Make sure the name is exactly `ncii-postgres` (case-sensitive)
- Check if it exists in your Render dashboard under "Databases"

### "Cannot link database"
- Make sure both service and database are in the same region
- Check that you have permission to link databases

### "Environment variables not set"
- Wait a few seconds after linking - Render sets them automatically
- Refresh the Environment Variables page
- If still missing, you can manually add them from the database's "Connections" tab

---

**Once linked, continue with adding environment variables!**

