'use client'

import { useEffect, useState } from 'react'
import { useLedgerStore } from '../store/ledgerStore'
import { getDataFile } from '../utils/dataPath'

interface Vendor {
  vendor_id: string
  name: string
  type: string
  category?: string
  yearly_payments: Record<string, number>
}

export default function VendorList() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'for_profit' | 'non_profit' | 'public'>('all')
  const { setSelectedVendor } = useLedgerStore()

  useEffect(() => {
    const loadVendors = async () => {
      try {
        const response = await fetch(getDataFile('vendors_master.json'))
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        
        if (Array.isArray(data)) {
          // Filter for non-public entities (for-profit, non-profit, and optionally public for comparison)
          // Exclude 'unknown' type as those aren't classified
          const nonPublic = data.filter((v: any) => {
            const type = v.type || v.vendor_type
            return type === 'for_profit' || type === 'non_profit' || type === 'public'
          })
          
          // Calculate totals
          const withTotals = nonPublic.map((v: any) => {
            const yearly = v.yearly_payments || {}
            const total = Object.values(yearly).reduce((sum: number, amt: any) => sum + (amt || 0), 0)
            return { 
              ...v, 
              _total: total,
              name: v.name || v.vendor_name_normalized || 'Unknown',
              vendorType: v.type || v.vendor_type || 'unknown'
            }
          })
          
          // Sort by total
          withTotals.sort((a: any, b: any) => b._total - a._total)
          setVendors(withTotals)
        } else {
          console.error('Data is not an array:', typeof data)
        }
      } catch (error) {
        console.error('Failed to load vendors:', error)
      } finally {
        setLoading(false)
      }
    }

    loadVendors()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 font-light">Loading vendors...</p>
      </div>
    )
  }

  // Filter vendors by active tab
  const filteredVendors = vendors.filter((v: any) => {
    if (activeTab === 'all') return v.vendorType !== 'public'
    return v.vendorType === activeTab
  }).slice(0, 20)

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'for_profit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-light bg-red-100 text-red-700 border border-red-200">
            💼 For-Profit Company
          </span>
        )
      case 'non_profit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-light bg-green-100 text-green-700 border border-green-200">
            🧩 Non-Profit Operator
          </span>
        )
      case 'public':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-light bg-blue-100 text-blue-700 border border-blue-200">
            🏛 Public Institution
          </span>
        )
      default:
        return null
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'for_profit':
        return 'text-red-600'
      case 'non_profit':
        return 'text-green-600'
      case 'public':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-2">
          Largest Paid Non-Public Entities
        </h3>
        <p className="text-sm md:text-base text-gray-600 font-light">
          Click any entity to see detailed payment information
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-sm font-light rounded-t-lg transition-colors ${
            activeTab === 'all'
              ? 'bg-gray-100 text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Types
        </button>
        <button
          onClick={() => setActiveTab('for_profit')}
          className={`px-3 py-1.5 text-sm font-light rounded-t-lg transition-colors ${
            activeTab === 'for_profit'
              ? 'bg-red-50 text-red-900 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          For-Profit Companies
        </button>
        <button
          onClick={() => setActiveTab('non_profit')}
          className={`px-3 py-1.5 text-sm font-light rounded-t-lg transition-colors ${
            activeTab === 'non_profit'
              ? 'bg-green-50 text-green-900 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Non-Profit Operators
        </button>
        <button
          onClick={() => setActiveTab('public')}
          className={`px-3 py-1.5 text-sm font-light rounded-t-lg transition-colors ${
            activeTab === 'public'
              ? 'bg-blue-50 text-blue-900 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Public Institutions
        </button>
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {filteredVendors.map((vendor) => {
          const total = (vendor as any)._total || 0
          const vendorType = (vendor as any).vendorType || 'unknown'
          return (
            <button
              key={vendor.vendor_id}
              onClick={() => setSelectedVendor(vendor.vendor_id)}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1.5">
                    <p className="font-light text-gray-900 text-base md:text-lg truncate flex-1">
                      {vendor.name}
                    </p>
                    {getTypeBadge(vendorType)}
                  </div>
                  {vendor.category && (
                    <p className="text-xs md:text-sm text-gray-500 font-light capitalize">
                      {vendor.category.replace('_', ' ')}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-base md:text-lg font-light ${getTypeColor(vendorType)}`}>
                    {formatCurrency(total)}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-8 text-gray-500 font-light">
          No entities found in this category
        </div>
      )}
    </div>
  )
}
