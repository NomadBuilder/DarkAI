"use client";

import { useEffect, useMemo, useState } from "react";
import { LANGUAGE_RULES } from "@/lib/rules";
import {
  buildGuideMarkdown,
  prefsFromSharePayload,
  prefsToSharePayload,
} from "@/lib/guide";
import { mergePreferences, resolveRules } from "@/lib/preferences";
import { useRulePreferences } from "@/hooks/useRulePreferences";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  type Category,
  type RulePreferences,
} from "@/lib/types";
import { withBasePath } from "@/lib/base-path";

export function GuideStudio() {
  const { preferences: localPrefs, hydrated } = useRulePreferences();
  const [sharedPrefs, setSharedPrefs] = useState<RulePreferences | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const payload = params.get("prefs");
    if (payload) {
      const parsed = prefsFromSharePayload(payload);
      if (parsed) setSharedPrefs(mergePreferences(parsed));
    }
  }, []);

  const prefs = sharedPrefs ?? localPrefs;
  const usingShared = Boolean(sharedPrefs);
  const rules = useMemo(() => resolveRules(prefs), [prefs]);

  const byCategory = useMemo(() => {
    const map = new Map<Category, typeof rules>();
    for (const category of CATEGORY_ORDER) {
      map.set(
        category,
        rules.filter((r) => r.category === category),
      );
    }
    return map;
  }, [rules]);

  function shareLink() {
    const payload = prefsToSharePayload(prefs);
    const url = `${window.location.origin}${withBasePath("/guide/")}#prefs=${encodeURIComponent(payload)}`;
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
    window.history.replaceState(null, "", `#prefs=${encodeURIComponent(payload)}`);
  }

  function downloadGuide() {
    const md = buildGuideMarkdown(prefs);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "un-default-style-guide.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--ink-soft)]">
            {rules.length} active rules
            {usingShared
              ? " · viewing a shared guide"
              : hydrated
                ? " · from your browser settings"
                : ""}
            {" · "}
            {LANGUAGE_RULES.length} in the full catalog
          </p>
          <p className="text-sm text-[var(--ink-soft)] mt-1 max-w-xl">
            Share this page with your team so everyone sees the same tuned
            defaults. Or download a Markdown style guide.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={shareLink}
            className="text-sm px-4 py-2 bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--moss-deep)] transition-colors"
          >
            {copied ? "Link copied" : "Copy share link"}
          </button>
          <button
            type="button"
            onClick={downloadGuide}
            className="text-sm px-4 py-2 border border-[color-mix(in_oklab,var(--ink)_18%,transparent)] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--ink-soft)] transition-colors"
          >
            Download Markdown
          </button>
          {usingShared ? (
            <button
              type="button"
              onClick={() => {
                setSharedPrefs(null);
                window.history.replaceState(null, "", window.location.pathname);
              }}
              className="text-sm px-4 py-2 text-[var(--ink-soft)] underline underline-offset-2"
            >
              Use my local rules
            </button>
          ) : null}
        </div>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const group = byCategory.get(category) ?? [];
        if (group.length === 0) return null;
        return (
          <section key={category} className="grid gap-4">
            <header className="border-b border-[color-mix(in_oklab,var(--ink)_12%,transparent)] pb-3">
              <h2
                className="text-2xl text-[var(--ink)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {CATEGORY_META[category].title}
              </h2>
              <p className="text-sm text-[var(--ink-soft)] mt-1 max-w-2xl">
                {CATEGORY_META[category].description}
              </p>
            </header>
            <ul className="grid gap-5">
              {group.map((rule) => (
                <li
                  key={rule.id}
                  className="grid gap-2 border-b border-[color-mix(in_oklab,var(--ink)_8%,transparent)] pb-4"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3
                      className="text-lg text-[var(--ink)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {rule.label}
                    </h3>
                  </div>
                  <p className="text-sm text-[var(--ink-soft)] leading-relaxed max-w-3xl">
                    {rule.why}
                  </p>
                  <p className="text-sm text-[var(--moss-deep)]">
                    <span className="text-[var(--ink-soft)]">Prefer: </span>
                    {rule.suggestions.join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {rules.length === 0 ? (
        <p className="text-[var(--ink-soft)]">
          All rules are disabled in this guide. Enable some on the Rules page.
        </p>
      ) : null}
    </div>
  );
}
