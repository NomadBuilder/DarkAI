'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useLedgerStore } from '@/store/ledgerStore'

interface LensControllerProps {
  onClear?: () => void
}

export default function LensController({ onClear }: LensControllerProps) {
  const { activeLens, setActiveLens } = useLedgerStore()

  if (!activeLens) return null

  const handleClear = () => {
    setActiveLens(null)
    if (onClear) onClear()
  }

  return (
    <AnimatePresence>
      {activeLens && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-20 px-4 md:px-6 py-2 md:py-3 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-full shadow-lg cursor-pointer hover:bg-white transition-colors group"
          onClick={handleClear}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleClear()
            }
          }}
          aria-label="Clear active lens filter"
        >
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-sm md:text-lg font-light text-gray-900 capitalize">
              {activeLens.replace('_', ' ')} Lens
            </span>
            <span className="text-gray-400 group-hover:text-gray-600 text-lg md:text-xl leading-none transition-colors">
              ×
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
