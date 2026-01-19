'use client'

import { motion } from 'framer-motion'

export default function SectionLongTermCare() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-gradient-to-b from-slate-50 to-white py-16 md:py-0">
      <div className="max-w-6xl w-full space-y-12 md:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
            Long-Term Care
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
            The Ford government&apos;s bed allocation decisions reveal a clear privatization agenda
          </p>
        </motion.div>

        {/* Key Stat */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 md:p-12 text-center"
        >
          <p className="text-5xl sm:text-6xl md:text-7xl font-light text-red-600 mb-4">
            The Pattern
          </p>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light">
            New long-term care beds overwhelmingly allocated to for-profit operators
          </p>
        </motion.div>

        {/* The Shift */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-8 md:space-y-12"
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 text-center">
            Bed Allocation Decisions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-blue-50 rounded-xl p-6 md:p-8 border border-blue-200">
              <h4 className="text-xl md:text-2xl font-light text-gray-900 mb-4">
                Public & Non-Profit
              </h4>
              <p className="text-sm md:text-base text-gray-600 font-light mb-4">
                Municipal and non-profit operators have historically provided the majority of long-term care
              </p>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <p className="text-xs md:text-sm text-gray-500 font-light mb-2">Before Ford</p>
                <p className="text-2xl md:text-3xl font-light text-blue-900">
                  Majority of beds
                </p>
              </div>
            </div>
            
            <div className="bg-red-50 rounded-xl p-6 md:p-8 border border-red-200">
              <h4 className="text-xl md:text-2xl font-light text-gray-900 mb-4">
                For-Profit Operators
              </h4>
              <p className="text-sm md:text-base text-gray-600 font-light mb-4">
                Under Ford, new bed allocations have shifted dramatically toward for-profit operators
              </p>
              <div className="bg-white rounded-lg p-4 border border-red-100">
                <p className="text-xs md:text-sm text-gray-500 font-light mb-2">Under Ford</p>
                <p className="text-2xl md:text-3xl font-light text-red-900">
                  Disproportionate share
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* The Impact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-slate-900 text-white rounded-2xl p-8 md:p-12"
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-center mb-8">
            Why This Matters
          </h3>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <span className="text-2xl">→</span>
              <div>
                <p className="text-lg md:text-xl font-light mb-2">
                  For-profit LTC homes have worse outcomes
                </p>
                <p className="text-sm md:text-base text-gray-300 font-light">
                  Higher mortality rates, lower staffing levels, more violations
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <span className="text-2xl">→</span>
              <div>
                <p className="text-lg md:text-xl font-light mb-2">
                  Public dollars flow to private profits
                </p>
                <p className="text-sm md:text-base text-gray-300 font-light">
                  Every new for-profit bed is a permanent commitment of public funding to private operators
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <span className="text-2xl">→</span>
              <div>
                <p className="text-lg md:text-xl font-light mb-2">
                  Capacity leaves the public system
                </p>
                <p className="text-sm md:text-base text-gray-300 font-light">
                  Once built, these beds are locked into the for-profit system for decades
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Source Link */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <a
            href="https://www.ontariohealthcoalition.ca/wp-content/uploads/Final-Ford-government-LTC-bed-allocations-report.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 md:px-8 py-3 md:py-4 bg-gray-900 text-white rounded-lg text-base md:text-lg font-light hover:bg-gray-800 transition-colors"
          >
            Read the Full LTC Bed Allocations Report →
          </a>
        </motion.div>
      </div>
    </section>
  )
}
