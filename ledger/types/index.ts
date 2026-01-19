// Core data types

export type VendorType = 'public' | 'non_profit' | 'for_profit' | 'unknown'
export type ServiceCategory = 'staffing' | 'consulting' | 'healthcare_delivery' | 'IT' | 'facilities' | 'other'
export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface Vendor {
  vendor_id: string
  vendor_name_normalized: string
  vendor_name_aliases?: string[]
  vendor_type: VendorType
  service_category?: ServiceCategory
  confidence: ConfidenceLevel
  evidence_note?: string
  first_year_paid: number
  last_year_paid: number
  total_paid_all_years: number
  growth_rate?: number
}

export interface Payment {
  fiscal_year: number
  vendor_id: string
  vendor_name_normalized: string
  ministry: string
  total_paid: number
}

export interface SystemComposition {
  year: number
  public_total: number
  non_profit_total: number
  for_profit_total: number
  unknown_total: number
}

export interface VendorYearlyPayments {
  vendor_id: string
  name: string
  type: VendorType
  category?: ServiceCategory
  yearly_payments: Record<number, number>
}

export interface LensData {
  lens: 'staffing' | 'consulting' | 'healthcare'
  vendors: VendorYearlyPayments[]
  description: string
  copy_angle: string
}

// UI state types

export interface LedgerState {
  currentYear: number
  receiptsMode: boolean
  activeLens: 'staffing' | 'consulting' | 'healthcare' | null
  scrollProgress: number
  selectedVendor: string | null
}
