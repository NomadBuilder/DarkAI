import { promises as fs } from "node:fs";
import path from "node:path";
import {
  CODE_EXTENSIONS,
  hasSupportedExtension,
} from "../lib/code-scanner";
import { pathIgnored, type IgnoreConfig } from "./ignore";

const BUILTIN_IGNORE_DIRS = new Set([
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
  "bin",
  "obj",
  "packages",
  "umbraco",
]);

const MAX_FILE_BYTES = 400_000;
const MAX_FILES = 2000;

function shouldSkipBuiltin(filePath: string): boolean {
  const base = path.basename(filePath);
  if (base === "rules.ts" || base === "rules.js") return true;
  const normalized = filePath.replace(/\\/g, "/");
  if (normalized.includes("/public/fixtures/")) return true;
  if (normalized.includes("/fixtures/corpus/")) return true;
  if (/\.min\.(js|css)$/i.test(base)) return true;
  if (/bootstrap|jquery|owl\.carousel|aos\.css/i.test(base)) return true;
  return false;
}

export async function collectFiles(
  cwd: string,
  targets: string[],
  ignore: IgnoreConfig,
): Promise<string[]> {
  const acc: string[] = [];
  for (const target of targets) {
    const resolved = path.resolve(cwd, target);
    await walk(resolved, cwd, ignore, acc);
    if (acc.length >= MAX_FILES) break;
  }
  return [...new Set(acc)].slice(0, MAX_FILES);
}

async function walk(
  target: string,
  cwd: string,
  ignore: IgnoreConfig,
  acc: string[],
): Promise<void> {
  let stat;
  try {
    stat = await fs.stat(target);
  } catch {
    return;
  }

  const rel = path.relative(cwd, target) || path.basename(target);

  if (stat.isFile()) {
    if (
      hasSupportedExtension(target) &&
      !shouldSkipBuiltin(target) &&
      !pathIgnored(rel, ignore.patterns)
    ) {
      acc.push(target);
    }
    return;
  }

  if (!stat.isDirectory()) return;

  if (pathIgnored(rel, ignore.patterns) && rel !== "") return;

  const entries = await fs.readdir(target, { withFileTypes: true });
  for (const entry of entries) {
    if (BUILTIN_IGNORE_DIRS.has(entry.name)) continue;
    if (entry.name.startsWith(".") && entry.name !== ".github") continue;
    const full = path.join(target, entry.name);
    const childRel = path.relative(cwd, full);
    if (pathIgnored(childRel, ignore.patterns)) continue;
    if (entry.isDirectory()) {
      await walk(full, cwd, ignore, acc);
    } else if (entry.isFile()) {
      const lower = entry.name.toLowerCase();
      if (
        CODE_EXTENSIONS.some((ext) => lower.endsWith(ext)) &&
        !shouldSkipBuiltin(full)
      ) {
        acc.push(full);
      }
    }
    if (acc.length >= MAX_FILES) return;
  }
}

export async function readFiles(
  cwd: string,
  paths: string[],
): Promise<Array<{ path: string; content: string }>> {
  const files: Array<{ path: string; content: string }> = [];
  for (const filePath of paths) {
    try {
      const stat = await fs.stat(filePath);
      if (stat.size > MAX_FILE_BYTES) continue;
      const content = await fs.readFile(filePath, "utf8");
      files.push({
        path: path.relative(cwd, filePath) || filePath,
        content,
      });
    } catch {
      // skip
    }
  }
  return files;
}

export { MAX_FILES };
