'use client'

import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import MPPContactModal from '../../components/MPPContactModal'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'

const fadeIn = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
}

const actions = [
  {
    title: 'Contact your MPP',
    description: 'Tell your provincial representative you want accountability: strong public healthcare, protected water, species and Indigenous rights, and no favours for developers.',
    cta: 'Contact Your MPP',
    type: 'modal',
  },
  {
    title: 'Sign petitions',
    description: 'Ontario Nature and the David Suzuki Foundation are calling on Premier Ford to cancel Bill 5 and protect species and Indigenous rights. Add your name.',
    links: [
      { label: 'Ontario Nature: Bill 5 — A moment to mobilize', href: 'https://ontarionature.org/bill-5-a-moment-to-mobilize-for-nature-in-ontario-blog/' },
      { label: 'David Suzuki Foundation: Repeal Bill 5', href: 'https://davidsuzuki.org/action/repealbill5/' },
    ],
  },
  {
    title: 'Join protests and rallies',
    description: 'Anti-Ford and provincial accountability protests happen across Ontario — in Toronto, Ottawa, and other cities. Showing up in person makes the demand visible and harder to ignore.',
    links: [
      { label: 'View listed protests & rallies', href: '/protests', internal: true },
      { label: 'Search for Ontario protests and rallies (e.g. healthcare, Greenbelt, Bill 5)', href: 'https://www.google.com/search?q=Ontario+protest+Ford+2025' },
      { label: 'OFL Ford Tracker — campaigns and actions', href: 'https://ofl.ca/ford-tracker/' },
    ],
  },
  {
    title: 'Stay informed and share',
    description: 'Use the data and sources on this site to back up what you say. Share Protect Ontario with others so more people see the pattern.',
    links: [
      { label: 'Data Sources', drawer: 'dataSources' as const },
      { label: 'Methodology', drawer: 'methodology' as const },
    ],
  },
]

export default function TakeActionPage() {
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const handleDrawerClick = (type: 'methodology' | 'dataSources') => {
    if (type === 'methodology') handleMethodologyToggle()
    else handleDataSourcesToggle()
  }

  return (
    <div className="relative">
      <TopNavigation
        onDataSourcesClick={handleDataSourcesToggle}
        onMethodologyClick={handleMethodologyToggle}
      />
      <div className="relative z-10 pt-28 sm:pt-32">
        {/* Hero — same nav-to-content spacing as issue pages */}
        <section className="relative flex items-start justify-center px-4 sm:px-6 md:px-8 pt-4 sm:pt-0 pb-16 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />
          <div className="relative max-w-4xl w-full text-center">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 mb-6 leading-tight"
            >
              What you can do
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-xl sm:text-2xl text-gray-600 font-light max-w-2xl mx-auto"
            >
              Contact your MPP, sign petitions, join protests, and stay informed. Public pressure works — the Greenbelt reversal proved it.
            </motion.p>
          </div>
        </section>

        {/* Action list */}
        <section className="px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-white">
          <div className="max-w-3xl mx-auto space-y-12 md:space-y-16">
            {actions.map((action, idx) => (
              <motion.article
                key={action.title}
                {...fadeIn}
                className="relative pl-8 sm:pl-10 border-l-2 border-slate-200"
              >
                <span className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-white text-xs font-medium flex items-center justify-center">
                  {idx + 1}
                </span>
                <h2 className="text-xl sm:text-2xl font-light text-gray-900 mb-3">
                  {action.title}
                </h2>
                <p className="text-gray-600 font-light leading-relaxed mb-6">
                  {action.description}
                </p>
                {action.type === 'modal' && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-block px-6 py-3 bg-slate-900 text-white text-base font-light rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {action.cta}
                  </button>
                )}
                {action.links && (
                  <ul className="space-y-2">
                    {action.links.map((link) =>
                      'drawer' in link ? (
                        <li key={link.label}>
                          <button
                            type="button"
                            onClick={() => handleDrawerClick(link.drawer)}
                            className="text-blue-600 hover:text-blue-700 font-light underline underline-offset-2"
                          >
                            {link.label} →
                          </button>
                        </li>
                      ) : 'internal' in link && link.internal ? (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-blue-600 hover:text-blue-700 font-light underline underline-offset-2"
                          >
                            {link.label} →
                          </Link>
                        </li>
                      ) : (
                        <li key={link.label}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 font-light underline underline-offset-2"
                          >
                            {link.label} →
                          </a>
                        </li>
                      )
                    )}
                  </ul>
                )}
              </motion.article>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-slate-900 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <motion.p {...fadeIn} className="text-xl sm:text-2xl font-light text-gray-300 mb-8">
              The Greenbelt reversal happened because people showed up, wrote, and refused to accept that protected land was for sale. The same kind of pressure can protect healthcare, water, species, and Indigenous rights.
            </motion.p>
            <motion.div {...fadeIn}>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-block px-8 py-4 bg-white text-slate-900 text-lg font-light rounded-lg hover:bg-gray-100 transition-colors"
              >
                Contact Your MPP
              </button>
            </motion.div>
          </div>
        </section>
      </div>

      <MPPContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

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
