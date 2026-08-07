import type { OutputFormat } from "./format";

export type FailOn = "any" | "hard" | "never";
export type Command =
  | "scan"
  | "init"
  | "baseline"
  | "fix"
  | "feedback"
  | "mcp";

export interface CliArgs {
  command: Command;
  help: boolean;
  version: boolean;
  format: OutputFormat;
  failOn: FailOn;
  outPath: string | null;
  ignorePath: string | null;
  paths: string[];
  urls: string[];
  urlsFile: string | null;
  baselinePath: string;
  useBaseline: boolean;
  changedFrom: string | null;
  dryRun: boolean;
  feedbackKind: string | null;
  feedbackRuleId: string | null;
  feedbackMatch: string | null;
  feedbackContext: string | null;
  feedbackNote: string | null;
  feedbackSource: string | null;
  openIssue: boolean;
}

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    command: "scan",
    help: false,
    version: false,
    format: "text",
    failOn: "hard",
    outPath: null,
    ignorePath: null,
    paths: [],
    urls: [],
    urlsFile: null,
    baselinePath: ".antidefaultbaseline.json",
    useBaseline: true,
    changedFrom: null,
    dryRun: false,
    feedbackKind: null,
    feedbackRuleId: null,
    feedbackMatch: null,
    feedbackContext: null,
    feedbackNote: null,
    feedbackSource: null,
    openIssue: false,
  };

  let i = 0;
  const commands: Command[] = [
    "init",
    "baseline",
    "fix",
    "feedback",
    "mcp",
  ];
  if (argv[0] && commands.includes(argv[0] as Command)) {
    args.command = argv[0] as Command;
    i = 1;
  }
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
    if (a === "--baseline-file") {
      args.baselinePath = argv[++i] ?? ".antidefaultbaseline.json";
      i += 1;
      continue;
    }
    if (a === "--no-baseline") {
      args.useBaseline = false;
      i += 1;
      continue;
    }
    if (a === "--changed-from") {
      args.changedFrom = argv[++i] ?? null;
      i += 1;
      continue;
    }
    if (a === "--dry-run") {
      args.dryRun = true;
      i += 1;
      continue;
    }
    if (a === "--kind") {
      args.feedbackKind = argv[++i] ?? null;
      i += 1;
      continue;
    }
    if (a === "--rule") {
      args.feedbackRuleId = argv[++i] ?? null;
      i += 1;
      continue;
    }
    if (a === "--match") {
      args.feedbackMatch = argv[++i] ?? null;
      i += 1;
      continue;
    }
    if (a === "--context") {
      args.feedbackContext = argv[++i] ?? null;
      i += 1;
      continue;
    }
    if (a === "--note") {
      args.feedbackNote = argv[++i] ?? null;
      i += 1;
      continue;
    }
    if (a === "--source") {
      args.feedbackSource = argv[++i] ?? null;
      i += 1;
      continue;
    }
    if (a === "--open-issue") {
      args.openIssue = true;
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

export const HELP = `Anti-Default — inclusive language scan, safe fix, and agent tools

Usage:
  npx anti-default init
  npx anti-default [paths…] [options]
  npx anti-default fix [paths…] [--dry-run]
  npx anti-default baseline [paths…]
  npx anti-default feedback --kind fine_in_context --rule <id> --match <text> --context <snippet>
  npx anti-default mcp
  npx anti-default --urls https://example.com

Options:
  --format, -f text|json|sarif   Output format (default: text)
  --fail-on any|hard|never       Exit 1 when findings match (default: hard)
  --out, -o <file>               Write output to a file
  --ignore-file <path>           Path to ignore file (default: .antidefaultignore)
  --urls <url…>                  Scan public HTML pages instead of files
  --urls-file <path>             File with one URL per line
  --changed-from <git-ref>       Scan files changed since a branch/SHA
  --baseline-file <path>         Baseline file (default: .antidefaultbaseline.json)
  --no-baseline                  Report findings already in the baseline
  --dry-run                      For fix: show safe autofixes without writing
  -h, --help                     Show help
  -v, --version                  Show version

Agent / AI-copy habit:
  1. npx anti-default fix .          # auto-heal safe 1:1 swaps
  2. npx anti-default . --fail-on hard
  3. Only ask a human about remaining contextual hits
  4. Mark intentional language: feedback --kind fine_in_context …

Examples:
  npx anti-default .
  npx anti-default fix ./README.md --dry-run
  npx anti-default fix .
  npx anti-default mcp
`;
