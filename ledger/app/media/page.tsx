'use client'

import Link from 'next/link'
import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LOGO_ASSETS,
  PRESS_CHART_ASSETS,
  PRESS_DOWNLOADS,
  PRESS_EXPERT_ROUTING,
  PRESS_QUOTES,
} from '../../lib/press-room'

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
}

export default function MediaKitPage() {
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)

  return (
    <div className="relative min-h-screen bg-slate-50">
      <TopNavigation
        onDataSourcesClick={() => {
          setShowMethodology(false)
          setShowDataSources(true)
        }}
        onMethodologyClick={() => {
          setShowDataSources(false)
          setShowMethodology(true)
        }}
      />
      <div className="relative z-10 pt-20 sm:pt-24">
        <section className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-gradient-to-br from-slate-950 via-[#152a45] to-slate-900 text-white border-b border-slate-800">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs uppercase tracking-[0.35em] text-blue-200/90 mb-3 font-medium">Press room</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light mb-4 leading-tight">Media kit &amp; creator pack</h1>
            <p className="text-lg text-slate-200/95 font-light max-w-3xl leading-relaxed">
              Downloadable packs for budget day, breaking accountability stories, and social creators — plus expert
              routing when you need a specialist voice.
            </p>
            <p className="mt-4 text-sm text-slate-400 font-light">
              General media inquiries:{' '}
              <Link href="/about#contact" className="text-blue-200 underline underline-offset-2 hover:text-white">
                About → Contact (Media Inquiry)
              </Link>
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-5xl mx-auto space-y-12">
            <motion.div {...fade}>
              <h2 className="text-2xl font-light text-slate-900 mb-2">Download packs</h2>
              <p className="text-sm text-slate-600 font-light mb-6 max-w-2xl">
                Ready when an AG report drops, a court ruling lands, or you need charts for a segment.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {PRESS_DOWNLOADS.map((dl) => (
                  <a
                    key={dl.href}
                    href={dl.href}
                    download
                    className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-[#2E4A6B]/40 hover:shadow-md transition-all"
                  >
                    <h3 className="text-lg font-light text-slate-900 group-hover:text-[#2E4A6B]">{dl.label}</h3>
                    <p className="mt-2 flex-1 text-sm text-slate-600 font-light leading-relaxed">{dl.description}</p>
                    {dl.sizeHint && (
                      <span className="mt-3 text-xs text-slate-400 font-light">{dl.sizeHint}</span>
                    )}
                    <span className="mt-4 text-sm text-[#2E4A6B] font-medium">Download ZIP →</span>
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.div {...fade}>
              <h2 className="text-2xl font-light text-slate-900 mb-2">Ready-to-quote lines</h2>
              <div className="space-y-4">
                {PRESS_QUOTES.map((q) => (
                  <blockquote
                    key={q.text.slice(0, 40)}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <p className="text-slate-800 font-light leading-relaxed">&ldquo;{q.text}&rdquo;</p>
                    <footer className="mt-3 text-sm text-slate-500 font-light">
                      — {q.attribution}
                      {q.sourceUrl && (
                        <>
                          {' · '}
                          <a href={q.sourceUrl} className="text-blue-600 underline underline-offset-2">
                            Source page
                          </a>
                        </>
                      )}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </motion.div>

            <motion.div {...fade}>
              <h2 className="text-2xl font-light text-slate-900 mb-2">Chart &amp; B-roll assets</h2>
              <p className="text-sm text-slate-600 font-light mb-4">
                Individual charts for broadcast and TikTok. Credit ProtectOnt.ca on-screen or in caption.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {PRESS_CHART_ASSETS.map((c) => (
                  <li key={c.href}>
                    <a
                      href={c.href}
                      download
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-blue-600 hover:bg-slate-50"
                    >
                      {c.label}
                      <span className="text-slate-400">↓</span>
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="/og-image.png"
                    download
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-blue-600 hover:bg-slate-50"
                  >
                    Open Graph / social share image
                    <span className="text-slate-400">↓</span>
                  </a>
                </li>
              </ul>
              <p className="mt-4 text-sm text-slate-500 font-light">
                For ledger-style motion B-roll, screen-record the{' '}
                <Link href="/" className="text-blue-600 underline underline-offset-2">
                  homepage ledger section
                </Link>
                . See creator README inside the B-roll ZIP.
              </p>
            </motion.div>

            <motion.div {...fade}>
              <h2 className="text-2xl font-light text-slate-900 mb-2">Expert routing</h2>
              <p className="text-sm text-slate-600 font-light mb-6 max-w-2xl">
                ProtectOnt is a data and materials hub — for specialist commentary, contact the organizations leading
                each fight.
              </p>
              <ul className="space-y-4">
                {PRESS_EXPERT_ROUTING.map((expert) => (
                  <li
                    key={expert.topic}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-1">{expert.topic}</p>
                    <a
                      href={expert.href}
                      target={expert.href.startsWith('http') ? '_blank' : undefined}
                      rel={expert.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-lg font-light text-blue-600 hover:text-blue-700 underline underline-offset-2"
                    >
                      {expert.organization} →
                    </a>
                    <p className="mt-2 text-sm text-slate-600 font-light leading-relaxed">{expert.note}</p>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div {...fade} className="grid gap-8 md:grid-cols-2">
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-xl font-light text-gray-900 mb-4">Mission</h2>
                <p className="text-sm text-gray-700 font-light leading-relaxed">
                  Protect Ontario is a public‑accountability project that tracks provincial spending, legislation,
                  and policy impacts — turning complex public records into clear, actionable insights.
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-xl font-light text-gray-900 mb-4">Quick facts</h2>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 font-light">
                  <li>Focus: Public spending, healthcare, land, water, wildlife &amp; Indigenous rights</li>
                  <li>Sources: Public Accounts, legislation, Auditor General, public research</li>
                  <li>Coverage: Ontario (2018–2024 fiscal years)</li>
                  <li>Website: ProtectOnt.ca</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 md:col-span-2">
                <h2 className="text-xl font-light text-gray-900 mb-4">Logos &amp; brand assets</h2>
                <ul className="grid gap-2 sm:grid-cols-2 text-sm text-gray-700 font-light">
                  {LOGO_ASSETS.map((asset) => (
                    <li key={asset.href}>
                      <a
                        href={asset.href}
                        className="text-blue-600 hover:text-blue-700 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {asset.label} →
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <MethodologyDrawer isOpen={showMethodology} onClose={() => setShowMethodology(false)} />
      <DataSourcesDrawer isOpen={showDataSources} onClose={() => setShowDataSources(false)} />
    </div>
  )
}
