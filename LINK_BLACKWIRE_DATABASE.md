# 🔗 How to Use Existing "blackwire" Database

## Quick Method: Get Connection Details from Database Page

Since you already have the "blackwire" database, you can manually add the connection variables:

### Step 1: Get Database Connection Details

1. **Click on "blackwire"** in your services list (the database row you showed)
2. This will open the database details page
3. Look for **"Connections"** or **"Connection Info"** section
4. You'll see:
   - **Internal Database URL** (or connection string)
   - **Host**
   - **Port**
   - **Database Name**
   - **User**
   - **Password** (may be hidden, click to reveal)

### Step 2: Add Environment Variables Manually

1. **Go back to your DarkAI web service** → **"Environment"** tab
2. **Click "Edit"** button (top right of Environment Variables section)
3. **Click "+ Add"** to add each variable:

Add these 5 variables:

```
POSTGRES_HOST=<host from blackwire database>
POSTGRES_PORT=5432
POSTGRES_USER=<user from blackwire database>
POSTGRES_PASSWORD=<password from blackwire database>
POSTGRES_DB=<database name from blackwire database>
```

### Step 3: Save and Redeploy

1. Click **"Save Changes"**
2. Render will automatically redeploy with the new variables

---

## Alternative: Link from Database Page

Some Render interfaces allow linking from the database page:

1. **Click on "blackwire"** database
2. Look for **"Link to Service"** or **"Connect Service"** button
3. Select your **"DarkAI"** web service
4. Render will automatically add the `POSTGRES_*` variables

---

## What the Connection Details Look Like

From the blackwire database page, you should see something like:

```
Internal Database URL:
postgresql://blackwire_user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/blackwire

Or separate fields:
Host: dpg-xxxxx-a.oregon-postgres.render.com
Port: 5432
Database: blackwire
User: blackwire_user
Password: [hidden - click to reveal]
```

Copy these values into your environment variables!

---

## Verification

After adding the variables:

1. Go to **DarkAI service** → **"Environment"** tab
2. You should see all 5 `POSTGRES_*` variables listed
3. The build should now connect to the database successfully

