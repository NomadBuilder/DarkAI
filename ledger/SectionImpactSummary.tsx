'use client'

import { motion } from 'framer-motion'

export default function SectionImpactSummary() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-gradient-to-b from-slate-50 to-white py-16 md:py-0">
      <div className="max-w-6xl w-full space-y-12 md:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
              The Impact
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
              What this privatization (Americanization) means for Ontario
            </p>
          </div>
        </motion.div>

        {/* Impact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              icon: '🏥',
              title: 'Hospital Crisis',
              stat: '66 of 134 hospitals',
              description: 'in deficit, unable to meet demand',
            },
            {
              icon: '💰',
              title: '$725M Wasted',
              stat: 'Annually',
              description: 'on private agencies that cost 3x more',
            },
            {
              icon: '📉',
              title: '33/38 OECD',
              stat: 'Canada\'s ranking',
              description: 'lowest hospital beds per capita (Ontario reflects this)',
            },
            {
              icon: '👥',
              title: 'Staff Shortages',
              stat: 'System-wide',
              description: 'created by wage suppression and underfunding',
            },
            {
              icon: '🏛️',
              title: 'Public Capacity',
              stat: 'Hollowed out',
              description: 'once capacity leaves, it doesn\'t return',
            },
            {
              icon: '🌍',
              title: 'Global Context',
              stat: 'Outlier',
              description: 'one of the most undercapacity systems in the industrialized world',
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg md:text-xl font-light text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-2xl md:text-3xl font-light text-red-600 mb-2">
                {item.stat}
              </p>
              <p className="text-sm md:text-base text-gray-600 font-light">
                {item.description}
              </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* The Bottom Line */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6">
              The Bottom Line
            </h3>
            
            <div className="space-y-4 text-lg md:text-xl font-light">
              <p>
                Ontario has one of the <strong className="font-normal">most undercapacity hospital systems</strong> in the industrialized world.
              </p>
              <p className="text-gray-300">
                Hallway medicine is the norm.
              </p>
              <p>
                This wasn&apos;t inevitable. It was <strong className="font-normal">policy-driven</strong>.
              </p>
              <p className="text-gray-300">
                Underfunding created the crisis. Privatization (Americanization) profits from it.
              </p>
            </div>
          </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
