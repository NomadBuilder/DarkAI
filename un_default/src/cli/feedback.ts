import { promises as fs } from "node:fs";
import path from "node:path";
import {
  fineInContextIssueUrl,
  type FeedbackEvent,
  type FeedbackKind,
} from "../lib/feedback";
import type { Finding } from "../lib/types";
import { findingFingerprint, writeBaseline, loadBaseline } from "./baseline";

export const DEFAULT_FEEDBACK_FILE = ".undefaultfeedback.jsonl";

export async function appendFeedback(
  cwd: string,
  event: FeedbackEvent,
  fileName = DEFAULT_FEEDBACK_FILE,
): Promise<string> {
  const filePath = path.resolve(cwd, fileName);
  await fs.appendFile(filePath, `${JSON.stringify(event)}\n`, "utf8");
  return filePath;
}

/** Also suppress this fingerprint locally so the habit stays quiet. */
export async function suppressFindingInBaseline(
  cwd: string,
  finding: Finding,
  baselineFile = ".undefaultbaseline.json",
): Promise<void> {
  const existing = await loadBaseline(cwd, baselineFile);
  existing.add(findingFingerprint(finding));
  const fingerprints = [...existing].sort();
  const filePath = path.resolve(cwd, baselineFile);
  await fs.writeFile(
    filePath,
    `${JSON.stringify({ version: 1, fingerprints }, null, 2)}\n`,
    "utf8",
  );
}

export function feedbackHelpUrl(event: FeedbackEvent): string {
  if (event.kind === "fine_in_context") return fineInContextIssueUrl(event);
  return fineInContextIssueUrl({ ...event, kind: "fine_in_context" });
}

export function parseFeedbackKind(raw: string): FeedbackKind {
  if (
    raw === "fine_in_context" ||
    raw === "false_positive" ||
    raw === "bad_suggestion"
  ) {
    return raw;
  }
  throw new Error(
    `Unknown feedback kind: ${raw} (use fine_in_context|false_positive|bad_suggestion)`,
  );
}
