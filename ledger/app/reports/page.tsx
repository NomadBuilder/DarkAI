'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import TopNavigation from '../../components/TopNavigation'
import { PROTECTONT_REPORTS } from '../../lib/reports'

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
}

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopNavigation />

      <header className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-[#152a45] to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 sm:pt-28 sm:pb-12">
          <p className="text-xs uppercase tracking-[0.35em] text-blue-200/90 mb-3 font-medium">Reports</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light mb-4 leading-tight">
            Accountability briefs
          </h1>
          <p className="text-lg text-slate-200/95 font-light max-w-3xl leading-relaxed">
            Plain-language deep dives on the Ford government’s biggest bills — what changed, how fast it passed, and
            how your MPP voted.
          </p>
        </div>
      </header>

      <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-5xl mx-auto space-y-6">
          {PROTECTONT_REPORTS.map((report) => (
            <motion.article key={report.slug} {...fade}>
              <a
                href={report.href}
                className="group block rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm hover:border-[#2E4A6B]/35 hover:shadow-md transition-all"
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {report.badge ? (
                    <span className="rounded-full bg-[#f9e04c] px-2.5 py-0.5 text-xs font-medium text-slate-900">
                      {report.badge}
                    </span>
                  ) : null}
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                    {report.dateLabel}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-light text-slate-900 group-hover:text-[#2E4A6B] transition-colors">
                  {report.title}
                </h2>
                <p className="mt-1 text-base text-slate-700 font-light">{report.subtitle}</p>
                <p className="mt-3 text-sm sm:text-base text-slate-600 font-light leading-relaxed max-w-3xl">
                  {report.description}
                </p>
                <span className="mt-5 inline-flex text-sm font-medium text-[#2E4A6B]">
                  Read the report →
                </span>
              </a>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-light text-slate-900 mb-2">Looking for something else?</h2>
          <p className="text-sm text-slate-600 font-light mb-4 leading-relaxed">
            Issue pages, petitions, and contact tools live under Take action and The Issues.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/take-action"
              className="inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-light text-white hover:bg-slate-800"
            >
              Take action
            </Link>
            <Link
              href="/receipts"
              className="inline-flex rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-light text-slate-800 hover:bg-slate-50"
            >
              The Receipts
            </Link>
            <Link
              href="/methodology"
              className="inline-flex rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-light text-slate-800 hover:bg-slate-50"
            >
              Methodology
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
