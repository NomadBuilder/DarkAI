# Build Dependencies Checklist

## ✅ Already Fixed

These dependencies have been moved from `devDependencies` to `dependencies` because they're needed during the build:

1. **TypeScript** (`typescript`) - Required for type checking during build
2. **Type Definitions** (`@types/node`, `@types/react`, `@types/react-dom`, `@types/d3`) - Required for TypeScript compilation
3. **PostCSS** (`postcss`) - Required for CSS processing
4. **Tailwind CSS** (`tailwindcss`) - Required for CSS generation
5. **Autoprefixer** (`autoprefixer`) - Required for CSS processing

## ✅ Safe to Keep in devDependencies

These are truly only needed for development, not during builds:

1. **ESLint** (`eslint`, `eslint-config-next`) - Disabled during builds via `next.config.js` (`eslint: { ignoreDuringBuilds: true }`)

## 🔍 Other Potential Issues to Watch For

### 1. Node.js Version
- **Issue**: Render might use a different Node version than local
- **Check**: Verify `NODE_VERSION` env var in Render matches local
- **Current**: Set to `22.16.0` in `render.yaml`

### 2. Build Scripts
- **Issue**: Scripts that run during build might need dependencies
- **Check**: `scripts/validate-build.js` only runs in `build:validate`, not regular build ✅
- **Status**: Safe - not called during production build

### 3. Config Files That Require Dependencies
- **postcss.config.js**: Requires `tailwindcss` and `autoprefixer` ✅ (moved to dependencies)
- **tailwind.config.js**: No external dependencies ✅
- **next.config.js**: Only uses Node.js built-ins (`path`) ✅

### 4. Missing Files in Git
- **Issue**: Files needed for build might be ignored by `.gitignore`
- **Check**: `public/data/processed/` is explicitly included ✅
- **Check**: Config files are committed ✅

### 5. Environment Variables
- **Issue**: Build might fail if env vars are missing
- **Current**: Build uses `NODE_ENV`, `BASE_PATH`, `STATIC_EXPORT` - all set in `render.yaml` ✅

### 6. Memory Limits
- **Issue**: Large builds might exhaust memory
- **Current**: Build is relatively small, no issues expected
- **If needed**: Can add `NODE_OPTIONS="--max-old-space-size=4096"` to build command

## 🧪 How to Test Locally

To verify your build will work on Render, test with production install:

```bash
# Clean install (simulates Render's production install)
rm -rf node_modules .next out
npm install --production=false  # Render installs all deps
NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build

# Verify output
test -d out && echo "✅ Build succeeded" || echo "❌ Build failed"
test -f out/index.html && echo "✅ index.html exists" || echo "❌ index.html missing"
```

## 📋 Rule of Thumb

**If a package is:**
- Used by Next.js during `next build` → Must be in `dependencies`
- Used by PostCSS/Tailwind during CSS processing → Must be in `dependencies`
- Used by TypeScript during type checking → Must be in `dependencies`
- Only used for linting/formatting → Can stay in `devDependencies` (if disabled during build)
- Only used in dev server → Can stay in `devDependencies`

## 🚨 Red Flags

Watch for these error patterns in build logs:

- `Cannot find module 'X'` → X needs to be in `dependencies`
- `TypeScript not found` → `typescript` needs to be in `dependencies`
- `PostCSS plugin not found` → PostCSS plugins need to be in `dependencies`
- `ESLint must be installed` → Either install ESLint in `dependencies` OR disable it in `next.config.js` ✅ (we disabled it)

## ✅ Current Status

**All build-time dependencies are correctly placed!**

The build has been tested with `npm install --production=false` and succeeds. All required packages are in `dependencies`.
