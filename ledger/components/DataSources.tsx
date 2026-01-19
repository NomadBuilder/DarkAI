'use client'

import { motion } from 'framer-motion'

export default function DataSources() {
  const dataSources = [
    {
      title: 'Ontario Public Accounts',
      description: 'Official government financial reports published annually',
      link: 'https://www.ontario.ca/page/public-accounts',
      years: '2018-2024',
    },
    {
      title: 'Detailed Schedule of Payments',
      description: 'Complete list of all payments to vendors, by ministry and year',
      link: 'https://data.ontario.ca/dataset/public-accounts-detailed-schedule-of-payments',
      format: 'CSV files',
    },
    {
      title: 'Open Data Portal',
      description: 'Machine-readable data published by the Government of Ontario',
      link: 'https://data.ontario.ca',
      note: 'All data is publicly available and verifiable',
    },
  ]

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white py-16 md:py-0">
      <div className="max-w-5xl w-full space-y-12 md:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 mb-4">
            Raw Data Sources
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light max-w-3xl mx-auto">
            Every number comes from publicly available government data. Verify it yourself.
          </p>
        </motion.div>

        <div className="space-y-6 md:space-y-8">
          {dataSources.map((source, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="bg-gray-50 rounded-xl p-6 md:p-8 border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-2">
                    {source.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 font-light mb-2">
                    {source.description}
                  </p>
                  {source.years && (
                    <p className="text-xs md:text-sm text-gray-500 font-light">
                      Years covered: {source.years}
                    </p>
                  )}
                  {source.format && (
                    <p className="text-xs md:text-sm text-gray-500 font-light">
                      Format: {source.format}
                    </p>
                  )}
                  {source.note && (
                    <p className="text-xs md:text-sm text-gray-500 font-light italic mt-2">
                      {source.note}
                    </p>
                  )}
                </div>
                <a
                  href={source.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-light hover:bg-gray-800 transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  View Source
                  <span className="text-xs">→</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center pt-8 border-t border-gray-200"
        >
          <p className="text-sm md:text-base text-gray-500 font-light">
            All processing code is available in the project repository
          </p>
        </motion.div>
      </div>
    </section>
  )
}
