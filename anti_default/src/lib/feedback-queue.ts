import type { FeedbackEvent } from "./feedback";
import { FEEDBACK_STORAGE_KEY } from "./feedback";

export interface FeedbackQueueSummary {
  total: number;
  fineInContext: number;
  falsePositive: number;
  badSuggestion: number;
  byRule: Array<{ ruleId: string; count: number; kinds: string[] }>;
}

export function loadFeedbackEvents(): FeedbackEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (event): event is FeedbackEvent =>
        Boolean(event) &&
        typeof event === "object" &&
        event.version === 1 &&
        typeof event.ruleId === "string" &&
        typeof event.kind === "string",
    );
  } catch {
    return [];
  }
}

export function clearFeedbackEvents(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(FEEDBACK_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function summarizeFeedback(events: FeedbackEvent[]): FeedbackQueueSummary {
  const byRuleMap = new Map<string, { count: number; kinds: Set<string> }>();
  let fineInContext = 0;
  let falsePositive = 0;
  let badSuggestion = 0;

  for (const event of events) {
    if (event.kind === "fine_in_context") fineInContext += 1;
    if (event.kind === "false_positive") falsePositive += 1;
    if (event.kind === "bad_suggestion") badSuggestion += 1;
    const entry = byRuleMap.get(event.ruleId) ?? {
      count: 0,
      kinds: new Set<string>(),
    };
    entry.count += 1;
    entry.kinds.add(event.kind);
    byRuleMap.set(event.ruleId, entry);
  }

  const byRule = [...byRuleMap.entries()]
    .map(([ruleId, value]) => ({
      ruleId,
      count: value.count,
      kinds: [...value.kinds],
    }))
    .sort((a, b) => b.count - a.count);

  return {
    total: events.length,
    fineInContext,
    falsePositive,
    badSuggestion,
    byRule,
  };
}

export function downloadFeedbackJson(events: FeedbackEvent[]): void {
  const blob = new Blob([JSON.stringify(events, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `anti-default-feedback-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function feedbackToMarkdown(events: FeedbackEvent[]): string {
  const summary = summarizeFeedback(events);
  const lines = [
    "# Anti-Default false-positive / fine-in-context queue",
    "",
    `- **Events:** ${summary.total}`,
    `- **Fine in context:** ${summary.fineInContext}`,
    `- **False positive:** ${summary.falsePositive}`,
    `- **Bad suggestion:** ${summary.badSuggestion}`,
    "",
    "## By rule",
    "",
  ];
  for (const row of summary.byRule) {
    lines.push(`- \`${row.ruleId}\` — ${row.count} (${row.kinds.join(", ")})`);
  }
  lines.push("", "## Events", "");
  for (const event of events.slice().reverse()) {
    lines.push(`### ${event.kind} · \`${event.ruleId}\``);
    lines.push("");
    lines.push(`- **Match:** “${event.match}”`);
    lines.push(`- **When:** ${event.createdAt}`);
    if (event.source) lines.push(`- **Source:** ${event.source}`);
    lines.push(`- **Context:** ${event.context}`);
    if (event.note) lines.push(`- **Note:** ${event.note}`);
    lines.push("");
  }
  return lines.join("\n");
}

export function downloadFeedbackMarkdown(events: FeedbackEvent[]): void {
  const blob = new Blob([feedbackToMarkdown(events)], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `anti-default-feedback-${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
