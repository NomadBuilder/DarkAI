'use client'

import { motion } from 'framer-motion'

export default function SectionKeyFindings() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white py-16 md:py-0">
      <div className="max-w-6xl w-full space-y-12 md:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
            Key Findings
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
            The data tells a clear story
          </p>
        </motion.div>

        {/* Findings Grid */}
        <div className="space-y-8 md:space-y-12">
          {[
            {
              number: '1',
              title: 'For-profit spending grew 86.7% since 2018',
              description: 'While public funding grew 46.5% in the same period',
              highlight: true,
            },
            {
              number: '2',
              title: '$9.2 billion to private staffing agencies over 10 years',
              description: 'Private agency costs grew 98% while public staff spending grew only 6%',
            },
            {
              number: '3',
              title: 'Private agencies cost 3x more than public staff',
              description: '0.4% of hours but 6% of costs ($725M annually)',
            },
            {
              number: '4',
              title: '66 of 134 hospitals in deficit',
              description: '49% of Ontario hospitals face budget shortfalls',
            },
            {
              number: '5',
              title: 'Ontario ranks 33/38 OECD countries',
              description: 'One of the most undercapacity hospital systems in the industrialized world',
            },
            {
              number: '6',
              title: 'New for-profit vendors appeared post-2018',
              description: 'WCG ($403M), Omni Health Care entities ($732M total), Southbridge ($175M) and others',
            },
            {
              number: '7',
              title: 'Public capacity hollowed out',
              description: 'Once capacity leaves the public system, it doesn\'t return',
            },
            {
              number: '8',
              title: 'System-wide staff shortages',
              description: 'Created by wage suppression and underfunding',
            },
          ].map((finding, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className={`rounded-xl p-6 md:p-8 border-2 ${
                finding.highlight
                  ? 'bg-red-50 border-red-400'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start gap-6">
                <div className={`text-4xl md:text-5xl font-light ${
                  finding.highlight ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {finding.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-2">
                    {finding.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 font-light">
                    {finding.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* The Conclusion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-slate-900 text-white rounded-2xl p-8 md:p-12 text-center"
        >
          <p className="text-2xl sm:text-3xl md:text-4xl font-light mb-6">
            This is not a natural trend.
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-light text-gray-300">
            It is the result of deliberate policy choices.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
