/**
 * Anti-Default content script — highlights matches and serves findings to the popup.
 */
(() => {
  if (globalThis.__antiDefaultLoaded) return;
  globalThis.__antiDefaultLoaded = true;

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

  const PLACE =
    /\b(?:land|lands|america|americas|continent|island|country|nation|people|tribe|world|africa|asia|australia|india|canada|mexico|brazil|territory|indigenous|settler|colony|voyage|explorer)\b/i;
  const TECH_DISCOVER =
    /\b(?:a\s+bug|the\s+bug|bugs?\b|issues?\b|vulnerabilit(?:y|ies)|errors?\b|flaws?\b|problems?\b)\b/i;

  let rules = [];
  /** @type {Array<Record<string, unknown>>} */
  let findings = [];

  boot();

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== "object") return;

    if (message.type === "GET_FINDINGS") {
      sendResponse({
        ok: true,
        url: location.href,
        title: document.title,
        findings,
      });
      return true;
    }

    if (message.type === "FOCUS_FINDING") {
      const el = document.querySelector(
        `mark.anti-default-hit[data-ad-id="${CSS.escape(String(message.id))}"]`,
      );
      if (el) {
        document
          .querySelectorAll("mark.anti-default-hit.anti-default-focus")
          .forEach((m) => m.classList.remove("anti-default-focus"));
        el.classList.add("anti-default-focus");
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        sendResponse({ ok: true });
      } else {
        sendResponse({ ok: false });
      }
      return true;
    }

    if (message.type === "RESCAN") {
      scan().then(() => {
        sendResponse({ ok: true, findings });
      });
      return true;
    }
  });

  async function boot() {
    try {
      const url = chrome.runtime.getURL("rules.json");
      const res = await fetch(url);
      const data = await res.json();
      rules = data.rules || [];
      await scan();
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
    findings = [];
    updateBadge(0);
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

  function snippet(text, index, length) {
    const start = Math.max(0, index - 48);
    const end = Math.min(text.length, index + length + 48);
    const prefix = start > 0 ? "…" : "";
    const suffix = end < text.length ? "…" : "";
    return (
      prefix +
      text.slice(start, end).replace(/\s+/g, " ").trim() +
      suffix
    );
  }

  async function scan() {
    if (!rules.length || !document.body) return;
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

    let softCount = 0;
    let seq = 0;

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
              match: m[0],
              context: snippet(text, m.index, m[0].length),
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
        seq += 1;
        const id = String(seq);
        const mark = document.createElement("mark");
        mark.className =
          "anti-default-hit" + (r.soft ? " anti-default-soft" : "");
        mark.dataset.adId = id;
        mark.textContent = text.slice(r.start, r.end);
        mark.title = [r.rule.label, r.soft ? "Check surrounding context" : ""]
          .filter(Boolean)
          .join(" · ");
        frag.appendChild(mark);

        findings.push({
          id,
          ruleId: r.rule.id,
          match: r.match,
          label: r.rule.label,
          why: r.rule.why,
          suggestions: r.rule.suggestions || [],
          category: r.rule.category,
          soft: Boolean(r.soft),
          context: r.context,
        });
        if (r.soft) softCount += 1;
        cursor = r.end;
      }
      if (cursor < text.length) {
        frag.appendChild(document.createTextNode(text.slice(cursor)));
      }
      node.parentNode?.replaceChild(frag, node);
    }

    showToast(findings.length, softCount);
    updateBadge(findings.length);
  }

  function updateBadge(count) {
    try {
      chrome.runtime.sendMessage({ type: "SET_BADGE", count }, () => {
        void chrome.runtime.lastError;
      });
    } catch {
      // ignore
    }
  }

  function showToast(hits, soft) {
    document.getElementById("anti-default-toast")?.remove();
    if (!hits) return;
    const el = document.createElement("div");
    el.id = "anti-default-toast";
    el.setAttribute("role", "status");
    el.innerHTML =
      "<strong>Anti-Default</strong> · " +
      hits +
      " highlight" +
      (hits === 1 ? "" : "s") +
      (soft ? " (" + soft + " soft-flagged)" : "") +
      "<br/><span class=\"anti-default-toast-hint\">Open the toolbar icon for details</span>";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 6000);
  }
})();
