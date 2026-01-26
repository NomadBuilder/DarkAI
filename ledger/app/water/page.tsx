'use client'

import SectionWaterOverview from '../../components/sections/SectionWaterOverview'
import SectionWaterControlSlider from '../../components/sections/SectionWaterControlSlider'
import SectionWaterComparisonToggle from '../../components/sections/SectionWaterComparisonToggle'
import SectionWaterLegalAnalysis from '../../components/sections/SectionWaterLegalAnalysis'
import SectionWaterPrivatizationPathway from '../../components/sections/SectionWaterPrivatizationPathway'
import SectionWaterRisks from '../../components/sections/SectionWaterRisks'
import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import MPPContactModal from '../../components/MPPContactModal'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function WaterPage() {
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

  return (
    <div className="relative">
      <TopNavigation 
        onDataSourcesClick={handleDataSourcesToggle}
        onMethodologyClick={handleMethodologyToggle}
      />
      <div className="relative z-10 pt-28 sm:pt-32 space-y-0">
        <SectionWaterOverview />
        <div className="pt-16 md:pt-24">
          <SectionWaterControlSlider />
        </div>
        <div className="pt-16 md:pt-24">
          <SectionWaterComparisonToggle />
        </div>
        <div className="pt-16 md:pt-24">
          <SectionWaterLegalAnalysis />
        </div>
        <div className="pt-16 md:pt-24">
          <SectionWaterPrivatizationPathway />
        </div>
        <div className="pt-16 md:pt-24">
          <SectionWaterRisks />
        </div>
        
        {/* CTA Section */}
        <section className="pt-16 md:pt-24">
          <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 md:px-8 bg-slate-900 text-white py-16 md:py-24">
            <div className="max-w-5xl w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8 }}
              >
                <div className="text-center space-y-6">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-300">
                    Contact your provincial representative
                  </h3>
                  <p className="text-base sm:text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto">
                    Tell your MPP that water is a human right, not a corporate commodity
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-block px-6 sm:px-8 md:px-12 lg:px-16 py-4 sm:py-5 md:py-6 bg-white text-slate-900 text-base sm:text-lg md:text-xl lg:text-2xl font-light rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl active:scale-95 touch-manipulation min-h-[48px] sm:min-h-0 text-center"
                  >
                    Contact Your MPP
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      <MPPContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} variant="water" />

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
