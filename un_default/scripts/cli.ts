#!/usr/bin/env tsx
/**
 * Unified Un-Default CLI — scan, fix, feedback, MCP, CI exit codes.
 */
import { promises as fs, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Finding } from "../src/lib/types";
import { feedbackEventFromFinding } from "../src/lib/feedback";
import { HELP, parseArgs, type FailOn } from "../src/cli/args";
import {
  buildSummary,
  formatJson,
  formatSarif,
  formatText,
  type ScanReport,
} from "../src/cli/format";
import { writeBaseline } from "../src/cli/baseline";
import { initializeProject, initNextSteps } from "../src/cli/init";
import { applySafeFixes } from "../src/cli/fix";
import { runScan } from "../src/cli/scan";
import {
  appendFeedback,
  feedbackHelpUrl,
  parseFeedbackKind,
  suppressFindingInBaseline,
} from "../src/cli/feedback";

declare const __ANTI_DEFAULT_VERSION__: string | undefined;

function packageVersion(): string {
  if (
    typeof __ANTI_DEFAULT_VERSION__ !== "undefined" &&
    __ANTI_DEFAULT_VERSION__
  ) {
    return __ANTI_DEFAULT_VERSION__;
  }
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(
      readFileSync(path.join(here, "..", "package.json"), "utf8"),
    ) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function shouldFail(findings: Finding[], failOn: FailOn): boolean {
  if (failOn === "never") return false;
  if (failOn === "any") return findings.length > 0;
  return findings.some((f) => !f.likelyFalsePositive);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const version = packageVersion();

  if (args.help) {
    console.log(HELP);
    return;
  }
  if (args.version) {
    console.log(version);
    return;
  }

  const cwd = process.cwd();

  if (args.command === "mcp") {
    const { startMcpServer } = await import("../src/cli/mcp");
    await startMcpServer({ cwd, version });
    return;
  }

  if (args.command === "init") {
    const created = await initializeProject(cwd);
    if (created.length) {
      console.log("Un-Default initialized:");
      for (const item of created) console.log(`  + ${item}`);
    } else {
      console.log("Un-Default is already initialized; no files changed.");
    }
    for (const line of initNextSteps()) console.log(line);
    return;
  }

  if (args.command === "feedback") {
    const kind = parseFeedbackKind(args.feedbackKind || "fine_in_context");
    if (!args.feedbackRuleId || !args.feedbackMatch || !args.feedbackContext) {
      throw new Error(
        "feedback requires --rule, --match, and --context (optional --note --source --open-issue)",
      );
    }
    const finding: Finding = {
      id: "feedback",
      ruleId: args.feedbackRuleId,
      match: args.feedbackMatch,
      category: "general",
      severity: "low",
      label: args.feedbackRuleId,
      why: "",
      suggestions: [],
      context: args.feedbackContext,
      index: 0,
      source: args.feedbackSource ?? undefined,
    };
    const event = feedbackEventFromFinding(finding, kind, {
      note: args.feedbackNote ?? undefined,
      sourceKind: "cli",
    });
    const filePath = await appendFeedback(cwd, event);
    await suppressFindingInBaseline(cwd, finding, args.baselinePath);
    console.log(`Recorded ${kind} → ${path.relative(cwd, filePath)}`);
    console.log("Suppressed in local baseline so this match stays quiet.");
    const url = feedbackHelpUrl(event);
    console.log(`Share to improve the catalog: ${url}`);
    if (args.openIssue) {
      const open =
        process.platform === "darwin"
          ? "open"
          : process.platform === "win32"
            ? "start"
            : "xdg-open";
      const { spawn } = await import("node:child_process");
      spawn(open, [url], { detached: true, stdio: "ignore" }).unref();
    }
    return;
  }

  const scan = await runScan({
    cwd,
    paths: args.paths,
    urls: args.urls,
    urlsFile: args.urlsFile,
    ignorePath: args.ignorePath,
    changedFrom: args.changedFrom,
    useBaseline: args.useBaseline,
    baselinePath: args.baselinePath,
  });

  if (scan.mode === "urls" && (scan.urlsScanned ?? 0) === 0) {
    console.error("No URLs could be fetched.");
    process.exit(1);
  }
  if (
    scan.mode === "files" &&
    (scan.filesScanned ?? 0) === 0 &&
    args.command !== "fix"
  ) {
    if (args.changedFrom && scan.targets.length === 0) {
      console.log(`No supported files changed from ${args.changedFrom}.`);
      return;
    }
    console.error("No readable source files found.");
    process.exit(1);
  }

  if (args.command === "baseline") {
    const baselinePath = await writeBaseline(
      cwd,
      scan.rawFindings,
      args.baselinePath,
    );
    console.log(
      `Wrote ${scan.rawFindings.length} finding fingerprint(s) to ${path.relative(
        cwd,
        baselinePath,
      )}`,
    );
    return;
  }

  if (args.command === "fix") {
    const fix = await applySafeFixes(cwd, scan.findings, {
      dryRun: args.dryRun,
    });
    const payload = {
      tool: "un-default",
      version,
      command: "fix",
      dryRun: args.dryRun,
      appliedCount: fix.appliedCount,
      skippedCount: fix.skippedCount,
      files: fix.results,
    };
    if (args.format === "json") {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      console.log(
        `Un-Default fix${args.dryRun ? " (dry-run)" : ""} — ${fix.appliedCount} safe swap(s), ${fix.skippedCount} left for review`,
      );
      for (const file of fix.results) {
        console.log(`\n${file.file}`);
        for (const a of file.applied) {
          console.log(`  “${a.match}” → “${a.replacement}” (${a.ruleId})`);
        }
      }
      if (!fix.appliedCount) {
        console.log("\nNo safe autofixes in scope. Run a scan for the rest.");
      }
    }
    // After writing, remaining hard findings should still fail CI habits
    if (!args.dryRun && fix.appliedCount) {
      const again = await runScan({
        cwd,
        paths: args.paths.length ? args.paths : ["."],
        ignorePath: args.ignorePath,
        useBaseline: args.useBaseline,
        baselinePath: args.baselinePath,
      });
      if (shouldFail(again.findings, args.failOn)) process.exitCode = 1;
    }
    return;
  }

  const report: ScanReport = {
    tool: "un-default",
    version,
    scannedAt: new Date().toISOString(),
    mode: scan.mode,
    targets: scan.targets,
    filesScanned: scan.filesScanned,
    urlsScanned: scan.urlsScanned,
    suppressedByBaseline: scan.suppressedByBaseline,
    findings: scan.findings,
    summary: buildSummary(scan.findings),
  };

  let output: string;
  if (args.format === "json") output = formatJson(report);
  else if (args.format === "sarif") output = formatSarif(report);
  else output = formatText(report);

  if (args.outPath) {
    await fs.writeFile(path.resolve(cwd, args.outPath), output, "utf8");
    if (args.format === "text") {
      console.log(output);
    } else {
      console.error(`Wrote ${args.format} → ${args.outPath}`);
      console.error(
        `Findings: ${report.summary.total} (${report.summary.hard} hard · ${report.summary.soft} soft)`,
      );
    }
  } else {
    console.log(output);
  }

  if (shouldFail(scan.findings, args.failOn)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
