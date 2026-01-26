'use client'

import { useState, useEffect } from 'react'
import { useLedgerStore } from '../../store/ledgerStore'
import VendorCard from '../../components/VendorCard'
import VendorList from '../../components/VendorList'
import TopNavigation from '@/components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import ReceiptOverlay from '../../components/ReceiptOverlay'

export default function ReceiptsPage() {
  const { selectedVendor, setSelectedVendor } = useLedgerStore()
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)

  // Ensure only one drawer is open at a time
  const handleMethodologyToggle = () => {
    if (showMethodology) {
      setShowMethodology(false)
    } else {
      setShowDataSources(false)
      setShowMethodology(true)
    }
  }

  const handleDataSourcesToggle = () => {
    if (showDataSources) {
      setShowDataSources(false)
    } else {
      setShowMethodology(false)
      setShowDataSources(true)
    }
  }

  // Clear receipts mode when page loads (since it's now a page, not a modal)
  useEffect(() => {
    const { setReceiptsMode } = useLedgerStore.getState()
    setReceiptsMode(false)
  }, [])

  return (
    <div className="relative min-h-screen bg-white">
      <TopNavigation 
        onDataSourcesClick={handleDataSourcesToggle}
        onMethodologyClick={handleMethodologyToggle}
      />
            <div className="relative z-10 pt-28 sm:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
          {/* Header */}
          <div className="mb-8 md:mb-12 text-center">
            <div className="mb-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
                The Receipts
              </h1>
              {selectedVendor && (
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="text-sm md:text-base text-gray-500 hover:text-gray-700 font-light underline"
                >
                  ← Back to list
                </button>
              )}
            </div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light max-w-4xl mx-auto">
              Every payment is documented. Vendor names, exact dollar amounts, ministry and year—all sourced from Ontario&apos;s Public Accounts.
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 md:p-8">
              {selectedVendor ? (
                <VendorCard vendorId={selectedVendor} />
              ) : (
                <VendorList />
              )}
            </div>
          </div>
        </div>
      </div>

      <ReceiptOverlay />

      <MethodologyDrawer 
        isOpen={showMethodology} 
        onClose={() => setShowMethodology(false)} 
      />

      <DataSourcesDrawer 
        isOpen={showDataSources} 
        onClose={() => setShowDataSources(false)} 
      />

    </div>
  )
}
