'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

/** After the data story — CTA toward /join */
export default function SectionJoinCtaBridge() {
  return (
    <section className="border-t border-slate-100 bg-gradient-to-b from-slate-900 to-slate-800 px-4 py-12 text-center sm:px-6 sm:py-14 md:px-8">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="text-xl font-light text-white sm:text-2xl md:text-3xl"
      >
        You&apos;ve seen the pattern. Help push back.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row"
      >
        <Link
          href="/join"
          className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-lg bg-white px-8 py-3.5 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-gray-100 sm:w-auto"
        >
          Join us
        </Link>
        <Link
          href="/protests"
          className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-lg border-2 border-white/40 px-8 py-3.5 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10 sm:w-auto"
        >
          Find a protest
        </Link>
        <Link
          href="/take-action"
          className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-lg border-2 border-white/40 px-8 py-3.5 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10 sm:w-auto"
        >
          Contact your MPP
        </Link>
      </motion.div>
    </section>
  )
}
