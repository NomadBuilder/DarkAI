import { analyzeSegments } from "./analyzer";
import type { AnalysisResult, RulePreferences } from "./types";

const STRING_LITERAL_RE =
  /(?<!\\)(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\]|\$\{[^}]*\})*`)/g;

const COMMENT_RE =
  /\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|#(?!\!)[^\n]*/g;

const JSX_TEXT_RE = />([^<>{][^<>]*)</g;
const PROSE_EXTENSION_RE = /\.(?:md|mdx|txt|rst|adoc)$/i;

export interface CodeFileInput {
  path: string;
  content: string;
}

function stripQuotes(literal: string): string {
  if (
    (literal.startsWith('"') && literal.endsWith('"')) ||
    (literal.startsWith("'") && literal.endsWith("'")) ||
    (literal.startsWith("`") && literal.endsWith("`"))
  ) {
    return literal.slice(1, -1);
  }
  return literal;
}

function isLikelyUserFacing(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 3) return false;
  if (/^[A-Z0-9_./:-]+$/.test(trimmed) && !/\s/.test(trimmed)) return false;
  if (/^https?:\/\//i.test(trimmed)) return false;
  if (/^[\w.-]+@[\w.-]+$/.test(trimmed)) return false;
  if (/^[.#]?[a-z]+(-[a-z0-9]+)+$/.test(trimmed)) return false; // css-ish
  if (/^\$\{/.test(trimmed)) return false;
  // Prefer strings with letters/spaces — UI copy, comments, messages
  return /[A-Za-z]/.test(trimmed);
}

export function extractReviewableSegments(
  file: CodeFileInput,
): Array<{ text: string; source: string }> {
  const segments: Array<{ text: string; source: string }> = [];
  const { path, content } = file;

  if (PROSE_EXTENSION_RE.test(path)) {
    let inFence = false;
    for (const [index, line] of content.split(/\r?\n/).entries()) {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        continue;
      }
      const text = line
        .replace(/^\s{0,3}#{1,6}\s+/, "")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (!inFence && isLikelyUserFacing(text)) {
        segments.push({ text, source: `${path}:${index + 1}` });
      }
    }
    return segments;
  }

  for (const match of content.matchAll(STRING_LITERAL_RE)) {
    const text = stripQuotes(match[0])
      .replace(/\\n/g, " ")
      .replace(/\\t/g, " ")
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    if (!isLikelyUserFacing(text)) continue;
    const line = content.slice(0, match.index ?? 0).split("\n").length;
    segments.push({ text, source: `${path}:${line}` });
  }

  for (const match of content.matchAll(COMMENT_RE)) {
    const text = match[0]
      .replace(/^\/\/\s?/, "")
      .replace(/^\/\*+/, "")
      .replace(/\*+\/$/, "")
      .replace(/^<!--/, "")
      .replace(/-->$/, "")
      .replace(/^#\s?/, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!isLikelyUserFacing(text) || text.length < 8) continue;
    const line = content.slice(0, match.index ?? 0).split("\n").length;
    segments.push({ text, source: `${path}:${line} (comment)` });
  }

  if (/\.(tsx|jsx|vue|svelte|html?|cshtml|razor)$/i.test(path)) {
    for (const match of content.matchAll(JSX_TEXT_RE)) {
      const text = (match[1] ?? "").replace(/\s+/g, " ").trim();
      if (!isLikelyUserFacing(text)) continue;
      const line = content.slice(0, match.index ?? 0).split("\n").length;
      segments.push({ text, source: `${path}:${line} (markup)` });
    }
  }

  // Razor / C#: @"..." and plain string content between tags already partly covered;
  // also pull visible-ish text from @* *@ comments via COMMENT_RE-style
  if (/\.(cshtml|razor)$/i.test(path)) {
    for (const match of content.matchAll(/@\*([\s\S]*?)\*@/g)) {
      const text = (match[1] ?? "").replace(/\s+/g, " ").trim();
      if (!isLikelyUserFacing(text) || text.length < 8) continue;
      const line = content.slice(0, match.index ?? 0).split("\n").length;
      segments.push({ text, source: `${path}:${line} (razor comment)` });
    }
  }

  return segments;
}

export function analyzeCodeFiles(
  files: CodeFileInput[],
  preferences?: RulePreferences | null,
): AnalysisResult {
  const segments = files.flatMap(extractReviewableSegments);
  const label =
    files.length === 1
      ? files[0].path
      : `${files.length} files`;

  return analyzeSegments(segments, {
    sourceType: "code",
    sourceLabel: label,
    title: "Code language review",
    preferences,
  });
}

export const CODE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".cs",
  ".cshtml",
  ".razor",
  ".py",
  ".rb",
  ".go",
  ".java",
  ".kt",
  ".swift",
  ".rs",
  ".php",
  ".vue",
  ".svelte",
  ".html",
  ".htm",
  ".md",
  ".mdx",
  ".txt",
  ".rst",
  ".adoc",
  ".json",
  ".yml",
  ".yaml",
];

export function hasSupportedExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  return CODE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
