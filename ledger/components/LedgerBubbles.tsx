'use client'

import { useEffect, useState, useMemo } from 'react'
import { useLedgerStore } from '@/store/ledgerStore'
import type { VendorYearlyPayments } from '@/types'

interface Bubble {
  id: string
  name: string
  type: string
  value: number
  radius: number
  x: number
  y: number
}

interface LedgerBubblesProps {
  year: number
  width: number
  height: number
}

export default function LedgerBubbles({ year, width, height }: LedgerBubblesProps) {
  const { activeLens } = useLedgerStore()
  const [vendors, setVendors] = useState<VendorYearlyPayments[]>([])
  const [loading, setLoading] = useState(true)

  // Load vendors data
  useEffect(() => {
    let cancelled = false
    
    fetch('/data/processed/vendors_master.json')
      .then(r => {
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`)
        }
        return r.json()
      })
      .then(data => {
        if (cancelled) return
        setVendors(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load vendors:', err)
        setLoading(false)
      })
    
    return () => {
      cancelled = true
    }
  }, [])

  // Generate bubbles for current year
  const bubbles = useMemo(() => {
    if (loading || vendors.length === 0) return []

    // Filter vendors for current year
    let activeVendors = vendors.filter(v => {
      const payments = v.yearly_payments as any
      const amount = payments[year.toString()] || payments[year] || 0
      return amount > 0
    })

    // Apply lens filter
    if (activeLens) {
      activeVendors = activeVendors.filter(v => {
        if (activeLens === 'staffing') return v.category === 'staffing'
        if (activeLens === 'consulting') return v.category === 'consulting'
        if (activeLens === 'healthcare') return v.category === 'healthcare_delivery'
        return false
      })
    }

    // Sort by amount and take top 300 for performance
    activeVendors.sort((a, b) => {
      const aPayments = a.yearly_payments as any
      const bPayments = b.yearly_payments as any
      const aAmount = aPayments[year.toString()] || aPayments[year] || 0
      const bAmount = bPayments[year.toString()] || bPayments[year] || 0
      return bAmount - aAmount
    })
    activeVendors = activeVendors.slice(0, 300)

    if (activeVendors.length === 0) return []

    // Calculate max value for scaling
    const maxValue = Math.max(...activeVendors.map(v => {
      const payments = v.yearly_payments as any
      return payments[year.toString()] || payments[year] || 0
    }))

    const minRadius = 4
    const maxRadius = 50

    // Generate bubble positions using simple grid + random offset
    const bubbles: Bubble[] = activeVendors.map((v, i) => {
      const payments = v.yearly_payments as any
      const value = payments[year.toString()] || payments[year] || 0
      const radius = Math.max(minRadius, Math.min(maxRadius, Math.sqrt(value / maxValue) * maxRadius))
      
      // Simple positioning: arrange in a circle with some randomness
      const angle = (i / activeVendors.length) * Math.PI * 2
      const distance = Math.min(width, height) * 0.3 + Math.random() * Math.min(width, height) * 0.2
      const x = width / 2 + Math.cos(angle) * distance
      const y = height / 2 + Math.sin(angle) * distance

      return {
        id: v.vendor_id,
        name: v.name || (v as any).vendor_name_normalized || 'Unknown',
        type: (v.type || (v as any).vendor_type || 'unknown') as string,
        value,
        radius,
        x: Math.max(radius, Math.min(width - radius, x)),
        y: Math.max(radius, Math.min(height - radius, y)),
      }
    })

    return bubbles
  }, [vendors, year, activeLens, width, height, loading])

  const colorMap: Record<string, string> = {
    public: '#3b82f6',
    non_profit: '#10b981',
    for_profit: '#ef4444',
    unknown: '#94a3b8',
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
        <p className="text-gray-500 font-light">Loading visualization...</p>
      </div>
    )
  }

  if (bubbles.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
        <p className="text-gray-500 font-light">No data for {year}</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden" style={{ zIndex: 1 }}>
      {bubbles.map((bubble) => (
        <div
          key={`${bubble.id}-${year}`}
          className="absolute rounded-full transition-all duration-500 ease-out"
          style={{
            left: `${bubble.x}px`,
            top: `${bubble.y}px`,
            width: `${bubble.radius * 2}px`,
            height: `${bubble.radius * 2}px`,
            marginLeft: `-${bubble.radius}px`,
            marginTop: `-${bubble.radius}px`,
            backgroundColor: colorMap[bubble.type] || colorMap.unknown,
            opacity: 0.7,
            boxShadow: `0 2px 8px rgba(0, 0, 0, 0.15)`,
            transform: 'translateZ(0)', // GPU acceleration
          }}
          title={`${bubble.name}: $${(bubble.value / 1e6).toFixed(1)}M`}
        />
      ))}
    </div>
  )
}
