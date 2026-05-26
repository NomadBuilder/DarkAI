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
    <div className="relative min-h-screen bg-white">
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
      <div className="relative z-10 pt-24 sm:pt-28">
        <StoriesPageContent />
      </div>
      <MethodologyDrawer isOpen={showMethodology} onClose={() => setShowMethodology(false)} />
      <DataSourcesDrawer isOpen={showDataSources} onClose={() => setShowDataSources(false)} />
    </div>
  )
}
