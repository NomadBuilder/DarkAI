'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ComparisonItem {
  icon: string
  title: string
  count: number
  unit: string
  description: string
  source: string
  sourceUrl?: string
}

interface HealthcareCosts {
  costs: {
    [key: string]: {
      annual_salary?: number
      benefits_percentage?: number
      total_annual_cost?: number
      annual_operating_cost?: number
      annual_operating_budget?: number
      cost_per_hospital?: number
      annual_cost?: number
      source: string
      source_url?: string
      notes: string
    }
  }
  presets: Array<{
    label: string
    value: number
    description: string
    source: string
  }>
  last_updated: string
  data_notes: string
}

// Use $2.3B annually - current annual for-profit vendor payments (2024)
const FOR_PROFIT_SPENDING = 2300000000 // $2.3B annually (2024)

export default function SectionWhatCouldFund() {
  const [healthcareCosts, setHealthcareCosts] = useState<HealthcareCosts | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // healthcare_costs.json is in public/data/, use getPublicDataFile for basePath handling
        const { getPublicDataFile } = await import('../../utils/dataPath')
        const dataPath = getPublicDataFile('healthcare_costs.json')
        const response = await fetch(dataPath)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data = await response.json()
        setHealthcareCosts(data)
      } catch (error) {
        console.error('Failed to load healthcare costs data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(2)}B`
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`
    }
    return `$${amount.toLocaleString()}`
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return num.toLocaleString()
    }
    return num.toString()
  }

  const comparisons = useMemo<ComparisonItem[]>(() => {
    if (!healthcareCosts) return []
    
    const amount = FOR_PROFIT_SPENDING
    const costs = healthcareCosts.costs

    const items: ComparisonItem[] = []

    // Registered Nurses
    if (costs.registered_nurse.total_annual_cost && amount >= costs.registered_nurse.total_annual_cost) {
      const count = Math.floor(amount / costs.registered_nurse.total_annual_cost)
      items.push({
        icon: '👩‍⚕️',
        title: 'Full-time registered nurses',
        count,
        unit: count === 1 ? 'nurse' : 'nurses',
        description: `At average salary with benefits (${formatCurrency(costs.registered_nurse.total_annual_cost)} per nurse annually)`,
        source: costs.registered_nurse.source,
        sourceUrl: costs.registered_nurse.source_url,
      })
    }

    // Hospital Beds
    if (costs.hospital_bed.annual_operating_cost && amount >= costs.hospital_bed.annual_operating_cost) {
      const count = Math.floor(amount / costs.hospital_bed.annual_operating_cost)
      items.push({
        icon: '🛏️',
        title: 'Hospital beds',
        count,
        unit: count === 1 ? 'bed' : 'beds',
        description: `Annual operating costs (${formatCurrency(costs.hospital_bed.annual_operating_cost)} per bed)`,
        source: costs.hospital_bed.source,
        sourceUrl: costs.hospital_bed.source_url,
      })
    }

    // Allied Health Professionals
    if (costs.allied_health_professional.total_annual_cost && amount >= costs.allied_health_professional.total_annual_cost) {
      const count = Math.floor(amount / costs.allied_health_professional.total_annual_cost)
      items.push({
        icon: '👨‍⚕️',
        title: 'Allied health professionals',
        count,
        unit: count === 1 ? 'professional' : 'professionals',
        description: `Physiotherapists, lab techs, respiratory therapists (${formatCurrency(costs.allied_health_professional.total_annual_cost)} each annually)`,
        source: costs.allied_health_professional.source,
        sourceUrl: costs.allied_health_professional.source_url,
      })
    }

    // Small Hospitals
    if (costs.small_hospital.annual_operating_budget && amount >= costs.small_hospital.annual_operating_budget) {
      const count = Math.floor(amount / costs.small_hospital.annual_operating_budget)
      items.push({
        icon: '🏥',
        title: 'Small community hospitals',
        count,
        unit: count === 1 ? 'hospital' : 'hospitals',
        description: `Full annual operating budgets (${formatCurrency(costs.small_hospital.annual_operating_budget)} each)`,
        source: costs.small_hospital.source,
        sourceUrl: costs.small_hospital.source_url,
      })
    }

    // Emergency Department Upgrades
    if (costs.emergency_department_upgrade.cost_per_hospital && amount >= costs.emergency_department_upgrade.cost_per_hospital) {
      const count = Math.floor(amount / costs.emergency_department_upgrade.cost_per_hospital)
      items.push({
        icon: '🚨',
        title: 'Emergency department upgrades',
        count,
        unit: count === 1 ? 'upgrade' : 'upgrades',
        description: `Modernization/expansion projects (${formatCurrency(costs.emergency_department_upgrade.cost_per_hospital)} each)`,
        source: costs.emergency_department_upgrade.source,
        sourceUrl: costs.emergency_department_upgrade.source_url,
      })
    }

    // Primary Care Physicians
    if (costs.primary_care_physician.annual_cost && amount >= costs.primary_care_physician.annual_cost) {
      const count = Math.floor(amount / costs.primary_care_physician.annual_cost)
      items.push({
        icon: '👨‍⚕️',
        title: 'Primary care physicians',
        count,
        unit: count === 1 ? 'physician' : 'physicians',
        description: `Annual cost including overhead and supports (${formatCurrency(costs.primary_care_physician.annual_cost)} each)`,
        source: costs.primary_care_physician.source,
        sourceUrl: costs.primary_care_physician.source_url,
      })
    }

    // Long-Term Care Beds
    if (costs.long_term_care_bed.annual_operating_cost && amount >= costs.long_term_care_bed.annual_operating_cost) {
      const count = Math.floor(amount / costs.long_term_care_bed.annual_operating_cost)
      items.push({
        icon: '🏠',
        title: 'Long-term care beds',
        count,
        unit: count === 1 ? 'bed' : 'beds',
        description: `Annual operating costs (${formatCurrency(costs.long_term_care_bed.annual_operating_cost)} per bed)`,
        source: costs.long_term_care_bed.source,
        sourceUrl: costs.long_term_care_bed.source_url,
      })
    }

    // Mental Health Beds
    if (costs.mental_health_bed.annual_operating_cost && amount >= costs.mental_health_bed.annual_operating_cost) {
      const count = Math.floor(amount / costs.mental_health_bed.annual_operating_cost)
      items.push({
        icon: '🧠',
        title: 'Mental health inpatient beds',
        count,
        unit: count === 1 ? 'bed' : 'beds',
        description: `Annual operating costs (${formatCurrency(costs.mental_health_bed.annual_operating_cost)} per bed)`,
        source: costs.mental_health_bed.source,
        sourceUrl: costs.mental_health_bed.source_url,
      })
    }

    return items.slice(0, 6) // Show top 6 most relevant comparisons
  }, [healthcareCosts])

  return (
    <section className="py-20 sm:py-24 md:py-32 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-4 md:mb-6">
            The Trade-Off
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
            What $2.3 billion in annual for-profit vendor payments could fund instead
          </p>
          <p className="text-sm text-gray-500 font-light mt-4">
            Source: The Ledger data analysis (2024 for-profit vendor payments)
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Loading data...</p>
            </div>
          ) : comparisons.length > 0 ? (
            <>
              <div className="mb-8">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 text-center mb-2">
                {formatCurrency(FOR_PROFIT_SPENDING)} could fund:
              </h3>
                <p className="text-sm text-gray-500 text-center">
                  Based on 2023-24 Ontario healthcare cost data
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {comparisons.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: 0.4 + idx * 0.1 }}
                  >
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all h-full flex flex-col">
                      <div className="text-4xl mb-4">{item.icon}</div>
                      <h4 className="text-xl md:text-2xl font-light text-gray-900 mb-2">
                        <span className="font-normal text-red-600">{formatNumber(item.count)}</span>{' '}
                        {item.unit}
                      </h4>
                      <p className="text-sm md:text-base text-gray-600 font-light mb-4 flex-grow">
                        {item.description}
                      </p>
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Source:{' '}
                          {item.sourceUrl ? (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 hover:underline"
                            >
                              {item.source}
                            </a>
                          ) : (
                            <span>{item.source}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Unable to load comparison data
              </p>
            </div>
          )}
        </motion.div>

        {/* Data Sources Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 md:mt-16 pt-8 border-t border-gray-200"
        >
          <div className="bg-slate-50 rounded-2xl p-6 md:p-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Data Sources & Methodology</h4>
            <div className="space-y-3 text-sm text-gray-600">
              {healthcareCosts && (
                <>
                  <p>
                    <strong className="text-gray-900">Last updated:</strong> {healthcareCosts.last_updated}
                  </p>
                  <p>
                    <strong className="text-gray-900">Data notes:</strong> {healthcareCosts.data_notes}
                  </p>
                </>
              )}
              <p className="text-xs text-gray-500 mt-4">
                All cost figures are based on publicly available data from Ontario healthcare organizations,
                government sources, and collective agreements. Actual costs may vary by region, hospital size,
                and specific circumstances. Calculations are estimates for illustrative purposes.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
