// User roles
export type UserRole = "admin" | "manager" | "user"

// Role
export interface Role {
  id: string
  user_id: string
  role: UserRole
  created_at: string
  updated_at: string
}

// User with role
export interface UserWithRole {
  id: string
  email: string
  role: UserRole
  is_blocked: boolean
  full_name?: string | null
  created_at: string
}

