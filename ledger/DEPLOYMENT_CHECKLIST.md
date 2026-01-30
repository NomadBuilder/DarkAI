# Deployment Checklist for Render.com

## Pre-Deployment

- [x] ✅ Build process verified (`npm run build` works)
- [x] ✅ Static export tested (`STATIC_EXPORT=true npm run build` works)
- [x] ✅ Viewport metadata warning fixed
- [x] ✅ All data files in `public/data/processed/`
- [x] ✅ CSS classes are scoped (Tailwind + custom prefixes)
- [x] ✅ No global JavaScript conflicts
- [x] ✅ Component names are unique
- [x] ✅ Render configuration files created

## Deployment Steps

### 1. Choose Deployment Type

**Static Site (Recommended):**
- ✅ No server costs
- ✅ Faster loading
- ✅ No conflicts with other services
- Use: `render-static.yaml` (rename to `render.yaml`)

**Node.js Service:**
- ✅ Full Next.js features
- ✅ API routes support
- Use: Current `render.yaml`

### 2. Connect to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Render will auto-detect `render.yaml`

### 3. Configure Domain

1. In Render dashboard → Your Service → Settings
2. Go to "Custom Domains"
3. Add: `ledger.darkai.ca`
4. Follow DNS instructions:
   - Add CNAME: `ledger` → `your-service.onrender.com`

### 4. Deploy

1. Render will automatically build on first push
2. Monitor build logs
3. Wait for SSL certificate (automatic)

## Post-Deployment Verification

- [ ] Site loads at `ledger.darkai.ca`
- [ ] All sections render correctly
- [ ] Data visualizations work
- [ ] Navigation works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] All external links work
- [ ] Data files load (`/data/processed/*.json`)

## Conflict Prevention

### ✅ Already Safe:

1. **CSS Classes:**
   - Tailwind CSS (scoped by default)
   - Custom classes prefixed: `.canvas-container`, `.receipt-overlay`
   - No global conflicts expected

2. **Component Names:**
   - All unique: `ScrollyContainer`, `LedgerCanvas`, etc.
   - No generic names that might conflict

3. **JavaScript:**
   - All module-scoped
   - No global variables
   - React components isolated

4. **File Paths:**
   - All relative paths
   - Data in `/public/data/processed/`
   - No absolute paths

## Troubleshooting

### Build Fails
- Check Node.js version (needs 18+)
- Verify all dependencies in `package.json`
- Check Render build logs

### CSS Not Loading
- Verify Tailwind build
- Check `globals.css` import
- Ensure PostCSS config

### Data Not Loading
- Verify JSON files in `public/data/processed/`
- Check browser console
- Verify paths are relative

### Domain Issues
- Wait for DNS propagation (up to 48h)
- Verify DNS records
- Check SSL certificate status

## Files Created for Deployment

- ✅ `render.yaml` - Main Render config (Node.js)
- ✅ `render-static.yaml` - Static site config (alternative)
- ✅ `.renderignore` - Files to exclude from deployment
- ✅ `DEPLOYMENT.md` - Full deployment guide
- ✅ `DEPLOYMENT_CHECKLIST.md` - This file

## Quick Start

1. **For Static Site:**
   ```bash
   mv render.yaml render-node.yaml
   mv render-static.yaml render.yaml
   git add render.yaml
   git commit -m "Configure for static deployment"
   git push
   ```

2. **For Node.js Service:**
   ```bash
   # Use current render.yaml (already configured)
   git add render.yaml
   git commit -m "Configure for Render deployment"
   git push
   ```

3. **Connect to Render:**
   - Go to Render dashboard
   - New Web Service
   - Connect Git repo
   - Render auto-detects config

## Notes

- All data files are in `public/data/processed/` ✅
- Build process is verified ✅
- No environment variables needed ✅
- No database required ✅
- Fully self-contained ✅
