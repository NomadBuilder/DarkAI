'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import type { Flyer, FlyerShared } from '@/lib/flyers'
import FlyerSheetHeader from '@/components/flyers/FlyerSheetHeader'
import FlyerShareActions from '@/components/flyers/FlyerShareActions'
import { footerGradient, resolveFlyerTheme } from '@/lib/flyer-theme'
import { bindFlyerPrintTitleCleanup } from '@/lib/print-flyer'

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

  const theme = resolveFlyerTheme(flyer.theme)
  const useGridLayout = flyer.slug === 'overview'
  const calloutActions = flyer.calloutActions?.filter((a) => a.label || a.text) ?? []
  const printDensityClass =
    flyer.sections.length >= 4
      ? 'flyer-print-dense'
      : flyer.sections.length >= 3
        ? 'flyer-print-compact'
        : ''

  return (
      <div className="flyer-print-chrome min-h-screen bg-gradient-to-b from-[#3d2b7a] to-[#2a1f58] py-6 px-3 sm:py-10 sm:px-6">
        {showToolbar && (
          <div className="flyer-no-print mx-auto mb-6 w-full max-w-[8.5in] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href={backHref}
                className="text-sm font-light text-[#f9e04c]/90 hover:text-[#f9e04c] transition-colors"
              >
                ← All flyers
              </Link>
              <span className="text-xs uppercase tracking-widest text-[#f9e04c]/50">
                Letter · 8.5″×11″
              </span>
            </div>
            <FlyerShareActions slug={flyer.slug} />
          </div>
        )}

        <div className="flyer-print-page mx-auto w-full max-w-[8.5in]">
        <article
          className={`flyer-sheet mx-auto w-full max-w-[8.5in] overflow-hidden rounded-md border-2 border-transparent shadow-2xl print:flex print:flex-col print:h-[11in] print:max-h-[11in] print:min-h-0 print:border-[#1a1a1a] print:shadow-none ${printDensityClass}`}
          style={{ background: theme.bodyBackground }}
          aria-label={`Protect Ontario printable flyer: ${flyer.title} ${flyer.subtitle}`}
        >
          <FlyerSheetHeader flyer={flyer} theme={theme} />

          {/* Body sections */}
          {flyer.sections.length > 0 && (
            <div
              className={`flyer-sheet-body ${
                useGridLayout ? 'flyer-sheet-body--grid grid gap-0 sm:grid-cols-2' : 'flex flex-col divide-y divide-slate-200'
              }`}
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
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
              <div className="min-w-0 flex-1 sm:max-w-[70%]">
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
        </div>

        {showToolbar && (
          <p className="flyer-no-print mx-auto mt-6 w-full max-w-[8.5in] text-center text-sm text-[#f9e04c]/70 font-light leading-relaxed">
            <strong className="font-normal">PDF</strong> downloads a ready-made file. For{' '}
            <strong className="font-normal">Print</strong>, set margins to None, turn off headers and footers, and turn
            on background graphics.
          </p>
        )}
      </div>
  )
}
