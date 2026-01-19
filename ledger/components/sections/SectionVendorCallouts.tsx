'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Vendor {
  name: string
  firstYear: number
  firstAmount: number
  total: number
  category: string
  description: string
}

export default function SectionVendorCallouts() {
  const [vendors, setVendors] = useState<Vendor[]>([])

  useEffect(() => {
    // Load vendor data
    fetch('/data/processed/vendors_master.json')
      .then(r => r.json())
      .then(data => {
        // Find specific vendors that first appeared 2018+
        const targetVendors = [
          'Wcg International Consultants',
          'WCG International Consultants',
          'Omni Health Care',
          '0760444 Bc Ltd',
          'Southbridge',
          'Cvh (No.9)',
          'Crh Canada Group',
        ]

        const found: Vendor[] = []
        
        data.forEach((v: any) => {
          const name = v.name || ''
          const payments = v.yearly_payments || {}
          
          // Check if this vendor matches our targets
          const matches = targetVendors.some(target => 
            name.toLowerCase().includes(target.toLowerCase())
          )
          
          if (matches && v.type === 'for_profit') {
            const years = Object.keys(payments)
              .map(y => parseInt(y))
              .filter(y => !isNaN(y) && payments[y] > 0)
              .sort((a: number, b: number) => a - b)
            
            if (years.length > 0) {
              const firstYear = years[0]
              if (firstYear >= 2018) {
                found.push({
                  name: name,
                  firstYear: firstYear,
                  firstAmount: payments[String(firstYear)] || 0,
                  total: Object.values(payments).reduce((sum: number, val: any) => sum + (val || 0), 0),
                  category: v.category || 'other',
                  description: firstYear === 2018 
                    ? 'First appeared the year Doug Ford took office'
                    : `First appeared ${firstYear - 2018} years after Ford took office`,
                })
              }
            }
          }
        })

        // Sort by total amount
        found.sort((a, b) => b.total - a.total)
        setVendors(found.slice(0, 6))
      })
      .catch(err => console.error('Failed to load vendors:', err))
  }, [])

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
            Meet the Beneficiaries
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
            These companies didn&apos;t exist in Ontario&apos;s public accounts before 2018
          </p>
        </motion.div>

        {vendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {vendors.map((vendor, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 hover:border-red-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-2">
                      {vendor.name.length > 50 
                        ? vendor.name.substring(0, 50) + '...'
                        : vendor.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-light">
                        First: {vendor.firstYear}
                      </span>
                      {vendor.category && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-light capitalize">
                          {vendor.category.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-600 font-light">First payment:</span>
                    <span className="text-lg font-light text-gray-900">
                      {formatCurrency(vendor.firstAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-600 font-light">Total payments:</span>
                    <span className="text-xl font-light text-red-600">
                      {formatCurrency(vendor.total)}
                    </span>
                  </div>
                </div>
                
                <p className="text-xs md:text-sm text-gray-500 font-light mt-4 pt-4 border-t border-gray-100">
                  {vendor.description}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          // Fallback with known vendors if data doesn't load
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                name: 'WCG International Consultants',
                firstYear: 2020,
                firstAmount: 36588712,
                total: 402933493,
                category: 'consulting',
                description: 'First appeared 2 years after Ford took office',
              },
              {
                name: 'Omni Health Care Limited Partnership',
                firstYear: 2018,
                firstAmount: 71093266,
                total: 71093266,
                category: 'healthcare',
                description: 'First appeared the year Doug Ford took office',
              },
              {
                name: 'Southbridge Care Homes',
                firstYear: 2020,
                firstAmount: 30404735,
                total: 150868966,
                category: 'healthcare',
                description: 'First appeared 2 years after Ford took office',
              },
              {
                name: 'CRH Canada Group',
                firstYear: 2018,
                firstAmount: 220624304,
                total: 1333054583,
                category: 'other',
                description: 'First appeared the year Doug Ford took office',
              },
            ].map((vendor, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 hover:border-red-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-2">
                      {vendor.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-light">
                        First: {vendor.firstYear}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-light capitalize">
                        {vendor.category}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-600 font-light">First payment:</span>
                    <span className="text-lg font-light text-gray-900">
                      {new Intl.NumberFormat('en-CA', {
                        style: 'currency',
                        currency: 'CAD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                        notation: 'compact',
                        compactDisplay: 'short'
                      }).format(vendor.firstAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-600 font-light">Total payments:</span>
                    <span className="text-xl font-light text-red-600">
                      {new Intl.NumberFormat('en-CA', {
                        style: 'currency',
                        currency: 'CAD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                        notation: 'compact',
                        compactDisplay: 'short'
                      }).format(vendor.total)}
                    </span>
                  </div>
                </div>
                
                <p className="text-xs md:text-sm text-gray-500 font-light mt-4 pt-4 border-t border-gray-100">
                  {vendor.description}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Key Insight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 md:p-12 text-center"
        >
          <p className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-4">
            This wasn&apos;t announced.
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-light text-red-900">
            It was invoiced.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
