'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FF_COLORS } from '@/lib/ff-get-involved'
import { JOIN_PATHS } from './join-paths'

/**
 * Bridges homepage → /join: same “what are you here for?” paths, site slate/white styling.
 */
export default function SectionJoinPathBridge({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const isCompact = variant === 'compact'

  return (
    <section
      id="get-involved-paths"
      className={`relative overflow-hidden border-b border-slate-100 scroll-mt-20 ${
        isCompact ? 'px-4 py-10 sm:px-6 sm:py-12' : 'px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20'
      }`}
    >
      {/* Soft violet wash — echoes /join without full campaign gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-violet-50/90 via-slate-50 to-white"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(92, 72, 153, 0.12) 0%, transparent 70%)',
        }}
      />

      <div className={`relative z-10 mx-auto ${isCompact ? 'max-w-4xl' : 'max-w-5xl'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-4 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-violet-800 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: FF_COLORS.link }} aria-hidden />
            Grassroots · Ontario
          </p>
          <h2 className="text-2xl font-light text-gray-900 sm:text-3xl md:text-4xl">
            What are you here for?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base font-light leading-relaxed text-gray-600 sm:text-lg">
            The same options as our{' '}
            <Link href="/join" className="font-medium underline underline-offset-2" style={{ color: FF_COLORS.link }}>
              get involved
            </Link>{' '}
            page — signs, pickup hubs, volunteering, and more.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={`mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 ${
            isCompact ? 'lg:grid-cols-3' : 'lg:grid-cols-5'
          }`}
        >
          {JOIN_PATHS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white/90 p-4 text-left shadow-sm transition-all hover:border-violet-200 hover:shadow-md sm:p-5"
            >
              <span className="text-base font-medium text-gray-900 sm:text-lg">{item.label}</span>
              <span className="mt-1 flex-1 text-sm font-light leading-snug text-gray-600">{item.subtitle}</span>
              <span
                className="mt-3 text-xs font-medium uppercase tracking-wide"
                style={{ color: FF_COLORS.link }}
              >
                On get involved →
              </span>
            </Link>
          ))}
        </motion.div>

        {!isCompact && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              href="/join#signup-form"
              className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-lg bg-[#2E4A6B] px-8 py-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#243d56] sm:w-auto"
            >
              Open sign-up form
            </Link>
            <Link
              href="/join"
              className="text-sm font-light text-gray-600 hover:text-gray-900"
            >
              View full get involved page →
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
