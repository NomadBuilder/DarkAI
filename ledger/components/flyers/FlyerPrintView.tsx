'use client'

import Link from 'next/link'
import type { Flyer, FlyerShared } from '@/lib/flyers'

export function FlyerPrintStyles() {
  return (
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
  )
}

type FlyerPrintViewProps = {
  flyer: Flyer
  shared: FlyerShared
  backHref?: string
  showToolbar?: boolean
}

export default function FlyerPrintView({
  flyer,
  shared,
  backHref = '/flyer',
  showToolbar = true,
}: FlyerPrintViewProps) {
  const handlePrint = () => window.print()
  const gridCols = flyer.sections.length === 1 ? 'grid-cols-1' : 'sm:grid-cols-2'

  return (
    <>
      <FlyerPrintStyles />

      <div className="flyer-no-print min-h-screen bg-gradient-to-b from-[#3d2b7a] to-[#2a1f58] py-6 px-4 sm:py-10 sm:px-6">
        {showToolbar && (
          <div className="flyer-no-print mx-auto mb-6 flex max-w-[8.5in] flex-wrap items-center justify-between gap-3">
            <Link
              href={backHref}
              className="text-sm font-light text-[#f9e04c]/90 hover:text-[#f9e04c] transition-colors"
            >
              ← All flyers
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-lg bg-[#f9e04c] px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] shadow-md hover:bg-[#f5d84a] transition-colors"
            >
              Print / Save as PDF
            </button>
          </div>
        )}

        <article
          className="flyer-sheet mx-auto max-w-[8.5in] overflow-hidden rounded-sm bg-white shadow-2xl print:shadow-none"
          aria-label={`Protect Ontario printable flyer: ${flyer.title} ${flyer.subtitle}`}
        >
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
                {shared.headerEyebrow}
              </p>
            </div>

            <div className={flyer.heroImageUrl ? 'mt-5 flex flex-col gap-5 sm:flex-row sm:items-start' : 'mt-5'}>
              <div className="min-w-0 flex-1">
                <h1 className="text-[1.65rem] font-bold leading-[1.12] tracking-tight text-[#f9e04c] sm:text-3xl">
                  {flyer.title}
                  {flyer.subtitle && (
                    <span className="block text-white sm:mt-1">{flyer.subtitle}</span>
                  )}
                </h1>
                {flyer.intro && (
                  <p className="mt-3 max-w-2xl text-sm leading-snug text-white/90 sm:text-base">{flyer.intro}</p>
                )}
              </div>
              {flyer.heroImageUrl && (
                <div className="shrink-0 sm:max-w-[40%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={flyer.heroImageUrl}
                    alt=""
                    className="w-full rounded-lg border border-white/20 object-contain bg-white/10"
                  />
                </div>
              )}
            </div>
          </header>

          <div className="h-1.5 bg-[#9f1239]" aria-hidden />

          {flyer.sections.length > 0 && (
            <div className={`grid gap-0 ${gridCols}`}>
              {flyer.sections.map((block, i) => (
                <section
                  key={`${block.title}-${i}`}
                  className={`px-6 py-4 sm:px-7 sm:py-5 ${
                    flyer.sections.length > 1 && i % 2 === 0 ? 'sm:border-r border-slate-200' : ''
                  } ${flyer.sections.length > 1 && i < 2 ? 'border-b border-slate-200' : ''}`}
                >
                  {block.title && (
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#3d2b7a]">{block.title}</h2>
                  )}
                  <ul className={block.title ? 'mt-2 space-y-1.5' : 'space-y-1.5'}>
                    {block.bullets.map((bullet) => (
                      <li
                        key={bullet.slice(0, 48)}
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
          )}

          {(flyer.calloutTitle || flyer.calloutBody) && (
            <section className="border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-8 sm:py-5">
              {flyer.calloutTitle && (
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#2E4A6B]">{flyer.calloutTitle}</h2>
              )}
              {flyer.calloutBody && (
                <p className="mt-2 text-[0.85rem] leading-relaxed text-slate-700">{flyer.calloutBody}</p>
              )}
            </section>
          )}

          <footer
            className="px-6 py-5 sm:px-8 sm:py-6"
            style={{ background: 'linear-gradient(168deg, #5c4899 0%, #3d2b7a 50%, #2a1f58 100%)' }}
          >
            <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-[#f9e04c]">
              {shared.footerHeading}
            </p>
            <div
              className={`mt-3 grid gap-3 text-center ${
                shared.ctas.length >= 3 ? 'sm:grid-cols-3' : shared.ctas.length === 2 ? 'sm:grid-cols-2' : ''
              } sm:gap-4`}
            >
              {shared.ctas.map((cta) => (
                <div
                  key={cta.label}
                  className="rounded-lg border border-[#f9e04c]/30 bg-white/10 px-3 py-3"
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#f9e04c]/80">
                    {cta.label}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">{cta.text}</p>
                </div>
              ))}
            </div>
            {shared.footerFinePrint && (
              <p className="mt-4 text-center text-[0.65rem] leading-relaxed text-white/60">{shared.footerFinePrint}</p>
            )}
          </footer>
        </article>

        {showToolbar && (
          <p className="flyer-no-print mx-auto mt-6 max-w-[8.5in] text-center text-xs text-[#f9e04c]/60 font-light">
            Tip: In the print dialog, choose &quot;Save as PDF&quot; or print on letter paper (8.5″×11″).
          </p>
        )}
      </div>
    </>
  )
}
