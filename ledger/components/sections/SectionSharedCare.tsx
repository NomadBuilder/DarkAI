'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import InlineCitation from '../InlineCitation'

const pillars = [
  {
    title: 'At work',
    body:
      'Most nurses, PSWs, EAs, and childcare workers in Ontario are women. Bill 124 capped wages in health and education while private staffing agencies captured billions — work that is essential, underpaid, and overwhelmingly done by women.',
    cite: { href: '#source-5', label: '5' },
  },
  {
    title: 'At home',
    body:
      'When ER waits grow, home-care waitlists stretch, and school supports shrink, the gap does not disappear — families absorb it. That unpaid caregiving falls disproportionately on women, especially in multigenerational and single-parent households.',
    cite: { href: '#source-6', label: '6' },
  },
  {
    title: 'In the movement',
    body:
      'Much of Ontario’s opposition is volunteer-led: coordinating signs, protests, mutual aid, and school-council pressure. Women often do this invisible organizing work — even when men are the public face.',
  },
]

export default function SectionSharedCare() {
  return (
    <section
      id="shared-care"
      className="min-h-0 flex items-center justify-center px-4 sm:px-6 md:px-8 bg-slate-50 py-16 md:py-24 scroll-mt-24"
    >
      <div className="max-w-6xl w-full space-y-10 md:space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 mb-4 md:mb-6">
            Public care is shared care
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
            When public services are cut, the load lands unevenly — at work, at home, and in the volunteer
            networks holding communities together.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {pillars.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
            >
              <h3 className="text-lg font-medium text-[#2E4A6B] mb-3">{item.title}</h3>
              <p className="text-sm sm:text-base text-gray-700 font-light leading-relaxed">
                {item.body}
                {item.cite ? (
                  <>
                    {' '}
                    <InlineCitation href={item.cite.href} label={item.cite.label} />
                  </>
                ) : null}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl border border-violet-200 bg-violet-50/80 px-6 py-8 sm:px-10 text-center"
        >
          <p className="text-lg sm:text-xl font-light text-violet-950 leading-relaxed max-w-2xl mx-auto">
            The bill doesn&apos;t disappear — it goes home.
          </p>
          <p className="mt-4 text-sm text-violet-900/90 font-light max-w-xl mx-auto">
            Print and share the{' '}
            <Link
              href="/flyers/public-care"
              className="font-medium text-[#3d2b7a] underline underline-offset-2 hover:text-[#2a1f58]"
            >
              public care flyer
            </Link>{' '}
            or{' '}
            <Link
              href="/stories#share-your-story"
              className="font-medium text-[#3d2b7a] underline underline-offset-2 hover:text-[#2a1f58]"
            >
              share your story
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </section>
  )
}
