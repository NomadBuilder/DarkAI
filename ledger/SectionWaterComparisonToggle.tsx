'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const governmentClaims = [
  {
    claim: 'Bill 60 modernizes infrastructure and provides new financing tools',
    reality: 'It enables corporate delivery of water services, weakening direct municipal control and removing democratic accountability',
  },
  {
    claim: 'It doesn\'t privatize water; providers remain overseen by government',
    reality: 'Corporations formed under Business Corporations Act with powers to set rates, issue shares, and collect fees create a framework for commercialization and profit extraction',
  },
  {
    claim: 'Details will be defined in regulations rather than statute',
    reality: 'Uncertainty increases risk of pro-profit outcomes and fewer legal safeguards for affordability and public accountability. Regulations can be changed without legislative debate',
  },
  {
    claim: 'This provides flexibility and efficiency',
    reality: 'The corporate model enables profit incentives and reduced public accountability, opening the door to full privatization',
  },
  {
    claim: 'Municipalities will benefit from new governance models',
    reality: 'Municipalities lose direct control. Once designated, they must deliver water exclusively through corporations and can no longer operate systems directly',
  },
]

export default function SectionWaterComparisonToggle() {
  const [showReality, setShowReality] = useState(false)

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white py-24 md:py-32">
      <div className="max-w-6xl w-full space-y-12 md:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
              Government Claims vs. Reality
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
              Toggle to see what the government says versus what the law actually does
            </p>
          </div>
        </motion.div>

        {/* Toggle Switch */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="bg-white rounded-full p-2 border-2 border-gray-300 shadow-lg inline-flex items-center gap-2">
            <button
              onClick={() => setShowReality(false)}
              className={`px-6 md:px-8 py-3 md:py-4 rounded-full text-sm md:text-base font-light transition-all duration-300 ${
                !showReality
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Government Says
            </button>
            <button
              onClick={() => setShowReality(true)}
              className={`px-6 md:px-8 py-3 md:py-4 rounded-full text-sm md:text-base font-light transition-all duration-300 ${
                showReality
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Reality
            </button>
          </div>
        </motion.div>

        {/* Content Cards */}
        <div className="space-y-6 md:space-y-8">
          <AnimatePresence mode="wait">
            {governmentClaims.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div
                  className={`rounded-2xl p-6 md:p-8 border-2 transition-all duration-300 ${
                    showReality
                      ? 'bg-red-50 border-red-400'
                      : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-light text-lg md:text-xl ${
                        showReality ? 'bg-red-600' : 'bg-blue-600'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <motion.p
                        key={showReality ? 'reality' : 'claim'}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`text-base md:text-lg font-light leading-relaxed ${
                          showReality ? 'text-red-900' : 'text-blue-900'
                        }`}
                      >
                        {showReality ? item.reality : item.claim}
                      </motion.p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12 text-center">
            <p className="text-2xl sm:text-3xl md:text-4xl font-light mb-6">
              The Pattern Is Clear
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-light text-gray-300 leading-relaxed max-w-4xl mx-auto">
              Bill 60&apos;s language doesn&apos;t explicitly say &quot;privatize,&quot; but it creates the legal framework for corporations — structured like private companies — to take control of water services. The government&apos;s claims don&apos;t match what the law actually enables.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
