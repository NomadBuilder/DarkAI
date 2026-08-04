"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { DOGWHISTLE_BLURBS } from "@/lib/dogwhistle-guide";
import { LANGUAGE_RULES } from "@/lib/rules";
import { patternAsPhrase } from "@/lib/lookup";
import {
  compactSourceName,
  sourcesForRule,
} from "@/lib/rule-sources";

type SoftFilter = "all" | "soft" | "strong";

/** Educational guide for coded / dogwhistle phrases — not a rewrite tool. */
export function DogwhistleGuide() {
  const [query, setQuery] = useState("");
  const [softFilter, setSoftFilter] = useState<SoftFilter>("all");
  const deferredQuery = useDeferredValue(query);

  const rules = useMemo(
    () => LANGUAGE_RULES.filter((r) => r.category === "coded"),
    [],
  );

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return rules.filter((rule) => {
      if (softFilter === "soft" && !rule.defaultSoft) return false;
      if (softFilter === "strong" && rule.defaultSoft) return false;
      if (!q) return true;
      const blurb = DOGWHISTLE_BLURBS[rule.id];
      const hay = [
        rule.label,
        rule.why,
        rule.id,
        patternAsPhrase(rule.pattern),
        ...(rule.suggestions ?? []),
        blurb?.looksLike,
        blurb?.signal,
        blurb?.whenFine,
        ...(blurb?.sayInstead ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rules, deferredQuery, softFilter]);

  return (
    <div className="grid gap-14">
      <section className="grid gap-4 max-w-2xl">
        <h2
          className="text-2xl text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          What is a dogwhistle?
        </h2>
        <p className="text-[var(--ink-soft)] leading-relaxed">
          A dogwhistle is language that sounds ordinary to most people but
          carries a second meaning for a specific in-group — often far-right or
          conspiracy audiences. Someone can repeat the phrase without knowing
          that history. Intent isn’t always present; context still matters.
        </p>
        <p className="text-[var(--ink-soft)] leading-relaxed">
          This page is for learning: what a phrase can signal, when the same
          words may be fine, and how to say what you actually mean. It is not a
          purity test. Review still shows coded hits as a separate “Possible
          coded signals” lane so you can decide in context.
        </p>
        <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
          Deeper reading on{" "}
          <Link
            href="/sources"
            className="text-[var(--teal-deep)] underline underline-offset-2"
          >
            Sources
          </Link>
          , including Indiecator, RationalWiki, the Conspiracy Chart, ADL, and
          SPLC. Prefer community and journalism guides when they differ from
          ours.
        </p>
      </section>

      <section className="grid gap-8">
        <header className="border-b border-[color-mix(in_oklab,var(--ink)_12%,transparent)] pb-4 grid gap-4">
          <div>
            <h2
              className="text-2xl text-[var(--ink)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Phrases we flag
            </h2>
            <p className="text-sm text-[var(--ink-soft)] mt-2 max-w-2xl leading-relaxed">
              {rules.length} entries · showing {filtered.length}
              {softFilter !== "all" || deferredQuery.trim()
                ? " (filtered)"
                : ""}
              . Soft heads-ups fire in everyday talk and need extra care.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end">
            <label className="flex-1 min-w-[12rem] grid gap-1">
              <span className="text-xs text-[var(--ink-soft)]">Search</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. globalist, replacement, soy…"
                className="w-full px-3 py-2 bg-white/70 border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] text-[var(--ink)] outline-none focus:border-[var(--indigo)]"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-[var(--ink-soft)]">Show</span>
              <select
                value={softFilter}
                onChange={(e) => setSoftFilter(e.target.value as SoftFilter)}
                className="px-3 py-2 bg-white/70 border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] text-[var(--ink)] outline-none focus:border-[var(--indigo)]"
              >
                <option value="all">All phrases</option>
                <option value="strong">Strong signals only</option>
                <option value="soft">Soft heads-ups only</option>
              </select>
            </label>
          </div>
        </header>

        {filtered.length === 0 ? (
          <p className="text-[var(--ink-soft)]">
            No phrases match that search. Clear the filter or try another word.
          </p>
        ) : (
          <ul className="grid gap-10">
            {filtered.map((rule) => {
              const blurb = DOGWHISTLE_BLURBS[rule.id];
              const phrase =
                blurb?.looksLike ||
                patternAsPhrase(rule.pattern) ||
                rule.label.replace(/^[“"]|[”"]$/g, "");
              const sources = sourcesForRule(rule);
              const badges = [
                ...new Map(
                  sources.map((s) => [compactSourceName(s.title), s] as const),
                ).values(),
              ].slice(0, 5);
              const sayInstead =
                blurb?.sayInstead?.length ? blurb.sayInstead : rule.suggestions;

              return (
                <li
                  key={rule.id}
                  id={rule.id}
                  className="scroll-mt-24 grid gap-4 border-b border-[color-mix(in_oklab,var(--ink)_8%,transparent)] pb-10"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                    <h3
                      className="text-xl md:text-2xl text-[var(--ink)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {rule.label}
                    </h3>
                    {rule.defaultSoft ? (
                      <span className="text-xs tracking-wide px-2 py-1 text-[var(--warn)] bg-[color-mix(in_oklab,var(--warn)_12%,white)]">
                        Soft heads-up
                      </span>
                    ) : (
                      <span className="text-xs tracking-wide px-2 py-1 text-[var(--indigo)] bg-[color-mix(in_oklab,var(--indigo)_12%,white)]">
                        Strong signal
                      </span>
                    )}
                  </div>

                  <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--ink-soft)]">
                    Often looks like: “{phrase}”
                  </p>

                  <div className="grid gap-2 max-w-2xl">
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--indigo)]">
                      What it can signal
                    </p>
                    <p className="text-[var(--ink)] leading-relaxed">
                      {blurb?.signal ?? rule.why}
                    </p>
                  </div>

                  <div className="grid gap-2 max-w-2xl">
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--warn)]">
                      When it may be fine
                    </p>
                    <p className="text-[var(--ink-soft)] leading-relaxed">
                      {blurb?.whenFine ??
                        "Context matters. Soft heads-ups especially — decide whether the coded sense is actually in play."}
                    </p>
                  </div>

                  {sayInstead.length > 0 ? (
                    <div className="grid gap-2 max-w-2xl">
                      <p className="text-xs uppercase tracking-[0.14em] text-[var(--moss)]">
                        What to say instead
                      </p>
                      <ul className="grid gap-1.5 text-[var(--ink-soft)] leading-relaxed">
                        {sayInstead.map((s) => (
                          <li key={s} className="flex gap-2">
                            <span className="text-[var(--moss)]" aria-hidden>
                              →
                            </span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {badges.length > 0 ? (
                    <p className="text-sm text-[var(--ink-soft)]">
                      <span className="text-[var(--ink)]">Learn more: </span>
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
                    <Link
                      href={`/swap/?q=${encodeURIComponent(
                        (blurb?.looksLike || phrase)
                          .split(/[;|]/)[0]
                          ?.replace(/\s*\(.*$/, "")
                          .trim() || phrase,
                      )}`}
                      className="text-[var(--teal-deep)] underline underline-offset-2"
                    >
                      Look up in Swap
                    </Link>
                    {" · "}
                    <Link
                      href={`/rules#${rule.id}`}
                      className="text-[var(--teal-deep)] underline underline-offset-2"
                    >
                      Rule settings
                    </Link>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
