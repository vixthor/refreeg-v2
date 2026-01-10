export type UserRole = "admin" | "manager" | "user";

export interface Role {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
  is_blocked: boolean;
  full_name?: string | null;
  username?: string | null;
  created_at: string;
  kyc_status?: "pending" | "approved" | "rejected" | null;
  kyc_verification_id?: string | null;
}
