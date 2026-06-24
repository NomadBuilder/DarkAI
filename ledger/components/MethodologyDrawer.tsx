'use client'

import { motion, AnimatePresence } from 'framer-motion'
import MethodologyContent from './methodology/MethodologyContent'

interface MethodologyDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function MethodologyDrawer({ isOpen, onClose }: MethodologyDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50 }}
            aria-hidden="true"
          >
            <div onClick={onClose} className="w-full h-full bg-black/50" />
          </motion.div>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ position: 'fixed', right: 0, top: 0, height: '100%', width: '100%', maxWidth: '42rem', zIndex: 50 }}
          >
            <div className="h-full w-full bg-white shadow-xl overflow-y-auto">
              <div className="p-4 md:p-8">
                <div className="flex justify-between items-center mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-light text-gray-900">Methodology</h2>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-2xl md:text-3xl leading-none transition-colors active:scale-95 touch-manipulation"
                    aria-label="Close Methodology"
                  >
                    ×
                  </button>
                </div>
                <MethodologyContent headingLevel="h3" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
