'use client'

import { useState } from 'react'
import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import SignsInTheWildContent from '../../components/sign-spotting/SignsInTheWildContent'

export default function SignsInTheWildPage() {
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)

  return (
    <div className="relative min-h-screen bg-white">
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
        <SignsInTheWildContent />
      </div>
      <MethodologyDrawer isOpen={showMethodology} onClose={() => setShowMethodology(false)} />
      <DataSourcesDrawer isOpen={showDataSources} onClose={() => setShowDataSources(false)} />
    </div>
  )
}
