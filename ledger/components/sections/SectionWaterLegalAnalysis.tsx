'use client'

import { motion } from 'framer-motion'

const legalPoints = [
  {
    title: 'Minister Can Designate a Corporation',
    excerpt: 'The Minister may, by regulation, designate a corporation as a water and wastewater public corporation to provide water and sewage services on behalf of the lower-tier municipalities that are prescribed by the regulations.',
    citation: 'Water and Wastewater Public Corporations Act, 2025, s. 2(1)',
    concern: 'A corporation may be designated only if the corporation is incorporated under the Business Corporations Act — the same legal structure as private, for-profit companies.',
  },
  {
    title: 'Exclusive Service Delivery',
    excerpt: 'Once a water and wastewater public corporation has been designated, the municipalities shall provide water and sewage services only through that water and wastewater public corporation.',
    citation: 's. 3',
    concern: 'Municipalities lose direct control. They cannot operate their own water systems once a corporation is designated.',
  },
  {
    title: 'Powers & Financial Authority',
    excerpt: 'The designated corporation can impose and collect fees or charges for services, have fees added to municipal tax rolls if unpaid, and prepare rate plans for Minister approval.',
    citation: 's. 5-7',
    concern: 'Corporations set their own rates with only regulatory oversight. Financial control shifts from public to corporate hands.',
  },
  {
    title: 'Corporate Structure & Share Rules',
    excerpt: 'The shares and dividends, if any, of a water and wastewater public corporation shall be issued in accordance with the regulations. A water and wastewater public corporation is not an agent of the Crown.',
    citation: 's. 9, s. 12',
    concern: 'The law permits share issuance and dividends — features of profit-oriented corporations. No guarantee of public ownership or accountability.',
  },
]

export default function SectionWaterLegalAnalysis() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white py-24 md:py-32">
      <div className="max-w-6xl w-full space-y-16 md:space-y-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
              The Legal Framework
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
              What the law actually says — and why it matters
            </p>
          </div>
        </motion.div>

        <div className="space-y-8 md:space-y-12">
          {legalPoints.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
            >
              <div className="bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-200">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-4">
                      {point.title}
                    </h3>
                    <div className="bg-white rounded-lg p-6 border-l-4 border-blue-500">
                      <p className="text-sm md:text-base text-gray-700 font-light italic leading-relaxed mb-3">
                        &quot;{point.excerpt}&quot;
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 font-light">
                        {point.citation}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <p className="text-sm md:text-base text-blue-900 font-light leading-relaxed">
                      <strong className="font-normal">Why this matters:</strong> {point.concern}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
