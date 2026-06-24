import type { Flyer } from '@/lib/flyers'
import { headerGradient, resolveFlyerTheme, type FlyerTheme } from '@/lib/flyer-theme'

/** Printable flyer width at 96dpi (8.5″). */
export const FLYER_SHEET_WIDTH_PX = 816

type FlyerSheetHeaderProps = {
  flyer: Flyer
  theme?: FlyerTheme
}

export default function FlyerSheetHeader({ flyer, theme: themeProp }: FlyerSheetHeaderProps) {
  const theme = themeProp ?? resolveFlyerTheme(flyer.theme)

  return (
    <>
      <header
        className="flyer-sheet-header px-8 pt-8 pb-7 sm:px-10 sm:pt-10 sm:pb-8"
        style={{ background: headerGradient(theme) }}
      >
        <div className="flex items-center gap-3" aria-hidden>
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
    </>
  )
}
