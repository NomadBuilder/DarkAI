'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import MPPContactModal from '../components/MPPContactModal'

const statements = [
  "Every dollar here is a dollar not strengthening public capacity.",
  "Once capacity leaves the public system, it doesn't quietly return.",
  "This wasn't announced.",
  "It was invoiced.",
]

export default function SectionLoss() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-slate-900 text-white py-24 md:py-0">
        <div className="max-w-5xl w-full space-y-12 md:space-y-16">
        {statements.map((statement, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ 
              duration: 1, 
              delay: idx * 0.3,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <div className="text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light leading-tight px-4">
                {statement}
              </p>
            </div>
          </motion.div>
        ))}
        
        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="text-center space-y-6">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-300">
            Contact your provincial representative
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-block px-6 sm:px-8 md:px-12 lg:px-16 py-4 sm:py-5 md:py-6 bg-white text-slate-900 text-base sm:text-lg md:text-xl lg:text-2xl font-light rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl active:scale-95 touch-manipulation min-h-[48px] sm:min-h-0 text-center"
          >
            Contact Your MPP
          </button>
          </div>
        </motion.div>
      </div>
    </section>

    <MPPContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
