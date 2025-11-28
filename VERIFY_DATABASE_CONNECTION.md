# 🔍 Verify Database Connection in Render

## The Problem

Your app is trying to connect to `localhost` instead of the Render database. This means the `POSTGRES_*` environment variables aren't being read.

## Step 1: Verify Database is Linked

1. **Go to your DarkAI web service** in Render dashboard
2. **Click "Environment"** tab
3. **Scroll down** and look for these 5 variables:
   - `POSTGRES_HOST`
   - `POSTGRES_PORT`
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DB`

**If you DON'T see these variables:**
- The database wasn't linked properly
- Go back to the "Environment" tab
- Click "+ Add" → "Add Datastore"
- Select "blackwire" database
- Save

## Step 2: Check Variable Values

The variables should have values like:

```
POSTGRES_HOST=dpg-xxxxx-a.oregon-postgres.render.com
POSTGRES_PORT=5432
POSTGRES_USER=blackwire_user
POSTGRES_PASSWORD=******** (hidden)
POSTGRES_DB=blackwire
```

**Important:** The `POSTGRES_HOST` should end with `.render.com`, NOT be `localhost`.

## Step 3: Restart the Service

After linking the database:

1. Go to your **DarkAI** service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
   - OR wait for auto-deploy if enabled
3. This ensures the app picks up the new environment variables

## Step 4: Check Build Logs

1. Go to **"Deploys"** tab
2. Click on the latest deploy
3. Check the build logs for any database connection errors
4. Look for: `POSTGRES_HOST` in the logs to verify it's being read

## Troubleshooting

### If variables are missing:
- The datastore linking might not have completed
- Try unlinking and re-linking the database
- Or manually add the variables (see below)

### If variables exist but app still uses localhost:
- The app might be caching old config
- Restart/redeploy the service
- Check that variables don't have quotes or extra spaces

### Manual Variable Setup (if linking doesn't work):

1. Go to **"blackwire"** database page
2. Click **"Connections"** or **"Info"** tab
3. Copy the connection details:
   - Host
   - Port
   - Database name
   - User
   - Password
4. Go to **DarkAI** service → **"Environment"** tab
5. Click **"Edit"** → **"+ Add"**
6. Add each variable manually:
   ```
   POSTGRES_HOST=<host from blackwire>
   POSTGRES_PORT=5432
   POSTGRES_USER=<user from blackwire>
   POSTGRES_PASSWORD=<password from blackwire>
   POSTGRES_DB=<database name from blackwire>
   ```
7. Save and redeploy

---

**Once the variables are set correctly, the app should connect to the Render database instead of localhost.**

