# Integration Guide: Adding FFord to darkai-consolidated

This guide explains how to integrate The Ledger project into your existing darkai-consolidated repository for deployment at `darkai.ca/ledger`.

## Integration Strategy

Since you want to use the existing Render service, we have two main options:

### Option 1: Monorepo Structure (Recommended)

Add this project as a subdirectory in your darkai-consolidated repo:

```
darkai-consolidated/
├── ledger/              # This project (FFord)
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── ...
├── [other projects]
└── package.json         # Root package.json (optional)
```

### Option 2: Build and Copy Static Files

Build this project and copy the static output to your main service's public directory.

## Step-by-Step Integration

### Step 1: Copy Project to darkai-consolidated

```bash
# From FFord directory
cd /Users/aazir/Desktop/Coding/personalprojects/FFord

# Copy to darkai-consolidated (adjust path as needed)
cp -r . /path/to/darkai-consolidated/ledger
```

### Step 2: Update Build Configuration

If your darkai-consolidated uses a monorepo structure:

**Option A: Separate build process**

Update your Render build command to:
```bash
cd ledger && npm install && BASE_PATH=/ledger STATIC_EXPORT=true npm run build
```

Then configure your main service to serve files from `ledger/out/` at `/ledger` path.

**Option B: Integrated build**

If you have a root `package.json`, add a script:
```json
{
  "scripts": {
    "build:ledger": "cd ledger && BASE_PATH=/ledger STATIC_EXPORT=true npm run build"
  }
}
```

### Step 3: Configure Routing

In your main darkai.ca service, configure routing to serve the ledger:

**If using Next.js/Express:**
```javascript
// Serve static files from ledger build
app.use('/ledger', express.static('ledger/out'));
```

**If using Nginx (in Render):**
```nginx
location /ledger {
    alias /opt/render/project/src/ledger/out;
    try_files $uri $uri/ /ledger/index.html;
}
```

**If using a simple static server:**
- Copy `ledger/out/*` to your `public/ledger/` directory
- Files will be served automatically at `/ledger`

### Step 4: Update Render Configuration

Update your `render.yaml` in darkai-consolidated:

```yaml
services:
  - type: web
    name: darkai
    env: node  # or static, depending on your setup
    buildCommand: |
      # Your existing build commands
      npm install
      # Build ledger
      cd ledger && npm install && BASE_PATH=/ledger STATIC_EXPORT=true npm run build
      cd ..
      # Your other build steps
    startCommand: npm start
```

## File Structure After Integration

```
darkai-consolidated/
├── ledger/                    # The Ledger project
│   ├── app/
│   ├── components/
│   ├── public/
│   │   └── data/processed/   # JSON data files
│   ├── out/                   # Built static files (after build)
│   ├── package.json
│   ├── next.config.js
│   └── ...
├── [your other projects]
├── public/                    # Main public directory (if applicable)
│   └── ledger/                # Copy ledger/out/* here for serving
├── package.json               # Root package.json
└── render.yaml                # Updated Render config
```

## Ensuring No Conflicts

### ✅ CSS Classes
- All Tailwind classes are scoped
- Custom classes use prefixes (`.canvas-container`, `.receipt-overlay`)
- No global CSS conflicts expected

### ✅ JavaScript
- All code is module-scoped
- No global variables
- React components are isolated

### ✅ File Paths
- All paths use `/ledger` prefix when built with `BASE_PATH=/ledger`
- Data files served from `/ledger/data/processed/`
- No absolute paths

## Build Script Example

Create a build script in your root `package.json`:

```json
{
  "scripts": {
    "build": "npm run build:ledger && [your other build commands]",
    "build:ledger": "cd ledger && npm install && BASE_PATH=/ledger STATIC_EXPORT=true npm run build"
  }
}
```

## Deployment Checklist

- [ ] Copy FFord project to `darkai-consolidated/ledger/`
- [ ] Update Render build command to build ledger
- [ ] Configure routing to serve `/ledger` path
- [ ] Test build locally
- [ ] Verify `darkai.ca/ledger` works after deployment
- [ ] Check all assets load correctly
- [ ] Verify data files load from `/ledger/data/processed/`

## Quick Integration Commands

```bash
# 1. Copy project
cp -r /Users/aazir/Desktop/Coding/personalprojects/FFord /path/to/darkai-consolidated/ledger

# 2. Build ledger
cd /path/to/darkai-consolidated/ledger
BASE_PATH=/ledger STATIC_EXPORT=true npm run build

# 3. Copy built files to your main public directory (if needed)
cp -r out/* /path/to/darkai-consolidated/public/ledger/
```

## Notes

- The ledger project is self-contained
- No shared dependencies required
- Can be built independently
- Static files can be served from any directory
- All paths are relative when using `BASE_PATH`
