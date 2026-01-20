'use client'

import { motion } from 'framer-motion'

export default function SectionHospitalCrisis() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-gradient-to-b from-slate-50 to-white py-12 md:py-0">
      <div className="max-w-6xl w-full space-y-12 md:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
              The Hospital Crisis
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
              Underfunding has left Ontario with one of the most undercapacity hospital systems in the industrialized world
            </p>
          </div>
        </motion.div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 md:p-12 text-center">
            <p className="text-5xl sm:text-6xl md:text-7xl font-light text-red-600 mb-4">
              66
            </p>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light mb-2">
              of 134 hospitals
            </p>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light">
              had budget deficits in 2023-24
            </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-8 md:p-12 text-center">
            <p className="text-5xl sm:text-6xl md:text-7xl font-light text-blue-600 mb-4">
              33/38
            </p>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light mb-2">
              Canada's OECD ranking
            </p>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light">
              Hospital beds per capita (Ontario reflects this)
            </p>
            </div>
          </motion.div>
        </div>

        {/* Ontario vs Canada */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-center mb-8">
            Lowest Hospital Spending in Canada
          </h3>
          <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
            {[
              { province: 'Alberta', spending: '$2,045', rank: '1st' },
              { province: 'Quebec', spending: '$2,028', rank: '2nd' },
              { province: 'British Columbia', spending: '$1,902', rank: '3rd' },
              { province: 'Ontario', spending: '$1,805', rank: '4th', highlight: true },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8 + idx * 0.1 }}
              >
                <div className={`flex items-center justify-between p-4 md:p-6 rounded-lg ${
                  item.highlight ? 'bg-red-900/50 border-2 border-red-500' : 'bg-gray-800/50'
                }`}>
                <div className="flex items-center gap-4">
                  <span className="text-2xl md:text-3xl font-light text-gray-400">
                    {item.rank}
                  </span>
                  <span className="text-lg md:text-xl font-light">{item.province}</span>
                </div>
                <span className="text-xl md:text-2xl font-light">{item.spending}</span>
                </div>
              </motion.div>
            ))}
            <p className="text-sm md:text-base text-gray-400 font-light text-center mt-6 pt-6 border-t border-gray-700">
              Per capita hospital spending, 2022
            </p>
          </div>
          </div>
        </motion.div>

        {/* The Impact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="space-y-6 md:space-y-8">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 text-center">
            The Impact
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                title: 'Seven years of cuts',
                description: 'Real per capita hospital spending decreased in 7 of 10 years (2013-2022)',
              },
              {
                title: 'Small hospitals hit hardest',
                description: '63% of hospitals under $100M revenue had deficits',
              },
              {
                title: 'Hallway medicine',
                description: 'In Ontario, hallway medicine is the norm',
              },
              {
                title: 'Second-fewest beds',
                description: 'Ontario has the second-fewest hospital beds per capita in Canada',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: 1.2 + idx * 0.1 }}
              >
                <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200">
                <h4 className="text-xl md:text-2xl font-light text-gray-900 mb-3">
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

        {/* The Solution */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-8 md:p-12 text-center">
          <p className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-4">
            The Solution
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-light text-blue-900 mb-6">
            $2 billion annually
          </p>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light">
            Additional funding needed to stabilize public hospitals and increase capacity
          </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
