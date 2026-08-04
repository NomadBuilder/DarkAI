import { InclusiveBand, SiteNav } from "@/components/SiteNav";
import { PhraseLookup } from "@/components/PhraseLookup";

export const metadata = {
  title: "Swap a phrase — Anti-Default",
  description:
    "Look up a word or short phrase and get inclusive alternatives from Anti-Default’s public rules.",
};

export default function SwapPage() {
  return (
    <main id="main-content" className="flex-1">
      <div className="voice-orbs" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 pt-10 pb-20 md:px-10">
        <SiteNav active="swap" />

        <p className="animate-rise text-xs uppercase tracking-[0.2em] text-[var(--ochre)] mb-4">
          Quick swap
        </p>
        <h1
          className="animate-rise text-[clamp(2.4rem,7vw,4rem)] leading-[1.05] tracking-[-0.02em] text-[var(--ink)] max-w-3xl mb-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
        >
          Swap a phrase
        </h1>
        <InclusiveBand className="mb-8" />
        <p className="animate-rise-delay max-w-2xl text-lg text-[var(--ink-soft)] leading-relaxed mb-10">
          Type a word or short phrase. Inclusive matches get gentler alternatives;
          coded / dogwhistle matches get a decode — what it can signal — not a
          forced rewrite.{" "}
          <span className="text-[var(--ink)]">you guys → you all, folks</span>
          .
        </p>

        <div className="max-w-2xl">
          <PhraseLookup />
        </div>
      </div>
    </main>
  );
}
