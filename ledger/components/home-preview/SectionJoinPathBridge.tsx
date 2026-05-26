'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FF_COLORS } from '@/lib/ff-get-involved'
import { JOIN_PATHS } from './join-paths'
import JoinPurpleBackdrop from './JoinPurpleBackdrop'

/**
 * Bridges homepage → /join: same paths as /join, purple above-the-fold (full) or light (compact).
 */
export default function SectionJoinPathBridge({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const isCompact = variant === 'compact'
  const onPurple = !isCompact

  return (
    <section
      id="get-involved-paths"
      className={`relative overflow-hidden scroll-mt-20 ${
        isCompact
          ? 'border-t border-slate-100 px-4 py-10 sm:px-6 sm:py-12'
          : 'border-b border-[#f9e04c]/10 px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20'
      }`}
    >
      {onPurple ? (
        <JoinPurpleBackdrop fadeToWhite />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" aria-hidden />
      )}

      <div className={`relative z-10 mx-auto ${isCompact ? 'max-w-4xl' : 'max-w-5xl'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          {!isCompact && (
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f9e04c]/25 bg-[#f9e04c]/10 px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#f9e04c] sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff9a3c]" aria-hidden />
              Grassroots · Ontario
            </p>
          )}
          <h2
            className={`text-2xl font-light sm:text-3xl md:text-4xl ${
              onPurple ? 'text-[#f9e04c]' : 'text-gray-900'
            }`}
          >
            What are you here for?
          </h2>
          <p
            className={`mx-auto mt-3 max-w-2xl text-base font-light leading-relaxed sm:text-lg ${
              onPurple ? 'text-[#f9e04c]/85' : 'text-gray-600'
            }`}
          >
            The same options as our{' '}
            <Link
              href="/join"
              className={
                onPurple
                  ? 'font-medium underline underline-offset-2'
                  : 'font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700'
              }
              style={onPurple ? { color: FF_COLORS.link } : undefined}
            >
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
              className={`group flex flex-col rounded-xl border p-4 text-left transition-all sm:rounded-2xl sm:p-5 ${
                onPurple
                  ? 'border-[#f9e04c]/20 bg-white/[0.08] shadow-lg backdrop-blur-sm hover:border-[#f9e04c]/40 hover:bg-white/[0.12]'
                  : 'border-slate-200 bg-white shadow-sm hover:border-violet-200 hover:shadow-md'
              }`}
            >
              <span
                className={`text-base font-medium sm:text-lg ${
                  onPurple ? 'text-[#f9e04c]' : 'text-gray-900'
                }`}
              >
                {item.label}
              </span>
              <span
                className={`mt-1 flex-1 text-sm font-light leading-snug ${
                  onPurple ? 'text-[#f9e04c]/70' : 'text-gray-600'
                }`}
              >
                {item.subtitle}
              </span>
              <span
                className="mt-3 text-xs font-bold uppercase tracking-wider"
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
              className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl px-8 py-3.5 text-sm font-bold uppercase tracking-[0.06em] shadow-[0_8px_24px_-8px_rgba(249,224,76,0.5)] transition-all hover:scale-[1.02] sm:w-auto"
              style={{ backgroundColor: FF_COLORS.headingBg, color: FF_COLORS.headingText }}
            >
              Open sign-up form
            </Link>
            <Link
              href="/join"
              className="text-sm font-medium text-[#f9e04c]/90 underline underline-offset-2 transition-colors hover:text-[#f9e04c]"
            >
              View full get involved page →
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
