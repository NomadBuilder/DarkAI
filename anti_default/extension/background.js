/**
 * Sets the toolbar badge to the finding count for a tab.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== "SET_BADGE") return;

  const tabId = sender.tab?.id;
  if (tabId == null) {
    sendResponse({ ok: false });
    return;
  }

  const count = Number(message.count) || 0;
  const text = count <= 0 ? "" : count > 99 ? "99+" : String(count);

  chrome.action.setBadgeText({ tabId, text });
  chrome.action.setBadgeBackgroundColor({
    tabId,
    color: "#1a524a",
  });
  if (chrome.action.setBadgeTextColor) {
    chrome.action.setBadgeTextColor({ tabId, color: "#f6f1e8" });
  }

  sendResponse({ ok: true, text });
  return true;
});

// Clear badge when the tab starts loading a new document
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    chrome.action.setBadgeText({ tabId, text: "" });
  }
});
