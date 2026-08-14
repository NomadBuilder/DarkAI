import type { Finding } from "./types";
import { readMigratedStorage } from "./storage";

export const IGNORES_STORAGE_KEY = "un-default.ignoredFindings.v1";
const LEGACY_IGNORES_STORAGE_KEY = "anti-default.ignoredFindings.v1";

/** Stable key: same rule + same matched phrase (case-insensitive). */
export function ignoreKey(finding: Pick<Finding, "ruleId" | "match">): string {
  return `${finding.ruleId}::${finding.match.toLowerCase()}`;
}

export function loadIgnoredKeys(): string[] {
  try {
    const raw = readMigratedStorage(
      IGNORES_STORAGE_KEY,
      LEGACY_IGNORES_STORAGE_KEY,
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export function saveIgnoredKeys(keys: string[]): void {
  try {
    localStorage.setItem(IGNORES_STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // quota / private mode
  }
}

export function filterIgnoredFindings(
  findings: Finding[],
  ignored: Set<string> | string[],
): Finding[] {
  const set = ignored instanceof Set ? ignored : new Set(ignored);
  return findings.filter((f) => !set.has(ignoreKey(f)));
}
