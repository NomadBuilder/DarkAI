'use client'

import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getPublicDataFile } from '../../utils/dataPath'
import type { Protest } from '../../data/protests'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
}

export default function ProtestsPage() {
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)
  const [protests, setProtests] = useState<Protest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = getPublicDataFile('protests.json')
    fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setProtests(Array.isArray(data) ? data : [])
      })
      .catch(() => setProtests([]))
      .finally(() => setLoading(false))
  }, [])

  const handleMethodologyToggle = () => {
    if (showMethodology) {
      setShowMethodology(false)
    } else {
      setShowDataSources(false)
      setShowMethodology(true)
    }
  }

  const handleDataSourcesToggle = () => {
    if (showDataSources) {
      setShowDataSources(false)
    } else {
      setShowMethodology(false)
      setShowDataSources(true)
    }
  }

  return (
    <div className="relative">
      <TopNavigation
        onDataSourcesClick={handleDataSourcesToggle}
        onMethodologyClick={handleMethodologyToggle}
      />
      <div className="relative z-10 pt-28 sm:pt-32">
        {/* Hero */}
        <section className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-4 leading-tight"
            >
              Protests &amp; rallies
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-gray-600 font-light max-w-2xl mx-auto"
            >
              Rallies and protests calling for accountability from the Ford government, across Ontario. Add your voice in person.
            </motion.p>
          </div>
        </section>

        {/* Card list */}
        <section className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-slate-50 min-h-[50vh]">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="rounded-xl bg-white border border-slate-200 p-12 text-center">
                <p className="text-gray-500 font-light">Loading…</p>
              </div>
            ) : protests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl bg-white border border-slate-200 p-8 md:p-12 text-center"
              >
                <p className="text-gray-600 font-light">
                  No protests are listed yet. Check back soon or see the{' '}
                  <Link href="/take-action" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                    Take action
                  </Link>{' '}
                  page for other ways to get involved.
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                {protests.map((protest, idx) => (
                  <motion.article
                    key={protest.id}
                    {...fadeIn}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6 sm:p-8 flex flex-col h-full">
                      <div className="flex flex-wrap gap-2 text-sm text-slate-500 font-light mb-2">
                        <span>{protest.date}</span>
                        <span className="text-slate-300">·</span>
                        <span>{protest.location}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-light text-gray-900 mb-3 leading-tight">
                        {protest.title}
                      </h2>
                      {protest.description && (
                        <p className="text-gray-600 font-light leading-relaxed flex-grow mb-4">
                          {protest.description}
                        </p>
                      )}
                      {protest.link ? (
                        <a
                          href={protest.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-light text-sm mt-auto"
                        >
                          Event details →
                        </a>
                      ) : null}
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Back to Take action */}
        <section className="px-4 sm:px-6 md:px-8 py-8 bg-white border-t border-slate-100">
          <div className="max-w-5xl mx-auto text-center">
            <Link
              href="/take-action"
              className="text-blue-600 hover:text-blue-700 font-light underline underline-offset-2"
            >
              ← Back to What you can do
            </Link>
          </div>
        </section>
      </div>

      <MethodologyDrawer
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
      />

      <DataSourcesDrawer
        isOpen={showDataSources}
        onClose={() => setShowDataSources(false)}
      />
    </div>
  )
}
