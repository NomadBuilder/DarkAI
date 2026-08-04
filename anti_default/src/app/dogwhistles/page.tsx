import Link from "next/link";
import { DogwhistleGuide } from "@/components/DogwhistleGuide";
import { InclusiveBand, SiteNav } from "@/components/SiteNav";

export const metadata = {
  title: "Dogwhistles — Anti-Default",
  description:
    "Learn how coded and dogwhistle phrases work, what they can signal, and clearer ways to say what you mean.",
};

export default function DogwhistlesPage() {
  return (
    <main id="main-content" className="flex-1">
      <div className="voice-orbs" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 pt-10 pb-20 md:px-10">
        <SiteNav active="dogwhistles" />

        <p className="animate-rise text-xs uppercase tracking-[0.2em] text-[var(--indigo)] mb-4">
          Coded language
        </p>
        <h1
          className="animate-rise text-[clamp(2.4rem,7vw,4rem)] leading-[1.05] tracking-[-0.02em] text-[var(--ink)] max-w-3xl mb-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
        >
          Dogwhistles
        </h1>
        <InclusiveBand className="mb-8" />
        <p className="animate-rise-delay max-w-2xl text-lg text-[var(--ink-soft)] leading-relaxed mb-10">
          Phrases that can carry a second meaning — often without the speaker
          knowing. Read the signal, then choose clearer words. For one-off
          inclusive swaps (you guys → folks), use{" "}
          <Link
            href="/swap"
            className="text-[var(--teal-deep)] underline underline-offset-2"
          >
            Swap
          </Link>
          .
        </p>

        <DogwhistleGuide />
      </div>
    </main>
  );
}
