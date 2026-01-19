'use client'

import { useEffect, useRef, useState } from 'react'
import { useLedgerStore } from '@/store/ledgerStore'
import SectionColdOpen from './sections/SectionColdOpen'
import SectionNumbers from './sections/SectionNumbers'
import SectionPolicyTimeline from './sections/SectionPolicyTimeline'
import SectionLedgerEnhanced from './sections/SectionLedgerEnhanced'
import SectionStaffingCrisis from './sections/SectionStaffingCrisis'
import SectionCostComparison from './sections/SectionCostComparison'
import SectionHospitalCrisis from './sections/SectionHospitalCrisis'
import SectionLongTermCare from './sections/SectionLongTermCare'
import SectionFordTracker from './sections/SectionFordTracker'
import SectionVendorCallouts from './sections/SectionVendorCallouts'
import SectionRegionalImpact from './sections/SectionRegionalImpact'
import SectionKeyFindings from './sections/SectionKeyFindings'
import SectionNaming from './sections/SectionNaming'
import SectionLenses from './sections/SectionLenses'
import SectionLoss from './sections/SectionLoss'
import ReceiptOverlay from './ReceiptOverlay'
import MethodologyDrawer from './MethodologyDrawer'
import DataSourcesDrawer from './DataSourcesDrawer'
import ReceiptsToggle from './ReceiptsToggle'
import TopNavigation from './TopNavigation'

export default function ScrollyContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const ledgerSectionRef = useRef<HTMLDivElement>(null)
  const { setScrollProgress, setCurrentYear } = useLedgerStore()
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)
  const [isLedgerVisible, setIsLedgerVisible] = useState(false)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!containerRef.current || !ledgerSectionRef.current || ticking) return
      
      ticking = true
      requestAnimationFrame(() => {
        if (!containerRef.current || !ledgerSectionRef.current) return

        const scrollTop = window.scrollY
        const scrollHeight = containerRef.current.scrollHeight - window.innerHeight
        const progress = Math.min(Math.max(0, scrollTop / scrollHeight), 1)
        
        setScrollProgress(progress)

        // Only update year when ledger section is in view
        const ledgerRect = ledgerSectionRef.current.getBoundingClientRect()
        const isLedgerInView = ledgerRect.top < window.innerHeight && ledgerRect.bottom > 0
        
        // Year mapping is now handled by SectionLedger component
        // This keeps the scroll progress for other uses
        
        ticking = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [setScrollProgress, setCurrentYear])

  // Track when SectionLedger is in view - make it more sensitive
  useEffect(() => {
    if (!ledgerSectionRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsLedgerVisible(entry.isIntersecting)
          // Also set initial year when section becomes visible
          if (entry.isIntersecting && entry.intersectionRatio > 0) {
            setCurrentYear(2018) // Start at first year (when Doug Ford took office)
          }
        })
      },
      {
        threshold: [0, 0.05, 0.1, 0.5, 1], // Multiple thresholds for better detection
        rootMargin: '0px', // No margin - trigger immediately
      }
    )

    observer.observe(ledgerSectionRef.current)

    return () => observer.disconnect()
  }, [setCurrentYear])

  return (
    <div ref={containerRef} className="relative">
      <TopNavigation />
      {/* Scrollable content sections */}
      <div className="relative z-10">
        <SectionColdOpen />
        <section id="numbers">
          <SectionNumbers />
        </section>
        <section id="timeline">
          <SectionPolicyTimeline />
        </section>
        <section id="ledger" ref={ledgerSectionRef}>
          <SectionLedgerEnhanced />
        </section>
        <section id="staffing">
          <SectionStaffingCrisis />
        </section>
        <section id="cost">
          <SectionCostComparison />
        </section>
        <section id="hospitals">
          <SectionHospitalCrisis />
        </section>
        <section id="ltc">
          <SectionLongTermCare />
        </section>
        <SectionFordTracker />
        <section id="vendors">
          <SectionVendorCallouts />
        </section>
        <SectionRegionalImpact />
        <section id="findings">
          <SectionKeyFindings />
        </section>
        <SectionNaming />
        <SectionLenses />
        <SectionLoss />
      </div>

      {/* Receipts overlay */}
      <ReceiptOverlay />

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

      {/* Control buttons - responsive positioning */}
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col gap-2 md:gap-3">
        <ReceiptsToggle />
        <button
          onClick={() => setShowDataSources(true)}
          className="px-4 sm:px-5 py-3 sm:py-2.5 md:py-2 text-sm sm:text-base bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm hover:bg-white transition-colors active:scale-95 touch-manipulation min-h-[44px] sm:min-h-0"
          aria-label="View Data Sources"
        >
          Data Sources
        </button>
        <button
          onClick={() => setShowMethodology(true)}
          className="px-4 sm:px-5 py-3 sm:py-2.5 md:py-2 text-sm sm:text-base bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm hover:bg-white transition-colors active:scale-95 touch-manipulation min-h-[44px] sm:min-h-0"
          aria-label="View Methodology"
        >
          Methodology
        </button>
      </div>
    </div>
  )
}
