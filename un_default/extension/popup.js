const summaryEl = document.getElementById("summary");
const listEl = document.getElementById("list");
const statusEl = document.getElementById("status");
const rescanBtn = document.getElementById("rescan");

function showStatus(message) {
  statusEl.hidden = false;
  statusEl.textContent = message;
  listEl.innerHTML = "";
}

function renderFindings(payload) {
  const findings = payload.findings || [];
  statusEl.hidden = true;
  listEl.innerHTML = "";

  const soft = findings.filter((f) => f.soft).length;
  summaryEl.textContent =
    findings.length === 0
      ? "No phrases to reconsider on this page."
      : `${findings.length} highlight${findings.length === 1 ? "" : "s"} on this page` +
        (soft ? ` · ${soft} may be quoted / context-sensitive` : "");

  if (!findings.length) {
    showStatus(
      "No rule matches here. Try another page, or re-scan after new content loads.",
    );
    return;
  }

  for (const f of findings) {
    const li = document.createElement("li");
    li.className = "finding";
    li.tabIndex = 0;

    const label = document.createElement("p");
    label.className = "label";
    label.textContent = f.label;

    const match = document.createElement("p");
    match.className = "match";
    match.textContent = `“${f.match}”`;

    const why = document.createElement("p");
    why.className = "why";
    why.textContent = f.why;

    const tryEl = document.createElement("p");
    tryEl.className = "try";
    tryEl.innerHTML =
      "<strong>Try:</strong> " +
      escapeHtml((f.suggestions || []).slice(0, 3).join(" · ") || "rephrase");

    const context = document.createElement("p");
    context.className = "context";
    context.innerHTML =
      "<strong>On page:</strong> " + escapeHtml(f.context || "");

    li.append(label, match, why, tryEl, context);

    if (f.soft) {
      const note = document.createElement("p");
      note.className = "note";
      note.textContent =
        "Often fine in quotes or self-description — check the surrounding context.";
      li.appendChild(note);
    }

    li.addEventListener("click", () => focusFinding(f.id));
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        focusFinding(f.id);
      }
    });
    listEl.appendChild(li);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function activeTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function ensureContentScript(tabId) {
  try {
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ["content.css"],
    });
  } catch {
    // CSS may already be present
  }
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"],
  });
}

async function sendToTab(message) {
  const tab = await activeTab();
  if (!tab?.id) throw new Error("No active tab.");
  if (!tab.url || !/^https?:/i.test(tab.url)) {
    throw new Error("Open a normal http(s) page to review.");
  }

  try {
    return await chrome.tabs.sendMessage(tab.id, message);
  } catch {
    // Tab opened before install/reload, or script not injected yet — inject now
    try {
      await ensureContentScript(tab.id);
      return await chrome.tabs.sendMessage(tab.id, message);
    } catch {
      throw new Error(
        "Couldn’t reach this page. Reload the tab, then open Un-Default again.",
      );
    }
  }
}

/** Always run a fresh scan on open — same path as Re-scan (avoids empty race). */
async function loadFindings() {
  summaryEl.textContent = "Scanning…";
  try {
    const payload = await sendToTab({ type: "RESCAN" });
    if (!payload?.ok && !payload?.findings) {
      throw new Error("No response from page.");
    }
    renderFindings(payload);
  } catch (err) {
    summaryEl.textContent = "Review unavailable";
    showStatus(err instanceof Error ? err.message : String(err));
  }
}

async function focusFinding(id) {
  try {
    await sendToTab({ type: "FOCUS_FINDING", id });
  } catch {
    // popup stays open; ignore
  }
}

rescanBtn.addEventListener("click", async () => {
  rescanBtn.disabled = true;
  summaryEl.textContent = "Re-scanning…";
  try {
    const payload = await sendToTab({ type: "RESCAN" });
    if (payload?.findings) {
      renderFindings(payload);
    } else {
      await loadFindings();
    }
  } catch (err) {
    showStatus(err instanceof Error ? err.message : String(err));
  } finally {
    rescanBtn.disabled = false;
  }
});

loadFindings();
