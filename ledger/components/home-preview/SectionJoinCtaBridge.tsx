'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

/** Light closing CTA — site gradients, links to /join without mirroring join-page layout */
export default function SectionJoinCtaBridge() {
  return (
    <section className="relative overflow-hidden border-t border-slate-100 px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <h2 className="text-2xl font-light text-gray-900 sm:text-3xl md:text-4xl">
          Help grow the movement
        </h2>
        <p className="mt-4 text-base font-light leading-relaxed text-gray-600 sm:text-lg">
          Request a sign, volunteer, host a pickup hub, or donate on our get involved page.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/join"
            className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-lg bg-[#2E4A6B] px-8 py-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#243d56] sm:w-auto"
          >
            Get involved
          </Link>
          <Link
            href="/take-action"
            className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-lg border-2 border-[#2E4A6B] px-8 py-3.5 text-sm font-medium text-[#2E4A6B] transition-colors hover:bg-[#2E4A6B] hover:text-white sm:w-auto"
          >
            More ways to take action
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
