'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useLedgerStore } from '@/store/ledgerStore'

interface YearControllerProps {
  isVisible?: boolean
}

export default function YearController({ isVisible = true }: YearControllerProps) {
  const { currentYear } = useLedgerStore()

  if (!isVisible) return null

  return (
    <div className="fixed top-4 md:top-8 left-1/2 -translate-x-1/2 z-20 px-4">
      <motion.div
        key={currentYear}
        initial={{ opacity: 0, y: -10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.9 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="px-6 md:px-8 py-3 md:py-4 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-full shadow-lg"
      >
        <span className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 tracking-tight block">
          {currentYear}
        </span>
      </motion.div>
    </div>
  )
}
