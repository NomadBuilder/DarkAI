# Systematic Testing Plan to Fix Build

## Hypothesis 1: New Pages Are Breaking the Build

### Test 1: Remove New Pages (Isolate the Issue)

**Goal:** See if build works with just original 4 pages

**Steps:**
1. Temporarily rename/disable new pages
2. Try build
3. If it works → new pages are the problem
4. If it fails → something else is wrong

### Test 2: Add Pages One at a Time

**Goal:** Find which specific page breaks it

**Steps:**
1. Start with original 4 pages (should work)
2. Add `/about` → test build
3. Add `/water` → test build  
4. Add `/water_billcalculator` → test build
5. First one that breaks = the culprit

## Hypothesis 2: TypeScript Errors

### Test 3: Check All TypeScript Errors

**Goal:** Find any hidden TypeScript errors

**Steps:**
1. Run `tsc --noEmit` locally
2. Fix all errors
3. Try build

## Hypothesis 3: Build Process Issue

### Test 4: Compare Build Output

**Goal:** See exactly where build fails

**Steps:**
1. Run build manually in Render shell
2. Capture full output
3. Compare with working commit's build output

