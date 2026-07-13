'use client'

import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import MPPContactModal, { type MppContactVariant } from '../../components/MPPContactModal'
import MPPIssuePicker from '../../components/take-action/MPPIssuePicker'
import MppVoteRecordLookup from '../../components/take-action/MppVoteRecordLookup'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CARE_ECONOMY_PETITIONS,
  ENVIRONMENT_PETITIONS,
  type MppContactVariant as MppVariant,
} from '../../lib/mpp-contact'

const fadeIn = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
}

export default function TakeActionPage() {
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mppVariant, setMppVariant] = useState<MppContactVariant>('default')
  const [selectedIssue, setSelectedIssue] = useState<MppVariant | null>(null)

  const handleMethodologyToggle = () => {
    if (showMethodology) setShowMethodology(false)
    else {
      setShowDataSources(false)
      setShowMethodology(true)
    }
  }

  const handleDataSourcesToggle = () => {
    if (showDataSources) setShowDataSources(false)
    else {
      setShowMethodology(false)
      setShowDataSources(true)
    }
  }

  const openMppWithIssue = (variant: MppVariant) => {
    setSelectedIssue(variant)
    setMppVariant(variant)
    setIsModalOpen(true)
  }

  return (
    <div className="relative">
      <TopNavigation
        onDataSourcesClick={handleDataSourcesToggle}
        onMethodologyClick={handleMethodologyToggle}
      />
      <div className="relative z-10 pt-28 sm:pt-32">
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
              Contact your MPP, sign petitions, join protests, and show visible support. Public pressure works — the
              Greenbelt reversal proved it on land, and the fight continues at Ontario Place.
            </motion.p>
          </div>
        </section>

        <MppVoteRecordLookup />

        {/* Issue-picker MPP flow */}
        <section className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-white border-y border-slate-100">
          <div className="max-w-4xl mx-auto">
            <motion.div {...fadeIn}>
              <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2 text-center">
                What do you care about most?
              </h2>
              <p className="text-gray-600 font-light text-center mb-8 max-w-2xl mx-auto leading-relaxed">
                Pick an issue — we&apos;ll open a pre-filled, respectful letter you can send to your MPP. Edit it in
                your own words before you copy or email.
              </p>
              <MPPIssuePicker
                selected={selectedIssue}
                onSelect={(variant) => openMppWithIssue(variant)}
              />
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => openMppWithIssue(mppVariant)}
                  disabled={!selectedIssue}
                  className="inline-block px-8 py-3 bg-slate-900 text-white text-base font-light rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {selectedIssue ? 'Write to your MPP →' : 'Select an issue above'}
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-slate-50">
          <div className="max-w-3xl mx-auto space-y-12 md:space-y-16">
            <motion.article {...fadeIn} className="relative pl-8 sm:pl-10 border-l-2 border-slate-200">
              <span className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-white text-xs font-medium flex items-center justify-center">
                1
              </span>
              <h2 className="text-xl sm:text-2xl font-light text-gray-900 mb-3">Sign petitions — care &amp; public services</h2>
              <p className="text-gray-600 font-light leading-relaxed mb-6">
                Healthcare coalitions, labour, and research groups are organizing on Bill 124, hospital funding, and
                the care economy. Add your name where you can.
              </p>
              <ul className="space-y-3">
                {CARE_ECONOMY_PETITIONS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-light underline underline-offset-2"
                    >
                      {link.label} →
                    </a>
                    {link.blurb && (
                      <p className="text-sm text-slate-500 font-light mt-0.5 ml-0">{link.blurb}</p>
                    )}
                  </li>
                ))}
              </ul>
            </motion.article>

            <motion.article {...fadeIn} className="relative pl-8 sm:pl-10 border-l-2 border-slate-200">
              <span className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-white text-xs font-medium flex items-center justify-center">
                2
              </span>
              <h2 className="text-xl sm:text-2xl font-light text-gray-900 mb-3">
                Sign petitions — environment, species &amp; research animals
              </h2>
              <p className="text-gray-600 font-light leading-relaxed mb-4">
                Ontario Nature and the David Suzuki Foundation are calling for Bill 5 to be cancelled and for species
                and Indigenous rights to be protected. Animal Alliance of Canada and others are pushing for stronger
                Bill 75 rules before they take effect in 2027.
              </p>
              <p className="text-gray-600 font-light leading-relaxed mb-6">
                <Link href="/wildlife" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                  Read the full wildlife &amp; animal protection breakdown →
                </Link>
              </p>
              <ul className="space-y-2">
                {ENVIRONMENT_PETITIONS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-light underline underline-offset-2"
                    >
                      {link.label} →
                    </a>
                  </li>
                ))}
              </ul>
            </motion.article>

            <motion.article {...fadeIn} className="relative pl-8 sm:pl-10 border-l-2 border-slate-200">
              <span className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-white text-xs font-medium flex items-center justify-center">
                3
              </span>
              <h2 className="text-xl sm:text-2xl font-light text-gray-900 mb-3">Join protests and rallies</h2>
              <p className="text-gray-600 font-light leading-relaxed mb-6">
                Provincial accountability protests happen across Ontario. Showing up in person makes the demand visible
                and harder to ignore.
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/protests" className="text-blue-600 hover:text-blue-700 font-light underline underline-offset-2">
                    View listed protests &amp; rallies →
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-blue-600 hover:text-blue-700 font-light underline underline-offset-2">
                    Suggest an event (About contact form) →
                  </Link>
                </li>
                <li>
                  <Link href="/join#download-a-sign" className="text-blue-600 hover:text-blue-700 font-light underline underline-offset-2">
                    Download a sign before you go →
                  </Link>
                </li>
              </ul>
            </motion.article>

            <motion.article {...fadeIn} className="relative pl-8 sm:pl-10 border-l-2 border-slate-200">
              <span className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-white text-xs font-medium flex items-center justify-center">
                4
              </span>
              <h2 className="text-xl sm:text-2xl font-light text-gray-900 mb-3">Show your sign — signs in the wild</h2>
              <p className="text-gray-600 font-light leading-relaxed mb-6">
                Spotted a ProtectOnt or Fight Ford yard sign? Upload a photo for the gallery. We only publish your
                forward sortation area (FSA — first three characters of your postal code), never your full address.
              </p>
              <Link
                href="/signs-in-the-wild"
                className="inline-block px-6 py-3 bg-white border border-slate-300 text-slate-900 text-base font-light rounded-lg hover:bg-slate-50 transition-colors"
              >
                Upload a sign photo →
              </Link>
            </motion.article>

            <motion.article {...fadeIn} className="relative pl-8 sm:pl-10 border-l-2 border-slate-200">
              <span className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-white text-xs font-medium flex items-center justify-center">
                5
              </span>
              <h2 className="text-xl sm:text-2xl font-light text-gray-900 mb-3">Stay informed and share</h2>
              <p className="text-gray-600 font-light leading-relaxed mb-6">
                Use the data and sources on this site to back up what you say. Share Protect Ontario with others so
                more people see the pattern.
              </p>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={handleDataSourcesToggle}
                    className="text-blue-600 hover:text-blue-700 font-light underline underline-offset-2"
                  >
                    Data Sources →
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleMethodologyToggle}
                    className="text-blue-600 hover:text-blue-700 font-light underline underline-offset-2"
                  >
                    Methodology →
                  </button>
                </li>
                <li>
                  <Link href="/media" className="text-blue-600 hover:text-blue-700 font-light underline underline-offset-2">
                    Press room &amp; media kit →
                  </Link>
                </li>
              </ul>
            </motion.article>
          </div>
        </section>

        <section className="px-4 sm:px-6 md:px-8 pt-16 pb-24 md:pt-24 md:pb-32 bg-slate-900 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <motion.p {...fadeIn} className="text-xl sm:text-2xl font-light text-gray-300 mb-8">
              The Greenbelt reversal happened because people showed up, wrote, and refused to accept that protected
              land was for sale. The same kind of pressure can protect healthcare, water, public waterfront, species,
              and Indigenous rights.
            </motion.p>
            <motion.div {...fadeIn}>
              <button
                onClick={() => openMppWithIssue(selectedIssue ?? 'default')}
                className="inline-block px-8 py-4 bg-white text-slate-900 text-lg font-light rounded-lg hover:bg-gray-100 transition-colors"
              >
                Contact Your MPP
              </button>
            </motion.div>
          </div>
        </section>
      </div>

      <MPPContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} variant={mppVariant} />

      <MethodologyDrawer isOpen={showMethodology} onClose={() => setShowMethodology(false)} />

      <DataSourcesDrawer isOpen={showDataSources} onClose={() => setShowDataSources(false)} />
    </div>
  )
}
