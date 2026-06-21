'use client'

import { useEffect, useRef, useState } from 'react'
import { useLedgerStore } from '@/store/ledgerStore'
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
import SectionColdOpenJoinBridge from './home/SectionColdOpenJoinBridge'
import SectionJoinCtaBridge from './home/SectionJoinCtaBridge'
import PartnerOrganizationsSection from './home/PartnerOrganizationsCarousel'

export default function ScrollyContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const ledgerSectionRef = useRef<HTMLDivElement>(null)
  const { setScrollProgress, setCurrentYear } = useLedgerStore()
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

  useEffect(() => {
    const handleOpenDataSources = () => {
      setShowMethodology(false)
      setShowDataSources(true)
    }
    window.addEventListener('openDataSources', handleOpenDataSources)
    return () => window.removeEventListener('openDataSources', handleOpenDataSources)
  }, [])

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
        ticking = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [setScrollProgress, setCurrentYear])

  useEffect(() => {
    if (!ledgerSectionRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0) {
            setCurrentYear(2018)
          }
        })
      },
      {
        threshold: [0, 0.05, 0.1, 0.5, 1],
        rootMargin: '0px',
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
      <div className="relative z-10 w-full">
        <SectionColdOpenJoinBridge />
        <PartnerOrganizationsSection />
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
        <SectionJoinCtaBridge />
        <section id="sources" className="border-t border-slate-100 bg-white px-4 py-12 sm:px-6 md:px-8 md:py-16">
          <div className="mx-auto max-w-4xl">
            <h3 className="mb-4 text-xl font-light text-gray-900 sm:text-2xl">Sources &amp; citations</h3>
            <ul className="space-y-2 text-sm font-light leading-relaxed text-gray-700 md:text-base">
              <li id="source-1">
                <span className="mr-2 text-slate-500">1.</span>
                <a
                  href="https://www.ontario.ca/page/public-accounts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
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
                  className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
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
                  className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
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
                  className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
                >
                  Ontario Open Data: Detailed Schedule of Payments
                </a>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <ReceiptOverlay />

      <MethodologyDrawer isOpen={showMethodology} onClose={() => setShowMethodology(false)} />

      <DataSourcesDrawer isOpen={showDataSources} onClose={() => setShowDataSources(false)} />
    </div>
  )
}
