import * as cheerio from "cheerio";
import { analyzeText, isSafeHttpUrl } from "./analyzer";
import type { AnalysisResult, RulePreferences } from "./types";

const MAX_HTML_BYTES = 1_500_000;
const FETCH_TIMEOUT_MS = 12_000;

const SKIP_TAGS = "script, style, noscript, svg, canvas, iframe, template";

export interface ScrapeResult {
  url: string;
  title: string;
  text: string;
  blocks: Array<{ heading?: string; text: string }>;
}

export async function scrapeUrl(rawUrl: string): Promise<ScrapeResult> {
  if (!isSafeHttpUrl(rawUrl)) {
    throw new Error(
      "Only public http(s) URLs are allowed. Local and private network targets are blocked.",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(rawUrl, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "AntiDefaultInclusiveReview/1.0 (+https://darkai.ca/anti-default)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`Could not fetch URL (HTTP ${response.status}).`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (
      contentType &&
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml")
    ) {
      throw new Error("URL did not return HTML content.");
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_HTML_BYTES) {
      throw new Error("Page is too large to analyze safely.");
    }

    const html = new TextDecoder("utf-8").decode(buffer);
    return extractFromHtml(html, response.url || rawUrl);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Timed out while fetching the page.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function extractFromHtml(html: string, url: string): ScrapeResult {
  const $ = cheerio.load(html);
  $(SKIP_TAGS).remove();
  $("[aria-hidden='true']").remove();

  const title =
    $("title").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    url;

  const blocks: ScrapeResult["blocks"] = [];
  const seen = new Set<string>();

  const candidates = $(
    "h1, h2, h3, h4, p, li, blockquote, figcaption, button, a, label, td, th, dt, dd",
  );

  candidates.each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text.length < 3 || text.length > 2000) return;
    const key = text.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    const tag = el.tagName?.toLowerCase() ?? "p";
    blocks.push({
      heading: /^h[1-4]$/.test(tag) ? text : undefined,
      text,
    });
  });

  // Fallback: body text if selectors yielded little
  if (blocks.length < 3) {
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    if (bodyText) {
      blocks.push({ text: bodyText.slice(0, 20_000) });
    }
  }

  const text = blocks.map((b) => b.text).join("\n");

  return { url, title, text, blocks };
}

export async function analyzeUrl(
  rawUrl: string,
  preferences?: RulePreferences | null,
): Promise<AnalysisResult> {
  const scraped = await scrapeUrl(rawUrl);
  return analyzeText(scraped.text, {
    sourceType: "url",
    sourceLabel: scraped.url,
    title: scraped.title,
    preferences,
  });
}
