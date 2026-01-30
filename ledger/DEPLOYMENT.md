# Deployment Guide for Render.com

This guide covers deploying The Ledger to Render.com under your darkai.ca domain.

## Prerequisites

- Render.com account
- darkai.ca domain configured in Render
- Git repository with this code

## Deployment Options

### Option 1: Static Site (Recommended for Subdomain/Path)

Best for: `ledger.darkai.ca` or `darkai.ca/ledger`

**Advantages:**
- No server costs
- Faster loading
- No conflicts with other services
- Easy to deploy

**Steps:**

1. **Update render.yaml** to use static export:
   ```yaml
   services:
     - type: web
       name: the-ledger
       env: static
       buildCommand: npm install && npm run build:static
       staticPublishPath: ./out
   ```

2. **Deploy:**
   - Connect your Git repository to Render
   - Render will automatically detect `render.yaml`
   - Build will run automatically

### Option 2: Node.js Service (For Full Next.js Features)

Best for: `ledger.darkai.ca` (standalone subdomain)

**Advantages:**
- Full Next.js server features
- API routes support (if needed)
- Better for dynamic content

**Steps:**

1. **Use the default render.yaml** (already configured)

2. **Deploy:**
   - Connect your Git repository to Render
   - Render will automatically detect `render.yaml`
   - Build will run automatically

## Domain Configuration

### Subdomain Setup (Recommended)

1. In Render dashboard, go to your service
2. Go to Settings → Custom Domains
3. Add custom domain: `ledger.darkai.ca`
4. Render will provide DNS records to add:
   - CNAME: `ledger` → `your-service.onrender.com`

### Path Setup (If using static site)

If you want `darkai.ca/ledger`:
- Configure in your main darkai.ca service
- Use reverse proxy or static file serving
- May require additional configuration

## Ensuring No Conflicts

### CSS Class Scoping

✅ **Already Safe:**
- All styles use Tailwind CSS (scoped by default)
- Custom CSS classes are prefixed (`.canvas-container`, `.receipt-overlay`)
- No global CSS conflicts expected

### Component Names

✅ **Already Safe:**
- All components use unique names
- No generic names like `Button`, `Card` that might conflict
- Components are in `@/components/` namespace

### JavaScript Globals

✅ **Already Safe:**
- No global variables exposed
- All code is module-scoped
- React components are isolated

## Build Verification

Before deploying, verify the build works:

```bash
# Test production build
npm run build

# Test static export (if using Option 1)
npm run build:static
```

## Environment Variables

Currently, no environment variables are required. If you need to add any:

1. In Render dashboard → Environment
2. Add variables as needed
3. Update `render.yaml` to include them

## Post-Deployment Checklist

- [ ] Verify site loads at your domain
- [ ] Test all interactive features
- [ ] Check mobile responsiveness
- [ ] Verify data files load correctly (`/data/processed/*.json`)
- [ ] Test navigation and scrolling
- [ ] Check console for errors
- [ ] Verify all external links work

## Troubleshooting

### Build Fails

1. Check Render build logs
2. Verify Node.js version (should be 18+)
3. Ensure all dependencies are in `package.json`
4. Check that data files exist in `public/data/processed/`

### CSS Not Loading

1. Verify Tailwind is building correctly
2. Check that `globals.css` is imported in `layout.tsx`
3. Ensure PostCSS is configured correctly

### Data Not Loading

1. Verify JSON files are in `public/data/processed/`
2. Check browser console for fetch errors
3. Ensure paths are relative (they should be)

### Domain Not Working

1. Verify DNS records are correct
2. Wait for DNS propagation (up to 48 hours)
3. Check Render custom domain settings
4. Verify SSL certificate is issued

## File Structure for Deployment

```
FFord/
├── app/                    # Next.js app directory
├── components/             # React components
├── public/                 # Static assets (including data/)
│   └── data/processed/    # JSON data files
├── package.json           # Dependencies
├── next.config.js         # Next.js config
├── tailwind.config.js     # Tailwind config
├── tsconfig.json          # TypeScript config
└── render.yaml            # Render deployment config
```

## Notes

- The `.renderignore` file excludes development files from deployment
- All data files must be in `public/data/processed/` (they are)
- The build process is configured in `package.json`
- No database or external services required

## Support

If you encounter issues:
1. Check Render build logs
2. Review browser console for errors
3. Verify all files are committed to Git
4. Ensure Node.js version matches (18+)
