'use client'

import Link from 'next/link'

const ISSUES: { title: string; bullets: string[] }[] = [
  {
    title: 'Healthcare',
    bullets: [
      'Billions to private staffing agencies while public hospitals run deficits.',
      'For-profit clinics paid more than public hospitals for the same procedures.',
      'Longer waits as capacity shifts out of public hands.',
    ],
  },
  {
    title: 'Water',
    bullets: [
      'Bill 60 opens the door to corporate control of water and wastewater.',
      'Municipal oversight and public accountability are weakened.',
    ],
  },
  {
    title: 'Public land',
    bullets: [
      'Greenbelt swaps and Ontario Place — who benefits when protected land is opened up?',
      'Waterfront and farmland treated as developer opportunity, not public trust.',
    ],
  },
  {
    title: 'Environment & rights',
    bullets: [
      'Bill 5 rolls back species protection and Indigenous participation.',
      'Special economic zones and weakened environmental rules.',
    ],
  },
]

export default function FlyerPage() {
  const handlePrint = () => window.print()

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .flyer-no-print {
            display: none !important;
          }
          .flyer-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            max-width: none !important;
            border-radius: 0 !important;
          }
        }
        @page {
          size: letter;
          margin: 0.35in;
        }
      `}</style>

      <div className="flyer-no-print min-h-screen bg-gradient-to-b from-[#3d2b7a] to-[#2a1f58] py-6 px-4 sm:py-10 sm:px-6">
        <div className="flyer-no-print mx-auto mb-6 flex max-w-[8.5in] flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-light text-[#f9e04c]/90 hover:text-[#f9e04c] transition-colors"
          >
            ← ProtectOnt.ca
          </Link>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg bg-[#f9e04c] px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] shadow-md hover:bg-[#f5d84a] transition-colors"
          >
            Print / Save as PDF
          </button>
        </div>

        <article
          className="flyer-sheet mx-auto max-w-[8.5in] overflow-hidden rounded-sm bg-white shadow-2xl print:shadow-none"
          aria-label="Protect Ontario printable awareness flyer"
        >
          {/* Header band */}
          <header
            className="px-6 pt-6 pb-5 sm:px-8 sm:pt-8"
            style={{
              background: 'linear-gradient(135deg, #3d2b7a 0%, #2E4A6B 55%, #1e3a5f 100%)',
            }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-icon-text.svg"
                alt="ProtectOnt.ca"
                className="h-10 w-auto brightness-0 invert sm:h-11"
              />
              <p className="text-right text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#f9e04c]/80 sm:text-xs">
                Public data · Ontario
              </p>
            </div>
            <h1 className="mt-5 text-[1.65rem] font-bold leading-[1.12] tracking-tight text-[#f9e04c] sm:text-3xl">
              Doug Ford&apos;s Ontario:
              <span className="block text-white sm:mt-1">What&apos;s being sold off?</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-snug text-white/90 sm:text-base">
              Cuts, privatization, and weakened accountability — the pattern is in the public record.
              Protect Ontario makes it visible so neighbours can talk about what&apos;s actually happening.
            </p>
          </header>

          {/* Red accent stripe */}
          <div className="h-1.5 bg-[#9f1239]" aria-hidden />

          {/* Issue grid */}
          <div className="grid gap-0 sm:grid-cols-2">
            {ISSUES.map((block, i) => (
              <section
                key={block.title}
                className={`px-6 py-4 sm:px-7 sm:py-5 ${i % 2 === 0 ? 'sm:border-r border-slate-200' : ''} ${i < 2 ? 'border-b border-slate-200' : ''}`}
              >
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#3d2b7a]">{block.title}</h2>
                <ul className="mt-2 space-y-1.5">
                  {block.bullets.map((bullet) => (
                    <li
                      key={bullet.slice(0, 40)}
                      className="flex gap-2 text-[0.8rem] leading-snug text-slate-800 sm:text-[0.85rem]"
                    >
                      <span className="mt-[0.35rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#9f1239]" aria-hidden />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {/* Accountability callout */}
          <section className="border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-8 sm:py-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#2E4A6B]">The bigger picture</h2>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-slate-700">
              Public money is shifting toward private, for-profit delivery — in healthcare, water, land, and
              environmental rules. The details are buried in spreadsheets and legalese.{' '}
              <strong className="font-semibold text-slate-900">ProtectOnt.ca</strong> uses only public sources to
              show the pattern so you can hold power to account.
            </p>
          </section>

          {/* CTA footer */}
          <footer
            className="px-6 py-5 sm:px-8 sm:py-6"
            style={{ background: 'linear-gradient(168deg, #5c4899 0%, #3d2b7a 50%, #2a1f58 100%)' }}
          >
            <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-[#f9e04c]">
              Take the next step
            </p>
            <div className="mt-3 grid gap-3 text-center sm:grid-cols-3 sm:gap-4">
              <div className="rounded-lg border border-[#f9e04c]/30 bg-white/10 px-3 py-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#f9e04c]/80">Learn</p>
                <p className="mt-1 text-sm font-bold text-white">protectont.ca</p>
              </div>
              <div className="rounded-lg border border-[#f9e04c]/30 bg-white/10 px-3 py-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#f9e04c]/80">Join</p>
                <p className="mt-1 text-sm font-bold text-white">protectont.ca/join</p>
              </div>
              <div className="rounded-lg border border-[#f9e04c]/30 bg-white/10 px-3 py-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#f9e04c]/80">Protest</p>
                <p className="mt-1 text-sm font-bold text-white">protectont.ca/protests</p>
              </div>
            </div>
            <p className="mt-4 text-center text-[0.65rem] leading-relaxed text-white/60">
              Sources: Ontario Public Accounts, Auditor General reports, legislation, and documented journalism.
              See protectont.ca/methodology · Post freely · Print for community boards &amp; doorsteps
            </p>
          </footer>
        </article>

        <p className="flyer-no-print mx-auto mt-6 max-w-[8.5in] text-center text-xs text-[#f9e04c]/60 font-light">
          Tip: In the print dialog, choose &quot;Save as PDF&quot; or print on letter paper (8.5″×11″).
        </p>
      </div>
    </>
  )
}
