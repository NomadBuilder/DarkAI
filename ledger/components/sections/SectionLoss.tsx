'use client'

import { motion } from 'framer-motion'

const statements = [
  "Every dollar here is a dollar not strengthening public capacity.",
  "Once capacity leaves the public system, it doesn't quietly return.",
  "This wasn't announced.",
  "It was invoiced.",
]

export default function SectionLoss() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-slate-900 text-white py-12 md:py-16 pb-24 md:pb-32">
      <div className="max-w-5xl w-full space-y-16 md:space-y-24">
        {statements.map((statement, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ 
              duration: 1, 
              delay: idx * 0.3,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="text-center"
          >
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light leading-tight px-4">
              {statement}
            </p>
          </motion.div>
        ))}
        
        {/* Hospital Crisis Stat */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center bg-red-900/30 rounded-2xl p-6 md:p-8 border border-red-700/50"
        >
          <p className="text-3xl sm:text-4xl md:text-5xl font-light mb-2">
            66 of 134 hospitals
          </p>
          <p className="text-lg sm:text-xl md:text-2xl font-light text-gray-300">
            had budget deficits in 2023-24
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center space-y-6 md:space-y-8"
        >
          <div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 md:mb-8">
              What We Need
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto mb-8">
              {[
                'Fund hospitals properly — $2B annually',
                'Ban for-profit staffing agencies',
                'Restore public capacity',
                'End hallway medicine',
              ].map((action, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 1.4 + idx * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-left"
                >
                  <p className="text-base sm:text-lg md:text-xl font-light">{action}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                // Add your petition link here
                window.open('https://example.com/petition', '_blank')
              }}
              className="inline-block px-6 sm:px-8 md:px-12 lg:px-16 py-4 sm:py-5 md:py-6 bg-white text-slate-900 text-base sm:text-lg md:text-xl lg:text-2xl font-light rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl active:scale-95 touch-manipulation min-h-[48px] sm:min-h-0 text-center"
            >
              Demand Change Now
            </a>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="https://www.policyalternatives.ca/news-research/hollowed-out/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 sm:px-5 md:px-6 lg:px-8 py-3 sm:py-2.5 md:py-3 lg:py-4 bg-white/10 backdrop-blur-sm text-white text-xs sm:text-sm md:text-base lg:text-lg font-light rounded-lg hover:bg-white/20 transition-colors border border-white/30 active:scale-95 touch-manipulation min-h-[44px] sm:min-h-0 text-center"
              >
                CCPA Report
              </a>
              <a
                href="https://www.ontariohealthcoalition.ca/wp-content/uploads/Final-Ford-government-LTC-bed-allocations-report.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 sm:px-5 md:px-6 lg:px-8 py-3 sm:py-2.5 md:py-3 lg:py-4 bg-white/10 backdrop-blur-sm text-white text-xs sm:text-sm md:text-base lg:text-lg font-light rounded-lg hover:bg-white/20 transition-colors border border-white/30 active:scale-95 touch-manipulation min-h-[44px] sm:min-h-0 text-center"
              >
                OHC LTC Report
              </a>
              <a
                href="https://ofl.ca/ford-tracker/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 sm:px-5 md:px-6 lg:px-8 py-3 sm:py-2.5 md:py-3 lg:py-4 bg-white/10 backdrop-blur-sm text-white text-xs sm:text-sm md:text-base lg:text-lg font-light rounded-lg hover:bg-white/20 transition-colors border border-white/30 active:scale-95 touch-manipulation min-h-[44px] sm:min-h-0 text-center"
              >
                OFL Tracker
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
