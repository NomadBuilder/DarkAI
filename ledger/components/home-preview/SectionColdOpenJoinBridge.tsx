'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

/** Homepage cold open — same look as /, with clear path to /join */
export default function SectionColdOpenJoinBridge() {
  return (
    <section
      id="hero"
      className="relative flex w-full items-start justify-center overflow-x-hidden px-4 py-12 pb-12 scroll-mt-16 sm:scroll-mt-20 sm:px-6 md:min-h-[85vh] md:items-center md:px-8 md:py-16 md:pb-14"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" aria-hidden />
      <div className="relative w-full max-w-5xl space-y-8 text-center md:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-3xl font-light leading-tight tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl">
            Protecting Ontario means investing
            <br className="hidden sm:block" />
            <span className="sm:inline"> </span>
            <span className="font-normal">in what we hold in common.</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-2xl font-light leading-relaxed text-gray-600 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            Land and water.
            <br />
            Healthcare, schools, and services.
            <br />
            Accountability.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xl font-light italic text-gray-500 sm:text-2xl md:text-3xl lg:text-4xl">
            This is how it&apos;s supposed to work.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
          className="pt-8 md:pt-12"
        >
          <p className="text-2xl font-light text-red-600 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            Then the cuts and sell-offs accelerated.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.05, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row sm:gap-5 md:pt-4"
        >
          <Link
            href="/join"
            className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-lg bg-[#2E4A6B] px-8 py-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#243d56] sm:w-auto"
          >
            Get involved
          </Link>
          <a
            href="#timeline"
            className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-lg border-2 border-[#2E4A6B] px-8 py-3.5 text-sm font-medium text-[#2E4A6B] transition-colors hover:bg-[#2E4A6B] hover:text-white sm:w-auto"
          >
            See what changed
          </a>
        </motion.div>
      </div>
    </section>
  )
}
