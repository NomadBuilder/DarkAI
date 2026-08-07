import type { Finding } from "./types";

export type FeedbackKind = "fine_in_context" | "false_positive" | "bad_suggestion";

export interface FeedbackEvent {
  version: 1;
  kind: FeedbackKind;
  createdAt: string;
  ruleId: string;
  match: string;
  label?: string;
  category?: string;
  context: string;
  source?: string;
  contextModes?: Finding["contextModes"];
  soft?: boolean;
  note?: string;
  /** Helps shared-model training without shipping private paths. */
  sourceKind?: "web" | "cli" | "extension" | "mcp";
}

export function feedbackEventFromFinding(
  finding: Finding,
  kind: FeedbackKind,
  options?: { note?: string; sourceKind?: FeedbackEvent["sourceKind"] },
): FeedbackEvent {
  return {
    version: 1,
    kind,
    createdAt: new Date().toISOString(),
    ruleId: finding.ruleId,
    match: finding.match,
    label: finding.label,
    category: finding.category,
    context: finding.context,
    source: finding.source,
    contextModes: finding.contextModes,
    soft: Boolean(finding.likelyFalsePositive),
    note: options?.note,
    sourceKind: options?.sourceKind,
  };
}

const ISSUE_NEW = "https://github.com/NomadBuilder/anti-default/issues/new";

/** Pre-filled issue so “fine in context” can improve the shared catalog. */
export const FEEDBACK_STORAGE_KEY = "anti-default.feedbackEvents.v1";

/** Browser-only queue so web dismissals can later be exported / shared. */
export function recordFeedbackLocally(event: FeedbackEvent): void {
  if (typeof localStorage === "undefined") return;
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    const list: FeedbackEvent[] = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(list) ? list : [];
    next.push(event);
    localStorage.setItem(
      FEEDBACK_STORAGE_KEY,
      JSON.stringify(next.slice(-200)),
    );
  } catch {
    // private mode / quota
  }
}

export function fineInContextIssueUrl(event: FeedbackEvent): string {
  const title = `[Anti-Default] Fine in context: ${event.ruleId} (“${event.match}”)`;
  const body = [
    "## Why this was fine",
    "",
    event.note?.trim() || "<!-- What made this match appropriate here? -->",
    "",
    "## Event (machine-readable)",
    "",
    "```json",
    JSON.stringify(event, null, 2),
    "```",
    "",
    "This helps Anti-Default learn safer soft-flags and ignores without guessing.",
    "",
  ].join("\n");

  const params = new URLSearchParams({
    title,
    body,
    labels: "anti-default,fine-in-context",
  });
  return `${ISSUE_NEW}?${params.toString()}`;
}
