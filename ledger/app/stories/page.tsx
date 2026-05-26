'use client'

import { useState } from 'react'
import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import StoriesPageContent from '../../components/stories/StoriesPageContent'

export default function StoriesPage() {
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)

  return (
    <div className="relative min-h-screen">
      <TopNavigation
        onDataSourcesClick={() => {
          setShowMethodology(false)
          setShowDataSources((v) => !v)
        }}
        onMethodologyClick={() => {
          setShowDataSources(false)
          setShowMethodology((v) => !v)
        }}
      />
      <div className="relative z-10 pt-28 sm:pt-32 pb-16">
        <section className="relative px-4 sm:px-6 md:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />
          <div className="relative">
            <StoriesPageContent />
          </div>
        </section>
      </div>
      <MethodologyDrawer isOpen={showMethodology} onClose={() => setShowMethodology(false)} />
      <DataSourcesDrawer isOpen={showDataSources} onClose={() => setShowDataSources(false)} />
    </div>
  )
}
