import Link from "next/link";
import { ReviewApp } from "@/components/ReviewApp";
import { InclusiveBand, SiteNav } from "@/components/SiteNav";
import {
  CHROME_STORE_URL,
  GITHUB_URL,
} from "@/lib/links";

export default function Home() {
  return (
    <main id="main-content" className="flex-1">
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="voice-orbs" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pt-10 pb-16 md:px-10 md:pt-14">
          <SiteNav active="home" />

          <p className="animate-rise text-xs uppercase tracking-[0.2em] text-[var(--teal)] mb-6">
            For every reader · every community
          </p>

          <h1
            className="animate-rise text-[clamp(3.4rem,12vw,6.5rem)] leading-[0.92] tracking-[-0.03em] text-[var(--ink)] max-w-4xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
          >
            Un-Default
          </h1>
          <InclusiveBand className="mt-5 mb-8" />

          <p className="animate-rise-delay max-w-xl text-lg md:text-xl text-[var(--ink-soft)] leading-relaxed mb-3">
            Make public language a place more people can belong — review copy
            for colonial defaults, gendered assumptions, ableist metaphors, and
            other excluding phrasing.
          </p>
          <p className="animate-rise-delay text-base text-[var(--ink-soft)] max-w-xl mb-8 leading-relaxed">
            Suggestions are invitations, not a single “correct” English. Need
            one phrase? Use{" "}
            <Link
              href="/swap"
              className="text-[var(--teal-deep)] underline underline-offset-2 decoration-[var(--ochre)] hover:text-[var(--ink)]"
            >
              Swap
            </Link>
            . Learning coded language? See{" "}
            <Link
              href="/dogwhistles"
              className="text-[var(--teal-deep)] underline underline-offset-2 decoration-[var(--ochre)] hover:text-[var(--ink)]"
            >
              Dogwhistles
            </Link>
            . Tune what matters on{" "}
            <Link
              href="/rules"
              className="text-[var(--teal-deep)] underline underline-offset-2 decoration-[var(--ochre)] hover:text-[var(--ink)]"
            >
              /rules
            </Link>
            .
          </p>

          <div className="animate-rise-delay mb-10 max-w-xl">
            <p
              className="text-sm text-[var(--ink)] mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              npx -y anti-default init
            </p>
            <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
              After Claude or Cursor writes UI copy, make Un-Default the
              definition of done — skill, MCP, and PR check in one shot.{" "}
              <Link
                href="/for-agents"
                className="text-[var(--teal-deep)] underline underline-offset-2 decoration-[var(--ochre)] hover:text-[var(--ink)]"
              >
                Agents one-pager
              </Link>
              . Or scan here for demos and tuning.
            </p>
          </div>

          <div className="max-w-3xl">
            <ReviewApp />
          </div>
        </div>
      </section>

      <section
        className="border-t border-[color-mix(in_oklab,var(--ink)_10%,transparent)]"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in oklab, var(--coral) 8%, transparent), color-mix(in oklab, var(--ochre) 8%, transparent), color-mix(in oklab, var(--teal) 8%, transparent), color-mix(in oklab, var(--indigo) 8%, transparent), color-mix(in oklab, var(--rose) 8%, transparent))",
        }}
      >
        <div className="mx-auto max-w-5xl px-6 py-16 md:px-10 grid gap-12 md:grid-cols-3">
          <ApproachCard
            title="What we check"
            accent="var(--coral)"
            body="When you enter a website URL, we read the visible copy — and can follow about, careers, and product pages on the same site — then review titles, paragraphs, links, and buttons."
          />
          <ApproachCard
            title="Many standards"
            accent="var(--teal)"
            body={
              <>
                Patterns are public on{" "}
                <Link
                  href="/rules"
                  className="text-[var(--teal-deep)] underline underline-offset-2"
                >
                  /rules
                </Link>
                , each with style-guide footnotes. Turn rules on or off —
                inclusion is not one checklist. Optional browser extension
                highlights the same patterns on live pages.
              </>
            }
          />
          <ApproachCard
            title="Ship at scale"
            accent="var(--indigo)"
            body={
              <>
                <Link
                  href="/for-agents"
                  className="text-[var(--teal-deep)] underline underline-offset-2"
                >
                  Agents
                </Link>
                :{" "}
                <code className="text-[var(--ink)]">npx -y anti-default init</code>,
                MCP for Claude/Cursor, a GitHub Action that fails PRs, and a{" "}
                <a
                  href={CHROME_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--teal-deep)] underline underline-offset-2"
                >
                  Chrome extension
                </a>
                .
              </>
            }
          />
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 py-10 md:px-10 text-sm text-[var(--ink-soft)] flex flex-wrap gap-x-8 gap-y-3 justify-between">
        <p className="max-w-xl leading-relaxed">
          Language moves with people. Keep humans and communities in the loop.
        </p>
        <p className="text-xs self-end flex flex-wrap gap-x-3 gap-y-1 justify-end items-center">
          <Link
            href="/for-agents"
            className="text-[var(--teal-deep)] underline underline-offset-2"
          >
            Agents
          </Link>
          <Link
            href="/rules"
            className="text-[var(--teal-deep)] underline underline-offset-2"
          >
            Rules
          </Link>
          <Link
            href="/sources"
            className="text-[var(--teal-deep)] underline underline-offset-2"
          >
            Sources
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--teal-deep)] underline underline-offset-2"
          >
            GitHub
          </a>
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--teal-deep)] underline underline-offset-2"
          >
            Extension
          </a>
          <Link
            href="/privacy"
            className="text-[var(--teal-deep)] underline underline-offset-2"
          >
            Privacy
          </Link>
        </p>
      </footer>
    </main>
  );
}

function ApproachCard({
  title,
  body,
  accent,
}: {
  title: string;
  body: React.ReactNode;
  accent: string;
}) {
  return (
    <div>
      <div
        className="h-1 w-12 mb-4"
        style={{ background: accent }}
        aria-hidden
      />
      <h2
        className="text-2xl text-[var(--ink)] mb-3"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <p className="text-[var(--ink-soft)] leading-relaxed">{body}</p>
    </div>
  );
}
