'use client'

import SectionStaffingCrisis from '../../components/sections/SectionStaffingCrisis'
import SectionHospitalCrisis from '../../components/sections/SectionHospitalCrisis'
import SectionLongTermCare from '../../components/sections/SectionLongTermCare'
import SectionRegionalImpact from '../../components/sections/SectionRegionalImpact'
import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import ReceiptOverlay from '../../components/ReceiptOverlay'
import MPPContactModal from '../../components/MPPContactModal'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function HealthcarePage() {
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
    <div className="relative">
      <TopNavigation 
        onDataSourcesClick={handleDataSourcesToggle}
        onMethodologyClick={handleMethodologyToggle}
      />
            <div className="relative z-10">
              {/* Main body with top padding only; no separate white wrapper */}
              <section id="staffing" className="pt-20 sm:pt-24">
                <SectionStaffingCrisis />
              </section>
        <section id="hospitals" className="pt-16 md:pt-24">
          <SectionHospitalCrisis />
        </section>
        <section id="ltc" className="pt-16 md:pt-24">
          <SectionLongTermCare />
        </section>
        <div className="pt-16 md:pt-24">
          <SectionRegionalImpact />
        </div>

        {/* Sources */}
        <section id="sources" className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-4">Sources &amp; citations</h3>
            <ul className="space-y-2 text-sm md:text-base text-gray-700 font-light leading-relaxed">
              <li id="source-1">
                <span className="mr-2 text-slate-500">1.</span>
                <a href="https://www.policyalternatives.ca/news-research/hollowed-out/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                  CCPA: “Hollowed Out” — Private Staffing Agencies report
                </a>
              </li>
              <li id="source-2">
                <span className="mr-2 text-slate-500">2.</span>
                <a href="https://www.ontariohealthcoalition.ca/wp-content/uploads/Final-Ford-government-LTC-bed-allocations-report.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                  Ontario Health Coalition: Long‑term care bed allocations report
                </a>
              </li>
              <li id="source-3">
                <span className="mr-2 text-slate-500">3.</span>
                <a href="https://www.ontario.ca/laws/statute/19p12" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                  Ontario e‑Laws: Protecting a Sustainable Public Sector for Future Generations Act, 2019 (Bill 124)
                </a>
              </li>
              <li id="source-4">
                <span className="mr-2 text-slate-500">4.</span>
                <a href="https://www.cihi.ca/en/indicators/number-of-acute-care-beds" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                  CIHI: Number of acute care beds (per capita, by province)
                </a>
              </li>
            </ul>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="pt-16 md:pt-24">
          <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 md:px-8 bg-slate-900 text-white pt-16 pb-24 md:pt-24 md:pb-32">
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
                  <p className="text-sm sm:text-base md:text-lg text-gray-400 font-light max-w-2xl mx-auto">
                    Tell your MPP to reinvest in public hospitals, reduce dependence on private agencies, and protect
                    care as a public service.
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

      <ReceiptOverlay />
      
      <MPPContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} variant="healthcare" />

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
