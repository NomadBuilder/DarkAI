'use client'

import { motion } from 'framer-motion'

export default function SectionEnding() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-gradient-to-b from-slate-50 to-white py-16 md:py-32">
      <div className="max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                // Add your petition link here
                window.open('https://example.com/petition', '_blank')
              }}
              className="inline-block px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 bg-gray-900 text-white text-lg sm:text-xl md:text-2xl font-light rounded-lg hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl active:scale-95 touch-manipulation"
            >
              Sign a petition to demand change
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
