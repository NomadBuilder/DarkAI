'use client'

import { useEffect, useState } from 'react'
import TopNavigation from '../components/TopNavigation'
import MethodologyDrawer from '../components/MethodologyDrawer'
import DataSourcesDrawer from '../components/DataSourcesDrawer'
import SectionWhatCouldFund from '../components/sections/SectionWhatCouldFund'

export default function AlternativePresentPage() {
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)

  // Ensure only one drawer is open at a time
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
    <div className="relative w-full overflow-x-hidden min-h-screen bg-white">
      <TopNavigation 
        onDataSourcesClick={handleDataSourcesToggle}
        onMethodologyClick={handleMethodologyToggle}
      />
      
      {/* Main content with top padding for fixed nav */}
      <div className="pt-28 sm:pt-32">
        <SectionWhatCouldFund />
      </div>

      {/* Methodology drawer */}
      <MethodologyDrawer 
        isOpen={showMethodology} 
        onClose={() => setShowMethodology(false)} 
      />

      {/* Data Sources drawer */}
      <DataSourcesDrawer 
        isOpen={showDataSources} 
        onClose={() => setShowDataSources(false)} 
      />
    </div>
  )
}
