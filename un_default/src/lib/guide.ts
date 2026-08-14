import type { RulePreferences } from "./types";
import { LANGUAGE_RULES } from "./rules";
import { resolveRules } from "./preferences";
import { CATEGORY_META, CATEGORY_ORDER } from "./types";
import { suggestionDisplayTexts } from "./suggestions";

/** Compact prefs for URL sharing (only non-defaults). */
export function prefsToSharePayload(prefs: RulePreferences): string {
  const compact: RulePreferences = {};
  for (const rule of LANGUAGE_RULES) {
    const p = prefs[rule.id];
    if (!p) continue;
    const enabled = p.enabled !== false;
    if (enabled) continue;
    compact[rule.id] = { enabled: false };
  }
  const json = JSON.stringify(compact);
  if (typeof btoa === "function") {
    return btoa(unescape(encodeURIComponent(json)));
  }
  return json;
}

export function prefsFromSharePayload(payload: string): RulePreferences | null {
  try {
    let json = payload;
    if (typeof atob === "function" && !payload.trim().startsWith("{")) {
      json = decodeURIComponent(escape(atob(payload)));
    }
    const parsed = JSON.parse(json) as RulePreferences;
    return parsed;
  } catch {
    return null;
  }
}

export function buildGuideMarkdown(prefs: RulePreferences): string {
  const rules = resolveRules(prefs);
  const lines = [
    `# Un-Default style guide`,
    ``,
    `_Generated from tuned rules — invitations to reconsider defaults._`,
    ``,
    `Active rules: **${rules.length}**`,
    ``,
  ];

  for (const category of CATEGORY_ORDER) {
    const group = rules.filter((r) => r.category === category);
    if (group.length === 0) continue;
    lines.push(`## ${CATEGORY_META[category].title}`);
    lines.push(``);
    lines.push(CATEGORY_META[category].description);
    lines.push(``);
    for (const rule of group) {
      lines.push(`### ${rule.label}`);
      lines.push(``);
      lines.push(rule.why);
      lines.push(``);
      lines.push(
        `**Prefer:** ${suggestionDisplayTexts(rule.suggestions).join("; ")}`,
      );
      lines.push(``);
    }
  }

  return lines.join("\n");
}
