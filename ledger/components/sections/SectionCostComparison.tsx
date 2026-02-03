'use client'

import { motion } from 'framer-motion'
import InlineCitation from '../InlineCitation'

export default function SectionCostComparison() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-gradient-to-b from-white to-slate-50 py-24 md:py-0">
      <div className="max-w-6xl w-full space-y-12 md:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
              The True Cost
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
              What $725 million in annual private agency costs could fund instead
              <InlineCitation href="#source-2" label="2" />
              <InlineCitation href="/methodology#derived-estimates" label="M1" />
            </p>
          </div>
        </motion.div>

        {/* 3x Cost Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <p className="text-3xl sm:text-4xl md:text-5xl font-light text-red-900 mb-4">
              Private agencies cost <strong className="font-normal">3x more</strong>
              <InlineCitation href="#source-2" label="2" />
            </p>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light">
              For the same work, the same hours, the same care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200">
              <p className="text-sm md:text-base text-gray-600 font-light mb-2">Public Hospital Staff</p>
              <p className="text-3xl md:text-4xl font-light text-gray-900 mb-4">$1.00</p>
              <p className="text-xs md:text-sm text-gray-500 font-light">Per hour of care</p>
            </div>
            
            <div className="bg-red-100 rounded-2xl p-8 md:p-12 border-2 border-red-400">
              <p className="text-sm md:text-base text-red-700 font-light mb-2">Private Agency Staff</p>
              <p className="text-3xl md:text-4xl font-light text-red-900 mb-4">$3.00+</p>
              <p className="text-xs md:text-sm text-red-600 font-light">Per hour of care</p>
            </div>
          </div>
          </div>
        </motion.div>

        {/* What $725M Could Fund */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="space-y-6 md:space-y-8">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 text-center">
            What $725 million annually could fund instead
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: '🏥',
                title: '1,200+ full-time nurses',
                description: 'At average salary, with benefits',
              },
              {
                icon: '🛏️',
                title: '500+ hospital beds',
                description: 'Annual operating costs',
              },
              {
                icon: '👨‍⚕️',
                title: '800+ allied health professionals',
                description: 'Physiotherapists, lab techs, etc.',
              },
              {
                icon: '🏛️',
                title: '2-3 small hospitals',
                description: 'Full annual operating budgets',
              },
              {
                icon: '💊',
                title: 'Emergency department upgrades',
                description: 'For multiple hospitals',
              },
              {
                icon: '📈',
                title: 'Significant capacity expansion',
                description: 'Reduce hallway medicine',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: 0.6 + idx * 0.1 }}
              >
                <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h4 className="text-lg md:text-xl font-light text-gray-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-sm md:text-base text-gray-600 font-light">
                  {item.description}
                </p>
                </div>
              </motion.div>
            ))}
          </div>
          </div>
        </motion.div>

        {/* The Math */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-center mb-8">
              The Math
            </h3>
            
            <div className="space-y-4 text-lg sm:text-xl font-light">
              <div className="flex items-start gap-4 pb-4 border-b border-gray-700">
                <span className="text-2xl">→</span>
                <div>
                  <p className="mb-1">
                    Private agencies: <strong className="font-normal">0.4% of hours</strong>
                    <InlineCitation href="#source-2" label="2" />
                  </p>
                  <p className="text-gray-300 text-base">But consume 6% of labour costs</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 pb-4 border-b border-gray-700">
                <span className="text-2xl">→</span>
                <div>
                  <p className="mb-1">That&apos;s <strong className="font-normal">15x the cost per hour</strong></p>
                  <p className="text-gray-300 text-base">Compared to public staff</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-2xl">→</span>
                <div>
                  <p className="mb-1">Every dollar to agencies is a dollar <strong className="font-normal">not strengthening public capacity</strong></p>
                  <p className="text-gray-300 text-base">The cycle continues</p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
