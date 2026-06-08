'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import JoinPurpleBackdrop from './JoinPurpleBackdrop'

/** Homepage cold open — join purple above the fold, original copy */
export default function SectionColdOpenJoinBridge() {
  return (
    <section
      id="hero"
      className="relative flex w-full items-start justify-center overflow-x-hidden px-4 pb-16 pt-28 scroll-mt-16 sm:scroll-mt-20 sm:px-6 sm:pb-20 sm:pt-32 md:min-h-[85vh] md:items-center md:px-8 md:py-16 md:pb-20 lg:pt-20"
    >
      <JoinPurpleBackdrop />
      <div className="relative z-10 w-full max-w-5xl space-y-8 text-center md:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            className="text-3xl font-light leading-tight tracking-tight text-[#f9e04c] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.25)' }}
          >
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
          <p className="text-2xl font-light leading-relaxed text-[#f9e04c]/90 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
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
          <p className="text-xl font-light italic text-[#f9e04c]/75 sm:text-2xl md:text-3xl lg:text-4xl">
            This is how it&apos;s supposed to work.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
          className="pt-8 md:pt-12"
        >
          <p className="text-2xl font-light text-white sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
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
            className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-lg bg-[#f9e04c] px-8 py-3.5 text-sm font-semibold text-[#1a1a1a] shadow-md transition-colors hover:bg-[#f5d84a] sm:w-auto"
          >
            Join us
          </Link>
          <a
            href="#timeline"
            className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-lg border-2 border-white bg-transparent px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/15 sm:w-auto"
          >
            See what changed
          </a>
        </motion.div>
      </div>
    </section>
  )
}
