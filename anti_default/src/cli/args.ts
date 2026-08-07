import type { OutputFormat } from "./format";

export type FailOn = "any" | "hard" | "never";

export interface CliArgs {
  help: boolean;
  version: boolean;
  format: OutputFormat;
  failOn: FailOn;
  outPath: string | null;
  ignorePath: string | null;
  paths: string[];
  urls: string[];
  urlsFile: string | null;
}

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    help: false,
    version: false,
    format: "text",
    failOn: "hard",
    outPath: null,
    ignorePath: null,
    paths: [],
    urls: [],
    urlsFile: null,
  };

  let i = 0;
  while (i < argv.length) {
    const a = argv[i]!;
    if (a === "-h" || a === "--help") {
      args.help = true;
      i += 1;
      continue;
    }
    if (a === "-v" || a === "--version") {
      args.version = true;
      i += 1;
      continue;
    }
    if (a === "--format" || a === "-f") {
      const v = argv[++i];
      if (v === "text" || v === "json" || v === "sarif") args.format = v;
      else throw new Error(`Unknown format: ${v}`);
      i += 1;
      continue;
    }
    if (a === "--fail-on") {
      const v = argv[++i];
      if (v === "any" || v === "hard" || v === "never") args.failOn = v;
      else throw new Error(`Unknown --fail-on: ${v} (use any|hard|never)`);
      i += 1;
      continue;
    }
    if (a === "--out" || a === "-o") {
      args.outPath = argv[++i] ?? null;
      i += 1;
      continue;
    }
    if (a === "--ignore-file") {
      args.ignorePath = argv[++i] ?? null;
      i += 1;
      continue;
    }
    if (a === "--urls") {
      i += 1;
      while (i < argv.length && !argv[i]!.startsWith("-")) {
        args.urls.push(argv[i]!);
        i += 1;
      }
      continue;
    }
    if (a === "--urls-file") {
      args.urlsFile = argv[++i] ?? null;
      i += 1;
      continue;
    }
    if (a.startsWith("-")) {
      throw new Error(`Unknown option: ${a}`);
    }
    args.paths.push(a);
    i += 1;
  }

  return args;
}

export const HELP = `Anti-Default — inclusive language scan for files and URLs

Usage:
  npx anti-default [paths…] [options]
  npx anti-default --urls https://example.com https://example.com/about
  npx anti-default --urls-file urls.txt --format json

Options:
  --format, -f text|json|sarif   Output format (default: text)
  --fail-on any|hard|never       Exit 1 when findings match (default: hard)
                                 hard = non-soft findings; any = all findings
  --out, -o <file>               Write output to a file
  --ignore-file <path>           Path to ignore file (default: .antidefaultignore)
  --urls <url…>                  Scan public HTML pages instead of files
  --urls-file <path>             File with one URL per line
  -h, --help                     Show help
  -v, --version                  Show version

Ignore file (.antidefaultignore):
  node_modules/
  *.min.js
  rule:guys                      # disable a rule id for this scan

Examples:
  npx anti-default .
  npx anti-default ./src ./README.md --format sarif -o results.sarif
  npx anti-default --urls https://example.com --fail-on any
`;
