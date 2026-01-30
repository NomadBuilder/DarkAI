'use client'

import { motion } from 'framer-motion'

const concerns = [
  {
    title: 'Private-Type Corporations Can Deliver Water',
    description: 'Although called a "public corporation," the requirement that entities be incorporated under the Business Corporations Act means they are legally the same form as private companies — with potential for profit-oriented structures, share issuance, and dividends.',
  },
  {
    title: 'Municipal Control Is Limited',
    description: 'Once designated, municipalities must deliver water exclusively through these corporations and no longer operate systems directly themselves — shifting control from elected councils to corporate boards and provincial regulations.',
  },
  {
    title: 'Regulatory Safeguards Are Delayed',
    description: 'Many critical details — including corporate governance, rate controls, board appointments, and limits on profits — are left to future regulations, meaning protections aren\'t locked into statute and can be changed without legislative debate.',
  },
  {
    title: 'The Slippery Slope',
    description: 'This creates a formal framework for commercialization, even if the government claims privatization isn\'t the intent. The corporate model enables profit incentives and reduced public accountability, opening the door to full privatization.',
  },
]

const comparison = [
  {
    side: 'Government Position',
    points: [
      'Bill 60 modernizes infrastructure and provides new financing tools',
      'It doesn\'t privatize water; providers remain overseen by government',
      'Details will be defined in regulations rather than statute',
    ],
    color: 'blue',
  },
  {
    side: 'Critics\' Interpretation',
    points: [
      'It enables corporate delivery of water services, weakening direct municipal control',
      'Corporations formed under Business Corporations Act with powers to set rates, issue shares, and collect fees create a framework for commercialization',
      'Uncertainty increases risk of pro-profit outcomes and fewer legal safeguards for affordability and public accountability',
    ],
    color: 'red',
  },
]

export default function SectionWaterPrivatizationPathway() {
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
              The Privatization Pathway
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
              How Bill 60 enables corporate control of water
            </p>
          </div>
        </motion.div>

        {/* Key Concerns */}
        <div className="space-y-8 md:space-y-10">
          {concerns.map((concern, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
            >
              <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-8 md:p-12">
                <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-4">
                  {concern.title}
                </h3>
                <p className="text-base md:text-lg text-gray-700 font-light leading-relaxed">
                  {concern.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-center mb-8">
              Government Position vs. Critics&apos; Concerns
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {comparison.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg p-6 md:p-8 ${
                    item.color === 'blue'
                      ? 'bg-blue-900/50 border border-blue-700'
                      : 'bg-blue-800/50 border border-blue-600'
                  }`}
                >
                  <h4 className="text-xl md:text-2xl font-light mb-6">
                    {item.side}
                  </h4>
                  <ul className="space-y-4">
                    {item.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-3">
                        <span className="text-gray-400 mt-1">•</span>
                        <p className="text-sm md:text-base text-gray-200 font-light leading-relaxed flex-1">
                          {point}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Final Warning */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="bg-blue-700 text-white rounded-2xl p-8 md:p-12 text-center">
            <p className="text-2xl sm:text-3xl md:text-4xl font-light mb-6">
              This Is Privatization (Americanization)
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-light text-blue-50 leading-relaxed max-w-4xl mx-auto">
              Bill 60&apos;s Water and Wastewater Public Corporations Act doesn&apos;t explicitly privatize water services, but its language permits delivery through corporations incorporated under the same legal regime as private companies, with financial autonomy and fee-setting powers. This structure — coupled with governance rules left to regulation — opens the door to water privatization in Ontario.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
