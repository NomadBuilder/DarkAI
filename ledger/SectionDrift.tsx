'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useLedgerStore } from '@/store/ledgerStore'

export default function SectionDrift() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef as React.RefObject<HTMLElement>,
    offset: ['start end', 'end start']
  })
  const { currentYear } = useLedgerStore()

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1])

  return (
    <section 
      ref={containerRef}
      style={{ position: 'relative' }}
      className="min-h-[120vh] flex items-center justify-center px-4 sm:px-6 md:px-8 relative py-12 md:py-0"
    >
      <motion.div 
        style={{ opacity, scale }}
      >
        <div className="max-w-5xl w-full text-center space-y-8 md:space-y-12">
        <motion.div
          key={currentYear}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-light text-gray-900 tracking-tight">
            {currentYear}
          </p>
        </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
