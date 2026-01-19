'use client'

import { motion } from 'framer-motion'

const policyEvents = [
  {
    year: 2018,
    month: 'June',
    event: 'Doug Ford takes office',
    description: 'Progressive Conservative government elected',
    spendingImpact: 'Baseline year',
  },
  {
    year: 2019,
    month: 'November',
    event: 'Bill 124 passed',
    description: '1% cap on annual wage increases for public sector workers',
    spendingImpact: 'Wage suppression begins',
  },
  {
    year: 2020,
    month: 'March',
    event: 'COVID-19 pandemic begins',
    description: 'Hospitals face unprecedented pressure',
    spendingImpact: 'Private agency spending explodes',
  },
  {
    year: 2022,
    month: 'November',
    event: 'Bill 124 ruled unconstitutional',
    description: 'Courts find wage suppression law violates Charter rights',
    spendingImpact: 'Retroactive pay increases, but hospitals not fully funded',
  },
  {
    year: 2023,
    month: 'Fiscal Year',
    event: '66 of 134 hospitals in deficit',
    description: '49% of Ontario hospitals face budget shortfalls',
    spendingImpact: 'Crisis deepens',
  },
  {
    year: 2024,
    month: 'Present',
    event: 'Continued privatization',
    description: 'Private agency spending continues to grow',
    spendingImpact: 'System remains in crisis',
  },
]

export default function SectionPolicyTimeline() {
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
            The Timeline
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
            Policy decisions and their consequences
          </p>
          <p className="text-sm sm:text-base text-gray-500 font-light mt-4 italic">
            Data from <a 
              href="https://ofl.ca/ford-tracker/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-gray-700"
            >
              OFL Ford Tracker
            </a> and <a 
              href="https://www.policyalternatives.ca/news-research/hollowed-out/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-gray-700"
            >
              CCPA Reports
            </a>
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative overflow-x-hidden">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 transform md:-translate-x-1/2 hidden sm:block"></div>

          <div className="space-y-12 md:space-y-16">
            {policyEvents.map((event, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, delay: idx * 0.15 }}
                className={`relative flex flex-col md:flex-row items-start gap-6 md:gap-8 ${
                  idx % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-lg transform md:-translate-x-1/2 z-10"></div>

                {/* Content card */}
                <div
                  className={`flex-1 ${
                    idx % 2 === 0
                      ? 'md:pr-[calc(50%+2rem)] md:text-right'
                      : 'md:pl-[calc(50%+2rem)]'
                  }`}
                >
                  <div
                    className={`bg-gray-50 rounded-xl p-6 md:p-8 border border-gray-200 hover:border-gray-300 transition-colors ${
                      idx === 0 ? 'bg-red-50 border-red-200' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl md:text-3xl font-light text-gray-400">
                        {event.year}
                      </span>
                      <span className="text-sm md:text-base text-gray-500 font-light">
                        {event.month}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-2">
                      {event.event}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 font-light mb-3">
                      {event.description}
                    </p>
                    <div className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs md:text-sm font-light">
                      {event.spendingImpact}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Key Insight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="bg-slate-900 text-white rounded-2xl p-8 md:p-12 text-center"
        >
          <p className="text-2xl sm:text-3xl md:text-4xl font-light mb-6">
            This wasn&apos;t an accident.
          </p>
          <p className="text-lg sm:text-xl md:text-2xl font-light text-gray-300">
            Policy decisions created the conditions for privatization to flourish.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
