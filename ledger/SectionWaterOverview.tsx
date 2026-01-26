'use client'

import { motion } from 'framer-motion'

export default function SectionWaterOverview() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white py-12 md:py-0">
      <div className="max-w-6xl w-full space-y-12 md:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
              Water Privatization
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
              Bill 60 opens the door to corporate control of Ontario&apos;s water
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 shadow-lg">
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900">
                The Threat
              </h2>
              <div className="space-y-4">
                <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light leading-relaxed">
                  In November 2025, the Ontario government passed <strong className="font-normal text-gray-900">Bill 60</strong>, which includes the <strong className="font-normal text-gray-900">Water and Wastewater Public Corporations Act, 2025</strong>.
                </p>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light leading-relaxed">
                  Despite its name, this legislation creates a legal pathway for corporations — structured like private, for-profit companies — to take control of water and wastewater services across Ontario.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6 md:p-8">
            <p className="text-lg sm:text-xl md:text-2xl text-gray-900 font-light leading-relaxed">
              This isn&apos;t modernization. It&apos;s <strong className="font-normal text-red-700">privatization (Americanization)</strong> by another name.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 text-center">
              What Bill 60 Does
            </h2>
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-light">The &quot;Public Corporation&quot; That Isn&apos;t Public</h3>
                <p className="text-base md:text-lg text-gray-300 font-light leading-relaxed">
                  The law requires water corporations to be <strong className="font-normal text-white">incorporated under the Business Corporations Act</strong> — the same legal structure used for private, for-profit companies. This means they can issue shares, pay dividends, and operate with profit incentives, just like any private corporation.
                </p>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-gray-700">
                <h3 className="text-xl md:text-2xl font-light">Municipal Control Removed</h3>
                <p className="text-base md:text-lg text-gray-300 font-light leading-relaxed">
                  Once a corporation is designated, municipalities <strong className="font-normal text-white">must provide water services exclusively through that corporation</strong>. Direct municipal control is eliminated. Elected councils lose authority over their own water systems.
                </p>
              </div>
        
              <div className="space-y-4 pt-6 border-t border-gray-700">
                <h3 className="text-xl md:text-2xl font-light">Financial Autonomy</h3>
                <p className="text-base md:text-lg text-gray-300 font-light leading-relaxed">
                  These corporations can <strong className="font-normal text-white">set their own rates and fees</strong>, with only regulatory oversight. They can collect fees directly and add unpaid charges to municipal tax rolls. The power to control water costs shifts from public hands to corporate boards.
                </p>
              </div>
        
              <div className="space-y-4 pt-6 border-t border-gray-700">
                <h3 className="text-xl md:text-2xl font-light">Not an Agent of the Crown</h3>
                <p className="text-base md:text-lg text-gray-300 font-light leading-relaxed">
                  The law explicitly states these corporations <strong className="font-normal text-white">are not agents of the Crown</strong>. This means they operate outside the accountability framework of public institutions, with governance rules left to future regulations — regulations that could prioritize profit over public interest.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
