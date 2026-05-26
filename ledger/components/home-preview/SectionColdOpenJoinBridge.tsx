'use client'

import { motion } from 'framer-motion'
import { FF_PAGE_GRADIENT } from '@/lib/ff-get-involved'
import FfJoinLink from './FfJoinLink'

export default function SectionColdOpenJoinBridge() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-32 md:px-8 md:pb-20 scroll-mt-16 sm:scroll-mt-20"
      style={{ background: FF_PAGE_GRADIENT }}
    >
      {/* Ambient orbs — same language as /join */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, transparent 28%, rgba(0,0,0,0.12) 100%)',
          }}
        />
        <div
          className="absolute -top-32 right-[-8%] h-[28rem] w-[28rem] rounded-full opacity-50 blur-3xl sm:h-[34rem] sm:w-[34rem]"
          style={{ background: 'radial-gradient(circle, #f5b87a 0%, transparent 65%)' }}
        />
        <div
          className="absolute top-[12%] left-[-12%] h-80 w-80 rounded-full opacity-35 blur-3xl"
          style={{ background: 'radial-gradient(circle, #e07830 0%, transparent 68%)' }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-96 w-[120%] -translate-x-1/2 opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(ellipse at center, #f9e04c 0%, transparent 55%)' }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f9e04c]/25 bg-[#f9e04c]/10 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#f9e04c] sm:text-xs"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff9a3c]" aria-hidden />
          Grassroots · Ontario
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-[2rem] font-bold leading-[1.12] tracking-tight text-[#f9e04c] sm:text-4xl md:text-5xl lg:text-6xl"
          style={{ textShadow: '0 4px 32px rgba(0,0,0,0.35)' }}
        >
          Protecting Ontario means investing
          <br className="hidden sm:block" />
          <span className="font-semibold"> in what we hold in common.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 max-w-2xl space-y-4 text-[#f9e04c]/90 sm:mt-10"
        >
          <p className="text-lg font-medium leading-relaxed text-[#f9e04c] sm:text-xl">
            Land and water. Healthcare, schools, and services. Accountability.
          </p>
          <p className="text-base italic leading-relaxed text-[#f9e04c]/80 sm:text-lg">
            This is how it&apos;s supposed to work — then the cuts and sell-offs accelerated.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:mt-12 sm:flex-row sm:gap-5"
        >
          <FfJoinLink href="/join">Get involved</FfJoinLink>
          <a
            href="#timeline"
            className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl border border-[#f9e04c]/35 bg-white/10 px-8 py-3.5 text-sm font-semibold text-[#f9e04c] transition-colors hover:border-[#f9e04c]/55 hover:bg-white/15 sm:w-auto"
          >
            See what changed
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="mt-8 text-sm text-[#f9e04c]/65 sm:mt-10"
        >
          Explore the data below — signs, volunteering, and pickup hubs are on{' '}
          <a href="/join" className="font-semibold underline decoration-2 underline-offset-2" style={{ color: '#ff9a3c' }}>
            Get involved
          </a>
          .
        </motion.p>
      </div>

      {/* Bridge into the light data sections */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 sm:h-40"
        aria-hidden
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, #f8fafc 85%, #f8fafc 100%)',
        }}
      />
    </section>
  )
}
