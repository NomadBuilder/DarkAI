import { analyzeText } from "../lib/analyzer";
import type { Finding, RulePreferences } from "../lib/types";

export async function fetchPageText(
  url: string,
): Promise<{ title: string; text: string; url: string }> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "AntiDefaultInclusiveReview/1.0 (+https://darkai.ca/anti-default)",
      Accept: "text/html",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  const html = await res.text();
  const title =
    html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || url;
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  return { title, text, url: res.url || url };
}

export function analyzeUrlText(
  page: { title: string; text: string; url: string },
  preferences?: RulePreferences | null,
): Finding[] {
  const result = analyzeText(page.text, {
    sourceType: "url",
    sourceLabel: page.url,
    title: page.title,
    preferences,
  });
  return result.findings.map((f) => ({
    ...f,
    source: page.url,
  }));
}

export async function loadUrlList(
  filePath: string,
): Promise<string[]> {
  const { promises: fs } = await import("node:fs");
  const raw = await fs.readFile(filePath, "utf8");
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && /^https?:\/\//i.test(l));
}
