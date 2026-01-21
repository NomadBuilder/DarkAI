'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useLedgerStore } from '../store/ledgerStore'

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
          style={{ position: 'fixed', top: '5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}
        >
          <div
            className="px-4 md:px-6 py-2 md:py-3 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-full shadow-lg cursor-pointer hover:bg-white transition-colors group"
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
