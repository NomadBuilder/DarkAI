'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SectionFordTracker() {
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
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-8 md:mb-12">
              The Full Picture
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
              Privatization (Americanization) is just one part of a broader pattern
            </p>
          </div>
        </motion.div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full"
          >
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 md:p-12 h-full flex flex-col">
            <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-4">
              Cuts to Public Services
            </h3>
            <p className="text-sm md:text-base text-gray-600 font-light mb-6">
              The Ford government has systematically cut funding across multiple sectors
            </p>
            <div className="space-y-3">
              {[
                'Education funding cuts',
                'Public health unit reductions',
                'Social service program cuts',
                'Environmental protection cuts',
                'Legal aid reductions',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <p className="text-sm md:text-base text-gray-700 font-light">{item}</p>
                </div>
              ))}
            </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-full"
          >
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-8 md:p-12 h-full flex flex-col">
            <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-4">
              Expansion of Privatization (Americanization)
            </h3>
            <p className="text-sm md:text-base text-gray-600 font-light mb-6">
              While cutting public services, private spending has grown
            </p>
            <div className="space-y-3">
              {[
                'Private staffing agencies ($9.2B over 10 years)',
                'For-profit surgical clinics (Bill 60, 2023)',
                'For-profit long-term care',
                'Consulting and outsourcing',
                'Private healthcare delivery',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <p className="text-sm md:text-base text-gray-700 font-light">{item}</p>
                </div>
              ))}
            </div>
            </div>
          </motion.div>
        </div>

        {/* The Pattern */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-center mb-8">
            The Pattern
          </h3>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-start gap-4">
              <span className="text-2xl">1.</span>
              <div>
                <p className="text-lg md:text-xl font-light mb-2">
                  Cut funding to public services
                </p>
                <p className="text-sm md:text-base text-gray-300 font-light">
                  Create pressure and capacity constraints
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <span className="text-2xl">2.</span>
              <div>
                <p className="text-lg md:text-xl font-light mb-2">
                  Introduce private alternatives
                </p>
                <p className="text-sm md:text-base text-gray-300 font-light">
                  Frame privatization (Americanization) as the solution to the crisis you created
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <span className="text-2xl">3.</span>
              <div>
                <p className="text-lg md:text-xl font-light mb-2">
                  Public dollars flow to private profits
                </p>
                <p className="text-sm md:text-base text-gray-300 font-light">
                  Capacity permanently leaves the public system
                </p>
              </div>
            </div>
          </div>
          </div>
        </motion.div>

        {/* Source Link and Healthcare Link */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="text-center space-y-4">
          <Link
            href="/healthcare"
            className="inline-block px-6 md:px-8 py-3 md:py-4 bg-red-600 text-white rounded-lg text-base md:text-lg font-light hover:bg-red-700 transition-colors"
          >
            See the healthcare impact →
          </Link>
          <div>
            <a
              href="https://ofl.ca/ford-tracker/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 md:px-8 py-3 md:py-4 bg-gray-900 text-white rounded-lg text-base md:text-lg font-light hover:bg-gray-800 transition-colors"
            >
              Explore the Full OFL Ford Tracker →
            </a>
          </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
