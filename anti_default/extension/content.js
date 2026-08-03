/**
 * Anti-Default content script — highlights matches on the live page.
 * Rules load from rules.json (regenerate: npm run extension:rules).
 */
(() => {
  const SKIP = new Set([
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "TEXTAREA",
    "INPUT",
    "SELECT",
    "OPTION",
    "CODE",
    "PRE",
    "SVG",
    "CANVAS",
  ]);

  const SEVERITY_LABEL = {
    high: "Worth fixing",
    medium: "Consider",
    low: "Optional",
  };

  const PLACE =
    /\b(?:land|lands|america|americas|continent|island|country|nation|people|tribe|world|africa|asia|australia|india|canada|mexico|brazil|territory|indigenous|settler|colony|voyage|explorer)\b/i;
  const TECH_DISCOVER =
    /\b(?:a\s+bug|the\s+bug|bugs?\b|issues?\b|vulnerabilit(?:y|ies)|errors?\b|flaws?\b|problems?\b)\b/i;

  let enabled = true;
  let rules = [];

  chrome.storage.sync.get({ enabled: true }, (data) => {
    enabled = data.enabled !== false;
    if (enabled) boot();
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) {
      enabled = changes.enabled.newValue !== false;
      clearMarks();
      if (enabled) scan();
    }
  });

  async function boot() {
    try {
      const url = chrome.runtime.getURL("rules.json");
      const res = await fetch(url);
      const data = await res.json();
      rules = data.rules || [];
      scan();
    } catch (err) {
      console.warn("[Anti-Default] Could not load rules", err);
    }
  }

  function clearMarks() {
    document.querySelectorAll("mark.anti-default-hit").forEach((el) => {
      const parent = el.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(el.textContent || ""), el);
      parent.normalize();
    });
    document.getElementById("anti-default-toast")?.remove();
  }

  function shouldSkipDiscover(near) {
    if (TECH_DISCOVER.test(near)) return true;
    if (!PLACE.test(near)) return true;
    return false;
  }

  function inQuotes(text, index, length) {
    const before = text.slice(Math.max(0, index - 80), index);
    const after = text.slice(index + length, index + length + 80);
    const opens = (before.match(/"/g) || []).length;
    const closes = (after.match(/"/g) || []).length;
    return opens % 2 === 1 && closes >= 1;
  }

  function scan() {
    if (!enabled || !rules.length) return;
    clearMarks();
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const p = node.parentElement;
          if (!p || SKIP.has(p.tagName)) return NodeFilter.FILTER_REJECT;
          if (p.closest("mark.anti-default-hit"))
            return NodeFilter.FILTER_REJECT;
          if (!node.nodeValue || !node.nodeValue.trim())
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    let hitCount = 0;
    let softCount = 0;

    for (const node of textNodes) {
      const text = node.nodeValue;
      if (!text) continue;
      const replacements = [];

      for (const rule of rules) {
        try {
          const re = new RegExp(rule.pattern, "gi");
          let m;
          while ((m = re.exec(text)) !== null) {
            const near = text.slice(
              Math.max(0, m.index - 90),
              Math.min(text.length, m.index + m[0].length + 90),
            );
            if (rule.id === "discover-land" && shouldSkipDiscover(near)) {
              continue;
            }
            const soft = inQuotes(text, m.index, m[0].length);
            replacements.push({
              start: m.index,
              end: m.index + m[0].length,
              rule,
              soft,
            });
            if (m.index === re.lastIndex) re.lastIndex += 1;
          }
        } catch {
          // bad pattern — skip
        }
      }

      if (!replacements.length) continue;
      replacements.sort((a, b) => a.start - b.start);

      const frag = document.createDocumentFragment();
      let cursor = 0;
      for (const r of replacements) {
        if (r.start < cursor) continue;
        if (r.start > cursor) {
          frag.appendChild(
            document.createTextNode(text.slice(cursor, r.start)),
          );
        }
        const mark = document.createElement("mark");
        mark.className =
          "anti-default-hit" + (r.soft ? " anti-default-soft" : "");
        mark.textContent = text.slice(r.start, r.end);
        const tip = [
          r.rule.label,
          SEVERITY_LABEL[r.rule.severity] || r.rule.severity,
          r.soft ? "Likely false positive (quoted)" : "",
          r.rule.why,
          r.rule.suggestions?.length
            ? "Try: " + r.rule.suggestions.slice(0, 3).join(" · ")
            : "",
        ]
          .filter(Boolean)
          .join("\n");
        mark.title = tip;
        frag.appendChild(mark);
        hitCount += 1;
        if (r.soft) softCount += 1;
        cursor = r.end;
      }
      if (cursor < text.length) {
        frag.appendChild(document.createTextNode(text.slice(cursor)));
      }
      node.parentNode?.replaceChild(frag, node);
    }

    showToast(hitCount, softCount);
  }

  function showToast(hits, soft) {
    document.getElementById("anti-default-toast")?.remove();
    if (!hits) return;
    const el = document.createElement("div");
    el.id = "anti-default-toast";
    el.innerHTML =
      "<strong>Anti-Default</strong> · " +
      hits +
      " highlight" +
      (hits === 1 ? "" : "s") +
      (soft ? " (" + soft + " soft-flagged)" : "") +
      '<br/><a href="https://darkai.ca/anti-default/" target="_blank" rel="noopener">Open full review</a>';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 8000);
  }
})();
