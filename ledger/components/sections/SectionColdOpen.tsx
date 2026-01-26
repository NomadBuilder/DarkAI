'use client'

import { motion } from 'framer-motion'

export default function SectionColdOpen() {
  return (
    <section className="min-h-screen flex items-start md:items-center justify-center px-4 sm:px-6 md:px-8 bg-gradient-to-b from-slate-50 to-white py-12 md:py-16 pt-20 md:pt-0 pb-20 md:pb-16 w-full overflow-x-hidden">
      <div className="max-w-5xl w-full text-center space-y-8 md:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-light text-gray-900 leading-tight tracking-tight">
            Ontario funds public services
            <br className="hidden sm:block" />
            <span className="sm:inline"> </span>
            <span className="font-normal">through public institutions.</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-gray-600 leading-relaxed">
            Hospitals.
            <br />
            Infrastructure.
            <br />
            Care.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-gray-500 italic">
            This is how it&apos;s supposed to work.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
          className="pt-8 md:pt-12"
        >
          <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-red-600">
            Then Doug Ford showed up.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
