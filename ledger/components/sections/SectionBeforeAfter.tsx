'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getDataFile } from '../../utils/dataPath'

interface SystemComposition {
  year: number
  public_total: number
  for_profit_total: number
}

export default function SectionBeforeAfter() {
  const [data, setData] = useState<SystemComposition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(getDataFile('system_composition.json'))
      .then(r => r.json())
      .then(d => {
        const sorted = d.sort((a: SystemComposition, b: SystemComposition) => a.year - b.year)
        setData(sorted)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || data.length === 0) {
    return null
  }

  // Calculate baseline: use 2018 (first Ford year), skip 2019 if it has $0 data
  const validData = data.filter(d => d.public_total > 0 && d.for_profit_total > 0)
  const baselineYear = validData.find(d => d.year >= 2018) || data[0]
  const currentYear = data[data.length - 1]

  const forProfitBaseline = baselineYear.for_profit_total
  const forProfitCurrent = currentYear.for_profit_total
  const forProfitGrowth = forProfitBaseline > 0 
    ? ((forProfitCurrent - forProfitBaseline) / forProfitBaseline) * 100 
    : 0

  const publicBaseline = baselineYear.public_total
  const publicCurrent = currentYear.public_total
  const publicGrowth = publicBaseline > 0
    ? ((publicCurrent - publicBaseline) / publicBaseline) * 100
    : 0

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

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-gradient-to-b from-white to-slate-50 py-16 md:py-0">
      <div className="max-w-6xl w-full space-y-12 md:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
            Before & After
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
            What changed when Doug Ford took office
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-8 md:p-12"
          >
            <div className="text-center mb-6">
              <p className="text-3xl md:text-4xl font-light text-blue-600 mb-2">
                {baselineYear.year}
              </p>
              <p className="text-lg md:text-xl text-gray-700 font-light">
                Before Ford
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-gray-600 font-light mb-1">Public</p>
                <p className="text-2xl md:text-3xl font-light text-gray-900">
                  {formatCurrency(publicBaseline)}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-gray-600 font-light mb-1">For-Profit</p>
                <p className="text-2xl md:text-3xl font-light text-gray-900">
                  {formatCurrency(forProfitBaseline)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 md:p-12"
          >
            <div className="text-center mb-6">
              <p className="text-3xl md:text-4xl font-light text-red-600 mb-2">
                {currentYear.year}
              </p>
              <p className="text-lg md:text-xl text-gray-700 font-light">
                After Ford
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-red-100">
                <p className="text-sm text-gray-600 font-light mb-1">Public</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl md:text-3xl font-light text-gray-900">
                    {formatCurrency(publicCurrent)}
                  </p>
                  <span className="text-sm text-blue-600 font-light">
                    +{publicGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border-2 border-red-400">
                <p className="text-sm text-gray-600 font-light mb-1">For-Profit</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl md:text-3xl font-light text-red-600">
                    {formatCurrency(forProfitCurrent)}
                  </p>
                  <span className="text-lg text-red-600 font-light">
                    +{forProfitGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* The Change */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-slate-900 text-white rounded-2xl p-8 md:p-12"
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-center mb-8">
            The Change
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-light text-red-400 mb-2">
                {formatCurrency(forProfitCurrent - forProfitBaseline)}
              </p>
              <p className="text-sm md:text-base text-gray-300 font-light">
                Additional for-profit spending
              </p>
              <p className="text-xs text-gray-400 font-light mt-2">
                Since {baselineYear.year}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-light text-red-400 mb-2">
                {forProfitGrowth > publicGrowth 
                  ? `${((forProfitGrowth / publicGrowth) - 1).toFixed(1)}x`
                  : `${(forProfitGrowth / publicGrowth).toFixed(2)}x`
                }
              </p>
              <p className="text-sm md:text-base text-gray-300 font-light">
                Faster growth than public funding
              </p>
              <p className="text-xs text-gray-400 font-light mt-2">
                For-profit: {forProfitGrowth.toFixed(1)}% vs Public: {publicGrowth.toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Key Insight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-red-50 border-2 border-red-400 rounded-2xl p-8 md:p-12 text-center"
        >
          <p className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-4">
            This shift wasn&apos;t gradual.
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-light text-red-900">
            It accelerated the moment Ford took office.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
