import { create } from 'zustand'
import type { LedgerState } from '@/types'

interface LedgerStore extends LedgerState {
  setCurrentYear: (year: number) => void
  setReceiptsMode: (enabled: boolean) => void
  setActiveLens: (lens: 'staffing' | 'consulting' | 'healthcare' | null) => void
  setScrollProgress: (progress: number) => void
  setSelectedVendor: (vendorId: string | null) => void
}

export const useLedgerStore = create<LedgerStore>((set) => ({
  currentYear: 2014,
  receiptsMode: false,
  activeLens: null,
  scrollProgress: 0,
  selectedVendor: null,
  setCurrentYear: (year) => set({ currentYear: year }),
  setReceiptsMode: (enabled) => set({ receiptsMode: enabled }),
  setActiveLens: (lens) => set({ activeLens: lens }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setSelectedVendor: (vendorId) => set({ selectedVendor: vendorId }),
}))
