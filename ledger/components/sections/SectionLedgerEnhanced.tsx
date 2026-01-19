'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { useLedgerStore } from '@/store/ledgerStore'

interface SystemComposition {
  year: number
  public_total: number
  non_profit_total: number
  for_profit_total: number
  unknown_total: number
}

export default function SectionLedgerEnhanced() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { currentYear, setCurrentYear, activeLens } = useLedgerStore()
  const [isInView, setIsInView] = useState(false)
  const [data, setData] = useState<SystemComposition[]>([])
  const [loading, setLoading] = useState(true)
  const [chartHeight, setChartHeight] = useState(300)
  const [firstAppearances, setFirstAppearances] = useState<Record<string, number | null>>({})
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  })

  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.3, 0.7, 0.9, 1], [0, 1, 1, 1, 1, 0])

  // Set chart height based on screen size
  useEffect(() => {
    const updateChartHeight = () => {
      const width = window.innerWidth
      if (width < 640) {
        setChartHeight(180) // Mobile
      } else if (width < 1024) {
        setChartHeight(250) // Tablet
      } else {
        setChartHeight(300) // Desktop
      }
    }
    updateChartHeight()
    window.addEventListener('resize', updateChartHeight)
    return () => window.removeEventListener('resize', updateChartHeight)
  }, [])

  // Load data
  useEffect(() => {
    let cancelled = false
    
    // Add timeout
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        console.warn('Data load timeout in SectionLedgerEnhanced')
        setLoading(false)
      }
    }, 10000) // 10 second timeout
    
    fetch('/data/processed/system_composition.json', {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => {
        clearTimeout(timeoutId)
        if (cancelled) return
        
        if (!d) {
          console.error('No data received in SectionLedgerEnhanced')
          setLoading(false)
          return
        }
        
        const sorted = Array.isArray(d) 
          ? d.sort((a: SystemComposition, b: SystemComposition) => a.year - b.year) 
          : []
        
        if (sorted.length === 0) {
          console.warn('Empty data array in SectionLedgerEnhanced')
        }
        
        setData(sorted)
        setLoading(false)
      })
      .catch((err) => {
        clearTimeout(timeoutId)
        if (cancelled) return
        console.error('Failed to load data in SectionLedgerEnhanced:', err)
        setLoading(false)
      })
    
    return () => { 
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [])

  // Filter to only 2018 and later (when Doug Ford took office) and years with classified data
  const availableData = useMemo(() => {
    return data
      .filter(d => {
      const total = d.public_total + d.for_profit_total + d.non_profit_total + d.unknown_total
      const hasClassifiedData = d.public_total > 0 || d.for_profit_total > 0 || d.non_profit_total > 0
        return d.year >= 2018 && total > 0 && hasClassifiedData
    })
      .sort((a, b) => a.year - b.year) // Ensure years are sorted ascending
  }, [data])

  // Calculate first appearance years for each category
  useEffect(() => {
    const calculateFirstAppearances = async () => {
      try {
        const response = await fetch('/data/processed/vendors_master.json')
        if (!response.ok) return
        const vendors = await response.json()
        
        const appearances: Record<string, number | null> = {
          staffing: null,
          consulting: null,
          healthcare: null,
        }
        
        // Find first appearance for each category
        const categories = [
          { key: 'staffing', id: 'staffing' },
          { key: 'consulting', id: 'consulting' },
          { key: 'healthcare_delivery', id: 'healthcare' },
        ]
        
        categories.forEach(({ key, id }) => {
          const categoryVendors = vendors.filter((v: any) => {
            const category = v.category || v.service_category
            return category === key
          })
          
          if (categoryVendors.length === 0) {
            appearances[id] = null
            return
          }
          
          let firstYear: number | null = null
          categoryVendors.forEach((vendor: any) => {
            const payments = vendor.yearly_payments || {}
            const years = Object.keys(payments)
              .map(y => parseInt(y))
              .filter(y => !isNaN(y) && y >= 2018 && payments[y] > 0)
              .sort((a, b) => a - b)
            
            if (years.length > 0) {
              const vendorFirstYear = years[0]
              if (firstYear === null || vendorFirstYear < firstYear) {
                firstYear = vendorFirstYear
              }
            }
          })
          
          appearances[id] = firstYear
        })
        
        setFirstAppearances(appearances)
      } catch (error) {
        console.error('Failed to calculate first appearances:', error)
      }
    }
    
    calculateFirstAppearances()
  }, [])

  // Track when section is in view and initialize to first year
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting)
          if (entry.isIntersecting && availableData.length > 0) {
            // Only set initial year if currentYear is not in availableData
            const currentYearInData = availableData.find(d => d.year === currentYear)
            if (!currentYearInData) {
              setCurrentYear(availableData[0].year)
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
  }, [availableData, setCurrentYear, currentYear])

  // Ensure currentYear is always valid - if not in availableData, set to first available
  useEffect(() => {
    if (availableData.length > 0) {
      const currentYearInData = availableData.find(d => d.year === currentYear)
      if (!currentYearInData) {
        setCurrentYear(availableData[0].year)
      }
    }
  }, [availableData, currentYear, setCurrentYear])

  // Navigation functions
  const goToNextYear = useCallback(() => {
    const currentIndex = availableData.findIndex(d => d.year === currentYear)
    if (currentIndex === -1) {
      // Current year not found, go to first
      if (availableData.length > 0) {
        setCurrentYear(availableData[0].year)
      }
      return
    }
    if (currentIndex < availableData.length - 1) {
      setCurrentYear(availableData[currentIndex + 1].year)
    }
  }, [availableData, currentYear, setCurrentYear])

  const goToPreviousYear = useCallback(() => {
    const currentIndex = availableData.findIndex(d => d.year === currentYear)
    if (currentIndex === -1) {
      // Current year not found, go to first
      if (availableData.length > 0) {
        setCurrentYear(availableData[0].year)
      }
      return
    }
    if (currentIndex > 0) {
      setCurrentYear(availableData[currentIndex - 1].year)
    }
  }, [availableData, currentYear, setCurrentYear])

  // Keyboard navigation - works when section is in view
  useEffect(() => {
    if (!isInView || availableData.length === 0) return

    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        goToNextYear()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        goToPreviousYear()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isInView, availableData, goToNextYear, goToPreviousYear])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount)
  }

  // Calculate trend line data for mini chart - use unified scale so magnitudes are accurate
  // MUST be before early returns to follow Rules of Hooks
  const maxForProfit = availableData.length > 0 && availableData.some(d => d.for_profit_total > 0)
    ? Math.max(...availableData.map(d => d.for_profit_total).filter(v => v > 0))
    : 1
  const maxPublic = availableData.length > 0 && availableData.some(d => d.public_total > 0)
    ? Math.max(...availableData.map(d => d.public_total).filter(v => v > 0))
    : 1
  // Use the maximum of both for a unified scale - this shows true relative magnitudes
  const maxValue = Math.max(maxPublic, maxForProfit)
  
  // Calculate y-axis tick values (5 ticks) - MUST be before early returns
  // Use maxForProfit for trend chart since it only shows for-profit data
  const yAxisTicks = useMemo(() => {
    if (maxForProfit <= 0) return []
    const ticks = []
    for (let i = 0; i <= 4; i++) {
      const value = (maxForProfit * i) / 4
      ticks.push(value)
    }
    return ticks
  }, [maxForProfit])

  if (loading || availableData.length === 0) {
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

  const currentYearData = availableData.find(d => d.year === currentYear)
  
  if (!currentYearData) {
    return (
      <section 
        ref={containerRef}
        style={{ position: 'relative' }}
        className="min-h-[200vh] flex items-center justify-center px-4 sm:px-6 md:px-8 relative"
      >
        <p className="text-gray-500 font-light">No data available for {currentYear}</p>
      </section>
    )
  }

  const previousYearData = availableData.find((d, i) => {
    const currentIndex = availableData.findIndex(x => x.year === currentYear)
    return currentIndex > 0 && i === currentIndex - 1
  })
  
  // Get baseline (2018 - when Ford took office)
  const baselineData = availableData.find(d => d.year === 2018)
  
  // Calculate percentages and changes from pre-computed data
  // All calculations are simple math operations on static JSON data
  // No AI, no external services, no dynamic recalculation - just display of pre-computed values
  const total = currentYearData.public_total + currentYearData.for_profit_total + currentYearData.non_profit_total + currentYearData.unknown_total
  const hasClassifiedData = currentYearData.public_total > 0 || currentYearData.for_profit_total > 0 || currentYearData.non_profit_total > 0
  const publicPercent = total > 0 ? (currentYearData.public_total / total) * 100 : 0
  const forProfitPercent = total > 0 ? (currentYearData.for_profit_total / total) * 100 : 0

  // Calculate year-over-year changes (simple percentage calculation)
  const forProfitChange = previousYearData && previousYearData.for_profit_total > 0
    ? ((currentYearData.for_profit_total - previousYearData.for_profit_total) / previousYearData.for_profit_total) * 100
    : null
  const publicChange = previousYearData && previousYearData.public_total > 0
    ? ((currentYearData.public_total - previousYearData.public_total) / previousYearData.public_total) * 100
    : null

  // Calculate growth since 2018 (baseline comparison)
  const forProfitGrowthSince2018 = baselineData && baselineData.for_profit_total > 0
    ? ((currentYearData.for_profit_total - baselineData.for_profit_total) / baselineData.for_profit_total) * 100
    : null
  const publicGrowthSince2018 = baselineData && baselineData.public_total > 0
    ? ((currentYearData.public_total - baselineData.public_total) / baselineData.public_total) * 100
    : null

  // Calculate growth rate ratio (how many times faster)
  const growthRateRatio = publicGrowthSince2018 && forProfitGrowthSince2018 && publicGrowthSince2018 > 0
    ? (forProfitGrowthSince2018 / publicGrowthSince2018).toFixed(1)
    : null

  // Calculate years since 2018
  const yearsSince2018 = currentYear - 2018

  // Calculate average annual growth rates
  const forProfitAnnualGrowth = forProfitGrowthSince2018 && yearsSince2018 > 0
    ? (forProfitGrowthSince2018 / yearsSince2018).toFixed(1)
    : null
  const publicAnnualGrowth = publicGrowthSince2018 && yearsSince2018 > 0
    ? (publicGrowthSince2018 / yearsSince2018).toFixed(1)
    : null

  // Calculate acceleration (compare recent growth to early growth)
  const earlyYears = availableData.filter(d => d.year >= 2018 && d.year <= 2020)
  const recentYears = availableData.filter(d => d.year >= 2021 && d.year <= currentYear)
  
  let forProfitAcceleration = null
  if (earlyYears.length >= 2 && recentYears.length >= 2) {
    const earlyGrowth = earlyYears[earlyYears.length - 1].for_profit_total - earlyYears[0].for_profit_total
    const recentGrowth = recentYears[recentYears.length - 1].for_profit_total - recentYears[0].for_profit_total
    const earlyPeriod = earlyYears[earlyYears.length - 1].year - earlyYears[0].year
    const recentPeriod = recentYears[recentYears.length - 1].year - recentYears[0].year
    
    if (earlyPeriod > 0 && recentPeriod > 0 && earlyYears[0].for_profit_total > 0) {
      const earlyRate = (earlyGrowth / earlyYears[0].for_profit_total) / earlyPeriod
      const recentRate = (recentGrowth / recentYears[0].for_profit_total) / recentPeriod
      if (earlyRate > 0) {
        forProfitAcceleration = ((recentRate / earlyRate) - 1) * 100
      }
    }
  }

    return (
      <section 
        ref={containerRef}
      style={{ position: 'relative' }}
        className="min-h-[150vh] sm:min-h-[180vh] md:min-h-[200vh] flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 relative bg-gradient-to-b from-white to-slate-50 py-12 sm:py-16 md:py-24"
      >
        <motion.div 
          style={{ opacity }}
          className="max-w-6xl w-full space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-12 px-3 sm:px-4 md:px-6"
        >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 sm:space-y-8 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-xl border border-gray-200/50 cursor-pointer"
          onClick={(e) => {
            // Only navigate if clicking on the card itself, not on buttons
            if ((e.target as HTMLElement).closest('button')) return
            goToNextYear()
          }}
        >
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-gray-900">
              The Shift Over Time
            </h2>
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPreviousYear()
                }}
                disabled={availableData.findIndex(d => d.year === currentYear) === 0}
                className="p-2 sm:p-3 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                aria-label="Previous year"
                title="Previous year (←)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-600 font-light min-w-[70px] sm:min-w-[80px] md:min-w-[100px] text-center">
                {currentYear}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNextYear()
                }}
                disabled={availableData.findIndex(d => d.year === currentYear) === availableData.length - 1}
                className="p-2 sm:p-3 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                aria-label="Next year"
                title="Next year (→)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-light">
              {availableData.findIndex(d => d.year === currentYear) + 1} of {availableData.length}
            </p>
          </div>

          {/* First appearance indicator */}
          {activeLens && firstAppearances[activeLens] === currentYear && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-2xl mb-4 sm:mb-6"
            >
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm sm:text-base md:text-lg font-light text-red-900 leading-relaxed">
                      {activeLens === 'staffing' && (
                        <>Private <strong className="font-normal">staffing agencies</strong> first appear in the record in <strong className="font-normal">{currentYear}</strong>.</>
                      )}
                      {activeLens === 'consulting' && (
                        <>Payments to <strong className="font-normal">private consulting firms</strong> appear here for the first time in <strong className="font-normal">{currentYear}</strong>.</>
                      )}
                      {activeLens === 'healthcare' && (
                        <>Payments to <strong className="font-normal">private healthcare delivery</strong> providers first appear in <strong className="font-normal">{currentYear}</strong>.</>
                      )}
                    </p>
                    <p className="text-xs sm:text-sm text-red-700 font-light mt-2 italic">
                      This wasn&apos;t always normal.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {hasClassifiedData ? (
            <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
              {/* Main bars */}
              <div className="space-y-4 sm:space-y-6">
                {/* Public bar */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="text-xs sm:text-sm md:text-base text-gray-700 font-light">Public Institutions</span>
                      {publicChange !== null && (
                        <span className={`text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 sm:py-0.5 rounded-full whitespace-nowrap ${
                          publicChange > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {publicChange > 0 ? '+' : ''}{publicChange.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <span className="text-base sm:text-lg md:text-xl font-light text-gray-900">{formatCurrency(currentYearData.public_total)}</span>
                  </div>
                  <div className="h-8 sm:h-10 md:h-12 lg:h-14 bg-gray-100 rounded-full overflow-hidden relative">
                    <motion.div
                      key={currentYear}
                      initial={{ width: 0 }}
                      animate={{ width: `${publicPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 mt-1 text-right">{publicPercent.toFixed(1)}% of total</p>
                </div>

                {/* For-profit bar */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="text-xs sm:text-sm md:text-base text-gray-700 font-light">For-Profit Vendors</span>
                      {forProfitChange !== null && (
                        <span className={`text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 sm:py-0.5 rounded-full whitespace-nowrap ${
                          forProfitChange > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {forProfitChange > 0 ? '+' : ''}{forProfitChange.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <span className="text-base sm:text-lg md:text-xl font-light text-red-600">{formatCurrency(currentYearData.for_profit_total)}</span>
                  </div>
                  <div className="h-8 sm:h-10 md:h-12 lg:h-14 bg-gray-100 rounded-full overflow-hidden relative">
                    <motion.div
                      key={currentYear}
                      initial={{ width: 0 }}
                      animate={{ width: `${forProfitPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                      className="h-full bg-red-500 rounded-full"
                    />
                  </div>
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 mt-1 text-right">{forProfitPercent.toFixed(1)}% of total</p>
                </div>
              </div>

              {/* Baseline comparison and insights */}
              {baselineData && currentYear > 2018 && (
                <div className="pt-4 sm:pt-6 border-t border-gray-200 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Growth since 2018 */}
                    <div className="bg-blue-50 rounded-lg p-4 sm:p-5 border border-blue-100">
                      <p className="text-xs sm:text-sm text-blue-700 font-light mb-2">Public growth since 2018</p>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-light text-blue-900">
                        {publicGrowthSince2018 !== null ? `+${publicGrowthSince2018.toFixed(1)}%` : '—'}
                      </p>
                      {publicAnnualGrowth && (
                        <p className="text-xs sm:text-sm text-blue-600 font-light mt-1">
                          {publicAnnualGrowth}% per year on average
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4 sm:p-5 border border-red-100">
                      <p className="text-xs sm:text-sm text-red-700 font-light mb-2">For-profit growth since 2018</p>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-light text-red-900">
                        {forProfitGrowthSince2018 !== null ? `+${forProfitGrowthSince2018.toFixed(1)}%` : '—'}
                      </p>
                      {forProfitAnnualGrowth && (
                        <p className="text-xs sm:text-sm text-red-600 font-light mt-1">
                          {forProfitAnnualGrowth}% per year on average
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Key insights */}
                  <div className="space-y-3 sm:space-4">
                    {growthRateRatio && parseFloat(growthRateRatio) > 1 && (
                      <div className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200">
                        <p className="text-sm sm:text-base md:text-lg text-gray-900 font-light leading-relaxed">
                          <span className="font-normal">For-profit spending has grown <strong className="text-red-600">{growthRateRatio}x faster</strong> than public funding since 2018.</span>
                          {forProfitGrowthSince2018 && publicGrowthSince2018 && (
                            <span className="block mt-2 text-xs sm:text-sm text-gray-600">
                              From {formatCurrency(baselineData.for_profit_total)} to {formatCurrency(currentYearData.for_profit_total)} 
                              ({formatCurrency(currentYearData.for_profit_total - baselineData.for_profit_total)} increase)
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Acceleration indicator */}
                    {forProfitAcceleration !== null && forProfitAcceleration > 0 && (
                      <div className="bg-red-50 rounded-lg p-4 sm:p-5 border border-red-100">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                          </svg>
                          <div>
                            <p className="text-xs sm:text-sm text-red-700 font-light mb-1">Growth is accelerating</p>
                            <p className="text-sm sm:text-base text-red-900 font-light">
                              Recent growth rate is <strong className="font-normal">{forProfitAcceleration.toFixed(0)}% faster</strong> than the early Ford era (2018-2020).
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Share shift indicator */}
                    {baselineData && (
                      <div className="bg-slate-50 rounded-lg p-4 sm:p-5 border border-slate-200">
                        <p className="text-xs sm:text-sm text-slate-700 font-light mb-2">Share of classified spending</p>
                        <div className="flex items-center gap-4 sm:gap-6 text-sm sm:text-base">
                          <div className="flex-1">
                            <p className="text-slate-600 font-light">2018</p>
                            <p className="text-slate-900 font-light">
                              For-profit: {baselineData.for_profit_total + baselineData.public_total > 0 
                                ? ((baselineData.for_profit_total / (baselineData.for_profit_total + baselineData.public_total)) * 100).toFixed(1)
                                : '0'}%
                            </p>
                          </div>
                          <div className="text-slate-400">→</div>
                          <div className="flex-1">
                            <p className="text-slate-600 font-light">{currentYear}</p>
                            <p className="text-slate-900 font-light">
                              For-profit: {forProfitPercent.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enhanced trend chart - for-profit only */}
              <div className="pt-6 sm:pt-8 border-t border-gray-200">
                <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light mb-4 sm:mb-6">Trend over time</p>
                <div className="relative w-full overflow-x-auto" style={{ height: `${chartHeight + 40}px` }}>
                  <svg className="w-full h-full block min-w-full" viewBox={`0 0 ${availableData.length * 150 + 80} ${chartHeight + 40}`} preserveAspectRatio="xMidYMid meet">
                    {/* Y-axis labels - using for-profit scale for better visibility */}
                    {yAxisTicks.map((value, idx) => {
                      const y = chartHeight - (value / maxForProfit) * chartHeight * 0.8
                      const formattedValue = new Intl.NumberFormat('en-CA', {
                        style: 'currency',
                        currency: 'CAD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                        notation: 'compact',
                        compactDisplay: 'short'
                      }).format(value)
                      return (
                        <g key={idx}>
                      <line
                            x1="70"
                            y1={y}
                            x2={availableData.length * 150 + 10}
                            y2={y}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                          <text
                            x="65"
                            y={y + 4}
                            textAnchor="end"
                            className="text-[10px] sm:text-[11px] md:text-xs fill-gray-500"
                          >
                            {formattedValue}
                          </text>
                        </g>
                      )
                    })}
                    
                    {/* Area fill for for-profit only */}
                    {availableData.length > 0 && maxForProfit > 0 && (
                      <polygon
                        points={`${availableData.map((d, i) => {
                          const y = chartHeight - (d.for_profit_total / maxForProfit) * chartHeight * 0.8
                          return `${i * 150 + 75 + 80},${Math.max(0, Math.min(chartHeight, y))}`
                        }).join(' ')} ${availableData.length * 150 - 75 + 80},${chartHeight} ${75 + 80},${chartHeight}`}
                        fill="url(#forProfitGradient)"
                        opacity="0.2"
                      />
                    )}
                    
                    {/* Gradients */}
                    <defs>
                      <linearGradient id="forProfitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* For-profit trend line only */}
                    {availableData.length > 0 && maxForProfit > 0 && (
                      <polyline
                        points={availableData.map((d, i) => {
                          const y = chartHeight - (d.for_profit_total / maxForProfit) * chartHeight * 0.8
                          return `${i * 150 + 75 + 80},${Math.max(0, Math.min(chartHeight, y))}`
                        }).join(' ')}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    
                    {/* Data point markers for for-profit only */}
                    {availableData.length > 0 && maxForProfit > 0 && availableData.map((d, i) => {
                      const yForProfit = chartHeight - (d.for_profit_total / maxForProfit) * chartHeight * 0.8
                      const isCurrent = d.year === currentYear
                      const x = i * 150 + 75 + 80
                      return (
                        <g key={d.year}>
                          {/* Invisible larger hit area for easier clicking */}
                          <circle
                            cx={x}
                            cy={Math.max(0, Math.min(chartHeight, yForProfit))}
                            r="12"
                            fill="transparent"
                            onClick={() => setCurrentYear(d.year)}
                            style={{ cursor: 'pointer' }}
                          />
                          {/* Visible data point */}
                          <circle
                            cx={x}
                            cy={Math.max(0, Math.min(chartHeight, yForProfit))}
                            r={isCurrent ? "6" : "4"}
                            fill="#ef4444"
                            stroke="white"
                            strokeWidth={isCurrent ? "2.5" : "1.5"}
                            opacity={isCurrent ? 1 : 0.7}
                            onClick={() => setCurrentYear(d.year)}
                            style={{ cursor: 'pointer' }}
                          />
                        </g>
                      )
                    })}
                    
                    {/* Year labels - positioned in SVG to align with data points */}
                    {availableData.map((d, i) => {
                      const x = i * 150 + 75 + 80
                      const isCurrent = d.year === currentYear
                      return (
                        <text
                          key={d.year}
                          x={x}
                          y={chartHeight + 15}
                          textAnchor="middle"
                          className={`text-[11px] sm:text-xs md:text-sm ${isCurrent ? 'font-semibold fill-gray-900' : 'fill-gray-400'} hover:fill-gray-600`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setCurrentYear(d.year)}
                        >
                          {d.year}
                        </text>
                      )
                    })}
                    </svg>
                </div>
                
                {/* Legend - for-profit only */}
                <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2 sm:w-3 h-0.5 bg-red-500"></div>
                    <span>For-Profit</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 font-light">
                Data for {currentYear} is available but vendors haven&apos;t been classified yet.
              </p>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-500 font-light">
                Total payments: {formatCurrency(total)}
              </p>
            </div>
          )}

          <p className="text-xs sm:text-sm md:text-base text-gray-500 font-light italic pt-3 sm:pt-4">
            Use the arrow buttons or keyboard (← →) to navigate through {availableData[0]?.year} to {availableData[availableData.length - 1]?.year}
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}
