'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import type { Flyer } from '@/lib/flyers'
import { resolveFlyerTheme } from '@/lib/flyer-theme'
import FlyerSheetHeader, { FLYER_SHEET_WIDTH_PX } from '@/components/flyers/FlyerSheetHeader'

type Props = {
  flyer: Flyer
  featured?: boolean
}

/** First section block peeking below the header (when present). */
function FlyerPreviewBodyPeek({ flyer }: { flyer: Flyer }) {
  const block = flyer.sections[0]
  if (!block) return null

  const theme = resolveFlyerTheme(flyer.theme)

  return (
    <section className="px-8 py-5 sm:px-10 sm:py-6 bg-white">
      {block.title && (
        <h2
          className="text-lg sm:text-xl font-black uppercase tracking-wide pb-2 inline-block border-b-2"
          style={{ color: theme.sectionTitleColor, borderColor: theme.accentColor }}
        >
          {block.title}
        </h2>
      )}
      {block.lead && (
        <p
          className="mt-3 text-base sm:text-[17px] leading-relaxed font-medium opacity-80 line-clamp-2"
          style={{ color: theme.bodyTextColor }}
        >
          {block.lead}
        </p>
      )}
    </section>
  )
}

export default function FlyerCardPreview({ flyer, featured = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.42)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const width = el.clientWidth
      if (width > 0) setScale(width / FLYER_SHEET_WIDTH_PX)
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const theme = resolveFlyerTheme(flyer.theme)

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-white border-b border-slate-100 ${
        featured ? 'h-[min(280px,42vw)] sm:h-[300px]' : 'h-[min(220px,38vw)] sm:h-[240px]'
      }`}
      aria-hidden
    >
      <div
        className="absolute top-0 left-0 shadow-sm"
        style={{
          width: FLYER_SHEET_WIDTH_PX,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div style={{ background: theme.bodyBackground }}>
          <FlyerSheetHeader flyer={flyer} theme={theme} />
          <FlyerPreviewBodyPeek flyer={flyer} />
        </div>
      </div>
    </div>
  )
}
