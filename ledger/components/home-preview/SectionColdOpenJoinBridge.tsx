'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FF_COLORS } from '@/lib/ff-get-involved'
import JoinPurpleBackdrop from './JoinPurpleBackdrop'

/** Homepage cold open — join purple above the fold, original copy */
export default function SectionColdOpenJoinBridge() {
  return (
    <section
      id="hero"
      className="relative flex w-full items-start justify-center overflow-x-hidden px-4 py-12 pb-16 scroll-mt-16 sm:scroll-mt-20 sm:px-6 md:min-h-[85vh] md:items-center md:px-8 md:py-16 md:pb-20"
    >
      <JoinPurpleBackdrop fadeToWhite />
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
            className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl px-8 py-3.5 text-sm font-bold uppercase tracking-[0.06em] shadow-[0_8px_24px_-8px_rgba(249,224,76,0.5)] transition-all hover:scale-[1.02] sm:w-auto"
            style={{ backgroundColor: FF_COLORS.headingBg, color: FF_COLORS.headingText }}
          >
            Get involved
          </Link>
          <a
            href="#timeline"
            className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl border-2 border-[#f9e04c]/45 bg-white/10 px-8 py-3.5 text-sm font-semibold text-[#f9e04c] backdrop-blur-sm transition-colors hover:border-[#f9e04c]/70 hover:bg-white/15 sm:w-auto"
          >
            See what changed
          </a>
        </motion.div>
      </div>
    </section>
  )
}
