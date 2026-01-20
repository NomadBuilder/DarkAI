'use client'

import { useLedgerStore } from '@/store/ledgerStore'

export default function ReceiptsToggle() {
  const { receiptsMode, setReceiptsMode } = useLedgerStore()

  return (
    <button
      onClick={() => setReceiptsMode(!receiptsMode)}
      className={`px-4 py-2.5 md:py-2 text-sm rounded-lg shadow-sm transition-all duration-300 active:scale-95 touch-manipulation ${
        receiptsMode
          ? 'bg-gray-900 text-white hover:bg-gray-800'
          : 'bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-white'
      }`}
      aria-label={receiptsMode ? 'Exit Receipts Mode' : 'Enable Receipts Mode'}
    >
      {receiptsMode ? 'Exit Receipts' : 'Receipts'}
    </button>
  )
}
