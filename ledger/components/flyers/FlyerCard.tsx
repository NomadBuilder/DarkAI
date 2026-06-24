'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Flyer } from '@/lib/flyers'
import { toFlyerDisplayCase } from '@/lib/flyer-display'
import FlyerCardPreview from '@/components/flyers/FlyerCardPreview'

type Props = {
  flyer: Flyer
  index?: number
  featured?: boolean
}

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45 },
}

export default function FlyerCard({ flyer, index = 0, featured = false }: Props) {
  const title = toFlyerDisplayCase(flyer.title)
  const subtitle = toFlyerDisplayCase(flyer.subtitle)
  const sectionCount = flyer.sections.length
  const topics = flyer.sections.slice(0, 3).map((s) => s.title)

  return (
    <motion.div {...fade} transition={{ duration: 0.45, delay: index * 0.05 }}>
      <Link
        href={`/flyer/${flyer.slug}`}
        className={`group block h-full overflow-hidden rounded-2xl border bg-white transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9f1239] ${
          featured
            ? 'border-[#2E4A6B]/25 shadow-md shadow-slate-900/5 hover:border-[#2E4A6B]/40 hover:shadow-lg'
            : 'border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'
        }`}
      >
        <FlyerCardPreview flyer={flyer} featured={featured} />

        <article className={`flex flex-col flex-grow ${featured ? 'p-5 sm:p-6' : 'p-4 sm:p-5'}`}>
          <div className="mb-3 min-w-0">
            <h3
              className={`font-light text-slate-900 group-hover:text-[#2E4A6B] transition-colors leading-snug ${
                featured ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
              }`}
            >
              {title}
            </h3>
            {subtitle && (
              <p className="mt-0.5 text-sm text-slate-500 font-light leading-snug line-clamp-1">{subtitle}</p>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-light">
              {sectionCount > 0 ? (
                <>
                  {sectionCount} {sectionCount === 1 ? 'section' : 'sections'}
                  {topics.length > 0 && (
                    <span className="hidden sm:inline">
                      {' '}
                      · {topics.join(' · ')}
                      {flyer.sections.length > 3 ? ' · …' : ''}
                    </span>
                  )}
                </>
              ) : (
                'Sources included'
              )}
            </p>
            <span className="text-sm font-medium text-[#2E4A6B] group-hover:underline underline-offset-4">
              Open &amp; print →
            </span>
          </div>
        </article>
      </Link>
    </motion.div>
  )
}

export function FlyerCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white animate-pulse">
      <div
        className={`bg-slate-200 border-b border-slate-100 ${featured ? 'h-[min(280px,42vw)] sm:h-[300px]' : 'h-[min(220px,38vw)] sm:h-[240px]'}`}
      />
      <div className={featured ? 'p-5 sm:p-6' : 'p-4 sm:p-5'}>
        <div className={`bg-slate-200 rounded ${featured ? 'h-7 w-2/3' : 'h-6 w-3/4'} mb-2`} />
        <div className="h-4 w-1/2 bg-slate-100 rounded mb-4" />
        <div className="h-4 w-full bg-slate-100 rounded mt-6" />
      </div>
    </div>
  )
}
