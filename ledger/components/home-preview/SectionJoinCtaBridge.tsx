'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FF_COLORS, FF_PAGE_GRADIENT } from '@/lib/ff-get-involved'
import FfJoinLink from './FfJoinLink'

const QUICK_LINKS = [
  { label: 'Signs', href: '/join#signs', subtitle: 'Order or download artwork' },
  { label: 'Sign Pickup Hub', href: '/join#pickup-hub', subtitle: 'Host a local pickup point' },
  { label: 'Volunteer', href: '/join#volunteer', subtitle: 'Deliveries, outreach & events' },
  { label: 'Donations', href: '/join#donations', subtitle: 'Support the campaign' },
] as const

export default function SectionJoinCtaBridge() {
  return (
    <section
      className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 md:px-8 md:py-28"
      style={{ background: FF_PAGE_GRADIENT }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute bottom-0 left-1/2 h-80 w-[120%] -translate-x-1/2 opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(ellipse at center, #f9e04c 0%, transparent 55%)' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p
            className="mb-3 text-xs font-bold uppercase tracking-[0.2em] sm:text-sm"
            style={{ color: FF_COLORS.link }}
          >
            Ready to join?
          </p>
          <h2 className="text-2xl font-bold text-[#f9e04c] sm:text-3xl md:text-4xl">
            Take the next step
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#f9e04c]/85 sm:text-lg">
            You&apos;ve seen the pattern in the data. Help grow the movement — request a sign, volunteer,
            host a pickup hub, or donate.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col rounded-[1.35rem] border border-[#f9e04c]/18 bg-[#f9e04c]/[0.06] p-5 text-left transition-all duration-300 motion-safe:hover:-translate-y-0.5 hover:border-[#f9e04c]/40 hover:bg-[#f9e04c]/[0.11] hover:shadow-xl"
            >
              <span className="text-lg font-bold text-[#f9e04c]">{item.label}</span>
              <span className="mt-2 flex-1 text-sm leading-snug text-[#f9e04c]/70">{item.subtitle}</span>
              <span className="mt-4 text-xs font-bold uppercase tracking-wider" style={{ color: FF_COLORS.link }}>
                On get involved →
              </span>
            </Link>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <FfJoinLink href="/join#signup-form">Open sign-up form</FfJoinLink>
          <Link
            href="/join"
            className="text-sm font-semibold underline decoration-2 underline-offset-[3px] transition-opacity hover:opacity-90"
            style={{ color: FF_COLORS.link }}
          >
            View full get involved page
          </Link>
        </motion.div>
      </div>

      {/* Soft fade into sources / footer */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
        aria-hidden
        style={{ background: 'linear-gradient(to bottom, transparent, white)' }}
      />
    </section>
  )
}
