#!/usr/bin/env tsx
/**
 * CLI: scan a local project for inclusive-language issues in source strings/comments.
 *
 * Usage:
 *   npm run analyze -- .
 *   npm run analyze -- ./src ./README.md
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  analyzeCodeFiles,
  CODE_EXTENSIONS,
  type CodeFileInput,
} from "../src/lib/code-scanner";
import type { Finding } from "../src/lib/types";

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  ".turbo",
  "out",
  "vendor",
  "__pycache__",
]);

/** Skip catalogs/demos that intentionally contain flagged terms. */
function shouldSkipFile(filePath: string): boolean {
  const base = path.basename(filePath);
  if (base === "rules.ts" || base === "rules.js") return true;
  const normalized = filePath.replace(/\\/g, "/");
  return normalized.includes("/public/fixtures/");
}

const MAX_FILE_BYTES = 400_000;
const MAX_FILES = 200;

async function walk(target: string, acc: string[] = []): Promise<string[]> {
  const stat = await fs.stat(target);
  if (stat.isFile()) {
    if (!shouldSkipFile(target)) acc.push(target);
    return acc;
  }

  if (!stat.isDirectory()) return acc;

  const entries = await fs.readdir(target, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    if (entry.name.startsWith(".") && entry.name !== ".github") continue;
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) {
      await walk(full, acc);
    } else if (entry.isFile()) {
      const lower = entry.name.toLowerCase();
      if (
        CODE_EXTENSIONS.some((ext) => lower.endsWith(ext)) &&
        !shouldSkipFile(full)
      ) {
        acc.push(full);
      }
    }
    if (acc.length >= MAX_FILES) break;
  }
  return acc;
}

function printFinding(finding: Finding): void {
  const where = finding.source ? ` @ ${finding.source}` : "";
  console.log(
    `\n[${finding.severity.toUpperCase()}] ${finding.label}${where}`,
  );
  console.log(`  match: "${finding.match}"`);
  console.log(`  why:   ${finding.why}`);
  console.log(`  try:   ${finding.suggestions.join(" · ")}`);
  console.log(`  ctx:   ${finding.context}`);
}

async function main() {
  const args = process.argv.slice(2);
  const targets = args.length > 0 ? args : ["."];

  const paths: string[] = [];
  for (const target of targets) {
    const resolved = path.resolve(process.cwd(), target);
    await walk(resolved, paths);
  }

  const unique = [...new Set(paths)].slice(0, MAX_FILES);
  const files: CodeFileInput[] = [];

  for (const filePath of unique) {
    try {
      const stat = await fs.stat(filePath);
      if (stat.size > MAX_FILE_BYTES) continue;
      const content = await fs.readFile(filePath, "utf8");
      files.push({
        path: path.relative(process.cwd(), filePath) || filePath,
        content,
      });
    } catch {
      // skip unreadable files
    }
  }

  if (files.length === 0) {
    console.error("No readable source files found.");
    process.exit(1);
  }

  const result = analyzeCodeFiles(files);

  console.log("Decolonize — code language review");
  console.log(`Files scanned: ${files.length}`);
  console.log(`Findings: ${result.summary.total}`);
  console.log(
    `Severity — high: ${result.summary.bySeverity.high ?? 0}, medium: ${result.summary.bySeverity.medium ?? 0}, low: ${result.summary.bySeverity.low ?? 0}`,
  );

  if (result.findings.length === 0) {
    console.log("\nNo rule matches. Still worth a human pass for tone and context.");
    return;
  }

  for (const finding of result.findings.slice(0, 100)) {
    printFinding(finding);
  }

  if (result.findings.length > 100) {
    console.log(`\n…and ${result.findings.length - 100} more.`);
  }

  // Non-zero exit when high-severity findings exist (handy in CI)
  if ((result.summary.bySeverity.high ?? 0) > 0) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
