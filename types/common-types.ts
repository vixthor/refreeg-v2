export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Status types
export type CauseStatus = "pending" | "approved" | "rejected"
export type DonationStatus = "pending" | "completed" | "failed"

// Form data types
export interface ProfileFormData {
  name: string
  phone: string
  profile_photo?: string | null
}

export interface BankDetailsFormData {
  accountNumber: string
  bankName: string
  accountName: string
}

export interface CauseFormData {
  title: string
  description: string
  category: string
  goal: string | number
}

export interface DonationFormData {
  amount: string | number
  name: string
  email: string
  message: string
  isAnonymous: boolean
}

// Filter options
export interface CauseFilterOptions {
  category?: string
  status?: CauseStatus
  userId?: string
  limit?: number
  offset?: number
}

