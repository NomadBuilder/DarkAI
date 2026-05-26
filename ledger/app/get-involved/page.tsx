'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import GetInvolvedForm from '../../components/get-involved/GetInvolvedForm'
import { PROTECT_ONTARIO_DONATE_URL } from '@/lib/get-involved'

export default function GetInvolvedPage() {
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)

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

  return (
    <div className="relative min-h-screen">
      <TopNavigation
        onDataSourcesClick={handleDataSourcesToggle}
        onMethodologyClick={handleMethodologyToggle}
      />
      <div className="relative z-10 pt-28 sm:pt-32">
        <section className="relative flex items-start justify-center px-4 sm:px-6 md:px-8 pt-4 sm:pt-0 pb-12 md:pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />
          <div className="relative max-w-3xl w-full text-center">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 mb-6 leading-tight"
            >
              Get involved
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg sm:text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed"
            >
              Request a sign, host a drop-off point, volunteer, or tell us something we didn&apos;t list. One form helps
              organizers match you in your community.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8"
            >
              <a
                href={PROTECT_ONTARIO_DONATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#9f1239] to-[#7f1230] px-8 py-3.5 text-sm font-medium text-white shadow-md hover:opacity-95 transition-opacity"
              >
                Donate
              </a>
            </motion.div>
          </div>
        </section>

        <section className="px-4 sm:px-6 md:px-8 pb-16 md:pb-24 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-2xl mx-auto">
            <GetInvolvedForm />
          </div>
        </section>
      </div>

      <MethodologyDrawer isOpen={showMethodology} onClose={() => setShowMethodology(false)} />
      <DataSourcesDrawer isOpen={showDataSources} onClose={() => setShowDataSources(false)} />
    </div>
  )
}
