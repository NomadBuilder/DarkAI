import path from "node:path";
import { analyzeCodeFiles } from "../lib/code-scanner";
import { defaultPreferences } from "../lib/preferences";
import type { Finding, RulePreferences } from "../lib/types";
import { applyBaseline, loadBaseline } from "./baseline";
import { changedFiles } from "./changed";
import { loadIgnoreFile, type IgnoreConfig } from "./ignore";
import {
  analyzeUrlText,
  fetchPageText,
  loadUrlList,
} from "./urls";
import { collectFiles, readFiles } from "./walk";

export interface ScanOptions {
  cwd: string;
  paths?: string[];
  urls?: string[];
  urlsFile?: string | null;
  ignorePath?: string | null;
  changedFrom?: string | null;
  useBaseline?: boolean;
  baselinePath?: string;
}

export interface ScanResult {
  mode: "files" | "urls";
  targets: string[];
  filesScanned?: number;
  urlsScanned?: number;
  findings: Finding[];
  rawFindings: Finding[];
  suppressedByBaseline: number;
  ignore: IgnoreConfig;
  preferences: RulePreferences;
}

function prefsWithDisabled(disabled: Set<string>): RulePreferences {
  const prefs = defaultPreferences();
  for (const id of disabled) {
    prefs[id] = { ...prefs[id], enabled: false };
  }
  return prefs;
}

export async function runScan(options: ScanOptions): Promise<ScanResult> {
  const cwd = options.cwd;
  const ignore = await loadIgnoreFile(cwd, options.ignorePath);
  const preferences = prefsWithDisabled(ignore.disabledRules);

  let urls = [...(options.urls ?? [])];
  if (options.urlsFile) {
    urls = urls.concat(await loadUrlList(path.resolve(cwd, options.urlsFile)));
  }

  const mode = urls.length > 0 ? "urls" : "files";
  let rawFindings: Finding[] = [];
  let filesScanned: number | undefined;
  let urlsScanned: number | undefined;
  let targets =
    mode === "urls"
      ? urls
      : options.paths?.length
        ? options.paths
        : ["."];

  if (mode === "files" && options.changedFrom) {
    targets = await changedFiles(cwd, options.changedFrom, targets);
  }

  if (mode === "urls") {
    urlsScanned = 0;
    for (const url of urls) {
      try {
        const page = await fetchPageText(url);
        urlsScanned += 1;
        rawFindings = rawFindings.concat(analyzeUrlText(page, preferences));
      } catch {
        // skip failed URL
      }
    }
  } else if (targets.length) {
    const paths = await collectFiles(cwd, targets, ignore);
    const files = await readFiles(cwd, paths);
    filesScanned = files.length;
    if (files.length) {
      rawFindings = analyzeCodeFiles(files, preferences).findings;
    }
  }

  let findings = rawFindings;
  let suppressedByBaseline = 0;
  if (options.useBaseline !== false) {
    const baseline = await loadBaseline(
      cwd,
      options.baselinePath ?? ".antidefaultbaseline.json",
    );
    const applied = applyBaseline(findings, baseline);
    findings = applied.findings;
    suppressedByBaseline = applied.suppressed;
  }

  return {
    mode,
    targets,
    filesScanned,
    urlsScanned,
    findings,
    rawFindings,
    suppressedByBaseline,
    ignore,
    preferences,
  };
}
