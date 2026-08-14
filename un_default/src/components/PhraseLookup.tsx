"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { LOOKUP_EXAMPLES, lookupPhrase } from "@/lib/lookup";
import {
  compactSourceName,
  sourceContextForRuleId,
} from "@/lib/rule-sources";
import { CATEGORY_META } from "@/lib/types";
import { useRulePreferences } from "@/hooks/useRulePreferences";

export function PhraseLookup() {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const { preferences } = useRulePreferences();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQuery(q);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const trimmed = query.trim();
    const url = new URL(window.location.href);
    if (trimmed) url.searchParams.set("q", trimmed);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, [query]);

  const hits = useMemo(
    () => lookupPhrase(deferred, preferences),
    [deferred, preferences],
  );

  const trimmed = deferred.trim();
  const avoidHits = hits.filter((h) => h.relation === "avoid");
  const preferredHits = hits.filter((h) => h.relation === "already-preferred");

  return (
    <div className="grid gap-8">
      <label className="grid gap-2">
        <span className="text-sm text-[var(--ink-soft)]">
          Word or short phrase
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. you guys"
          autoComplete="off"
          autoFocus
          className="w-full text-xl md:text-2xl px-4 py-4 bg-[color-mix(in_oklab,white_72%,transparent)] border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus:outline-none focus:border-[var(--teal)]"
          style={{ fontFamily: "var(--font-display)" }}
          aria-describedby="swap-hint"
        />
        <span id="swap-hint" className="text-sm text-[var(--ink-soft)]">
          We match against the same rules as Review — suggestions are options,
          not a single correct English.
        </span>
      </label>

      {!trimmed ? (
        <div>
          <p className="text-sm text-[var(--ink-soft)] mb-3">Try</p>
          <div className="flex flex-wrap gap-2">
            {LOOKUP_EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setQuery(example)}
                className="px-3 py-2 text-sm border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--teal)] transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {trimmed && hits.length === 0 ? (
        <p className="text-[var(--ink-soft)] leading-relaxed max-w-xl">
          No rule matched “{trimmed}”. Browse{" "}
          <Link
            href="/rules"
            className="text-[var(--teal-deep)] underline underline-offset-2"
          >
            /rules
          </Link>{" "}
          or paste a longer passage into{" "}
          <Link
            href="/"
            className="text-[var(--teal-deep)] underline underline-offset-2"
          >
            Review
          </Link>
          .
        </p>
      ) : null}

      {avoidHits.length > 0 ? (
        <div className="grid gap-6">
          {avoidHits.map((hit) => {
            const sources = sourceContextForRuleId(
              hit.ruleId,
              hit.category,
            ).evidence;
            const badges = [
              ...new Map(
                sources.map((s) => [compactSourceName(s.title), s] as const),
              ).values(),
            ].slice(0, 4);

            return (
              <article
                key={hit.ruleId}
                className="border-t border-[color-mix(in_oklab,var(--ink)_10%,transparent)] pt-6"
              >
                <p
                  className={`text-xs uppercase tracking-[0.16em] mb-3 ${
                    hit.category === "coded"
                      ? "text-[var(--indigo)]"
                      : "text-[var(--coral)]"
                  }`}
                >
                  {CATEGORY_META[hit.category].title}
                </p>
                {hit.category === "coded" ? (
                  <>
                    <p
                      className="text-2xl md:text-3xl text-[var(--ink)] mb-3"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      “{hit.from}”
                    </p>
                    <p className="text-base text-[var(--indigo)] mb-3 leading-relaxed max-w-2xl">
                      This can signal: {hit.why}
                    </p>
                    {hit.suggestions.length > 0 ? (
                      <p className="text-base text-[var(--ink)] mb-3">
                        <span className="text-[var(--ink-soft)]">
                          If you didn’t mean the coded sense:{" "}
                        </span>
                        {hit.suggestions.join(" · ")}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-4">
                      <p
                        className="text-2xl md:text-3xl text-[var(--ink)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        <span className="line-through decoration-[var(--coral)] decoration-2 text-[var(--ink-soft)]">
                          {hit.from}
                        </span>
                        <span className="mx-3 text-[var(--ink-soft)]" aria-hidden>
                          →
                        </span>
                        <span>{hit.suggestions[0]}</span>
                      </p>
                    </div>
                    {hit.suggestions.length > 1 ? (
                      <p className="text-base text-[var(--ink)] mb-3">
                        <span className="text-[var(--ink-soft)]">Also try: </span>
                        {hit.suggestions.slice(1).join(" · ")}
                      </p>
                    ) : null}
                    <p className="text-[var(--ink-soft)] leading-relaxed max-w-2xl mb-3">
                      {hit.why}
                    </p>
                  </>
                )}
                {badges.length > 0 ? (
                  <p className="text-sm text-[var(--ink-soft)] mb-2">
                    <span className="text-[var(--ink)]">
                      {hit.category === "coded" ? "Learn more: " : "Supported by: "}
                    </span>
                    {badges.map((s, i) => (
                      <span key={s.href + s.title}>
                        {i > 0 ? " · " : null}
                        <a
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--teal-deep)] underline underline-offset-2 hover:text-[var(--ink)]"
                        >
                          {compactSourceName(s.title)}
                        </a>
                      </span>
                    ))}
                  </p>
                ) : null}
                <p className="text-sm text-[var(--ink-soft)]">
                  {hit.category === "coded" ? (
                    <>
                      <Link
                        href={`/dogwhistles#${hit.ruleId}`}
                        className="text-[var(--teal-deep)] underline underline-offset-2"
                      >
                        Full dogwhistle entry
                      </Link>
                      {" · "}
                    </>
                  ) : null}
                  Rule:{" "}
                  <Link
                    href={`/rules#${hit.ruleId}`}
                    className="text-[var(--teal-deep)] underline underline-offset-2"
                  >
                    {hit.label}
                  </Link>
                </p>
              </article>
            );
          })}
        </div>
      ) : null}

      {preferredHits.length > 0 ? (
        <div className="grid gap-4">
          <p className="text-sm text-[var(--moss-deep)]">
            “{trimmed}” already shows up as a preferred option for:
          </p>
          {preferredHits.map((hit) => (
            <article
              key={`pref-${hit.ruleId}`}
              className="text-[var(--ink-soft)] leading-relaxed"
            >
              <p>
                Instead of{" "}
                <span className="text-[var(--ink)]">{hit.from}</span>
                {" — "}
                <Link
                  href={`/rules#${hit.ruleId}`}
                  className="text-[var(--teal-deep)] underline underline-offset-2"
                >
                  {hit.label}
                </Link>
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
