import { promises as fs } from "node:fs";
import path from "node:path";
import type { Finding } from "../lib/types";
import { planSafeFixes, type SafeFixPlan } from "../lib/safe-fix";

export interface FileFixResult {
  file: string;
  applied: Array<{ match: string; replacement: string; ruleId: string }>;
  dryRun: boolean;
}

function sourcePath(finding: Finding): string | null {
  if (!finding.source) return null;
  return finding.source.split(":")[0] || null;
}

function sourceLine(finding: Finding): number | null {
  const m = finding.source?.match(/:(\d+)/);
  return m ? Number(m[1]) : null;
}

/** Replace one occurrence near the reported line; verify exact match text. */
export function applyPlanToFileContent(
  content: string,
  plan: SafeFixPlan,
): { next: string; applied: boolean } {
  const { finding, replacement } = plan;
  const lineNo = sourceLine(finding);
  const lines = content.split(/(\r?\n)/);
  // lines array alternates content/separator when using capturing split
  const contentLines: string[] = [];
  const seps: string[] = [];
  const parts = content.split(/(\r?\n)/);
  for (let i = 0; i < parts.length; i += 1) {
    if (i % 2 === 0) contentLines.push(parts[i]!);
    else seps.push(parts[i]!);
  }

  const tryReplaceIn = (text: string): string | null => {
    const idx = text.toLowerCase().indexOf(finding.match.toLowerCase());
    if (idx < 0) return null;
    const actual = text.slice(idx, idx + finding.match.length);
    if (actual.toLowerCase() !== finding.match.toLowerCase()) return null;
    return text.slice(0, idx) + replacement + text.slice(idx + actual.length);
  };

  if (lineNo != null && lineNo >= 1 && lineNo <= contentLines.length) {
    const line = contentLines[lineNo - 1]!;
    const replaced = tryReplaceIn(line);
    if (replaced != null) {
      contentLines[lineNo - 1] = replaced;
      let out = "";
      for (let i = 0; i < contentLines.length; i += 1) {
        out += contentLines[i];
        if (i < seps.length) out += seps[i];
      }
      return { next: out, applied: true };
    }
  }

  const whole = tryReplaceIn(content);
  if (whole != null) return { next: whole, applied: true };
  return { next: content, applied: false };
}

export async function applySafeFixes(
  cwd: string,
  findings: Finding[],
  options: { dryRun?: boolean } = {},
): Promise<{
  results: FileFixResult[];
  appliedCount: number;
  skippedCount: number;
  plans: SafeFixPlan[];
}> {
  const dryRun = Boolean(options.dryRun);
  const { plans, skipped } = planSafeFixes(findings);
  const byFile = new Map<string, SafeFixPlan[]>();

  for (const plan of plans) {
    const rel = sourcePath(plan.finding);
    if (!rel) continue;
    const list = byFile.get(rel) ?? [];
    list.push(plan);
    byFile.set(rel, list);
  }

  const results: FileFixResult[] = [];
  let appliedCount = 0;

  for (const [rel, filePlans] of byFile) {
    const abs = path.resolve(cwd, rel);
    let content: string;
    try {
      content = await fs.readFile(abs, "utf8");
    } catch {
      continue;
    }

    // Apply from bottom of file upward when line numbers exist
    const ordered = [...filePlans].sort((a, b) => {
      const la = sourceLine(a.finding) ?? 0;
      const lb = sourceLine(b.finding) ?? 0;
      return lb - la;
    });

    const applied: FileFixResult["applied"] = [];
    let next = content;
    for (const plan of ordered) {
      const result = applyPlanToFileContent(next, plan);
      if (!result.applied) continue;
      next = result.next;
      applied.push({
        match: plan.finding.match,
        replacement: plan.replacement,
        ruleId: plan.finding.ruleId,
      });
    }

    if (!applied.length) continue;
    if (!dryRun && next !== content) {
      await fs.writeFile(abs, next, "utf8");
    }
    appliedCount += applied.length;
    results.push({ file: rel, applied, dryRun });
  }

  return {
    results,
    appliedCount,
    skippedCount: skipped + (plans.length - appliedCount),
    plans,
  };
}
