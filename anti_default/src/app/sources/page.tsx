import { InclusiveBand, SiteNav } from "@/components/SiteNav";
import { SOURCE_GROUPS } from "@/lib/sources";
import Link from "next/link";

export const metadata = {
  title: "Sources — Anti-Default",
  description:
    "Style guides and references that informed the Anti-Default inclusive-language rule catalog.",
};

export default function SourcesPage() {
  return (
    <main id="main-content" className="flex-1">
      <div className="voice-orbs" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 pt-10 pb-20 md:px-10">
        <SiteNav active="sources" />

        <p className="animate-rise text-xs uppercase tracking-[0.2em] text-[var(--ochre)] mb-4">
          Where the rules come from
        </p>
        <h1
          className="animate-rise text-[clamp(2.4rem,7vw,4rem)] leading-[1.05] tracking-[-0.02em] text-[var(--ink)] max-w-3xl mb-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
        >
          Sources
        </h1>
        <InclusiveBand className="mb-8" />
        <p className="animate-rise-delay max-w-2xl text-lg text-[var(--ink-soft)] leading-relaxed mb-4">
          The rule catalog is a curated heuristic set drawn from inclusive-language
          guidance and, separately, documented dogwhistles so people can notice
          coded language they may repeat without knowing. It is not an official
          standard — tune what matters on{" "}
          <Link
            href="/rules"
            className="text-[var(--teal-deep)] underline underline-offset-2"
          >
            Rules
          </Link>
          .
        </p>
        <p className="text-sm text-[var(--ink-soft)] max-w-2xl mb-12 leading-relaxed">
          Links point to living documents; wording on those sites may change.
          Prefer the community’s own guidance when it differs from ours.
        </p>

        <div className="grid gap-12">
          {SOURCE_GROUPS.map((group) => (
            <section key={group.id} className="grid gap-4">
              <header className="border-b border-[color-mix(in_oklab,var(--ink)_12%,transparent)] pb-3">
                <h2
                  className="text-2xl text-[var(--ink)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {group.title}
                </h2>
                <p className="text-[var(--ink-soft)] mt-2 leading-relaxed max-w-3xl">
                  {group.summary}
                </p>
              </header>

              {group.links.length > 0 ? (
                <ul className="grid gap-4">
                  {group.links.map((link) => (
                    <li key={link.href + link.title}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--teal-deep)] underline underline-offset-2 hover:text-[var(--ink)] font-medium"
                      >
                        {link.title}
                      </a>
                      {link.note ? (
                        <p className="text-sm text-[var(--ink-soft)] mt-1 leading-relaxed max-w-3xl">
                          {link.note}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
