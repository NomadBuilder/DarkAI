'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Flyer } from '@/lib/flyers'
import { toFlyerDisplayCase } from '@/lib/flyer-display'

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
        className={`group block h-full rounded-2xl border bg-white transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9f1239] ${
          featured
            ? 'border-[#2E4A6B]/25 shadow-md shadow-slate-900/5 hover:border-[#2E4A6B]/40 hover:shadow-lg'
            : 'border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'
        }`}
      >
        <article className={`flex flex-col h-full ${featured ? 'p-6 sm:p-8' : 'p-5 sm:p-6'}`}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-w-0 flex-1">
              {featured && (
                <p className="text-xs font-medium text-[#9f1239] mb-2">Start here — overview flyer</p>
              )}
              <h3
                className={`font-light text-slate-900 group-hover:text-[#2E4A6B] transition-colors leading-snug ${
                  featured ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                }`}
              >
                {title}
              </h3>
              {subtitle && (
                <p className={`mt-1 text-slate-500 font-light leading-snug ${featured ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
                  {subtitle}
                </p>
              )}
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
              8.5″×11″
            </span>
          </div>

          {featured && flyer.intro && (
            <p className="text-sm sm:text-base text-slate-600 font-light leading-relaxed line-clamp-3 mb-4">
              {flyer.intro}
            </p>
          )}

          {!featured && flyer.highlights.length > 0 && (
            <ul className="flex flex-wrap gap-2 mb-4">
              {flyer.highlights.slice(0, 3).map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 font-light"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}

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
    <div
      className={`rounded-2xl border border-slate-200 bg-white animate-pulse ${
        featured ? 'p-6 sm:p-8' : 'p-5 sm:p-6'
      }`}
    >
      <div className={`bg-slate-200 rounded ${featured ? 'h-8 w-2/3 mb-3' : 'h-6 w-3/4 mb-2'}`} />
      <div className="h-4 w-1/2 bg-slate-100 rounded mb-4" />
      {featured && <div className="h-16 w-full bg-slate-100 rounded mb-4" />}
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
        <div className="h-6 w-24 bg-slate-100 rounded-full" />
      </div>
      <div className="h-4 w-full bg-slate-100 rounded mt-6" />
    </div>
  )
}
