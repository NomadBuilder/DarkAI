'use client'

import { useEffect, useState } from 'react'
import type { Payment, Vendor } from '../types'
import { getDataFile } from '../utils/dataPath'

interface VendorCardProps {
  vendorId: string
}

export default function VendorCard({ vendorId }: VendorCardProps) {
  const [vendor, setVendor] = useState<any | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVendorData = async () => {
      setLoading(true)
      try {
        const [vendorsList, paymentsList] = await Promise.all([
          fetch(getDataFile('vendors_master.json')).then(r => r.json()).catch(() => []),
          fetch(getDataFile('payments_by_year.json')).then(r => r.json()).catch(() => []),
        ])

        const vendorData = Array.isArray(vendorsList) 
          ? vendorsList.find((v: any) => v.vendor_id === vendorId)
          : null
        
        const paymentsData = Array.isArray(paymentsList)
          ? paymentsList.filter((p: Payment) => p.vendor_id === vendorId)
          : []

        setVendor(vendorData || null)
        setPayments(paymentsData || [])
      } catch (error) {
        console.error('Failed to load vendor data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadVendorData()
  }, [vendorId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Generate search URLs for company info
  const getCompanySearchUrl = (name: string) => {
    const encoded = encodeURIComponent(name)
    return `https://www.google.com/search?q=${encoded}+Ontario+Canada`
  }

  const getCompanyRegistryUrl = (name: string) => {
    const encoded = encodeURIComponent(name)
    return `https://www.ic.gc.ca/app/scr/cc/CorporationsCanada/fdrlCrpSrch.html?q=${encoded}`
  }

  if (loading) {
    return (
      <div className="py-12 md:py-16 text-center">
        <p className="text-gray-500 font-light">Loading vendor information...</p>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="py-12 md:py-16 text-center">
        <p className="text-gray-500 font-light">Vendor information not found</p>
      </div>
    )
  }

  // Calculate totals from yearly payments
  const yearlyPayments = vendor.yearly_payments || {}
  const totalPaid = Object.values(yearlyPayments).reduce((sum: number, amt: any) => sum + (amt || 0), 0)
  const years = Object.keys(yearlyPayments).map(Number).filter(y => yearlyPayments[y] > 0).sort()
  const firstYear = years[0]
  const lastYear = years[years.length - 1]
  const vendorName = vendor.name || vendor.vendor_name_normalized || 'Unknown'

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h3 className="text-2xl md:text-3xl font-light text-gray-900 mb-3 md:mb-4 break-words">
          {vendorName}
        </h3>
        <div className="flex flex-wrap gap-2 md:gap-3 mb-4">
          <span className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-light ${
            vendor.type === 'for_profit' ? 'bg-red-50 text-red-800 border border-red-200' :
            vendor.type === 'public' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
            vendor.type === 'non_profit' ? 'bg-green-50 text-green-800 border border-green-200' :
            'bg-gray-50 text-gray-800 border border-gray-200'
          }`}>
            {vendor.type?.replace('_', ' ') || 'unknown'}
          </span>
          {vendor.category && (
            <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-light bg-gray-50 text-gray-800 border border-gray-200">
              {vendor.category.replace('_', ' ')}
            </span>
          )}
        </div>
        
        {/* Company research links */}
        <div className="flex flex-wrap gap-2 mt-4">
          <a
            href={getCompanySearchUrl(vendorName)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs md:text-sm text-blue-600 hover:text-blue-800 underline font-light"
          >
            Search for company info →
          </a>
          <span className="text-gray-300">|</span>
          <a
            href={getCompanyRegistryUrl(vendorName)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs md:text-sm text-blue-600 hover:text-blue-800 underline font-light"
          >
            Check corporate registry →
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          <p className="text-xs md:text-sm text-gray-500 mb-2 font-light">Total Payments</p>
          <p className="text-xl md:text-2xl font-light text-gray-900 break-words">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          <p className="text-xs md:text-sm text-gray-500 mb-2 font-light">First Payment</p>
          <p className="text-xl md:text-2xl font-light text-gray-900">{firstYear || 'N/A'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          <p className="text-xs md:text-sm text-gray-500 mb-2 font-light">Last Payment</p>
          <p className="text-xl md:text-2xl font-light text-gray-900">{lastYear || 'N/A'}</p>
        </div>
      </div>

      <div>
        <h4 className="text-lg md:text-xl font-light text-gray-900 mb-3 md:mb-4">Payment History by Year</h4>
        <div className="space-y-2 max-h-64 md:max-h-96 overflow-y-auto">
          {years.map((year) => {
            const amount = yearlyPayments[year] || 0
            return (
              <div key={year} className="flex justify-between items-center py-2 md:py-3 border-b border-gray-100">
                <span className="text-sm md:text-base text-gray-700 font-light">{year}</span>
                <span className="text-sm md:text-base font-light text-gray-900">{formatCurrency(amount)}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="pt-4 md:pt-6 border-t border-gray-200 space-y-3">
        <div>
          <p className="text-xs text-gray-400 font-light mb-1">Source Data:</p>
          <a
            href="https://data.ontario.ca/dataset/public-accounts-detailed-schedule-of-payments"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline font-light"
          >
            Ontario Public Accounts — Detailed Schedule of Payments →
          </a>
        </div>
        {vendor.evidence_note && (
          <div>
            <p className="text-xs text-gray-400 font-light mb-1">Classification Note:</p>
            <p className="text-xs text-gray-500 font-light">
              {vendor.evidence_note}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
