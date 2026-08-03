"use client";

import { useMemo, useState } from "react";
import { LANGUAGE_RULES } from "@/lib/rules";
import { sourcesForRule } from "@/lib/rule-sources";
import { severityLabel } from "@/lib/severity";
import { useRulePreferences } from "@/hooks/useRulePreferences";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  type Category,
} from "@/lib/types";

export function RulesStudio() {
  const { preferences, hydrated, toggleRule, reset, drift } =
    useRulePreferences();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [showDisabledOnly, setShowDisabledOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LANGUAGE_RULES.filter((rule) => {
      if (categoryFilter !== "all" && rule.category !== categoryFilter) {
        return false;
      }
      const enabled = preferences[rule.id]?.enabled !== false;
      if (showDisabledOnly && enabled) return false;
      if (!q) return true;
      return (
        rule.label.toLowerCase().includes(q) ||
        rule.why.toLowerCase().includes(q) ||
        rule.pattern.toLowerCase().includes(q) ||
        rule.suggestions.some((s) => s.toLowerCase().includes(q)) ||
        rule.id.includes(q)
      );
    });
  }, [query, categoryFilter, preferences, showDisabledOnly]);

  const grouped = useMemo(() => {
    const map = new Map<Category, typeof filtered>();
    for (const category of CATEGORY_ORDER) {
      map.set(
        category,
        filtered.filter((rule) => rule.category === category),
      );
    }
    return map;
  }, [filtered]);

  const enabledCount = LANGUAGE_RULES.filter(
    (rule) => preferences[rule.id]?.enabled !== false,
  ).length;

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--ink-soft)]">
            {LANGUAGE_RULES.length} rules · {enabledCount} active
            {hydrated && drift.disabled > 0 ? (
              <span> · {drift.disabled} off</span>
            ) : null}
          </p>
          <p className="text-sm text-[var(--ink-soft)] mt-1 max-w-xl">
            Turn rules on or off for your reviews. Changes save in this browser.
            Each rule links to the style guides that informed it.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-sm px-4 py-2 border border-[color-mix(in_oklab,var(--ink)_18%,transparent)] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--ink-soft)] transition-colors"
        >
          Reset to defaults
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <label className="flex-1 min-w-[14rem] grid gap-1">
          <span className="text-xs uppercase tracking-wider text-[var(--moss)]">
            Search
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="label, pattern, suggestion…"
            className="w-full bg-white/70 border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] px-3 py-2 outline-none focus:border-[var(--moss)]"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs uppercase tracking-wider text-[var(--moss)]">
            Browse
          </span>
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as Category | "all")
            }
            className="bg-white/70 border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] px-3 py-2 outline-none focus:border-[var(--moss)]"
          >
            <option value="all">All topics</option>
            {CATEGORY_ORDER.map((id) => (
              <option key={id} value={id}>
                {CATEGORY_META[id].title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--ink-soft)] pt-5">
          <input
            type="checkbox"
            checked={showDisabledOnly}
            onChange={(e) => setShowDisabledOnly(e.target.checked)}
          />
          Disabled only
        </label>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const rules = grouped.get(category) ?? [];
        if (rules.length === 0) return null;

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

            <ul className="grid gap-4">
              {rules.map((rule) => {
                const enabled = preferences[rule.id]?.enabled !== false;
                const sources = sourcesForRule(rule);

                return (
                  <li
                    id={rule.id}
                    key={rule.id}
                    className={`scroll-mt-24 grid gap-3 md:grid-cols-[auto_1fr] md:items-start border-b border-[color-mix(in_oklab,var(--ink)_8%,transparent)] pb-4 ${
                      enabled ? "" : "opacity-55"
                    }`}
                  >
                    <label className="flex items-center gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) =>
                          toggleRule(rule.id, e.target.checked)
                        }
                        aria-label={`Enable ${rule.label}`}
                      />
                      <span className="sr-only">Enable</span>
                    </label>

                    <div className="grid gap-2 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3
                          className="text-lg text-[var(--ink)]"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {rule.label}
                        </h3>
                        <span className="text-xs text-[var(--ink-soft)]">
                          {severityLabel(rule.severity)}
                        </span>
                        <code className="text-xs font-[family-name:var(--font-mono)] text-[var(--moss-deep)] break-all">
                          /{rule.pattern}/i
                        </code>
                      </div>
                      <p className="text-sm text-[var(--ink-soft)] leading-relaxed max-w-3xl">
                        {rule.why}
                      </p>
                      <p className="text-sm text-[var(--moss-deep)]">
                        <span className="text-[var(--ink-soft)]">Try: </span>
                        {rule.suggestions.join(" · ")}
                      </p>
                      {sources.length > 0 ? (
                        <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                          <span className="uppercase tracking-wider text-[var(--moss)]">
                            Sources
                          </span>
                          {" · "}
                          {sources.map((s, i) => (
                            <span key={s.href + s.title}>
                              {i > 0 ? " · " : null}
                              <a
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--teal-deep)] underline underline-offset-2 hover:text-[var(--ink)]"
                              >
                                {s.title}
                              </a>
                            </span>
                          ))}
                        </p>
                      ) : null}
                      <p className="text-xs font-[family-name:var(--font-mono)] text-[var(--ink-soft)]">
                        {rule.id}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {filtered.length === 0 ? (
        <p className="text-[var(--ink-soft)]">No rules match this filter.</p>
      ) : null}
    </div>
  );
}
