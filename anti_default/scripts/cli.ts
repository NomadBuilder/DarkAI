#!/usr/bin/env tsx
/**
 * Unified Anti-Default CLI — files, URL lists, text/json/sarif, CI exit codes.
 */
import { promises as fs, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeCodeFiles } from "../src/lib/code-scanner";
import { defaultPreferences } from "../src/lib/preferences";
import type { Finding, RulePreferences } from "../src/lib/types";
import { HELP, parseArgs, type FailOn } from "../src/cli/args";
import {
  buildSummary,
  formatJson,
  formatSarif,
  formatText,
  type ScanReport,
} from "../src/cli/format";
import { loadIgnoreFile } from "../src/cli/ignore";
import {
  analyzeUrlText,
  fetchPageText,
  loadUrlList,
} from "../src/cli/urls";
import { collectFiles, readFiles } from "../src/cli/walk";

function packageVersion(): string {
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

function prefsWithDisabled(disabled: Set<string>): RulePreferences {
  const prefs = defaultPreferences();
  for (const id of disabled) {
    prefs[id] = { ...prefs[id], enabled: false };
  }
  return prefs;
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
  const ignore = await loadIgnoreFile(cwd, args.ignorePath);
  const preferences = prefsWithDisabled(ignore.disabledRules);

  let urls = [...args.urls];
  if (args.urlsFile) {
    urls = urls.concat(await loadUrlList(path.resolve(cwd, args.urlsFile)));
  }

  const mode = urls.length > 0 ? "urls" : "files";
  let findings: Finding[] = [];
  let filesScanned: number | undefined;
  let urlsScanned: number | undefined;
  const targets =
    mode === "urls" ? urls : args.paths.length ? args.paths : ["."];

  if (mode === "urls") {
    urlsScanned = 0;
    for (const url of urls) {
      try {
        const page = await fetchPageText(url);
        urlsScanned += 1;
        findings = findings.concat(analyzeUrlText(page, preferences));
      } catch (err) {
        console.error(
          `warn: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    if (urlsScanned === 0) {
      console.error("No URLs could be fetched.");
      process.exit(1);
    }
  } else {
    const paths = await collectFiles(cwd, targets, ignore);
    const files = await readFiles(cwd, paths);
    filesScanned = files.length;
    if (files.length === 0) {
      console.error("No readable source files found.");
      process.exit(1);
    }
    const result = analyzeCodeFiles(files, preferences);
    findings = result.findings;
  }

  const report: ScanReport = {
    tool: "anti-default",
    version,
    scannedAt: new Date().toISOString(),
    mode,
    targets,
    filesScanned,
    urlsScanned,
    findings,
    summary: buildSummary(findings),
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

  if (shouldFail(findings, args.failOn)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
