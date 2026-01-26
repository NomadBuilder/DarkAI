'use client'

import { motion } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { useLedgerStore } from '../../store/ledgerStore'

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
              Three Forms of Privatization
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light max-w-3xl mx-auto">
              How public dollars flow to private corporations
            </p>
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
                className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full flex flex-col"
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
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light leading-relaxed mb-3 flex-grow">
                {lens.description}
              </p>
              
              {/* Link to healthcare page for staffing and healthcare lenses */}
              {(lens.id === 'staffing' || lens.id === 'healthcare') ? (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    href="/healthcare"
                    className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-light underline transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Explore {lens.id === 'staffing' ? 'staffing' : 'healthcare'} impact →
                  </Link>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {/* Spacer to maintain consistent height */}
                </div>
              )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
