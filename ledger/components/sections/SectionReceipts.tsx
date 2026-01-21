'use client'

import { motion } from 'framer-motion'
import { useLedgerStore } from '@/store/ledgerStore'

export default function SectionReceipts() {
  const { setReceiptsMode } = useLedgerStore()

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-gradient-to-b from-white to-slate-50 py-12 md:py-0">
      <div className="max-w-5xl w-full text-center space-y-8 md:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6 md:mb-8">
            Every payment is documented
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="space-y-4">
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed px-4">
            Vendor names. Exact dollar amounts. Ministry and year. All sourced from Ontario&apos;s Public Accounts.
          </p>
          <button
            onClick={() => setReceiptsMode(true)}
            className="mt-6 px-8 md:px-12 py-4 md:py-5 bg-gray-900 text-white rounded-full text-base md:text-lg font-light hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl active:scale-95"
          >
            Explore the Data
          </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
