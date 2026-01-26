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
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}: ${r.statusText}`)
        }
        return r.json()
      })
      .then(d => {
        clearTimeout(timeoutId)
        if (cancelled) return
        
        console.log('Data received:', d ? `${Array.isArray(d) ? d.length : 'not array'} items` : 'null')
        
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
          setLoading(false)
          return
        }
        
        console.log('Setting data, sorted length:', sorted.length, 'years:', sorted.map((x: SystemComposition) => x.year))
        // Set both states together - React will batch them
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

  // Debug: log current state
  if (loading || data.length === 0) {
    console.log('Still loading - loading:', loading, 'data.length:', data.length)
    return (
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white py-24 md:py-0">
        <div className="text-center">
          <p className="text-gray-500 font-light">Loading data...</p>
        </div>
      </section>
    )
  }
  
  console.log('Rendering content - data.length:', data.length, 'loading:', loading)

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

  // Calculate percentages for each year
  const firstTotal = first.public_total + first.for_profit_total + first.non_profit_total + first.unknown_total
  const lastTotal = last.public_total + last.for_profit_total + last.non_profit_total + last.unknown_total
  
  const firstPublicPercent = firstTotal > 0 ? (first.public_total / firstTotal) * 100 : 0
  const firstForProfitPercent = firstTotal > 0 ? (first.for_profit_total / firstTotal) * 100 : 0
  const lastPublicPercent = lastTotal > 0 ? (last.public_total / lastTotal) * 100 : 0
  const lastForProfitPercent = lastTotal > 0 ? (last.for_profit_total / lastTotal) * 100 : 0

  return (
    <>
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white py-24 md:py-0">
      <div className="max-w-6xl w-full space-y-12 md:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-red-600 mb-8 md:mb-12 leading-tight">
              Then Doug Ford showed up.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
              The Numbers
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Public Growth */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-slate-50 rounded-2xl p-8 md:p-12 border border-slate-200">
            <div className="text-3xl md:text-4xl font-light text-gray-400 mb-4">Public Funding</div>
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-light text-gray-900 mb-2">
                +{publicGrowth.toFixed(1)}%
              </div>
              <p className="text-sm md:text-base text-gray-600 font-light">
                Growth from 2018 to 2024
              </p>
            </div>
            </div>
          </motion.div>

          {/* For-Profit Growth */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-red-50 rounded-2xl p-8 md:p-12 border border-red-200">
            <div className="text-3xl md:text-4xl font-light text-red-400 mb-4">For-Profit Payments</div>
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-light text-red-600 mb-2">
                +{forProfitGrowth.toFixed(1)}%
              </div>
              <p className="text-sm md:text-base text-gray-600 font-light">
                Growth from 2018 to 2024
              </p>
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
        >
          <div className="text-center bg-red-50 border border-red-200 rounded-2xl p-8 md:p-12">
          <p className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-red-600 mb-4">
            +{forProfitGrowth.toFixed(1)}%
          </p>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light">
            For-profit payments grew <strong className="font-normal">{growthRatio}</strong>x faster than public funding
          </p>
          <p className="text-xs sm:text-sm text-gray-500 font-light mt-4 italic">
            Based on corrected data (payment processors and misclassified public institutions excluded)
          </p>
          </div>
        </motion.div>

      </div>
    </section>

    {/* Sovereignty Quote Section */}
    <section className="py-20 sm:py-28 md:py-36 lg:py-44 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-gray-900 font-semibold leading-tight">
            Sovereignty in words.<br />
            <span className="text-red-600 font-bold">Americanization</span> in practice.
          </p>
        </motion.div>
      </div>
    </section>
    </>
  )
}
