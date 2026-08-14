import { InclusiveBand, SiteNav } from "@/components/SiteNav";
import { AdminReview } from "@/components/AdminReview";
import { LANGUAGE_RULES } from "@/lib/rules";

export const metadata = {
  title: "Review console — Anti-Default",
  description:
    "Reviewer console for separately auditing Anti-Default flags, evidence, framing, and context-sensitive alternatives.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main id="main-content" className="flex-1">
      <div className="voice-orbs" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 pt-10 pb-20 md:px-10">
        <SiteNav />

        <p className="animate-rise text-xs uppercase tracking-[0.2em] text-[var(--coral)] mb-4">
          Reviewer console
        </p>
        <h1
          className="animate-rise text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.05] tracking-[-0.02em] text-[var(--ink)] max-w-3xl mb-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
        >
          Review the flag and the alternative separately
        </h1>
        <InclusiveBand className="mb-8" />
        <p className="animate-rise-delay max-w-2xl text-lg text-[var(--ink-soft)] leading-relaxed mb-10">
          Go through all {LANGUAGE_RULES.length} rules. For each one, mark it{" "}
          <strong>verified</strong>, request <strong>changes</strong>, or{" "}
          <strong>reject</strong>
          {" "}it — and edit the label, rationale, or proposed alternatives
          inline. A valid reason to flag wording does not prove that a suggested
          replacement is better, so review its meaning, framing, and evidence
          independently. “Fine in this context” events from Review land in the
          false-positive queue below. You can also propose rules we missed. Your
          work stays in this browser; export it when you&rsquo;re done so the
          changes can be merged into{" "}
          <code className="font-[family-name:var(--font-mono)] text-sm text-[var(--teal-deep)]">
            src/lib/rules.ts
          </code>
          .
        </p>

        <AdminReview />
      </div>
    </main>
  );
}
