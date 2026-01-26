'use client'

import { useState } from 'react'
import type { ChangeEvent, MouseEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const publicControl = {
  title: 'Public Control',
  items: [
    'Elected municipal councils make decisions',
    'Transparent public meetings and accountability',
    'Rates set through democratic process',
    'All revenue stays in public hands',
    'Public can vote out decision-makers',
    'Service quality prioritized over profit',
  ],
  color: 'blue',
}

const corporateControl = {
  title: 'Corporate Control',
  items: [
    'Corporate board makes decisions',
    'Limited transparency, corporate meetings',
    'Corporation sets rates with minimal oversight',
    'Revenue can go to shareholders and dividends',
    'No direct public accountability',
    'Profit incentives can override service quality',
  ],
  color: 'red',
}

export default function SectionWaterControlSlider() {
  const [isPublic, setIsPublic] = useState(true)

  const handleToggle = () => {
    setIsPublic(!isPublic)
  }

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    // Snap to either 0 (public) or 100 (corporate) - no middle ground
    setIsPublic(value < 50)
  }

  const handleSliderMouseUp = (e: MouseEvent<HTMLInputElement>) => {
    // On mouse up, snap to the nearest end
    const value = parseInt((e.target as HTMLInputElement).value)
    setIsPublic(value < 50)
  }

  const currentContent = isPublic ? publicControl : corporateControl

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white py-24 md:py-32">
      <div className="max-w-6xl w-full space-y-12 md:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
              Public vs. Corporate Control
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
              Toggle to see how control shifts from public to corporate
            </p>
          </div>
        </motion.div>

        {/* Slider Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="bg-white rounded-2xl p-8 md:p-12 border-2 border-gray-200 shadow-xl">
            {/* Toggle Slider */}
            <div className="mb-12">
              <div className="relative px-4 md:px-8">
                {/* Labels positioned above the track */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm md:text-base font-light text-blue-700 whitespace-nowrap">Public Control</span>
                  <span className="text-sm md:text-base font-light text-red-700 whitespace-nowrap">Corporate Control</span>
                </div>
                
                {/* Slider track container */}
                <div className="relative h-16 md:h-20 bg-gradient-to-r from-blue-100 via-gray-200 to-red-100 rounded-full overflow-visible">
                  {/* Input range for interaction */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="100"
                    value={isPublic ? 0 : 100}
                    onChange={handleSliderChange}
                    onMouseUp={handleSliderMouseUp}
                    onTouchEnd={handleSliderMouseUp}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  
                  {/* Fill gradient */}
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-red-500 transition-all duration-300 ease-out rounded-full"
                    style={{ width: isPublic ? '0%' : '100%' }}
                  />
                  
                  {/* Handle */}
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full border-4 border-gray-800 shadow-lg flex items-center justify-center transition-all duration-300 ease-out z-20 cursor-pointer"
                    style={{ left: isPublic ? '0' : '100%' }}
                    onClick={handleToggle}
                  >
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm md:text-base text-gray-600 font-light">
                  {isPublic ? 'Public Control' : 'Corporate Control'}
                </p>
              </div>
            </div>

            {/* Single Content Box that Transitions */}
            <div className="relative min-h-[400px] md:min-h-[450px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isPublic ? 'public' : 'corporate'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-xl p-8 md:p-10 border-2 ${
                    isPublic
                      ? 'bg-blue-50 border-blue-400'
                      : 'bg-red-50 border-red-400'
                  }`}
                >
                  <h3 className={`text-2xl md:text-3xl font-light mb-6 ${
                    isPublic ? 'text-blue-900' : 'text-red-900'
                  }`}>
                    {currentContent.title}
                  </h3>
                  <ul className="space-y-4">
                    {currentContent.items.map((item, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: isPublic ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <span className={`mt-1 text-xl ${
                          isPublic ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {isPublic ? '✓' : '✗'}
                        </span>
                        <span className={`text-base md:text-lg font-light flex-1 ${
                          isPublic ? 'text-blue-900' : 'text-red-900'
                        }`}>
                          {item}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Warning Message - shows when slider moves to corporate side */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: !isPublic ? 1 : 0,
                height: !isPublic ? 'auto' : 0,
              }}
              transition={{ duration: 0.3 }}
              className="mt-8 overflow-hidden"
            >
              <div className="bg-red-100 border-2 border-red-400 rounded-xl p-6 text-center">
                <p className="text-base md:text-lg font-light text-red-900">
                  <strong className="font-normal">Bill 60 enables this shift.</strong> Once a corporation is designated, municipalities lose direct control and must deliver water exclusively through the corporation.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
