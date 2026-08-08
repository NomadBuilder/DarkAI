import { LANGUAGE_RULES } from "./rules";
import type { LanguageRule } from "./types";
import { CATEGORY_META } from "./types";

/**
 * Reviewer workflow for auditing what we flag and the fixes we recommend.
 *
 * The site ships as a static export with no backend, so a reviewer's work
 * lives in this browser (localStorage) and is exported as a JSON file that a
 * maintainer applies to `src/lib/rules.ts`. Nothing is written server-side.
 */

export type ReviewStatus =
  | "pending"
  | "verified"
  | "needs_changes"
  | "rejected";

export const REVIEW_STATUS_META: Record<
  ReviewStatus,
  { label: string; short: string; accent: string }
> = {
  pending: { label: "Not reviewed", short: "Pending", accent: "var(--ink-soft)" },
  verified: { label: "Verified — looks right", short: "Verified", accent: "var(--leaf)" },
  needs_changes: {
    label: "Needs changes (edits below)",
    short: "Needs changes",
    accent: "var(--ochre)",
  },
  rejected: { label: "Reject — remove this rule", short: "Rejected", accent: "var(--coral)" },
};

export const REVIEW_STATUS_ORDER: ReviewStatus[] = [
  "verified",
  "needs_changes",
  "rejected",
  "pending",
];

/** A single reviewer decision for one rule. Edited fields are only stored when changed. */
export interface RuleReview {
  ruleId: string;
  status: ReviewStatus;
  label?: string;
  why?: string;
  suggestions?: string[];
  notes?: string;
  reviewedAt?: string;
}

/** A new rule proposed by a reviewer. It is exported for maintainer review. */
export interface ProposedRule extends LanguageRule {
  proposalId: string;
  reviewerNotes?: string;
  createdAt: string;
}

export interface ReviewDoc {
  version: 1;
  reviewer: string;
  updatedAt: string;
  reviews: Record<string, RuleReview>;
  proposedRules: ProposedRule[];
}

export const REVIEW_STORAGE_KEY = "anti-default.ruleReview.v1";

export function emptyReviewDoc(): ReviewDoc {
  return {
    version: 1,
    reviewer: "",
    updatedAt: new Date().toISOString(),
    reviews: {},
    proposedRules: [],
  };
}

/** True when the reviewer has proposed a value different from the shipped rule. */
export function isEdited(rule: LanguageRule, review?: RuleReview): boolean {
  if (!review) return false;
  if (review.label != null && review.label !== rule.label) return true;
  if (review.why != null && review.why !== rule.why) return true;
  if (
    review.suggestions != null &&
    !suggestionsEqual(review.suggestions, rule.suggestions)
  ) {
    return true;
  }
  return false;
}

function suggestionsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

/** Rule as the reviewer currently proposes it (shipped value unless overridden). */
export function effectiveRule(
  rule: LanguageRule,
  review?: RuleReview,
): LanguageRule {
  if (!review) return rule;
  return {
    ...rule,
    label: review.label ?? rule.label,
    why: review.why ?? rule.why,
    suggestions: review.suggestions ?? rule.suggestions,
  };
}

export interface ReviewProgress {
  total: number;
  reviewed: number;
  verified: number;
  needsChanges: number;
  rejected: number;
  pending: number;
  edited: number;
}

export function computeProgress(doc: ReviewDoc): ReviewProgress {
  const total = LANGUAGE_RULES.length;
  let verified = 0;
  let needsChanges = 0;
  let rejected = 0;
  let edited = 0;
  for (const rule of LANGUAGE_RULES) {
    const review = doc.reviews[rule.id];
    if (review?.status === "verified") verified += 1;
    else if (review?.status === "needs_changes") needsChanges += 1;
    else if (review?.status === "rejected") rejected += 1;
    if (isEdited(rule, review)) edited += 1;
  }
  const reviewed = verified + needsChanges + rejected;
  return {
    total,
    reviewed,
    verified,
    needsChanges,
    rejected,
    pending: total - reviewed,
    edited,
  };
}

// ── Persistence ──────────────────────────────────────────────────────────

export function loadReviewDoc(): ReviewDoc {
  if (typeof window === "undefined") return emptyReviewDoc();
  try {
    const raw = window.localStorage.getItem(REVIEW_STORAGE_KEY);
    if (!raw) return emptyReviewDoc();
    const parsed = coerceReviewDoc(JSON.parse(raw));
    if (parsed) return parsed;
  } catch {
    // fall through to empty
  }
  return emptyReviewDoc();
}

export function saveReviewDoc(doc: ReviewDoc): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(doc));
  } catch {
    // storage full / unavailable — ignore
  }
}

