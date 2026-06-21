'use client'

import { useState } from 'react'
import Image from 'next/image'

export type ProductCarouselImage = {
  src: string
  alt: string
}

type Props = {
  images: ProductCarouselImage[]
}

export default function ProductImageCarousel({ images }: Props) {
  const [active, setActive] = useState(0)
  const count = images.length
  const current = images[active] ?? images[0]
  const hasMultiple = count > 1

  if (!current) return null

  const goPrev = () => setActive((i) => (i - 1 + count) % count)
  const goNext = () => setActive((i) => (i + 1) % count)

  return (
    <div className="space-y-3">
      <div className="group relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md shadow-slate-900/5">
        <div className="relative aspect-square bg-slate-50">
          <Image
            key={current.src}
            src={current.src}
            alt={current.alt}
            fill
            className="object-contain p-3 sm:p-4"
            sizes="(max-width: 1024px) 100vw, 480px"
            priority={active === 0}
          />
        </div>

        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/95 border border-slate-200 p-2 text-slate-700 shadow-sm opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 hover:bg-white"
              aria-label="Previous photo"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/95 border border-slate-200 p-2 text-slate-700 shadow-sm opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 hover:bg-white"
              aria-label="Next photo"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <p className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white tabular-nums">
              {active + 1} / {count}
            </p>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product photos">
          {images.map((img, index) => {
            const selected = index === active
            return (
              <button
                key={img.src}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`Photo ${index + 1}`}
                onClick={() => setActive(index)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors ${
                  selected ? 'border-[#2E4A6B]' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Image src={img.src} alt="" fill className="object-contain p-1" sizes="64px" />
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
