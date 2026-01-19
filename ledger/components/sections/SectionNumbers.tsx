'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getDataFile } from '../../utils/dataPath'

interface SystemComposition {
  year: number
  public_total: number
  non_profit_total: number
  for_profit_total: number
  unknown_total: number
}

export default function SectionNumbers() {
  const [data, setData] = useState<SystemComposition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    
    // Add timeout
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        console.warn('Data load timeout')
        setLoading(false)
      }
    }, 10000) // 10 second timeout
    
    fetch(getDataFile('system_composition.json'), {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
      .then(r => {
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`)
        }
        return r.json()
      })
      .then(d => {
        clearTimeout(timeoutId)
        if (cancelled) return
        
        if (!d) {
          console.error('No data received')
          setLoading(false)
          return
        }
        
        const sorted = Array.isArray(d) 
          ? d.sort((a: SystemComposition, b: SystemComposition) => a.year - b.year) 
          : []
        
        if (sorted.length === 0) {
          console.warn('Empty data array')
        }
        
        setData(sorted)
        setLoading(false)
      })
      .catch((err) => {
        clearTimeout(timeoutId)
        if (cancelled) return
        console.error('Failed to load system composition:', err)
        setLoading(false)
      })
    
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [])

  if (loading || data.length === 0) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white py-16 md:py-0">
        <div className="text-center">
          <p className="text-gray-500 font-light">Loading data...</p>
        </div>
      </section>
    )
  }

  // Filter to only 2018 and later (when Doug Ford took office)
  const fordEraData = data.filter(d => d.year >= 2018)
  
  if (fordEraData.length === 0) {
    return null
  }
  
  const first = fordEraData[0]
  const last = fordEraData[fordEraData.length - 1]
  
  if (!first || !last || !first.for_profit_total || !last.for_profit_total) {
    return null
  }
  
  // Calculate growth percentages from pre-computed data
  // Formula: ((new / old) - 1) * 100
  // These are simple mathematical operations on static data - no AI or external services
  // Data is pre-computed in process_data.py and loaded from JSON
  const forProfitGrowth = ((last.for_profit_total / first.for_profit_total) - 1) * 100
  const publicGrowth = first.public_total > 0 ? ((last.public_total / first.public_total) - 1) * 100 : 0
  // Calculate ratio: how many times faster for-profit grew compared to public
  const growthRatio = publicGrowth > 0 ? (forProfitGrowth / publicGrowth).toFixed(1) : '∞'

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount)
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white py-16 md:py-0">
      <div className="max-w-6xl w-full space-y-12 md:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-red-600 mb-8 md:mb-12 leading-tight">
            Then Doug Ford showed up.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
            The Numbers
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* 2018 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-200"
          >
            <div className="text-3xl md:text-4xl font-light text-gray-400 mb-4">2018</div>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm md:text-base text-gray-600">Public</span>
                <span className="text-xl md:text-2xl font-light text-gray-900">{formatCurrency(first.public_total)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm md:text-base text-gray-600">For-Profit</span>
                <span className="text-xl md:text-2xl font-light text-red-600">{formatCurrency(first.for_profit_total)}</span>
              </div>
            </div>
          </motion.div>

          {/* 2024 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-200"
          >
            <div className="text-3xl md:text-4xl font-light text-gray-400 mb-4">2024</div>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm md:text-base text-gray-600">Public</span>
                <span className="text-xl md:text-2xl font-light text-gray-900">{formatCurrency(last.public_total)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm md:text-base text-gray-600">For-Profit</span>
                <span className="text-xl md:text-2xl font-light text-red-600">{formatCurrency(last.for_profit_total)}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Key Stat */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center bg-red-50 border border-red-200 rounded-2xl p-8 md:p-12"
        >
          <p className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-red-600 mb-4">
            +{forProfitGrowth.toFixed(1)}%
          </p>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light">
            For-profit payments grew <strong className="font-normal">{growthRatio}</strong>x faster than public funding
          </p>
          <p className="text-xs sm:text-sm text-gray-500 font-light mt-4 italic">
            Based on corrected data (payment processors and misclassified public institutions excluded)
          </p>
        </motion.div>

        {/* Simple comparison */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center space-y-4"
        >
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light">
            From <span className="text-gray-900">{formatCurrency(first.for_profit_total)}</span> to <span className="text-red-600">{formatCurrency(last.for_profit_total)}</span>
          </p>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 font-light">
            In six years, for-profit vendor payments increased by <strong className="font-normal text-gray-700">{formatCurrency(last.for_profit_total - first.for_profit_total)}</strong>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
