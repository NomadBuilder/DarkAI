import { InclusiveBand, SiteNav } from "@/components/SiteNav";
import { GuideStudio } from "@/components/GuideStudio";

export const metadata = {
  title: "Style guide — Anti-Default",
  description:
    "A shareable inclusive-language style guide generated from your tuned Anti-Default rules.",
};

export default function GuidePage() {
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

        <p className="animate-rise text-xs uppercase tracking-[0.2em] text-[var(--indigo)] mb-4">
          Team style guide
        </p>
        <h1
          className="animate-rise text-[clamp(2.4rem,7vw,4rem)] leading-[1.05] tracking-[-0.02em] text-[var(--ink)] max-w-3xl mb-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
        >
          Shared defaults, written down
        </h1>
        <InclusiveBand className="mb-8" />
        <p className="animate-rise-delay max-w-2xl text-lg text-[var(--ink-soft)] leading-relaxed mb-10">
          Turn your tuned rule set into a living style guide — copy a share link
          for the team, or download Markdown for your handbook.
        </p>

        <GuideStudio />
      </div>
    </main>
  );
}
