'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Flyer } from '@/lib/flyers'

type Props = {
  flyer: Flyer
  index?: number
}

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
}

/** Flyer headlines are stored in caps for print; show readable case on the index. */
function toDisplayCase(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  const letters = trimmed.replace(/[^a-zA-Z]/g, '')
  if (letters && letters === letters.toUpperCase()) {
    return trimmed.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase())
  }
  return trimmed
}

export default function FlyerCard({ flyer, index = 0 }: Props) {
  const headline = [flyer.title, flyer.subtitle]
    .filter(Boolean)
    .map(toDisplayCase)
    .join(' ')

  return (
    <motion.div {...fade} transition={{ duration: 0.5, delay: index * 0.08 }}>
      <Link
        href={`/flyer/${flyer.slug}`}
        className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md shadow-slate-900/5 flex flex-col h-full transition-colors hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9f1239]"
      >
        <article className="p-5 md:p-6 flex flex-col flex-grow">
          <p className="text-xs tracking-wide text-slate-400 mb-2">Letter · 8.5″×11″</p>
          <h3 className="text-2xl font-light text-slate-900 mb-2 group-hover:text-[#2E4A6B] transition-colors">
            {headline}
          </h3>
          {flyer.highlights.length > 0 && (
            <p className="text-sm text-[#2E4A6B] font-medium mb-3 line-clamp-2">
              {flyer.highlights.slice(0, 2).join(' · ')}
            </p>
          )}
          {flyer.intro && (
            <p className="text-sm text-slate-600 font-light leading-relaxed mb-4 line-clamp-3">{flyer.intro}</p>
          )}
          <span className="mt-auto inline-flex justify-center rounded-xl bg-gradient-to-r from-[#9f1239] to-[#7f1230] px-5 py-3 text-sm font-medium text-white shadow-md group-hover:opacity-95 transition-opacity">
            Open &amp; print
          </span>
        </article>
      </Link>
    </motion.div>
  )
}
