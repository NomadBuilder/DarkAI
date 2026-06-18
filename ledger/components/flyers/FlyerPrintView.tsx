'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import type { Flyer, FlyerShared } from '@/lib/flyers'
import { footerGradient, headerGradient, resolveFlyerTheme } from '@/lib/flyer-theme'
import { bindFlyerPrintTitleCleanup, printFlyerSheet } from '@/lib/print-flyer'

const FLYER_QR_IMAGE = '/flyers/protectont-qr.png'
const FLYER_QR_URL = 'https://protectont.ca/'

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
  const theme = resolveFlyerTheme(flyer.theme)
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
          className="flyer-sheet mx-auto w-full max-w-[8.5in] min-h-[11in] overflow-hidden rounded-md border-2 border-transparent shadow-2xl print:border-[#1a1a1a] print:shadow-none"
          style={{ background: theme.bodyBackground }}
          aria-label={`Protect Ontario printable flyer: ${flyer.title} ${flyer.subtitle}`}
        >
          {/* Header — poster scale */}
          <header
            className="flyer-sheet-header px-8 pt-8 pb-7 sm:px-10 sm:pt-10 sm:pb-8"
            style={{ background: headerGradient(theme) }}
          >
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

            <div className={flyer.heroImageUrl ? 'mt-6 flex flex-col gap-6 lg:flex-row lg:items-start' : 'mt-6'}>
              <div className="min-w-0 flex-1">
                <h1
                  className="flyer-headline text-[2rem] sm:text-[2.75rem] font-black leading-[1.05] tracking-tight uppercase"
                  style={{ color: theme.headlineColor }}
                >
                  {flyer.title}
                </h1>
                {flyer.subtitle && (
                  <p
                    className="flyer-subhead mt-2 text-[1.5rem] sm:text-[2rem] font-bold leading-tight uppercase tracking-tight"
                    style={{ color: theme.subtitleColor }}
                  >
                    {flyer.subtitle}
                  </p>
                )}
                {flyer.intro && (
                  <p
                    className="flyer-body-text mt-5 text-base sm:text-lg leading-relaxed font-medium"
                    style={{ color: theme.introColor }}
                  >
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
                    className="w-full rounded-lg border-2 object-contain bg-black/20"
                    style={{ borderColor: `${theme.highlightColor}66` }}
                  />
                </div>
              )}
            </div>

            {flyer.highlights.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
                {flyer.highlights.map((h) => (
                  <span
                    key={h}
                    className="rounded-md px-3 py-2 text-xs sm:text-sm font-bold uppercase tracking-wide"
                    style={{ background: theme.highlightColor, color: theme.highlightTagTextColor }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="h-2" style={{ background: theme.accentColor }} aria-hidden />

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
                    <h2
                      className="flyer-section-title text-lg sm:text-xl font-black uppercase tracking-wide pb-2 inline-block border-b-2"
                      style={{ color: theme.sectionTitleColor, borderColor: theme.accentColor }}
                    >
                      {block.title}
                    </h2>
                  )}
                  {block.lead && (
                    <p
                      className="flyer-body-text mt-3 text-base sm:text-[17px] leading-relaxed font-medium opacity-80"
                      style={{ color: theme.bodyTextColor }}
                    >
                      {block.lead}
                    </p>
                  )}
                  <ul className={`${block.title || block.lead ? 'mt-4' : ''} space-y-3`}>
                    {block.bullets.map((bullet) => (
                      <li
                        key={bullet.slice(0, 56)}
                        className="flyer-body-text flex gap-3 text-[15px] sm:text-base leading-snug"
                        style={{ color: theme.bodyTextColor }}
                      >
                        <span
                          className="mt-2 h-2.5 w-2.5 shrink-0 rounded-sm"
                          style={{ background: theme.accentColor }}
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
            <section
              className="border-t-4 px-8 py-6 sm:px-10 sm:py-8"
              style={{ borderColor: theme.primaryColor, background: theme.calloutBackground }}
            >
              {flyer.calloutTitle && (
                <h2
                  className="text-lg sm:text-xl font-black uppercase tracking-wide"
                  style={{ color: theme.calloutTitleColor }}
                >
                  {flyer.calloutTitle}
                </h2>
              )}
              {flyer.calloutBody && (
                <p
                  className={`flyer-body-text text-base sm:text-lg leading-relaxed font-medium opacity-90 ${
                    flyer.calloutTitle ? 'mt-3' : ''
                  } ${calloutActions.length > 0 ? 'mb-1' : ''}`}
                  style={{ color: theme.bodyTextColor }}
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
                      className="rounded-lg border-2 bg-white px-4 py-3 text-center sm:text-left"
                      style={{ borderColor: `${theme.primaryColor}33` }}
                    >
                      <p
                        className="text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: theme.accentColor }}
                      >
                        {action.label}
                      </p>
                      <p
                        className="mt-1 text-sm sm:text-base font-bold"
                        style={{ color: theme.primaryColor }}
                      >
                        {action.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <footer
            className="flyer-sheet-footer px-8 py-7 sm:px-10 sm:py-9"
            style={{ background: footerGradient(theme) }}
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <div className="min-w-0 flex-1">
                <p
                  className="text-center sm:text-left text-sm sm:text-base font-black uppercase tracking-[0.2em]"
                  style={{ color: theme.footerHeadingColor }}
                >
                  {shared.footerHeading}
                </p>
                <div
                  className={`mt-5 grid gap-4 text-center sm:text-left ${
                    shared.ctas.length >= 3 ? 'sm:grid-cols-3' : shared.ctas.length === 2 ? 'sm:grid-cols-2' : ''
                  }`}
                >
                  {shared.ctas.map((cta) => (
                    <div
                      key={cta.label}
                      className="rounded-lg border-2 bg-white/10 px-4 py-4"
                      style={{ borderColor: `${theme.footerHeadingColor}66` }}
                    >
                      <p
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: theme.footerHeadingColor }}
                      >
                        {cta.label}
                      </p>
                      <p
                        className="mt-1.5 text-base sm:text-lg font-black"
                        style={{ color: theme.footerCtaTextColor }}
                      >
                        {cta.text}
                      </p>
                    </div>
                  ))}
                </div>
                {shared.footerFinePrint && (
                  <p
                    className="mt-5 text-center sm:text-left text-[11px] sm:text-xs leading-relaxed opacity-70"
                    style={{ color: theme.footerCtaTextColor }}
                  >
                    {shared.footerFinePrint}
                  </p>
                )}
              </div>

              <a
                href={FLYER_QR_URL}
                className="flyer-qr-block mx-auto shrink-0 flex flex-col items-center text-center sm:mx-0 sm:pt-1"
                aria-label="Visit protectont.ca — scan QR code or open link"
              >
                <div
                  className="rounded-xl border-2 bg-white p-2 shadow-md"
                  style={{ borderColor: `${theme.footerHeadingColor}88` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={FLYER_QR_IMAGE}
                    alt=""
                    width={96}
                    height={96}
                    className="h-[4.5rem] w-[4.5rem] sm:h-24 sm:w-24 object-contain"
                  />
                </div>
                <p
                  className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em]"
                  style={{ color: theme.footerHeadingColor }}
                >
                  Scan for more
                </p>
                <p className="mt-0.5 text-sm sm:text-base font-black" style={{ color: theme.footerCtaTextColor }}>
                  protectont.ca
                </p>
              </a>
            </div>
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
