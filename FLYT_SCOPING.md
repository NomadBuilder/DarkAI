# Flyt Landing Page - CSS Scoping

## Overview

All Flyt landing page styles are **fully scoped** under `.flyt-page` to prevent any conflicts with DarkAI's existing styles.

## How It Works

1. **HTML**: The `<body>` tag has `class="flyt-page"` 
2. **CSS**: All selectors are prefixed with `.flyt-page`
3. **Exceptions**: `@keyframes` and `@media` queries remain at root level (required for proper functionality)

## Example

**Before (unscoped):**
```css
.nav {
    position: fixed;
}
```

**After (scoped):**
```css
.flyt-page .nav {
    position: fixed;
}
```

## Verification

- ✅ All class selectors prefixed with `.flyt-page`
- ✅ All ID selectors prefixed with `.flyt-page`
- ✅ Global reset (`*`) scoped to `.flyt-page *`
- ✅ CSS variables scoped to `.flyt-page`
- ✅ `@keyframes` remain at root (required)
- ✅ `@media` queries remain at root (required)

## No Conflicts

The Flyt landing page styles will **never** affect:
- DarkAI homepage
- PersonaForge
- BlackWire
- ShadowStack
- Any other DarkAI pages

All styles are isolated to elements within `.flyt-page`.

