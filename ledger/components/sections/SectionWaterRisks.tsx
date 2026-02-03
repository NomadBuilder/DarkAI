'use client'

import { motion } from 'framer-motion'
import InlineCitation from '../InlineCitation'

const risks = [
  {
    title: 'Loss of Public Control',
    description: 'Elected municipal councils lose direct authority over water systems. Decisions shift from public accountability to corporate boards.',
    icon: '🏛️',
  },
  {
    title: 'Rate Increases',
    description: 'Corporations can set their own rates with only regulatory oversight. History shows privatized water systems lead to higher costs for residents.',
    icon: '💰',
  },
  {
    title: 'Profit Over Public Interest',
    description: 'The corporate structure enables profit incentives. Shareholders and dividends can take priority over affordability and service quality.',
    icon: '📈',
  },
  {
    title: 'Reduced Accountability',
    description: 'The law states these corporations are not agents of the Crown — meaning they operate outside the same accountability rules as public institutions. Governance details are left to regulations.',
    icon: '🔒',
  },
  {
    title: 'Irreversible Change',
    description: 'Once water systems are transferred to corporations, returning to public control becomes extremely difficult and costly.',
    icon: '⏳',
  },
  {
    title: 'Service Cuts',
    description: 'Water privatization has failed in communities worldwide, leading to service cuts, higher costs, and public health concerns.',
    icon: '✂️',
  },
]

export default function SectionWaterRisks() {
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
              The Risks
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
              What happens when water becomes a corporate commodity
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {risks.map((risk, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
            >
              <div className="bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-200 h-full flex flex-col">
                <div className="text-4xl md:text-5xl mb-4">{risk.icon}</div>
                <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-3">
                  {risk.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 font-light leading-relaxed flex-grow">
                  {risk.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-sm md:text-base text-gray-500 font-light text-center">
          Sources: privatization impacts on costs and service quality
          <InlineCitation href="#source-2" label="2" />
          <InlineCitation href="#source-3" label="3" />
        </p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="bg-blue-900 text-white rounded-2xl p-8 md:p-12 text-center">
            <p className="text-2xl sm:text-3xl md:text-4xl font-light mb-6">
              Water is a human right, not a corporate commodity.
              <InlineCitation href="#source-4" label="4" />
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-light text-blue-100 leading-relaxed max-w-4xl mx-auto">
              Once water systems are privatized, communities lose control, costs rise, and service quality often declines. This is a pattern we&apos;ve seen around the world — and it&apos;s a pattern Bill 60 enables in Ontario.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
