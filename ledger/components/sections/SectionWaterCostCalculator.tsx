'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import InlineCitation from '../InlineCitation'

// Illustrative range based on reported higher private utility rates
const MIN_INCREASE = 0.30
const MAX_INCREASE = 0.60
const AVERAGE_INCREASE = 0.59

export default function SectionWaterCostCalculator() {
  const [currentBill, setCurrentBill] = useState(75)
  const [increasePercent, setIncreasePercent] = useState(AVERAGE_INCREASE)
  const [displayValues, setDisplayValues] = useState({
    projectedBill: 0,
    monthlyIncrease: 0,
    annualIncrease: 0,
  })

  const projectedBill = currentBill * (1 + increasePercent)
  const annualIncrease = (projectedBill - currentBill) * 12
  const monthlyIncrease = projectedBill - currentBill

  useEffect(() => {
    // Randomize increase between min and max for variety
    const randomIncrease = MIN_INCREASE + Math.random() * (MAX_INCREASE - MIN_INCREASE)
    setIncreasePercent(randomIncrease)
  }, [currentBill])

  useEffect(() => {
    // Animate to new values
    const duration = 1000
    const steps = 60
    const stepDuration = duration / steps
    let currentStep = 0

    const startValues = { ...displayValues }
    const endValues = {
      projectedBill: Math.round(projectedBill),
      monthlyIncrease: Math.round(monthlyIncrease),
      annualIncrease: Math.round(annualIncrease),
    }

    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easeProgress = 1 - Math.pow(1 - progress, 3) // Ease out cubic

      setDisplayValues({
        projectedBill: Math.round(startValues.projectedBill + (endValues.projectedBill - startValues.projectedBill) * easeProgress),
        monthlyIncrease: Math.round(startValues.monthlyIncrease + (endValues.monthlyIncrease - startValues.monthlyIncrease) * easeProgress),
        annualIncrease: Math.round(startValues.annualIncrease + (endValues.annualIncrease - startValues.annualIncrease) * easeProgress),
      })

      if (currentStep >= steps) {
        clearInterval(interval)
        setDisplayValues(endValues)
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }, [projectedBill, monthlyIncrease, annualIncrease])

  const handleBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentBill(parseFloat(e.target.value) || 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

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
              What Privatization Costs You
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
              Calculate how much your water bill could increase
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-gradient-to-br from-blue-50 to-red-50 rounded-2xl p-8 md:p-12 border-2 border-gray-200 shadow-xl">
            {/* Input Section */}
            <div className="mb-12">
              <label htmlFor="water-bill-amount" className="block text-lg md:text-xl font-light text-gray-900 mb-4">
                Your current monthly water bill:
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full sm:w-auto">
                  <input
                    id="water-bill-amount"
                    type="number"
                    min="0"
                    max="500"
                    value={currentBill}
                    onChange={handleBillChange}
                    className="w-full px-6 py-4 text-2xl md:text-3xl font-light text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    aria-label="Monthly water bill amount in dollars"
                  />
                </div>
                <div className="text-2xl md:text-3xl font-light text-gray-600">
                  per month
                </div>
              </div>
              <p className="text-sm md:text-base text-gray-500 font-light mt-2 text-center">
                Studies of U.S. systems found private utilities charged typical households about 59% more on average
                <InlineCitation href="#source-2" label="2" />
              </p>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
              {/* Monthly Increase */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 md:p-8 border-2 border-red-300 text-center"
              >
                <p className="text-sm md:text-base text-gray-600 font-light mb-2">
                  Monthly Increase
                </p>
                <p className="text-3xl md:text-4xl font-light text-red-600 mb-2">
                  +{displayValues.monthlyIncrease}
                </p>
                <p className="text-xs md:text-sm text-gray-500 font-light">
                  per month
                </p>
              </motion.div>

              {/* New Monthly Bill */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 md:p-8 border-2 border-red-500 text-center shadow-lg"
              >
                <p className="text-sm md:text-base text-gray-600 font-light mb-2">
                  New Monthly Bill
                </p>
                <p className="text-4xl md:text-5xl font-light text-red-700 mb-2">
                  {formatCurrency(displayValues.projectedBill)}
                </p>
                <p className="text-xs md:text-sm text-gray-500 font-light">
                  {(increasePercent * 100).toFixed(0)}% increase
                </p>
              </motion.div>

              {/* Annual Increase */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 md:p-8 border-2 border-red-300 text-center"
              >
                <p className="text-sm md:text-base text-gray-600 font-light mb-2">
                  Annual Increase
                </p>
                <p className="text-3xl md:text-4xl font-light text-red-600 mb-2">
                  +{formatCurrency(displayValues.annualIncrease)}
                </p>
                <p className="text-xs md:text-sm text-gray-500 font-light">
                  per year
                </p>
              </motion.div>
            </div>

            {/* Visual Comparison */}
            <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200">
              <h3 className="text-lg md:text-xl font-light text-gray-900 mb-4 text-center">
                Cost Comparison
              </h3>
              <div className="space-y-4">
                {/* Current Bill Bar */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm md:text-base text-gray-700 font-light">Current (Public)</span>
                    <span className="text-sm md:text-base text-gray-700 font-light">{formatCurrency(currentBill)}</span>
                  </div>
                  <div className="h-8 bg-blue-500 rounded-lg flex items-center justify-end pr-2">
                    <span className="text-white text-xs font-light">{formatCurrency(currentBill)}</span>
                  </div>
                </div>

                {/* Projected Bill Bar */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm md:text-base text-gray-700 font-light">Projected (Private)</span>
                    <span className="text-sm md:text-base text-red-700 font-light">{formatCurrency(projectedBill)}</span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-8 bg-red-500 rounded-lg flex items-center justify-end pr-2"
                    style={{ width: `${Math.min(100, (projectedBill / currentBill) * 100)}%` }}
                  >
                    <span className="text-white text-xs font-light">{formatCurrency(projectedBill)}</span>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="mt-8 bg-red-100 border-2 border-red-400 rounded-xl p-6 text-center">
              <p className="text-base md:text-lg font-light text-red-900">
                <strong className="font-normal">This is based on real-world examples.</strong> Privatized water systems in cities like Atlanta, Indianapolis, and others have seen rate increases of 30-50% or more. Bill 60 enables corporations to set their own rates with minimal oversight.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
