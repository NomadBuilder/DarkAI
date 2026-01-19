'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useLedgerStore } from '@/store/ledgerStore'
import VendorCard from './VendorCard'
import VendorList from './VendorList'

export default function ReceiptOverlay() {
  const { receiptsMode, selectedVendor, setReceiptsMode, setSelectedVendor } = useLedgerStore()

  return (
    <AnimatePresence>
      {receiptsMode && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setReceiptsMode(false)
              setSelectedVendor(null)
            }}
            className="fixed inset-0 z-40 receipt-overlay flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-xl md:rounded-2xl shadow-2xl bg-white"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl md:text-2xl font-light text-gray-900">Receipts Mode</h2>
                  {selectedVendor && (
                    <button
                      onClick={() => setSelectedVendor(null)}
                      className="text-sm text-gray-500 hover:text-gray-700 font-light underline"
                    >
                      ← Back to list
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    setReceiptsMode(false)
                    setSelectedVendor(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl md:text-3xl leading-none transition-colors active:scale-95 touch-manipulation"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              
              <div className="p-4 md:p-8">
                {selectedVendor ? (
                  <VendorCard vendorId={selectedVendor} />
                ) : (
                  <VendorList />
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
