import type { CauseStatus } from "./common-types"

// Cause
export interface Cause {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  goal: number
  raised: number
  status: CauseStatus
  rejection_reason: string | null
  created_at: string
  updated_at: string
  image?: string | null
  profiles?: {
    full_name: string
    email: string
  }
}

// Cause with user information
export interface CauseWithUser extends Cause {
  user: {
    name: string
    email: string
  }
}

// Category
export interface Category {
  id: string
  name: string
}

// Cause form data
export interface CauseFormData {
  title: string
  description: string
  category: string
  goal: string | number
  currency: string
  coverImage: File | null
}

