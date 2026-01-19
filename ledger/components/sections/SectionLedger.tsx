'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { useLedgerStore } from '@/store/ledgerStore'

interface SystemComposition {
  year: number
  public_total: number
  non_profit_total: number
  for_profit_total: number
  unknown_total: number
}

export default function SectionLedger() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { currentYear, setCurrentYear } = useLedgerStore()
  const [isInView, setIsInView] = useState(false)
  const [data, setData] = useState<SystemComposition[]>([])
  const [loading, setLoading] = useState(true)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  })

  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.3, 0.7, 0.9, 1], [0, 1, 1, 1, 1, 0])

  // Load data
  useEffect(() => {
    fetch('/data/processed/system_composition.json')
      .then(r => r.json())
      .then(d => {
        const sorted = Array.isArray(d) 
          ? d.sort((a: SystemComposition, b: SystemComposition) => a.year - b.year) 
          : []
        setData(sorted)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Track when section is in view and update year
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting)
          if (entry.isIntersecting && data.length > 0) {
            // Set initial year when section becomes visible
            // Set to 2018 (when Doug Ford took office) or first available year >= 2018
            const fordEraYear = data.find(d => d.year >= 2018)?.year || data[0]?.year
            if (fordEraYear) {
              setCurrentYear(fordEraYear)
            }
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '-50px 0px',
      }
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [data, setCurrentYear])

  // Update year based on scroll position
  useEffect(() => {
    if (!isInView || !containerRef.current || data.length === 0) return

    let ticking = false
    const handleScroll = () => {
      if (ticking || !containerRef.current) return
      
      ticking = true
      requestAnimationFrame(() => {
        if (!containerRef.current) {
          ticking = false
          return
        }
        
        const sectionRect = containerRef.current.getBoundingClientRect()
        const sectionTop = sectionRect.top + window.scrollY
        const sectionBottom = sectionTop + sectionRect.height
        const viewportCenter = window.scrollY + window.innerHeight / 2
        
        const sectionProgress = Math.max(0, Math.min(1, 
          (viewportCenter - sectionTop) / Math.max(1, sectionBottom - sectionTop - window.innerHeight)
        ))
        
        // Only include years with actual data (total > 0)
        const availableYears = data
          .filter(d => {
            const total = d.public_total + d.for_profit_total + d.non_profit_total + d.unknown_total
            return total > 0
          })
          .map(d => d.year)
          .sort((a, b) => a - b)
        
        if (availableYears.length > 0) {
          const yearIndex = Math.floor(sectionProgress * (availableYears.length - 1))
          const year = availableYears[Math.max(0, Math.min(yearIndex, availableYears.length - 1))]
          setCurrentYear(year)
        }
        
        ticking = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isInView, data, setCurrentYear])

  const currentYearData = data.find(d => d.year === currentYear)
  
  if (!currentYearData) {
    return (
      <section 
        ref={containerRef}
        style={{ position: 'relative' }}
        className="min-h-[200vh] flex items-center justify-center px-4 sm:px-6 md:px-8 relative"
      >
        <p className="text-gray-500 font-light">Loading...</p>
      </section>
    )
  }
  
  const total = currentYearData.public_total + currentYearData.for_profit_total + currentYearData.non_profit_total + currentYearData.unknown_total

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount)
  }

  if (loading || !currentYearData) {
    return (
      <section 
        ref={containerRef}
        style={{ position: 'relative' }}
        className="min-h-[200vh] flex items-center justify-center px-4 sm:px-6 md:px-8 relative"
      >
        <p className="text-gray-500 font-light">Loading...</p>
      </section>
    )
  }

  const hasClassifiedData = currentYearData.public_total > 0 || currentYearData.for_profit_total > 0 || currentYearData.non_profit_total > 0
  const publicPercent = total > 0 ? (currentYearData.public_total / total) * 100 : 0
  const forProfitPercent = total > 0 ? (currentYearData.for_profit_total / total) * 100 : 0

  return (
    <section 
      ref={containerRef}
      style={{ position: 'relative' }}
      className="min-h-[200vh] flex items-center justify-center px-4 sm:px-6 md:px-8 relative bg-gradient-to-b from-white to-slate-50"
    >
      <motion.div 
        style={{ opacity }}
        className="max-w-6xl w-full space-y-12 md:space-y-16 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8 bg-white/95 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200/50"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900">
            The Shift Over Time
          </h2>
          
          {!hasClassifiedData && total > 0 ? (
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <p className="text-lg md:text-xl text-gray-600 font-light">
                Data for {currentYear} is available but vendors haven&apos;t been classified yet.
              </p>
              <p className="text-base md:text-lg text-gray-500 font-light">
                Total payments: {formatCurrency(total)}
              </p>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
            {/* Public bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm md:text-base text-gray-700 font-light">Public Institutions</span>
                <span className="text-lg md:text-xl font-light text-gray-900">{formatCurrency(currentYearData.public_total)}</span>
              </div>
              <div className="h-8 md:h-12 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${publicPercent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
              <p className="text-xs md:text-sm text-gray-500 mt-1 text-right">{publicPercent.toFixed(1)}%</p>
            </div>

            {/* For-profit bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm md:text-base text-gray-700 font-light">For-Profit Vendors</span>
                <span className="text-lg md:text-xl font-light text-red-600">{formatCurrency(currentYearData.for_profit_total)}</span>
              </div>
              <div className="h-8 md:h-12 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${forProfitPercent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  className="h-full bg-red-500 rounded-full"
                />
              </div>
              <p className="text-xs md:text-sm text-gray-500 mt-1 text-right">{forProfitPercent.toFixed(1)}%</p>
            </div>
          </div>
          )}

          <p className="text-sm md:text-base text-gray-500 font-light italic pt-4">
            Scroll to see how the mix changed from 2018 to 2024
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}
