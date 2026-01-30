'use client'

import { motion } from 'framer-motion'

export default function SectionStaffingCrisis() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white py-4 md:py-0">
      <div className="max-w-6xl w-full space-y-12 md:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
              The Healthcare Crisis
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
            How underfunding created a vicious cycle of privatization (Americanization)
          </p>
          </div>
        </motion.div>

        {/* Key Stat */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 md:p-12 text-center">
            <p className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-red-600 mb-4">
              $9.2B
            </p>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light">
              Paid to for-profit staffing agencies over 10 years
            </p>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light mt-4">
              (2013-2023)
            </p>
            <p className="text-xs sm:text-sm text-gray-500 font-light mt-2">
              Note: Most of this growth occurred during the Ford era (2018-2023)
            </p>
            <p className="text-sm sm:text-base text-gray-500 font-light mt-4 italic">
              Source: <a 
                href="https://www.policyalternatives.ca/news-research/hollowed-out/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-gray-700"
              >
                CCPA &quot;Hollowed Out&quot; Report
              </a>
            </p>
          </div>
        </motion.div>

        {/* The Vicious Cycle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="space-y-12 md:space-y-16">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 text-center mb-8 md:mb-12">
            The Vicious Cycle
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 items-stretch">
            {[
              {
                step: '1',
                title: 'Government underfunds hospitals',
                description: 'Real per capita spending cuts for 7 of 10 years',
              },
              {
                step: '2',
                title: 'Bill 124 suppresses wages',
                description: '1% cap on raises makes health care work less attractive',
              },
              {
                step: '3',
                title: 'Staff leave for better pay',
                description: 'Hospitals can\'t retain workers',
              },
              {
                step: '4',
                title: 'Hospitals forced to use agencies',
                description: 'Expensive private agencies fill the gaps',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: 0.6 + idx * 0.1 }}
                className="h-full"
              >
                <div className="bg-gray-50 rounded-2xl p-10 md:p-14 border border-gray-200 h-full flex flex-col">
                <div className="text-3xl md:text-4xl font-light text-red-600 mb-4 md:mb-6">
                  {item.step}
                </div>
                <h4 className="text-lg md:text-xl font-light text-gray-900 mb-3 md:mb-4">
                  {item.title}
                </h4>
                <p className="text-sm md:text-base text-gray-600 font-light flex-grow">
                  {item.description}
                </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center pt-8 md:pt-12">
            <div className="inline-flex items-center gap-3 text-gray-400">
              <div className="h-px w-16 bg-gray-300"></div>
              <span className="text-base md:text-lg font-light">The cycle repeats</span>
              <div className="h-px w-16 bg-gray-300"></div>
            </div>
          </div>
          </div>
        </motion.div>

        {/* Growth Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-blue-50 rounded-2xl p-8 md:p-12 border border-blue-200">
            <p className="text-sm md:text-base text-blue-700 font-light mb-2">Public Hospital Staff</p>
            <p className="text-4xl md:text-5xl font-light text-blue-900 mb-2">
              +6%
            </p>
            <p className="text-xs md:text-sm text-blue-600 font-light">
              Real per capita spending growth (2013-2023)
            </p>
          </div>
          
          <div className="bg-red-50 rounded-2xl p-8 md:p-12 border border-red-200">
            <p className="text-sm md:text-base text-red-700 font-light mb-2">Private Staffing Agencies</p>
            <p className="text-4xl md:text-5xl font-light text-red-900 mb-2">
              +98%
            </p>
            <p className="text-xs md:text-sm text-red-600 font-light">
              Real per capita spending growth (2013-2023)
            </p>
          </div>
          </div>
        </motion.div>

        {/* Regional Impact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="bg-slate-50 rounded-2xl p-8 md:p-12 border border-slate-200">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-6 md:mb-8 text-center">
            Hardest Hit Regions
          </h3>
          <div className="space-y-4 md:space-y-6">
            {[
              { region: 'North West', increase: '480%', share: '17% of staffing costs' },
              { region: 'North Simcoe Muskoka', increase: '372%', share: '7% of staffing costs' },
              { region: 'North East', increase: '216%', share: '11% of staffing costs' },
              { region: 'Central West', increase: 'Significant', share: '9% of staffing costs' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: 1.2 + idx * 0.1 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-gray-200 last:border-0">
                <div>
                  <p className="text-lg md:text-xl font-light text-gray-900">{item.region}</p>
                  <p className="text-sm md:text-base text-gray-600 font-light">{item.share}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl md:text-3xl font-light text-red-600">{item.increase}</p>
                  <p className="text-xs md:text-sm text-gray-500 font-light">increase in agency costs</p>
                </div>
                </div>
              </motion.div>
            ))}
          </div>
          </div>
        </motion.div>

        {/* The Cost */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <div className="bg-gray-900 text-white rounded-2xl p-8 md:p-12">
          <p className="text-xl sm:text-2xl md:text-3xl font-light text-center mb-6">
            In 2022-23, private agencies accounted for:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-center">
            <div>
              <p className="text-5xl md:text-6xl font-light mb-2">0.4%</p>
              <p className="text-sm md:text-base text-gray-300 font-light">of frontline hours worked</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl font-light mb-2">6%</p>
              <p className="text-sm md:text-base text-gray-300 font-light">of total labour costs ($725M)</p>
            </div>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-light text-center mt-8 pt-8 border-t border-gray-700">
            Private agency staff cost <strong className="font-normal">at least 3x more</strong> than regular employees
          </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
