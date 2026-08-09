import Link from "next/link";
import { InclusiveBand, SiteNav } from "@/components/SiteNav";
import { RulesStudio } from "@/components/RulesStudio";
import { LANGUAGE_RULES } from "@/lib/rules";

export const metadata = {
  title: "Rules — Anti-Default",
  description:
    "Browse and enable or disable the inclusive-language rules used by Anti-Default, with links to source style guides.",
};

export default function RulesPage() {
  return (
    <main id="main-content" className="flex-1">
      <div className="voice-orbs" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 pt-10 pb-20 md:px-10">
        <SiteNav active="rules" />

        <p className="animate-rise text-xs uppercase tracking-[0.2em] text-[var(--coral)] mb-4">
          Shared care · local choice
        </p>
        <h1
          className="animate-rise text-[clamp(2.4rem,7vw,4rem)] leading-[1.05] tracking-[-0.02em] text-[var(--ink)] max-w-3xl mb-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
        >
          What we flag — shaped with you
        </h1>
        <InclusiveBand className="mb-8" />
        <p className="animate-rise-delay max-w-2xl text-lg text-[var(--ink-soft)] leading-relaxed mb-10">
          {LANGUAGE_RULES.length} patterns across colonial, gender, LGBTQ+,
          ableist, racialized, class, and age language. Turn rules on or off for
          your reviews, or edit shared defaults in{" "}
          <code className="font-[family-name:var(--font-mono)] text-sm text-[var(--teal-deep)]">
            src/lib/rules.ts
          </code>
          . Rule-specific links are shown only when evidence has been attached
          directly; broader reading is kept separate so it cannot masquerade as
          proof. Suggested alternatives are prompts for contextual rewriting,
          not universal substitutions; evidence for a flag does not
          automatically validate every alternative. See{" "}
          <Link
            href="/sources"
            className="text-[var(--teal-deep)] underline underline-offset-2"
          >
            Sources
          </Link>{" "}
          for the full list.
        </p>

        <RulesStudio />
      </div>
    </main>
  );
}
