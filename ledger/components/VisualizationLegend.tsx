'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useLedgerStore } from '../store/ledgerStore'
import { useEffect, useState } from 'react'

interface SystemComposition {
  year: number
  public_total: number
  non_profit_total: number
  for_profit_total: number
  unknown_total: number
}

export default function VisualizationLegend() {
  const { currentYear } = useLedgerStore()
  const [composition, setComposition] = useState<SystemComposition | null>(null)

  useEffect(() => {
    let cancelled = false
    
    fetch('/data/processed/system_composition.json')
      .then(r => {
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`)
        }
        return r.json()
      })
      .then(data => {
        if (cancelled) return
        if (!data || !Array.isArray(data)) {
          console.warn('Invalid data format in VisualizationLegend')
          return
        }
        const yearData = data.find((d: SystemComposition) => d.year === currentYear)
        setComposition(yearData || null)
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load system composition in VisualizationLegend:', err)
        }
      })
    
    return () => {
      cancelled = true
    }
  }, [currentYear])

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

  if (!composition) return null

  const total = composition.public_total + composition.non_profit_total + composition.for_profit_total + composition.unknown_total
  const forProfitPercent = total > 0 ? (composition.for_profit_total / total * 100) : 0
  const publicPercent = total > 0 ? (composition.public_total / total * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-30 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-xl shadow-lg p-4 md:p-6 max-w-sm"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm md:text-base font-light text-gray-900 mb-3">
            What you&apos;re seeing
          </h3>
          <p className="text-xs md:text-sm text-gray-600 font-light leading-relaxed">
            This visualization shows how public spending shifted toward for-profit vendors over time. Click to navigate between years.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-xs md:text-sm font-light text-gray-700">Public</span>
                <span className="text-xs md:text-sm font-light text-gray-900">{formatCurrency(composition.public_total)}</span>
              </div>
              <div className="text-xs text-gray-500 font-light">{publicPercent.toFixed(1)}%</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-xs md:text-sm font-light text-gray-700">For-Profit</span>
                <span className="text-xs md:text-sm font-light text-red-600">{formatCurrency(composition.for_profit_total)}</span>
              </div>
              <div className="text-xs text-gray-500 font-light">{forProfitPercent.toFixed(1)}%</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-xs md:text-sm font-light text-gray-700">Non-Profit</span>
                <span className="text-xs md:text-sm font-light text-gray-900">{formatCurrency(composition.non_profit_total)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-400 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-xs md:text-sm font-light text-gray-700">Unclassified</span>
                <span className="text-xs md:text-sm font-light text-gray-900">{formatCurrency(composition.unknown_total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
