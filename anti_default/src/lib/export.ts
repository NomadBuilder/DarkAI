import type { AnalysisResult, Finding } from "./types";
import { CATEGORY_META } from "./types";

function downloadBlob(filename: string, content: string, mime: string) {
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

export function findingsToMarkdown(
  result: AnalysisResult,
  findings: Finding[],
): string {
  const lines = [
    `# Anti-Default review`,
    ``,
    `- **Source:** ${result.title ? `${result.title} · ` : ""}${result.sourceLabel}`,
    `- **Analyzed:** ${result.analyzedAt}`,
    `- **Findings in export:** ${findings.length}`,
    ``,
  ];

  if (findings.length === 0) {
    lines.push("_No findings in this export._");
    return lines.join("\n");
  }

  for (const f of findings) {
    lines.push(`## ${f.label} (${f.severity})`);
    lines.push(``);
    lines.push(`- **Match:** “${f.match}”`);
    lines.push(`- **Category:** ${CATEGORY_META[f.category].title}`);
    lines.push(`- **Why:** ${f.why}`);
    lines.push(`- **Try:** ${f.suggestions.join("; ")}`);
    lines.push(`- **Context:** ${f.context}`);
    if (f.source) lines.push(`- **Where:** ${f.source}`);
    lines.push(``);
  }

  return lines.join("\n");
}

export function findingsToCsv(findings: Finding[]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [
    [
      "severity",
      "category",
      "label",
      "match",
      "why",
      "suggestions",
      "context",
      "source",
    ].join(","),
  ];
  for (const f of findings) {
    rows.push(
      [
        f.severity,
        f.category,
        escape(f.label),
        escape(f.match),
        escape(f.why),
        escape(f.suggestions.join(" | ")),
        escape(f.context),
        escape(f.source ?? ""),
      ].join(","),
    );
  }
  return rows.join("\n");
}

export function findingsToGithubChecklist(
  result: AnalysisResult,
  findings: Finding[],
): string {
  const lines = [
    `## Anti-Default checklist`,
    ``,
    `Source: ${result.title ? `${result.title} · ` : ""}${result.sourceLabel}`,
    ``,
  ];
  if (findings.length === 0) {
    lines.push("- [x] No open findings");
    return lines.join("\n");
  }
  for (const f of findings) {
    const tryOne = f.suggestions[0] ?? "rephrase";
    lines.push(
      `- [ ] **${f.label}** — replace “${f.match}” (e.g. ${tryOne}) — _${f.severity}_`,
    );
  }
  return lines.join("\n");
}

export function downloadFindingsExport(
  format: "markdown" | "csv" | "github",
  result: AnalysisResult,
  findings: Finding[],
) {
  const day = stamp();
  if (format === "markdown") {
    downloadBlob(
      `anti-default-review-${day}.md`,
      findingsToMarkdown(result, findings),
      "text/markdown;charset=utf-8",
    );
  } else if (format === "csv") {
    downloadBlob(
      `anti-default-review-${day}.csv`,
      findingsToCsv(findings),
      "text/csv;charset=utf-8",
    );
  } else {
    downloadBlob(
      `anti-default-checklist-${day}.md`,
      findingsToGithubChecklist(result, findings),
      "text/markdown;charset=utf-8",
    );
  }
}
