/**
 * Load `.undefaultignore` (gitignore-style) next to cwd or an explicit path.
 *
 * Extra directives (one per line):
 *   rule:<id>     — disable that rule for this scan
 */
import { promises as fs } from "node:fs";
import path from "node:path";

export interface IgnoreConfig {
  /** Relative path patterns (gitignore-ish) */
  patterns: string[];
  /** Rule ids to disable */
  disabledRules: Set<string>;
  filePath: string | null;
}

const DEFAULT_IGNORE = `.undefaultignore`;

export function emptyIgnore(): IgnoreConfig {
  return { patterns: [], disabledRules: new Set(), filePath: null };
}

export async function loadIgnoreFile(
  cwd: string,
  explicitPath?: string | null,
): Promise<IgnoreConfig> {
  const candidates = explicitPath
    ? [path.resolve(cwd, explicitPath)]
    : [
        path.resolve(cwd, DEFAULT_IGNORE),
        path.resolve(cwd, ".antidefaultignore"),
      ];

  for (const filePath of candidates) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      return parseIgnore(raw, filePath);
    } catch {
      // try next
    }
  }
  return emptyIgnore();
}

export function parseIgnore(raw: string, filePath: string | null): IgnoreConfig {
  const patterns: string[] = [];
  const disabledRules = new Set<string>();
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const ruleMatch = /^rule:\s*([a-z0-9-]+)\s*$/i.exec(trimmed);
    if (ruleMatch?.[1]) {
      disabledRules.add(ruleMatch[1]);
      continue;
    }
    patterns.push(trimmed);
  }
  return { patterns, disabledRules, filePath };
}

/** Minimal gitignore-style match for common team needs. */
export function pathIgnored(
  relativePath: string,
  patterns: string[],
): boolean {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\.\//, "");
  for (const pattern of patterns) {
    if (matchGitish(normalized, pattern.replace(/\\/g, "/"))) return true;
  }
  return false;
}

function matchGitish(filePath: string, pattern: string): boolean {
  let p = pattern;
  if (p.endsWith("/")) p = p.slice(0, -1);

  // Directory prefix: node_modules/ or node_modules
  if (!p.includes("*") && !p.includes("?")) {
    if (filePath === p || filePath.startsWith(p + "/")) return true;
    if (filePath.split("/").includes(p)) return true;
    return false;
  }

  // Glob: ** / * / ?
  const regex = globToRegExp(p);
  return regex.test(filePath);
}

function globToRegExp(glob: string): RegExp {
  let g = glob;
  if (g.startsWith("**/")) g = g.slice(3);
  const escaped = g
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "{{GLOBSTAR}}")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, "[^/]")
    .replace(/{{GLOBSTAR}}/g, ".*");
  return new RegExp(`(^|/)${escaped}($|/)`);
}
