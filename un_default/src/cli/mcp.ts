/**
 * Minimal MCP stdio server — scan / fix / feedback for coding agents.
 * JSON-RPC 2.0, newline-delimited messages (no extra runtime deps).
 */
import { createInterface } from "node:readline";
import type { Finding } from "../lib/types";
import { feedbackEventFromFinding } from "../lib/feedback";
import { applySafeFixes } from "./fix";
import { runScan } from "./scan";
import {
  appendFeedback,
  parseFeedbackKind,
  suppressFindingInBaseline,
} from "./feedback";

interface McpOptions {
  cwd: string;
  version: string;
}

type JsonRpcId = string | number | null;

function send(message: unknown) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function result(id: JsonRpcId, value: unknown) {
  send({ jsonrpc: "2.0", id, result: value });
}

function error(id: JsonRpcId, code: number, message: string) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

const TOOLS = [
  {
    name: "un_default_scan",
    description:
      "Scan files for inclusive-language defaults in AI-generated or human copy. Returns JSON findings. Use after editing UI text, docs, READMEs, or marketing copy.",
    inputSchema: {
      type: "object",
      properties: {
        paths: {
          type: "array",
          items: { type: "string" },
          description: "Paths to scan (default: [\".\"])",
        },
        changedFrom: {
          type: "string",
          description: "Optional git ref — only scan files changed since it",
        },
        failOn: {
          type: "string",
          enum: ["any", "hard", "never"],
          description: "Whether remaining findings should be treated as blocking",
        },
      },
    },
  },
  {
    name: "un_default_fix",
    description:
      "Apply only safe, unambiguous 1:1 inclusive-language swaps (e.g. policeman→police officer, whitelist→allowlist). Does not touch coded/dogwhistle or soft contextual hits. Prefer dryRun first.",
    inputSchema: {
      type: "object",
      properties: {
        paths: {
          type: "array",
          items: { type: "string" },
        },
        dryRun: {
          type: "boolean",
          description: "If true, report swaps without writing files",
        },
      },
    },
  },
  {
    name: "un_default_feedback",
    description:
      "Record that a finding was fine in context (or a false positive). Suppresses it locally and writes structured feedback that can improve the shared catalog.",
    inputSchema: {
      type: "object",
      required: ["ruleId", "match", "context"],
      properties: {
        kind: {
          type: "string",
          enum: ["fine_in_context", "false_positive", "bad_suggestion"],
          description: "Default: fine_in_context",
        },
        ruleId: { type: "string" },
        match: { type: "string" },
        context: { type: "string" },
        source: { type: "string" },
        note: { type: "string" },
      },
    },
  },
];

export async function startMcpServer(options: McpOptions): Promise<void> {
  const { cwd, version } = options;
  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

  const handle = async (msg: {
    id?: JsonRpcId;
    method?: string;
    params?: Record<string, unknown>;
  }) => {
    const id = msg.id ?? null;
    const method = msg.method;

    if (method === "initialize") {
      result(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "un-default", version },
      });
      return;
    }
    if (method === "notifications/initialized" || method === "initialized") {
      return;
    }
    if (method === "ping") {
      result(id, {});
      return;
    }
    if (method === "tools/list") {
      result(id, { tools: TOOLS });
      return;
    }
    if (method === "tools/call") {
      const name = String(msg.params?.name ?? "");
      const args = (msg.params?.arguments ?? {}) as Record<string, unknown>;
      try {
        const text = await callTool(name, args, cwd, version);
        result(id, {
          content: [{ type: "text", text }],
          isError: false,
        });
      } catch (err) {
        result(id, {
          content: [
            {
              type: "text",
              text: err instanceof Error ? err.message : String(err),
            },
          ],
          isError: true,
        });
      }
      return;
    }

    if (id != null) {
      error(id, -32601, `Method not found: ${method}`);
    }
  };

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let msg: { id?: JsonRpcId; method?: string; params?: Record<string, unknown> };
    try {
      msg = JSON.parse(trimmed);
    } catch {
      continue;
    }
    await handle(msg);
  }
}

async function callTool(
  name: string,
  args: Record<string, unknown>,
  cwd: string,
  version: string,
): Promise<string> {
  if (name === "un_default_scan") {
    const paths = Array.isArray(args.paths)
      ? args.paths.map(String)
      : ["."];
    const scan = await runScan({
      cwd,
      paths,
      changedFrom: args.changedFrom ? String(args.changedFrom) : null,
      useBaseline: true,
    });
    return JSON.stringify(
      {
        tool: "un-default",
        version,
        filesScanned: scan.filesScanned,
        suppressedByBaseline: scan.suppressedByBaseline,
        summary: {
          total: scan.findings.length,
          hard: scan.findings.filter((f) => !f.likelyFalsePositive).length,
          soft: scan.findings.filter((f) => f.likelyFalsePositive).length,
        },
        findings: scan.findings,
        nextStep:
          "Call un_default_fix for safe autofixes, then re-scan. Ask a human before changing identity, quotes, legal, or self-description language.",
      },
      null,
      2,
    );
  }

  if (name === "un_default_fix") {
    const paths = Array.isArray(args.paths)
      ? args.paths.map(String)
      : ["."];
    const dryRun = Boolean(args.dryRun);
    const scan = await runScan({ cwd, paths, useBaseline: true });
    const fix = await applySafeFixes(cwd, scan.findings, { dryRun });
    return JSON.stringify(
      {
        dryRun,
        appliedCount: fix.appliedCount,
        skippedCount: fix.skippedCount,
        files: fix.results,
        nextStep:
          "Re-run un_default_scan. Remaining hard findings need human judgment or un_default_feedback if intentional.",
      },
      null,
      2,
    );
  }

  if (name === "un_default_feedback") {
    const kind = parseFeedbackKind(
      String(args.kind ?? "fine_in_context"),
    );
    const finding: Finding = {
      id: "feedback",
      ruleId: String(args.ruleId ?? ""),
      match: String(args.match ?? ""),
      category: "general",
      severity: "low",
      label: String(args.ruleId ?? ""),
      why: "",
      suggestions: [],
      context: String(args.context ?? ""),
      index: 0,
      source: args.source ? String(args.source) : undefined,
    };
    if (!finding.ruleId || !finding.match || !finding.context) {
      throw new Error("ruleId, match, and context are required");
    }
    const event = feedbackEventFromFinding(finding, kind, {
      note: args.note ? String(args.note) : undefined,
      sourceKind: "mcp",
    });
    const file = await appendFeedback(cwd, event);
    await suppressFindingInBaseline(cwd, finding);
    return JSON.stringify(
      {
        ok: true,
        kind,
        feedbackFile: file,
        suppressedInBaseline: true,
        event,
      },
      null,
      2,
    );
  }

  throw new Error(`Unknown tool: ${name}`);
}
