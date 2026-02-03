'use client'

import { useEffect, useRef, useState } from 'react'
import { useLedgerStore } from '@/store/ledgerStore'
import SectionColdOpen from './sections/SectionColdOpen'
import SectionPolicyTimeline from './sections/SectionPolicyTimeline'
import SectionLedgerEnhanced from './sections/SectionLedgerEnhanced'
import SectionFordTracker from './sections/SectionFordTracker'
import SectionKeyFindings from './sections/SectionKeyFindings'
import SectionLenses from './sections/SectionLenses'
import SectionLoss from './sections/SectionLoss'
import ReceiptOverlay from './ReceiptOverlay'
import MethodologyDrawer from './MethodologyDrawer'
import DataSourcesDrawer from './DataSourcesDrawer'
import TopNavigation from './TopNavigation'

export default function ScrollyContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const ledgerSectionRef = useRef<HTMLDivElement>(null)
  const { setScrollProgress, setCurrentYear } = useLedgerStore()
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

  // Listen for custom event to open data sources drawer
  useEffect(() => {
    const handleOpenDataSources = () => {
      setShowMethodology(false)
      setShowDataSources(true)
    }
    window.addEventListener('openDataSources', handleOpenDataSources)
    return () => window.removeEventListener('openDataSources', handleOpenDataSources)
  }, [])
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
    <div ref={containerRef} className="relative w-full overflow-x-hidden">
      <TopNavigation 
        onDataSourcesClick={handleDataSourcesToggle}
        onMethodologyClick={handleMethodologyToggle}
      />
      {/* Scrollable content sections */}
            <div className="relative z-10 w-full">
        <div className="pt-0 sm:pt-[152px] md:pt-0">
          <SectionColdOpen />
        </div>
        <section id="timeline">
          <SectionPolicyTimeline />
        </section>
        <section id="ledger" ref={ledgerSectionRef}>
          <SectionLedgerEnhanced />
        </section>
        <SectionLenses />
        <SectionFordTracker />
        <section id="findings">
          <SectionKeyFindings />
        </section>
        <SectionLoss />
        <section id="sources" className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-4">Sources &amp; citations</h3>
            <ul className="space-y-2 text-sm md:text-base text-gray-700 font-light leading-relaxed">
              <li id="source-1">
                <span className="mr-2 text-slate-500">1.</span>
                <a
                  href="https://www.ontario.ca/page/public-accounts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  Ontario Public Accounts (2018–2024)
                </a>
              </li>
              <li id="source-2">
                <span className="mr-2 text-slate-500">2.</span>
                <a
                  href="https://www.policyalternatives.ca/news-research/hollowed-out/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  CCPA: “Hollowed Out” — Ontario public hospitals &amp; private staffing agencies
                </a>
              </li>
              <li id="source-3">
                <span className="mr-2 text-slate-500">3.</span>
                <a
                  href="https://www.cbc.ca/news/canada/toronto/ontario-doug-ford-private-clinic-surgeries-fees-hospitals-1.7026926"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  CBC: For-profit clinic paid more than public hospitals (Bill 60)
                </a>
              </li>
              <li id="source-4">
                <span className="mr-2 text-slate-500">4.</span>
                <a
                  href="https://data.ontario.ca/dataset/public-accounts-detailed-schedule-of-payments"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  Ontario Open Data: Detailed Schedule of Payments
                </a>
              </li>
            </ul>
          </div>
        </section>
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

    </div>
  )
}
