# Chrome Web Store listing — Anti-Default

Copy/paste these fields into the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).

Privacy policy URL (required):

```
https://darkai.ca/anti-default/privacy/
```

Homepage:

```
https://darkai.ca/anti-default/
```

Support URL (issues):

```
https://github.com/NomadBuilder/DarkAI/issues
```

---

## Item name (max 75)

```
Anti-Default — Inclusive Language Highlights
```

## Short description (max 132)

```
Highlight inclusive-language suggestions on any page. Offline local rules — no AI calls, no tracking.
```

## Detailed description

```
Anti-Default highlights phrases on live web pages that often carry colonial, gendered, ableist, or other default-heavy framing — so you can rethink them in context.

How it works
• Matching runs entirely on your device from a bundled rule list
• No AI / LLM API calls and no account required
• Hover a highlight to see why it was flagged and suggested alternatives
• Soft-flags quoted text that is often a false positive
• Toggle highlights on or off from the toolbar popup

What this is not
• Not a purity test or automated “cancel” tool
• Context always wins — suggestions are starting points
• For deeper multi-page review, rewrite preview, and exports, use the free web app: https://darkai.ca/anti-default/

Privacy
• Page content is not sent to our servers by the extension
• Only the on/off preference is stored (Chrome sync storage)
• Full policy: https://darkai.ca/anti-default/privacy/

Open source as part of DarkAI: https://github.com/NomadBuilder/DarkAI
```

## Category

Primary: **Productivity**  
Secondary (optional): **Social & Communication** or leave blank

## Language

English

## Single purpose (justification — store asks this)

```
Highlight inclusive-language suggestions on web pages using a local rule list so writers and reviewers can notice default-heavy phrasing.
```

## Permission justifications

**storage**
```
Saves whether highlights are turned on or off in the popup.
```

**Host permission / content scripts on http(s)://*/***
```
Needed to scan visible text on pages you visit and insert highlight marks. Page content stays on your device; the extension does not upload it.
```

## Remote code

Answer **No** — the package contains only local JS/CSS/JSON. No remote scripts.

## Data usage / privacy practices (dashboard checkboxes)

Typically select:
- Does not collect user data  
  OR if the form forces categories: only “Extension options / preferences” stored locally via Chrome storage — not sold, not used for ads, not transferred.

Declare clearly that you do **not**:
- Sell data
- Use data for advertising
- Transfer data to third parties for unrelated purposes

## Screenshots to upload

From `extension/store/assets/`:

1. `screenshot-1-highlights-1280x800.png` (required — at least one 1280×800 or 640×400)
2. `screenshot-2-popup-1280x800.png`
3. Optional promo tile: `promo-tile-440x280.png`

## Store icon

Use `extension/icons/icon-128.png` (dashboard also uses the package icons).
