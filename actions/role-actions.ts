"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { UserRole, UserWithRole } from "@/types"

const DEFAULT_ADMIN_EMAIL = "kingraj1344@gmail.com"

/**
 * Check if a user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()


  // Check if the user has an admin role
  const { data, error } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle()

  if (error) {
    console.error("Error checking admin status:", error)
    return false
  }

  return !!data
}

/**
 * Check if a user is a manager
 */
export async function isManager(userId: string): Promise<boolean> {
  const supabase = await createClient()


  // Check if the user has a manager role
  const { data, error } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "manager")
    .maybeSingle()

  if (error) {
    console.error("Error checking manager status:", error)
    return false
  }

  return !!data
}

/**
 * Check if a user is an admin or manager
 */
export async function isAdminOrManager(userId: string): Promise<boolean> {
  const supabase = await createClient()


  // Check if the user has an admin or manager role
  const { data, error } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "manager"])
    .maybeSingle()

  if (error) {
    console.error("Error checking admin/manager status:", error)
    return false
  }

  return !!data
}

/**
 * Get a user's role
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = await createClient()


  // Check if the user has a role
  const { data, error } = await supabase.from("roles").select("role").eq("user_id", userId).maybeSingle()

  if (error) {
    console.error("Error getting user role:", error)
    return "user"
  }

  return (data?.role as UserRole) || "user"
}

/**
 * Set a user's role
 */
export async function setUserRole(userId: string, role: UserRole): Promise<boolean> {
  const supabase = await createClient()


  // Check if the user already has a role
  const { data: existingRole } = await supabase.from("roles").select("id").eq("user_id", userId).maybeSingle()

  let result

  if (existingRole) {
    // Update existing role
    result = await supabase
      .from("roles")
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
  } else {
    // Insert new role
    result = await supabase.from("roles").insert({
      user_id: userId,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  if (result.error) {
    console.error("Error setting user role:", result.error)
    return false
  }

  revalidatePath("/dashboard/admin/users")
  return true
}

/**
 * List all users with their roles
 */
export async function listUsersWithRoles(): Promise<UserWithRole[]> {
  const supabase = await createClient()


  // Get all users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers()

  if (usersError) {
    console.error("Error listing users:", usersError)
    throw usersError
  }

  // Get all roles
  const { data: roles, error: rolesError } = await supabase.from("roles").select("user_id, role")

  if (rolesError) {
    console.error("Error listing roles:", rolesError)
    throw rolesError
  }

  // Get all profiles
  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id, full_name, is_blocked")

  if (profilesError) {
    console.error("Error listing profiles:", profilesError)
    throw profilesError
  }

  // Create a map of user_id to role
  const roleMap = new Map()
  roles?.forEach((role) => {
    roleMap.set(role.user_id, role.role)
  })

  // Create a map of user_id to profile
  const profileMap = new Map()
  profiles?.forEach((profile) => {
    profileMap.set(profile.id, profile)
  })

  // Map users to UserWithRole
  return users.users.map((user) => {
    const profile = profileMap.get(user.id)
    return {
      id: user.id,
      email: user.email || "",
      role: roleMap.get(user.id) || "user",
      is_blocked: profile?.is_blocked || false,
      full_name: profile?.full_name || null,
      created_at: user.created_at,
    }
  })
}

/**
 * Ensure default admin exists
 */
export async function ensureDefaultAdmin(): Promise<void> {
  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    console.error("Error getting current user:", userError)
    return
  }

  // If the current user's email matches the default admin email, set them as admin
  if (user?.email === DEFAULT_ADMIN_EMAIL) {
    // Check if the user already has an admin role
    const { data: roleData } = await supabase
      .from("roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()

    if (!roleData) {
      // Set the user as an admin
      await setUserRole(user.id, "admin")
      console.log(`Set ${DEFAULT_ADMIN_EMAIL} as admin`)
    }
  }
}

