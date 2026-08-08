import type { LanguageRule } from "./types";

const MAX_EXAMPLES = 4;

/**
 * Turn the small regex dialect used by our rules into representative phrases.
 * This is display-only: matching still uses the original pattern.
 */
export function examplesForRule(rule: LanguageRule): string[] {
  const expanded = expand(rule.pattern)
    .map(clean)
    .filter((value) => value.length > 1 && !/[\\()[\]{}|?*+]/.test(value));

  return [...new Set(expanded)].slice(0, MAX_EXAMPLES);
}

function expand(source: string): string[] {
  return expandAlternatives(source, MAX_EXAMPLES);
}

function expandAlternatives(source: string, limit: number): string[] {
  const branches = splitTopLevel(source, "|");
  const output: string[] = [];
  for (const branch of branches) {
    output.push(...expandSequence(branch, limit - output.length));
    if (output.length >= limit) break;
  }
  return output.slice(0, limit);
}

function expandSequence(source: string, limit: number): string[] {
  let results = [""];
  let index = 0;

  while (index < source.length && results.length <= limit) {
    const parsed = readToken(source, index);
    index = parsed.next;
    let choices = parsed.values;

    const quantifier = readQuantifier(source, index);
    if (quantifier) {
      index = quantifier.next;
      if (quantifier.optional) choices = ["", ...choices];
    }

    results = combine(results, choices, limit);
  }

  return results.slice(0, limit);
}

function readToken(
  source: string,
  index: number,
): { values: string[]; next: number } {
  const char = source[index];

  if (char === "\\") {
    const escaped = source[index + 1] ?? "";
    if (escaped === "b" || escaped === "B") {
      return { values: [""], next: index + 2 };
    }
    if (escaped === "s") return { values: [" "], next: index + 2 };
    if (escaped === "d") return { values: ["0"], next: index + 2 };
    if (escaped === "n" || escaped === "t") {
      return { values: [" "], next: index + 2 };
    }
    return { values: [escaped], next: index + 2 };
  }

  if (char === "(") {
    const close = matchingParen(source, index);
    if (close < 0) return { values: [""], next: source.length };
    const marker = source.slice(index + 1, index + 3);
    if (marker === "?=" || marker === "?!" || marker === "?<") {
      return { values: [""], next: close + 1 };
    }
    const contentStart = source.startsWith("(?:", index) ? index + 3 : index + 1;
    return {
      values: expandAlternatives(
        source.slice(contentStart, close),
        MAX_EXAMPLES,
      ),
      next: close + 1,
    };
  }

  if (char === "[") {
    const close = source.indexOf("]", index + 1);
    if (close < 0) return { values: [""], next: source.length };
    const content = source.slice(index + 1, close);
    const preferred =
      content.match(/[a-zA-Z0-9’']/)?.[0] ??
      (content.includes(" ") ? " " : content.replace(/[\^-]/g, "")[0] ?? "");
    return { values: [preferred], next: close + 1 };
  }

  if (char === "." || char === "^" || char === "$") {
    return { values: [""], next: index + 1 };
  }

  return { values: [char], next: index + 1 };
}

function readQuantifier(
  source: string,
  index: number,
): { optional: boolean; next: number } | null {
  const char = source[index];
  if (char === "?") return { optional: true, next: index + 1 };
  if (char === "*" || char === "+") {
    return { optional: char === "*", next: index + 1 };
  }
  if (char === "{") {
    const close = source.indexOf("}", index + 1);
    if (close >= 0) {
      const body = source.slice(index + 1, close);
      return { optional: body.startsWith("0"), next: close + 1 };
    }
  }
  return null;
}

function combine(left: string[], right: string[], limit: number): string[] {
  const output: string[] = [];
  for (const prefix of left) {
    for (const suffix of right) {
      output.push(prefix + suffix);
      if (output.length >= limit) return output;
    }
  }
  return output;
}

function matchingParen(source: string, start: number): number {
  let depth = 0;
  let escaped = false;
  let inClass = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === "[") inClass = true;
    else if (char === "]") inClass = false;
    else if (!inClass && char === "(") depth += 1;
    else if (!inClass && char === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function splitTopLevel(source: string, separator: string): string[] {
  const parts: string[] = [];
  let start = 0;
  let depth = 0;
  let escaped = false;
  let inClass = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === "[") inClass = true;
    else if (char === "]") inClass = false;
    else if (!inClass && char === "(") depth += 1;
    else if (!inClass && char === ")") depth -= 1;
    else if (!inClass && depth === 0 && char === separator) {
      parts.push(source.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(source.slice(start));
  return parts;
}

function clean(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}
