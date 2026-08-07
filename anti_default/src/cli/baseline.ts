import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Finding } from "../lib/types";

export const DEFAULT_BASELINE_FILE = ".antidefaultbaseline.json";

interface BaselineFile {
  version: 1;
  fingerprints: string[];
}

function stableSource(source?: string): string {
  if (!source) return "";
  return source.replace(/:\d+(?: \([^)]*\))?$/, "").replace(/\\/g, "/");
}

export function findingFingerprint(finding: Finding): string {
  const input = [
    finding.ruleId,
    stableSource(finding.source),
    finding.match.toLowerCase().trim(),
    finding.context.toLowerCase().replace(/\s+/g, " ").trim(),
  ].join("\0");
  return createHash("sha256").update(input).digest("hex").slice(0, 20);
}

export async function loadBaseline(
  cwd: string,
  fileName = DEFAULT_BASELINE_FILE,
): Promise<Set<string>> {
  try {
    const raw = await fs.readFile(path.resolve(cwd, fileName), "utf8");
    const parsed = JSON.parse(raw) as BaselineFile;
    if (parsed.version !== 1 || !Array.isArray(parsed.fingerprints)) {
      throw new Error("unsupported baseline format");
    }
    return new Set(parsed.fingerprints);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return new Set();
    throw new Error(
      `Could not read ${fileName}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export function applyBaseline(
  findings: Finding[],
  baseline: Set<string>,
): { findings: Finding[]; suppressed: number } {
  const kept = findings.filter(
    (finding) => !baseline.has(findingFingerprint(finding)),
  );
  return { findings: kept, suppressed: findings.length - kept.length };
}

export async function writeBaseline(
  cwd: string,
  findings: Finding[],
  fileName = DEFAULT_BASELINE_FILE,
): Promise<string> {
  const filePath = path.resolve(cwd, fileName);
  const payload: BaselineFile = {
    version: 1,
    fingerprints: [...new Set(findings.map(findingFingerprint))].sort(),
  };
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return filePath;
}
