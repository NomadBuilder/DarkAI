import { SiteNav } from "@/components/SiteNav";
import PrivacyContent from "@/components/PrivacyContent";

export const metadata = {
  title: "Privacy — Anti-Default",
  description:
    "Privacy policy for the Anti-Default browser extension and web language reviewer.",
};

export default function PrivacyPage() {
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
          Privacy
        </p>
        <h1
          className="text-[clamp(2.2rem,6vw,3.4rem)] leading-[1.08] tracking-[-0.02em] text-[var(--ink)] max-w-3xl mb-10"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
        >
          What we collect — and what we don’t
        </h1>
        <PrivacyContent />
      </div>
    </main>
  );
}
