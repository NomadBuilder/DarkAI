import Link from "next/link";
import { LANGUAGE_RULES } from "@/lib/rules";
import {
  compactSourceName,
  sourcesForRule,
} from "@/lib/rule-sources";
import { patternAsPhrase } from "@/lib/lookup";

/** Educational guide for coded / dogwhistle phrases — not a rewrite tool. */
export function DogwhistleGuide() {
  const rules = LANGUAGE_RULES.filter((r) => r.category === "coded");

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
          This page is for learning: what a phrase can signal, and how to say
          what you actually mean without the coded frame. It is not a purity
          test. Review still shows coded hits as a separate “Possible coded
          signals” lane so you can decide in context.
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
        <header className="border-b border-[color-mix(in_oklab,var(--ink)_12%,transparent)] pb-3">
          <h2
            className="text-2xl text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Phrases we flag
          </h2>
          <p className="text-sm text-[var(--ink-soft)] mt-2 max-w-2xl leading-relaxed">
            {rules.length} entries in the Coded ruleset. Soft heads-ups are
            marked — those fire often in everyday talk and need extra care.
          </p>
        </header>

        <ul className="grid gap-10">
          {rules.map((rule) => {
            const phrase =
              patternAsPhrase(rule.pattern) ||
              rule.label.replace(/^[“"]|[”"]$/g, "");
            const sources = sourcesForRule(rule);
            const badges = [
              ...new Map(
                sources.map((s) => [compactSourceName(s.title), s] as const),
              ).values(),
            ].slice(0, 5);

            return (
              <li
                key={rule.id}
                id={rule.id}
                className="scroll-mt-24 grid gap-3 border-b border-[color-mix(in_oklab,var(--ink)_8%,transparent)] pb-10"
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
                  <p className="text-[var(--ink)] leading-relaxed">{rule.why}</p>
                </div>

                {rule.suggestions.length > 0 ? (
                  <div className="grid gap-2 max-w-2xl">
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--moss)]">
                      Say this instead (if that was your intent)
                    </p>
                    <ul className="grid gap-1.5 text-[var(--ink-soft)] leading-relaxed">
                      {rule.suggestions.map((s) => (
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
                    href={`/swap/?q=${encodeURIComponent(phrase.split(/\s*[|/]/)[0]?.trim() || phrase)}`}
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
      </section>
    </div>
  );
}
