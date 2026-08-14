import type { Finding } from "../lib/types";

export type OutputFormat = "text" | "json" | "sarif";

export interface ScanReport {
  tool: "un-default";
  version: string;
  scannedAt: string;
  mode: "files" | "urls";
  targets: string[];
  filesScanned?: number;
  urlsScanned?: number;
  suppressedByBaseline?: number;
  findings: Finding[];
  summary: {
    total: number;
    hard: number;
    soft: number;
    byRule: Record<string, number>;
  };
}

export function buildSummary(findings: Finding[]) {
  const byRule: Record<string, number> = {};
  let soft = 0;
  for (const f of findings) {
    byRule[f.ruleId] = (byRule[f.ruleId] ?? 0) + 1;
    if (f.likelyFalsePositive) soft += 1;
  }
  return {
    total: findings.length,
    hard: findings.length - soft,
    soft,
    byRule,
  };
}

export function formatText(report: ScanReport): string {
  const lines: string[] = [];
  lines.push("Un-Default — inclusive language scan");
  lines.push(`Mode: ${report.mode}`);
  if (report.filesScanned != null) {
    lines.push(`Files scanned: ${report.filesScanned}`);
  }
  if (report.urlsScanned != null) {
    lines.push(`URLs scanned: ${report.urlsScanned}`);
  }
  if (report.suppressedByBaseline) {
    lines.push(`Baseline: ${report.suppressedByBaseline} existing finding(s) hidden`);
  }
  lines.push(
    `Findings: ${report.summary.total} (${report.summary.hard} hard · ${report.summary.soft} soft)`,
  );

  const top = Object.entries(report.summary.byRule)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25);
  if (top.length) {
    lines.push("");
    lines.push("By rule:");
    for (const [id, n] of top) lines.push(`  ${n}\t${id}`);
  }

  if (report.findings.length === 0) {
    lines.push("");
    lines.push("No phrases to reconsider in scanned content.");
    return lines.join("\n");
  }

  const show = report.findings.slice(0, 100);
  for (const f of show) {
    const soft = f.likelyFalsePositive ? " [soft]" : "";
    const where = f.source ? ` @ ${f.source}` : "";
    lines.push("");
    lines.push(`[${f.label}]${soft}${where}`);
    lines.push(`  match: "${f.match}"`);
    lines.push(`  why:   ${f.why}`);
    lines.push(`  try:   ${f.suggestions.join(" · ")}`);
    lines.push(`  ctx:   ${f.context}`);
  }
  if (report.findings.length > show.length) {
    lines.push("");
    lines.push(`…and ${report.findings.length - show.length} more.`);
  }
  return lines.join("\n");
}

export function formatJson(report: ScanReport): string {
  return JSON.stringify(report, null, 2);
}

/** SARIF 2.1.0 — works with GitHub code scanning uploads. */
export function formatSarif(report: ScanReport): string {
  const rulesMap = new Map<
    string,
    { id: string; name: string; shortDescription: { text: string } }
  >();
  for (const f of report.findings) {
    if (!rulesMap.has(f.ruleId)) {
      rulesMap.set(f.ruleId, {
        id: f.ruleId,
        name: f.label,
        shortDescription: { text: f.why },
      });
    }
  }

  const results = report.findings.map((f) => {
    const uri = f.source?.split(":")[0] || "about:blank";
    const lineMatch = f.source?.match(/:(\d+)/);
    const line = lineMatch ? Number(lineMatch[1]) : 1;
    return {
      ruleId: f.ruleId,
      level: f.likelyFalsePositive ? "note" : "warning",
      message: {
        text: `${f.label}: “${f.match}” — ${f.why}${
          f.suggestions[0] ? ` Try: ${f.suggestions[0]}` : ""
        }`,
      },
      locations: [
        {
          physicalLocation: {
            artifactLocation: { uri },
            region: { startLine: line },
          },
        },
      ],
      properties: {
        category: f.category,
        soft: Boolean(f.likelyFalsePositive),
        match: f.match,
      },
    };
  });

  const sarif = {
    $schema:
      "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "Un-Default",
            version: report.version,
            informationUri: "https://github.com/NomadBuilder/anti-default",
            rules: [...rulesMap.values()],
          },
        },
        results,
      },
    ],
  };
  return JSON.stringify(sarif, null, 2);
}
