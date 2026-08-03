#!/usr/bin/env tsx
/**
 * Export LANGUAGE_RULES to extension/rules.json for the browser extension.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LANGUAGE_RULES } from "../src/lib/rules";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "extension");
mkdirSync(outDir, { recursive: true });

const slim = LANGUAGE_RULES.map((r) => ({
  id: r.id,
  pattern: r.pattern,
  matchWholeWord: r.matchWholeWord ?? false,
  category: r.category,
  severity: r.severity,
  label: r.label,
  why: r.why,
  suggestions: r.suggestions,
}));

writeFileSync(
  join(outDir, "rules.json"),
  JSON.stringify({ version: 1, rules: slim }, null, 2),
);
console.log(`Wrote ${slim.length} rules to extension/rules.json`);
