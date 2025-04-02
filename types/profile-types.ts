// User profile
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  account_number: string | null
  bank_name: string | null
  account_name: string | null
  profile_photo: string | null
  is_blocked: boolean
  created_at: string
  updated_at: string
}

