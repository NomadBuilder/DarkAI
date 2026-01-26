'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MPPContactModalProps {
  isOpen: boolean
  onClose: () => void
  variant?: 'default' | 'water' | 'healthcare'
}

const defaultMessage = `I'm concerned about the long-term impact of relying more heavily on for-profit providers in publicly funded systems.

Once public capacity is reduced, it can be difficult and costly to rebuild. I'd like to understand how these risks are being weighed in current policy decisions.

Thank you for considering this perspective.

Best regards,`

const waterMessage = `I'm concerned about Bill 60's Water and Wastewater Public Corporations Act, 2025, and its potential to enable water privatization in Ontario.

This legislation allows corporations structured like private companies to take control of water services, with the power to set rates and operate outside public accountability frameworks. Once water systems are transferred to corporations, returning to public control becomes extremely difficult and costly.

Water is a human right, not a corporate commodity. I'd like to understand how the government plans to ensure water remains affordable and publicly accountable under this legislation.

Thank you for considering this perspective.

Best regards,`

const healthcareMessage = `I'm concerned about the dramatic growth of private spending in Ontario's healthcare system, particularly the $9.2 billion paid to private staffing agencies over 10 years and the expansion of for-profit surgical clinics under Bill 60.

Private agency staff cost 3x more than regular employees, yet account for only 0.4% of hours but 6% of costs. Meanwhile, 66 of 134 hospitals are in deficit, and Ontario ranks 33 out of 38 OECD countries in hospital beds per capita.

Once public capacity is reduced, it can be difficult and costly to rebuild. I'd like to understand how the government plans to stabilize public hospitals and reduce reliance on expensive private providers.

Thank you for considering this perspective.

Best regards,`

export default function MPPContactModal({ isOpen, onClose, variant = 'default' }: MPPContactModalProps) {
  const [mppName, setMppName] = useState('')
  const [userName, setUserName] = useState('')
  const getInitialMessage = () => {
    if (variant === 'water') return waterMessage
    if (variant === 'healthcare') return healthcareMessage
    return defaultMessage
  }
  
  const [messageBody, setMessageBody] = useState(getInitialMessage())

  // Update message when variant changes
  useEffect(() => {
    if (variant === 'water') {
      setMessageBody(waterMessage)
    } else if (variant === 'healthcare') {
      setMessageBody(healthcareMessage)
    } else {
      setMessageBody(defaultMessage)
    }
  }, [variant])

  const handleFindMPP = () => {
    window.open('https://www.ola.org/en/members/current', '_blank')
  }

  const getFullMessage = () => {
    return `Hello ${mppName || '[My MPP]'},

${messageBody}
${userName || '[Your Name]'}`
  }

  const handleCopyMessage = () => {
    const fullMessage = getFullMessage()
    navigator.clipboard.writeText(fullMessage)
    // Show a brief confirmation
    const button = document.activeElement as HTMLElement
    const originalText = button.textContent
    button.textContent = 'Copied!'
    setTimeout(() => {
      if (button) button.textContent = originalText
    }, 2000)
  }

  const handleOpenEmail = () => {
    let subject = 'Concern about public capacity and for-profit providers'
    if (variant === 'water') {
      subject = 'Concern about Bill 60 and water privatization'
    } else if (variant === 'healthcare') {
      subject = 'Concern about healthcare privatization and hospital funding'
    }
    const body = encodeURIComponent(getFullMessage())
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50 }}
          >
            <div onClick={onClose} className="w-full h-full bg-black/60 backdrop-blur-sm" />
          </motion.div>

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50 }}
          >
            <div className="flex items-center justify-center p-4 pointer-events-none">
              <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">
                      Send a respectful message to your MPP
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 font-light">
                      You don&apos;t need to be an expert to contact your representative.
                      A short, respectful message asking about long-term public capacity is enough.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-2xl md:text-3xl leading-none transition-colors ml-4"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                {/* Step 1: MPP Name */}
                <div className="mb-6">
                  <label className="block text-sm md:text-base font-light text-gray-700 mb-2">
                    Your MPP&apos;s name
                    <span className="text-gray-400 font-normal"> (optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mppName}
                      onChange={(e) => setMppName(e.target.value)}
                      placeholder="Enter your MPP's name"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm md:text-base font-light focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleFindMPP}
                      className="px-4 py-2 text-sm md:text-base text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-light whitespace-nowrap"
                    >
                      Find my MPP →
                    </button>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 font-light mt-2">
                    Not sure who your MPP is? You can find their name in under 10 seconds.
                  </p>
                  <p className="text-xs text-gray-400 font-light mt-1">
                    We don&apos;t store anything you enter.
                  </p>
                </div>

                {/* Step 2: Message Template */}
                <div className="mb-6">
                  <label className="block text-sm md:text-base font-light text-gray-700 mb-2">
                    Your name
                    <span className="text-gray-400 font-normal"> (optional)</span>
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm md:text-base font-light focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                  />

                  <label className="block text-sm md:text-base font-light text-gray-700 mb-2">
                    Message
                  </label>
                  <p className="text-xs md:text-sm text-gray-500 font-light mb-2">
                    This message is designed to be respectful, factual, and appropriate for a constituent.
                  </p>
                  <textarea
                    value={getFullMessage()}
                    onChange={(e) => {
                      const newValue = e.target.value
                      // Extract just the message body (after the greeting)
                      const lines = newValue.split('\n')
                      const greetingIndex = lines.findIndex(line => line.startsWith('Hello'))
                      if (greetingIndex >= 0 && greetingIndex < lines.length - 1) {
                        // Get everything after the greeting (skip empty line after greeting)
                        const bodyStart = greetingIndex + 2
                        // Find "Best regards" to separate body from name
                        const regardsIndex = lines.findIndex((line, idx) => idx >= bodyStart && line.startsWith('Best regards'))
                        if (regardsIndex >= 0) {
                          const body = lines.slice(bodyStart, regardsIndex).join('\n')
                          const name = lines.slice(regardsIndex + 1).join('\n').trim()
                          setMessageBody(body)
                          setUserName(name || '')
                        } else {
                          // No "Best regards" found, treat everything after greeting as body
                          const body = lines.slice(bodyStart).join('\n')
                          setMessageBody(body)
                        }
                      } else {
                        // No greeting found, treat as body only
                        setMessageBody(newValue)
                      }
                    }}
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm md:text-base font-light focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  />
                </div>

                {/* Step 3: Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCopyMessage}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors text-sm md:text-base font-light"
                  >
                    Copy message
                  </button>
                  <button
                    onClick={handleOpenEmail}
                    className="flex-1 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors text-sm md:text-base font-light"
                  >
                    Open email client
                  </button>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
