'use client'

import { motion } from 'framer-motion'

export default function SectionDataIntegrity() {
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
            Data Integrity
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
            Every number is verified and sourced
          </p>
        </motion.div>

        {/* Integrity Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {[
            {
              icon: '✓',
              title: 'Payment Processors Excluded',
              description: 'Accounting pass-throughs like D+H (OSAP loans) are excluded from for-profit calculations. These are not corporate payments.',
            },
            {
              icon: '✓',
              title: 'Public Institutions Corrected',
              description: 'Hospitals, municipalities, and public entities misclassified as for-profit have been corrected.',
            },
            {
              icon: '✓',
              title: 'Multi-Source Verification',
              description: 'Data cross-referenced with CCPA reports, Ontario Health Coalition analysis, and OFL tracking.',
            },
            {
              icon: '✓',
              title: 'Transparent Methodology',
              description: 'All classification rules, exclusions, and corrections are documented and available.',
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-white rounded-xl p-6 md:p-8 border border-gray-200"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl md:text-4xl text-green-600 font-light">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-light text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 font-light">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Example Correction */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-8 md:p-12"
        >
          <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-4">
            Example: D+H Corporation Correction
          </h3>
          <div className="space-y-4 text-sm md:text-base text-gray-700 font-light">
            <p>
              <strong className="font-normal">Initial Classification:</strong> For-profit company, $1.7B payment
            </p>
            <p>
              <strong className="font-normal">Correction:</strong> Payment processor/pass-through for OSAP loans and grants
            </p>
            <p>
              <strong className="font-normal">Why it matters:</strong> This was not a $1.7B payment to a for-profit company. It was student financial aid flowing through a payment system. The money went to hundreds of thousands of students, not corporate profits.
            </p>
            <p className="text-xs md:text-sm text-gray-600 italic mt-4">
              This type of systematic review ensures our data accurately reflects actual privatization, not accounting artifacts.
            </p>
          </div>
        </motion.div>

        {/* Trust Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <p className="text-xl sm:text-2xl md:text-3xl font-light text-gray-900 mb-4">
            This data has been audited, corrected, and verified.
          </p>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light">
            Every number is traceable to Ontario Public Accounts.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
