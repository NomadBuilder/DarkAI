import { SiteNav } from "@/components/SiteNav";
import { UsageStatsPanel } from "@/components/UsageStatsPanel";

export const metadata = {
  title: "Usage — Un-Default",
  description:
    "Aggregate, anonymous usage counts for the for-agents page and GitHub Action.",
};

export default function UsagePage() {
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
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--coral)] mb-4">
          Usage
        </p>
        <h1
          className="text-[clamp(2.2rem,6vw,3.4rem)] leading-[1.08] tracking-[-0.02em] text-[var(--ink)] max-w-3xl mb-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
        >
          How much is Un-Default used?
        </h1>
        <p className="max-w-2xl text-lg text-[var(--ink-soft)] leading-relaxed mb-10">
          First-party counters only — page views and copy clicks on the agents
          guide, plus anonymous GitHub Action pings. No cookies, no repo names,
          no scanned text.
        </p>
        <UsageStatsPanel />
      </div>
    </main>
  );
}
