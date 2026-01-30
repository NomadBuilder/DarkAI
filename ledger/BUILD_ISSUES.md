# Build Process Issues & Solutions

## Root Causes of Blank Pages

The blank page issue happens when:

1. **React Component Errors**: Uncaught errors in components crash the entire app
2. **Build Cache Corruption**: Stale `.next` cache contains broken module references
3. **Runtime Errors**: Errors during data fetching or rendering that aren't caught
4. **Missing Error Boundaries**: No fallback UI when errors occur

## Solutions Implemented

### 1. Error Boundary (`components/ErrorBoundary.tsx`)
- Catches React component errors
- Shows a user-friendly error message instead of blank page
- Provides a reload button
- Logs errors to console for debugging

### 2. Improved Next.js Config
- Better webpack watch options for file changes
- Disabled minification in dev for faster builds
- Optimized on-demand entry management

### 3. Safe Dev Script (`scripts/dev-safe.sh`)
- Clears cache before starting
- Validates build before starting dev server
- Prevents starting with broken builds

### 4. Better Error Handling
- Components now have try/catch blocks
- Data fetching has timeouts and error states
- Graceful fallbacks when data fails to load

## Usage

### Normal Development
```bash
npm run dev
```

### If You Get Blank Pages
```bash
npm run dev:reset
```

### For Maximum Safety
```bash
npm run dev:safe
```

## What to Check When Page Goes Blank

1. **Browser Console** (F12): Look for JavaScript errors
2. **Terminal**: Check for build errors or warnings
3. **Network Tab**: Verify data files are loading (check `/data/processed/*.json`)
4. **Component Errors**: Check if a specific component is throwing

## Prevention

- Always use `npm run dev:reset` after major changes
- Check browser console regularly during development
- Use the Error Boundary to catch issues early
- Keep data files in `public/data/processed/` up to date
