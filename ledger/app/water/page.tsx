'use client'

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

const fadeIn = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
}

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
        {/* Hero */}
        <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 md:px-8 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-slate-50/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />
          <div className="relative max-w-5xl w-full text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-sm sm:text-base uppercase tracking-widest text-blue-700 font-medium mb-4 md:mb-6"
            >
              Ontario · 2025
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8 leading-tight"
            >
              Water Privatization
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-3xl mx-auto mb-10"
            >
              Bill 60 opens the door to corporate control of Ontario&apos;s water. The &quot;Water and Wastewater Public Corporations Act&quot; lets corporations — structured like private companies — take control of water services, set rates, and operate outside Crown accountability.
            </motion.p>
            {/* Key stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-wrap justify-center gap-6 sm:gap-10 md:gap-14"
            >
              <div className="text-center">
                <span className="block text-2xl sm:text-3xl md:text-4xl font-light text-blue-800 tabular-nums">Bill 60</span>
                <span className="block text-sm sm:text-base text-gray-500 mt-1">2025</span>
              </div>
              <div className="w-px h-12 bg-blue-200/80 hidden sm:block self-center" />
              <div className="text-center">
                <span className="block text-2xl sm:text-3xl md:text-4xl font-light text-blue-800 tabular-nums">30–50%</span>
                <span className="block text-sm sm:text-base text-gray-500 mt-1">rate increases (privatized systems)</span>
              </div>
              <div className="w-px h-12 bg-blue-200/80 hidden sm:block self-center" />
              <div className="text-center">
                <span className="block text-2xl sm:text-3xl md:text-4xl font-light text-blue-800 max-w-[8rem] mx-auto">Not Crown</span>
                <span className="block text-sm sm:text-base text-gray-500 mt-1">agents — less accountability</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 1: The threat */}
        <section className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-slate-50 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-blue-400 to-blue-600 opacity-80" />
          <div className="max-w-4xl mx-auto pl-4 sm:pl-6">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-8 md:mb-12 flex items-center gap-3">
              <span className="inline-block w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600" aria-hidden>1</span>
              The threat
            </motion.h2>
            <motion.div {...fadeIn} className="space-y-6 text-lg sm:text-xl text-gray-700 font-light leading-relaxed">
              <p>
                In November 2025, the Ontario government passed <strong className="font-normal text-gray-900">Bill 60</strong>, which includes the <strong className="font-normal text-gray-900">Water and Wastewater Public Corporations Act, 2025</strong>. Despite its name, this legislation creates a legal pathway for corporations — structured like private, for-profit companies — to take control of water and wastewater services across Ontario.
              </p>
              <motion.div {...fadeIn} className="rounded-xl bg-white/80 border border-blue-100 p-6 sm:p-8 shadow-sm">
                <p className="text-blue-800 font-medium text-lg sm:text-xl mb-2">This isn&apos;t modernization.</p>
                <p className="text-gray-700 text-base sm:text-lg">It&apos;s privatization (Americanization) by another name — corporate control, rate-setting power, and governance outside Crown accountability.</p>
              </motion.div>
            </motion.div>
            <motion.div {...fadeIn} className="mt-10 space-y-6">
              <h3 className="text-xl sm:text-2xl font-light text-gray-900">What Bill 60 does</h3>
              <div className="rounded-xl bg-slate-800 text-white p-6 sm:p-8 space-y-6">
                <div>
                  <h4 className="text-base font-medium text-blue-200 mb-1">The &quot;public corporation&quot; that isn&apos;t public</h4>
                  <p className="text-gray-300 text-base font-light leading-relaxed">Water corporations must be <strong className="text-white">incorporated under the Business Corporations Act</strong> — the same structure as private companies. They can issue shares, pay dividends, and operate with profit incentives.</p>
                </div>
                <div className="border-t border-slate-600 pt-4">
                  <h4 className="text-base font-medium text-blue-200 mb-1">Municipal control removed</h4>
                  <p className="text-gray-300 text-base font-light leading-relaxed">Once a corporation is designated, municipalities <strong className="text-white">must provide water services exclusively through that corporation</strong>. Elected councils lose direct authority over their own water systems.</p>
                </div>
                <div className="border-t border-slate-600 pt-4">
                  <h4 className="text-base font-medium text-blue-200 mb-1">Financial autonomy · Not Crown agents</h4>
                  <p className="text-gray-300 text-base font-light leading-relaxed">Corporations can <strong className="text-white">set their own rates and fees</strong>, with only regulatory oversight. The law states they <strong className="text-white">are not agents of the Crown</strong> — so they operate outside the accountability framework of public institutions.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 2: Public vs. Corporate Control */}
        <section className="relative px-0 pt-16 md:pt-24 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-blue-400 to-blue-600 opacity-80 z-10" />
          <div className="relative pl-4 sm:pl-6 pt-4">
            <span className="inline-block w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg font-light mb-6" aria-hidden>2</span>
            <SectionWaterControlSlider />
          </div>
        </section>

        {/* Section 3: Claims vs. Reality */}
        <section className="relative px-0 pt-16 md:pt-24 overflow-hidden bg-slate-50">
          <div className="absolute right-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-blue-300 to-blue-500 opacity-60 z-10" />
          <div className="relative pr-4 sm:pr-6 pt-4">
            <span className="inline-block w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg font-light mb-6 ml-4 sm:ml-6" aria-hidden>3</span>
            <SectionWaterComparisonToggle />
          </div>
        </section>

        {/* Section 4: Legal Framework */}
        <section className="relative px-0 pt-16 md:pt-24 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-blue-400 to-blue-600 opacity-80 z-10" />
          <div className="relative pl-4 sm:pl-6 pt-4">
            <span className="inline-block w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg font-light mb-6" aria-hidden>4</span>
            <SectionWaterLegalAnalysis />
          </div>
        </section>

        {/* Section 5: Privatization Pathway */}
        <section className="relative px-0 pt-16 md:pt-24 overflow-hidden bg-slate-50">
          <div className="absolute right-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-blue-300 to-blue-500 opacity-60 z-10" />
          <div className="relative pr-4 sm:pr-6 pt-4">
            <span className="inline-block w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg font-light mb-6 ml-4 sm:ml-6" aria-hidden>5</span>
            <SectionWaterPrivatizationPathway />
          </div>
        </section>

        {/* Section 6: The Risks */}
        <section className="relative px-0 pt-16 md:pt-24 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-blue-400 to-blue-600 opacity-80 z-10" />
          <div className="relative pl-4 sm:pl-6 pt-4">
            <span className="inline-block w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg font-light mb-6" aria-hidden>6</span>
            <SectionWaterRisks />
          </div>
        </section>

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
