'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import type { Flyer, FlyerShared } from '@/lib/flyers'
import { bindFlyerPrintTitleCleanup, printFlyerSheet } from '@/lib/print-flyer'

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
  useEffect(() => bindFlyerPrintTitleCleanup(), [])

  const handlePrint = () => printFlyerSheet()
  const useGridLayout = flyer.slug === 'overview'
  const calloutActions = flyer.calloutActions?.filter((a) => a.label || a.text) ?? []

  return (
      <div className="flyer-print-chrome min-h-screen bg-gradient-to-b from-[#3d2b7a] to-[#2a1f58] py-6 px-3 sm:py-10 sm:px-6">
        {showToolbar && (
          <div className="flyer-no-print mx-auto mb-6 flex w-full max-w-[8.5in] flex-wrap items-center justify-between gap-3">
            <Link
              href={backHref}
              className="text-sm font-light text-[#f9e04c]/90 hover:text-[#f9e04c] transition-colors"
            >
              ← All flyers
            </Link>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs uppercase tracking-widest text-[#f9e04c]/50">
                Letter · 8.5″×11″
              </span>
              <button
                type="button"
                onClick={handlePrint}
                className="rounded-lg bg-[#f9e04c] px-6 py-3 text-base font-bold text-[#1a1a1a] shadow-md hover:bg-[#f5d84a] transition-colors"
              >
                Print / Save as PDF
              </button>
            </div>
          </div>
        )}

        <article
          className="flyer-sheet mx-auto w-full max-w-[8.5in] min-h-[11in] overflow-hidden rounded-md border-2 border-transparent bg-white shadow-2xl print:border-[#1a1a1a] print:shadow-none"
          aria-label={`Protect Ontario printable flyer: ${flyer.title} ${flyer.subtitle}`}
        >
          {/* Header — poster scale */}
          <header
            className="flyer-sheet-header px-8 pt-8 pb-7 sm:px-10 sm:pt-10 sm:pb-8"
            style={{
              background: 'linear-gradient(135deg, #3d2b7a 0%, #2E4A6B 50%, #1e3a5f 100%)',
            }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3" aria-label="ProtectOnt.ca">
                {/* Shield is pure SVG — logo-icon-text.svg embeds a PNG that inverts to a white block */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/favicon.svg" alt="" className="h-11 w-11 shrink-0 sm:h-12 sm:w-12" />
                <span className="text-xl font-bold tracking-tight sm:text-2xl">
                  <span className="text-[#f9e04c]">Protect</span>
                  <span className="text-[#86efac]">Ont</span>
                  <span className="text-white">.ca</span>
                </span>
              </div>
              <p className="text-right text-xs font-bold uppercase tracking-[0.25em] text-[#f9e04c] sm:text-sm">
                {shared.headerEyebrow}
              </p>
            </div>

            <div className={flyer.heroImageUrl ? 'mt-6 flex flex-col gap-6 lg:flex-row lg:items-start' : 'mt-6'}>
              <div className="min-w-0 flex-1">
                <h1 className="flyer-headline text-[2rem] sm:text-[2.75rem] font-black leading-[1.05] tracking-tight text-[#f9e04c] uppercase">
                  {flyer.title}
                </h1>
                {flyer.subtitle && (
                  <p className="flyer-subhead mt-2 text-[1.5rem] sm:text-[2rem] font-bold leading-tight text-white uppercase tracking-tight">
                    {flyer.subtitle}
                  </p>
                )}
                {flyer.intro && (
                  <p className="flyer-body-text mt-5 text-base sm:text-lg leading-relaxed text-white/95 font-medium">
                    {flyer.intro}
                  </p>
                )}
              </div>
              {flyer.heroImageUrl && (
                <div className="shrink-0 lg:max-w-[42%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={flyer.heroImageUrl}
                    alt=""
                    className="w-full rounded-lg border-2 border-[#f9e04c]/40 object-contain bg-black/20"
                  />
                </div>
              )}
            </div>

            {flyer.highlights.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
                {flyer.highlights.map((h) => (
                  <span
                    key={h}
                    className="rounded-md bg-[#f9e04c] px-3 py-2 text-xs sm:text-sm font-bold uppercase tracking-wide text-[#1a1a1a]"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="h-2 bg-[#9f1239]" aria-hidden />

          {/* Body sections */}
          {flyer.sections.length > 0 && (
            <div
              className={
                useGridLayout
                  ? 'grid gap-0 sm:grid-cols-2'
                  : 'flex flex-col divide-y divide-slate-200'
              }
            >
              {flyer.sections.map((block, i) => (
                <section
                  key={`${block.title}-${i}`}
                  className={`px-8 py-6 sm:px-10 sm:py-7 ${
                    useGridLayout && i % 2 === 0 ? 'sm:border-r border-slate-200' : ''
                  } ${useGridLayout && i < 2 ? 'border-b border-slate-200' : ''}`}
                >
                  {block.title && (
                    <h2 className="flyer-section-title text-lg sm:text-xl font-black uppercase tracking-wide text-[#3d2b7a] border-b-2 border-[#9f1239] pb-2 inline-block">
                      {block.title}
                    </h2>
                  )}
                  {block.lead && (
                    <p className="flyer-body-text mt-3 text-base sm:text-[17px] leading-relaxed text-slate-700 font-medium">
                      {block.lead}
                    </p>
                  )}
                  <ul className={`${block.title || block.lead ? 'mt-4' : ''} space-y-3`}>
                    {block.bullets.map((bullet) => (
                      <li
                        key={bullet.slice(0, 56)}
                        className="flyer-body-text flex gap-3 text-[15px] sm:text-base leading-snug text-slate-900"
                      >
                        <span
                          className="mt-2 h-2.5 w-2.5 shrink-0 rounded-sm bg-[#9f1239]"
                          aria-hidden
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          {(flyer.calloutTitle || flyer.calloutBody || calloutActions.length > 0) && (
            <section className="border-t-4 border-[#3d2b7a] bg-[#f9e04c]/15 px-8 py-6 sm:px-10 sm:py-8">
              {flyer.calloutTitle && (
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide text-[#3d2b7a]">
                  {flyer.calloutTitle}
                </h2>
              )}
              {flyer.calloutBody && (
                <p
                  className={`flyer-body-text text-base sm:text-lg leading-relaxed text-slate-800 font-medium ${
                    flyer.calloutTitle ? 'mt-3' : ''
                  } ${calloutActions.length > 0 ? 'mb-1' : ''}`}
                >
                  {flyer.calloutBody}
                </p>
              )}
              {calloutActions.length > 0 && (
                <div
                  className={`grid gap-3 ${
                    calloutActions.length >= 4
                      ? 'sm:grid-cols-2'
                      : calloutActions.length === 3
                        ? 'sm:grid-cols-3'
                        : calloutActions.length === 2
                          ? 'sm:grid-cols-2'
                          : ''
                  } ${flyer.calloutTitle || flyer.calloutBody ? 'mt-4' : ''}`}
                >
                  {calloutActions.map((action) => (
                    <div
                      key={`${action.label}-${action.text}`}
                      className="rounded-lg border-2 border-[#3d2b7a]/20 bg-white px-4 py-3 text-center sm:text-left"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#9f1239]">
                        {action.label}
                      </p>
                      <p className="mt-1 text-sm sm:text-base font-bold text-[#3d2b7a]">{action.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <footer
            className="flyer-sheet-footer px-8 py-7 sm:px-10 sm:py-9"
            style={{ background: 'linear-gradient(168deg, #5c4899 0%, #3d2b7a 50%, #2a1f58 100%)' }}
          >
            <p className="text-center text-sm sm:text-base font-black uppercase tracking-[0.2em] text-[#f9e04c]">
              {shared.footerHeading}
            </p>
            <div
              className={`mt-5 grid gap-4 text-center ${
                shared.ctas.length >= 3 ? 'sm:grid-cols-3' : shared.ctas.length === 2 ? 'sm:grid-cols-2' : ''
              }`}
            >
              {shared.ctas.map((cta) => (
                <div
                  key={cta.label}
                  className="rounded-lg border-2 border-[#f9e04c]/40 bg-white/10 px-4 py-4"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-[#f9e04c]">{cta.label}</p>
                  <p className="mt-1.5 text-base sm:text-lg font-black text-white">{cta.text}</p>
                </div>
              ))}
            </div>
            {shared.footerFinePrint && (
              <p className="mt-5 text-center text-[11px] sm:text-xs leading-relaxed text-white/70">
                {shared.footerFinePrint}
              </p>
            )}
          </footer>
        </article>

        {showToolbar && (
          <p className="flyer-no-print mx-auto mt-6 w-full max-w-[8.5in] text-center text-sm text-[#f9e04c]/70 font-light leading-relaxed">
            In the print dialog: turn <strong className="font-normal">off</strong> &quot;Headers and footers&quot;,
            turn <strong className="font-normal">on</strong> background graphics, then print or save as PDF. Cut along
            the black border.
          </p>
        )}
      </div>
  )
}
