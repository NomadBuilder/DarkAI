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

export default function FlyerCard({ flyer, index = 0 }: Props) {
  const headline = [flyer.title, flyer.subtitle].filter(Boolean).join(' ')

  return (
    <motion.article
      {...fade}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md shadow-slate-900/5 flex flex-col"
    >
      <div className="p-5 md:p-6 flex flex-col flex-grow">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Letter · 8.5″×11″</p>
        <h3 className="text-2xl font-light text-slate-900 mb-2">{headline}</h3>
        {flyer.highlights.length > 0 && (
          <p className="text-sm text-[#2E4A6B] font-medium mb-3 line-clamp-2">
            {flyer.highlights.slice(0, 2).join(' · ')}
          </p>
        )}
        {flyer.intro && (
          <p className="text-sm text-slate-600 font-light leading-relaxed mb-4 line-clamp-3">{flyer.intro}</p>
        )}
        <Link
          href={`/flyer/${flyer.slug}`}
          className="mt-auto inline-flex justify-center rounded-xl bg-gradient-to-r from-[#9f1239] to-[#7f1230] px-5 py-3 text-sm font-medium text-white shadow-md hover:opacity-95 transition-opacity"
        >
          Open &amp; print
        </Link>
      </div>
    </motion.article>
  )
}
