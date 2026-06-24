'use client'

import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import MethodologyContent from '../../components/methodology/MethodologyContent'
import { useState } from 'react'

export default function MethodologyPage() {
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)

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
    <div className="relative min-h-screen bg-slate-50">
      <TopNavigation
        onDataSourcesClick={handleDataSourcesToggle}
        onMethodologyClick={handleMethodologyToggle}
      />
      <div className="relative z-10 pt-20 sm:pt-24">
        <section className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-4 leading-tight">
              Methodology
            </h1>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
              How we source flyers, issue pages, spending data, and event listings — and how we separate facts
              from interpretation.
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 md:p-10">
              <MethodologyContent headingLevel="h2" />
            </div>
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