export function coerceReviewDoc(raw: unknown): ReviewDoc | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Partial<ReviewDoc>;
  if (candidate.version !== 1 || typeof candidate.reviews !== "object") {
    return null;
  }
  return {
    version: 1,
    reviewer: typeof candidate.reviewer === "string" ? candidate.reviewer : "",
    updatedAt:
      typeof candidate.updatedAt === "string"
        ? candidate.updatedAt
        : new Date().toISOString(),
    reviews: candidate.reviews as Record<string, RuleReview>,
    proposedRules: Array.isArray(candidate.proposedRules)
      ? (candidate.proposedRules as ProposedRule[])
      : [],
  };
}

// ── Exports ────────────────────────────────────────────────────────────────

function downloadBlob(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function stamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export function downloadReviewJson(doc: ReviewDoc): void {
  const payload: ReviewDoc = { ...doc, updatedAt: new Date().toISOString() };
  downloadBlob(
    `anti-default-review-${stamp()}.json`,
    JSON.stringify(payload, null, 2),
    "application/json;charset=utf-8",
  );
}

/** Human-readable summary of every decision that isn't "pending" or is edited. */
export function reviewToMarkdown(doc: ReviewDoc): string {
  const progress = computeProgress(doc);
  const lines: string[] = [
    "# Anti-Default language review",
    "",
    `- **Reviewer:** ${doc.reviewer || "(unnamed)"}`,
    `- **Date:** ${stamp()}`,
    `- **Reviewed:** ${progress.reviewed} / ${progress.total} rules`,
    `- **Verified:** ${progress.verified} · **Needs changes:** ${progress.needsChanges} · **Rejected:** ${progress.rejected}`,
    `- **New rules proposed:** ${doc.proposedRules.length}`,
    "",
  ];

  const actionable = LANGUAGE_RULES.filter((rule) => {
    const review = doc.reviews[rule.id];
    return (
      (review && review.status !== "pending") || isEdited(rule, review)
    );
  });

  if (actionable.length === 0) {
    lines.push("_No decisions recorded yet._");
    return lines.join("\n");
  }

  for (const rule of actionable) {
    const review = doc.reviews[rule.id];
    const status = review?.status ?? "pending";
    lines.push(`## ${rule.label}  \`${rule.id}\``);
    lines.push("");
    lines.push(
      `- **Status:** ${REVIEW_STATUS_META[status].short}`,
    );
    lines.push(`- **Category:** ${CATEGORY_META[rule.category].title}`);
    lines.push(`- **Pattern:** \`/${rule.pattern}/i\``);
    if (isEdited(rule, review)) {
      const next = effectiveRule(rule, review);
      if (review?.label != null && review.label !== rule.label) {
        lines.push(`- **Label:** “${rule.label}” → “${next.label}”`);
      }
      if (review?.why != null && review.why !== rule.why) {
        lines.push(`- **Why (was):** ${rule.why}`);
        lines.push(`- **Why (proposed):** ${next.why}`);
      }
      if (
        review?.suggestions != null &&
        !suggestionsEqual(review.suggestions, rule.suggestions)
      ) {
        lines.push(`- **Suggestions (was):** ${rule.suggestions.join("; ")}`);
        lines.push(
          `- **Suggestions (proposed):** ${next.suggestions.join("; ")}`,
        );
      }
    }
    if (review?.notes) {
      lines.push(`- **Reviewer notes:** ${review.notes}`);
    }
    lines.push("");
  }

  if (doc.proposedRules.length > 0) {
    lines.push("# Proposed new rules", "");
    for (const rule of doc.proposedRules) {
      lines.push(`## ${rule.label}  \`${rule.id}\``);
      lines.push("");
      lines.push(`- **Category:** ${CATEGORY_META[rule.category].title}`);
      lines.push(`- **Pattern:** \`/${rule.pattern}/i\``);
      lines.push(`- **Why:** ${rule.why}`);
      lines.push(`- **Suggestions:** ${rule.suggestions.join("; ")}`);
      if (rule.reviewerNotes) {
        lines.push(`- **Reviewer notes:** ${rule.reviewerNotes}`);
      }
      if (rule.sources && rule.sources.length > 0) {
        lines.push(
          `- **Sources:** ${rule.sources.map((source) => `${source.title} — ${source.href}`).join("; ")}`,
        );
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

export function downloadReviewMarkdown(doc: ReviewDoc): void {
  downloadBlob(
    `anti-default-review-${stamp()}.md`,
    reviewToMarkdown(doc),
    "text/markdown;charset=utf-8",
  );
}
