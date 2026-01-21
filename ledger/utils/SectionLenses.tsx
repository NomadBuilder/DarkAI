'use client'

import { motion } from 'framer-motion'
import { useRef, useState, useEffect, useMemo } from 'react'
import { useLedgerStore } from '../store/ledgerStore'
import { getDataFile } from './dataPath'

const lenses = [
  {
    id: 'staffing' as const,
    title: 'Staffing Agencies',
    description: 'Temporary solutions became permanent spending.',
    color: 'text-red-600',
    hoverColor: 'hover:text-red-700',
    categoryKey: 'staffing',
  },
  {
    id: 'consulting' as const,
    title: 'Consulting & Outsourcing',
    description: 'Work that once lived inside the public system moved outside it.',
    color: 'text-orange-600',
    hoverColor: 'hover:text-orange-700',
    categoryKey: 'consulting',
  },
  {
    id: 'healthcare' as const,
    title: 'Healthcare Delivery',
    description: 'Delivery shifted, even when access stayed public on paper.',
    color: 'text-purple-600',
    hoverColor: 'hover:text-purple-700',
    categoryKey: 'healthcare_delivery',
  },
]

export default function SectionLenses() {
  const { activeLens, setActiveLens } = useLedgerStore()
  const lockedLensRef = useRef<string | null>(null)
  const [firstAppearances, setFirstAppearances] = useState<Record<string, number | null>>({})

  // Calculate first appearance year for each lens category
  useEffect(() => {
    const calculateFirstAppearances = async () => {
      try {
        const response = await fetch(getDataFile('vendors_master.json'))
        if (!response.ok) return
        const vendors = await response.json()
        
        const appearances: Record<string, number | null> = {}
        
        lenses.forEach(lens => {
          // Filter vendors by category
          const categoryVendors = vendors.filter((v: any) => {
            const category = v.category || v.service_category
            return category === lens.categoryKey
          })
          
          if (categoryVendors.length === 0) {
            appearances[lens.id] = null
            return
          }
          
          // Find the earliest year any vendor in this category was paid
          let firstYear: number | null = null
          categoryVendors.forEach((vendor: any) => {
            const payments = vendor.yearly_payments || {}
            const years = Object.keys(payments)
              .map(y => parseInt(y))
              .filter(y => !isNaN(y) && payments[y] > 0)
              .sort((a, b) => a - b)
            
            if (years.length > 0) {
              const vendorFirstYear = years[0]
              if (firstYear === null || vendorFirstYear < firstYear) {
                firstYear = vendorFirstYear
              }
            }
          })
          
          appearances[lens.id] = firstYear
        })
        
        setFirstAppearances(appearances)
      } catch (error) {
        console.error('Failed to calculate first appearances:', error)
      }
    }
    
    calculateFirstAppearances()
  }, [])

  return (
    <section className="flex items-center justify-center px-4 sm:px-6 md:px-8 bg-gradient-to-b from-white to-slate-50 py-12 sm:py-16 md:py-20">
      <div className="max-w-6xl w-full space-y-8 md:space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-4 md:mb-6">
              What are we looking at?
            </h2>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {lenses.map((lens, idx) => (
            <motion.div
              key={lens.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ 
                duration: 0.6, 
                delay: idx * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <div 
                className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => {
                  // Toggle lens: if already active, clear it; otherwise set it
                  const newLens = activeLens === lens.id ? null : lens.id
                  setActiveLens(newLens)
                  lockedLensRef.current = newLens
                }}
                onMouseEnter={() => {
                  // Only set on hover if no lens is locked
                  if (lockedLensRef.current === null) {
                    setActiveLens(lens.id)
                  }
                }}
                onMouseLeave={() => {
                  // Only clear on mouse leave if no lens is locked
                  if (lockedLensRef.current === null) {
                    setActiveLens(null)
                  }
                }}
              >
              <h3 className={`text-2xl sm:text-3xl md:text-4xl font-light mb-3 sm:mb-4 ${lens.color} ${lens.hoverColor} transition-colors`}>
                {lens.title}
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light leading-relaxed mb-3">
                {lens.description}
              </p>
              
              {/* First appearance indicator */}
              {firstAppearances[lens.id] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                      {lens.id === 'staffing' && (
                        <>Private <strong className="font-normal text-gray-900">staffing agencies</strong> first appear in the record in <strong className="font-normal text-gray-900">{firstAppearances[lens.id]}</strong>.</>
                      )}
                      {lens.id === 'consulting' && (
                        <>Payments to <strong className="font-normal text-gray-900">private consulting firms</strong> appear here for the first time in <strong className="font-normal text-gray-900">{firstAppearances[lens.id]}</strong>.</>
                      )}
                      {lens.id === 'healthcare' && (
                        <>Payments to <strong className="font-normal text-gray-900">private healthcare delivery</strong> providers first appear in <strong className="font-normal text-gray-900">{firstAppearances[lens.id]}</strong>.</>
                      )}
                    </p>
                  </div>
                  </div>
                </motion.div>
              )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
