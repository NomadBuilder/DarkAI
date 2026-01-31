# Deploy ProtectOnt.ca to Render

## 1. One-time setup (if not already done)

1. **Push this repo to GitHub** (if you use Git; Render can also connect via GitLab or direct deploy).
2. **Go to [Render Dashboard](https://dashboard.render.com)** → **New** → **Static Site**.
3. **Connect your repository** (e.g. the FFord repo) and select the branch to deploy (e.g. `main`).

## 2. Build settings (Blueprint or manual)

If you use the **Blueprint** (`render.yaml` in this repo):

- Render will read `render.yaml` and create a static site named **protectont** with:
  - **Build command:** `npm ci && STATIC_EXPORT=true NODE_ENV=production npm run build`
  - **Publish directory:** `out`

If you **configure manually** in the dashboard:

| Field | Value |
|-------|--------|
| **Build Command** | `npm ci && STATIC_EXPORT=true NODE_ENV=production npm run build` |
| **Publish Directory** | `out` |

## 3. Deploy

- **Save** the static site. Render will run the build and deploy.
- After the first successful deploy, the site is live at `https://<your-service-name>.onrender.com`.

## 4. Custom domain (ProtectOnt.ca)

1. In the Render dashboard, open your static site → **Settings** → **Custom Domains**.
2. Click **Add Custom Domain** and enter **protectont.ca** (and optionally **www.protectont.ca**).
3. Follow Render’s DNS instructions for your registrar (usually an A/ALIAS record for root, CNAME for `www`).
4. Wait for DNS and certificate provisioning (often a few minutes).

## 5. Future deploys

- Every push to the connected branch triggers a new build and deploy.
- No need to run the build locally before pushing; Render runs it in the cloud.

## Optional: Deploy from this repo without Blueprint

If you don’t use a Blueprint, create the static site in the dashboard and set **Build Command** and **Publish Directory** as in the table above. The repo’s `render.yaml` is for Blueprint-based deploys and sets the same values.
