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
https://github.com/NomadBuilder/anti-default/issues
```

---

## Item name (max 75)

```
Anti-Default — Inclusive Language Highlights
```

## Short description (max 132)

```
See inclusive-language findings for the current page in the popup. Offline local rules — no AI, no tracking.
```

## Detailed description

```
Anti-Default reviews the page you’re on and lists inclusive-language findings in the extension popup — match, why it was flagged, and suggested rewrites. Phrases are also highlighted on the page; click a finding to jump to it.

How it works
• Matching runs entirely on your device from a bundled rule list
• No AI / LLM API calls and no account required
What to expect
• Context always wins — suggestions are starting points, not verdicts
• Soft-flags quoted text that is often a false positive
• Re-scan when a page loads new content

Privacy
• Page content is not sent to our servers by the extension
• Full policy: https://darkai.ca/anti-default/privacy/

Open source: https://github.com/NomadBuilder/anti-default
```

## Category

Primary: **Productivity**  
Secondary (optional): **Social & Communication** or leave blank

## Language

English

## Single purpose (justification — store asks this)

```
Review inclusive-language suggestions on the current web page using a local rule list, shown in the extension popup.
```

## Permission justifications

**activeTab**
```
Lets the popup ask the current tab for scan results when you open Anti-Default.
```

**scripting**
```
If the page was open before the extension loaded, injects the scanner when you open the popup so results still appear.
```

**Host permission / content scripts on http(s)://*/***
```
Needed to scan visible text on pages you visit, highlight matches, and return findings to the popup. Page content stays on your device; the extension does not upload it.
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

1. `screenshot-1-highlights-1280x800.png`
2. `screenshot-2-popup-1280x800.png`
3. Optional promo tile: `promo-tile-440x280.png`

## Store icon

Use `extension/icons/icon-128.png` (dashboard also uses the package icons).
