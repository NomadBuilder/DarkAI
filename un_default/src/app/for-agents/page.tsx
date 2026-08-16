import type { Metadata } from "next";
import { InclusiveBand, SiteNav } from "@/components/SiteNav";
import { AgentsOnePager } from "@/components/AgentsOnePager";
import { AGENTS_URL } from "@/lib/agent-install";

export const metadata: Metadata = {
  title: "After Claude writes UI copy — Un-Default",
  description:
    "Make Un-Default the definition of done for AI-generated copy. One command: npx -y anti-default init — skill, MCP, and PR check for Claude and Cursor.",
  openGraph: {
    title: "After Claude writes UI copy, run this",
    description:
      "npx -y anti-default init — skill + MCP + PR check so agents don’t ship colonial defaults.",
    url: AGENTS_URL,
    type: "website",
    images: [
      {
        url: "/og-for-agents.jpg?v=2",
        width: 1200,
        height: 630,
        alt: "Un-Default — after Claude writes UI copy, run npx -y anti-default init",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "After Claude writes UI copy, run this",
    description:
      "npx -y anti-default init — skill + MCP + PR check so agents don’t ship colonial defaults.",
    images: ["/og-for-agents.jpg?v=2"],
  },
};
export default function ForAgentsPage() {
  return (
    <main id="main-content" className="flex-1">
      <div className="voice-orbs" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 pt-10 pb-20 md:px-10">
        <SiteNav active="agents" />

        <p className="animate-rise text-xs uppercase tracking-[0.2em] text-[var(--coral)] mb-4">
          For Claude · Cursor · any agent host
        </p>
        <h1
          className="animate-rise text-[clamp(2.4rem,7vw,4rem)] leading-[1.05] tracking-[-0.02em] text-[var(--ink)] max-w-3xl mb-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
        >
          After Claude writes UI copy, run this
        </h1>
        <InclusiveBand className="mb-8" />
        <p className="animate-rise-delay max-w-2xl text-lg text-[var(--ink-soft)] leading-relaxed mb-12">
          The missing step after AI writes your words — local inclusive-language
          check as definition of done. No account. No model required for
          matching.
        </p>

        <AgentsOnePager />
      </div>
    </main>
  );
}
