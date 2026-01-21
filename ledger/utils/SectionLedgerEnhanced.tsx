'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { useLedgerStore } from '../../store/ledgerStore'
import { getDataFile } from '../../utils/dataPath'

interface SystemComposition {
  year: number
  public_total: number
  non_profit_total: number
  for_profit_total: number
  unknown_total: number
}

export default function SectionLedgerEnhanced() {
  const containerRef = useRef<HTMLElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<SystemComposition[]>([])
  const [loading, setLoading] = useState(true)
  const [chartHeight, setChartHeight] = useState(300)
  
  const { scrollYProgress } = useScroll({
    target: containerRef as React.RefObject<HTMLElement>,
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
    
    const dataUrl = getDataFile('system_composition.json')
    console.log('Fetching data from:', dataUrl)
    
    fetch(dataUrl, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
      .then(r => {
        console.log('Response status:', r.status, r.statusText)
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`)
        return r.json()
      })
      .then(d => {
        clearTimeout(timeoutId)
        if (cancelled) return
        
        console.log('Data received:', d ? `${Array.isArray(d) ? d.length : 'not array'} items` : 'null')
        
        if (!d) {
          console.error('No data received in SectionLedgerEnhanced')
          setLoading(false)
          return
        }
        
        const sorted = Array.isArray(d) 
          ? d.sort((a: SystemComposition, b: SystemComposition) => a.year - b.year) 
          : []
        
        console.log('Sorted data:', sorted.length, 'items, years:', sorted.map((x: SystemComposition) => x.year))
        
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

  // Get 2018 and 2024 data for comparison
  const year2018 = availableData.find(d => d.year === 2018)
  const year2024 = availableData.find(d => d.year === 2024)

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

  if (!year2018 || !year2024) {
    return (
      <section 
        ref={containerRef}
        style={{ position: 'relative' }}
        className="min-h-[200vh] flex items-center justify-center px-4 sm:px-6 md:px-8 relative"
      >
        <p className="text-gray-500 font-light">Loading data...</p>
      </section>
    )
  }

  // Calculate totals and percentages for both years
  const total2018 = year2018.public_total + year2018.for_profit_total + year2018.non_profit_total + year2018.unknown_total
  const total2024 = year2024.public_total + year2024.for_profit_total + year2024.non_profit_total + year2024.unknown_total
  
  const publicPercent2018 = total2018 > 0 ? (year2018.public_total / total2018) * 100 : 0
  const forProfitPercent2018 = total2018 > 0 ? (year2018.for_profit_total / total2018) * 100 : 0
  const publicPercent2024 = total2024 > 0 ? (year2024.public_total / total2024) * 100 : 0
  const forProfitPercent2024 = total2024 > 0 ? (year2024.for_profit_total / total2024) * 100 : 0

  // Calculate changes from 2018 to 2024
  const publicChange = year2018.public_total > 0
    ? ((year2024.public_total - year2018.public_total) / year2018.public_total) * 100
    : 0
  const forProfitChange = year2018.for_profit_total > 0
    ? ((year2024.for_profit_total - year2018.for_profit_total) / year2018.for_profit_total) * 100
    : 0

  const hasClassifiedData = (year2024.public_total > 0 || year2024.for_profit_total > 0 || year2024.non_profit_total > 0)

  return (
    <section 
      ref={containerRef}
      style={{ position: 'relative' }}
      className="flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 relative bg-gradient-to-b from-white to-slate-50 py-12 sm:py-16 md:py-20"
    >
        <motion.div 
          style={{ opacity }}
        >
          <div className="max-w-6xl w-full space-y-6 md:space-y-8 px-3 sm:px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-8 md:space-y-10">
                <div className="text-center space-y-4 bg-white/95 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200/50">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-gray-900">
                    The Shift Over Time
                  </h2>
                  <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light">
                    2018 vs 2024
                  </p>
                </div>

                    {hasClassifiedData ? (
                  <div className="space-y-8 md:space-y-10 max-w-5xl mx-auto">
                    {/* Key metric - Private spending increase */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                    >
                      <div className="bg-white rounded-2xl p-6 md:p-10 border border-gray-200 text-center">
                        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-4 md:mb-6">
                          Private spending increased by
                        </p>
                        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-red-600 mb-3 md:mb-4">
                          {formatCurrency(year2024.for_profit_total - year2018.for_profit_total)}
                        </p>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light">
                          from 2018 to 2024
                        </p>
                      </div>
                    </motion.div>

                    {/* Detailed comparison - The Ledger */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-light text-gray-900 mb-4 md:mb-6 text-center">
                          The Ledger
                        </h3>
                        <div className="space-y-4 md:space-y-6">
                          {/* 2018 Row */}
                          <div className="border-b border-gray-200 pb-6">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-lg sm:text-xl md:text-2xl font-light text-gray-400">2018</span>
                              <span className="text-sm sm:text-base text-gray-500 font-light">Total: {formatCurrency(total2018)}</span>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm md:text-base text-gray-700 font-light">Public Institutions</span>
                                <span className="text-base md:text-lg font-light text-gray-900">{formatCurrency(year2018.public_total)}</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${publicPercent2018}%` }} />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm md:text-base text-gray-700 font-light">For-Profit Vendors</span>
                                <span className="text-base md:text-lg font-light text-red-600">{formatCurrency(year2018.for_profit_total)}</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full" style={{ width: `${forProfitPercent2018}%` }} />
                              </div>
                            </div>
                          </div>

                          {/* 2024 Row */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-lg sm:text-xl md:text-2xl font-light text-gray-900">2024</span>
                              <span className="text-sm sm:text-base text-gray-500 font-light">Total: {formatCurrency(total2024)}</span>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm md:text-base text-gray-700 font-light">Public Institutions</span>
                                  <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full ${
                                    publicChange > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {publicChange > 0 ? '+' : ''}{publicChange.toFixed(1)}%
                                  </span>
                                </div>
                                <span className="text-base md:text-lg font-light text-gray-900">{formatCurrency(year2024.public_total)}</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${publicPercent2024}%` }} />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm md:text-base text-gray-700 font-light">For-Profit Vendors</span>
                                  <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full ${
                                    forProfitChange > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {forProfitChange > 0 ? '+' : ''}{forProfitChange.toFixed(1)}%
                                  </span>
                                </div>
                                <span className="text-base md:text-lg font-light text-red-600">{formatCurrency(year2024.for_profit_total)}</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full" style={{ width: `${forProfitPercent2024}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

              {/* Enhanced trend chart - for-profit only */}
              <div className="pt-12 sm:pt-16 border-t border-gray-200">
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
                      const x = i * 150 + 75 + 80
                      return (
                        <circle
                          key={d.year}
                          cx={x}
                          cy={Math.max(0, Math.min(chartHeight, yForProfit))}
                          r="4"
                          fill="#ef4444"
                          stroke="white"
                          strokeWidth="1.5"
                          opacity="0.7"
                        />
                      )
                    })}
                    
                    {/* Year labels - positioned in SVG to align with data points */}
                    {availableData.map((d, i) => {
                      const x = i * 150 + 75 + 80
                      return (
                        <text
                          key={d.year}
                          x={x}
                          y={chartHeight + 15}
                          textAnchor="middle"
                          className="text-[11px] sm:text-xs md:text-sm fill-gray-400"
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
                      Data is available but vendors haven&apos;t been classified yet.
                    </p>
                  </div>
                )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
