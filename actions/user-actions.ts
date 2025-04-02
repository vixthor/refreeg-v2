"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Block a user
 */
export async function blockUser(userId: string): Promise<boolean> {
  const supabase = await
    createClient()


  // Update the profile to mark the user as blocked
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    is_blocked: true,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error blocking user:", error)
    return false
  }

  revalidatePath("/dashboard/admin/users")
  return true
}

/**
 * Unblock a user
 */
export async function unblockUser(userId: string): Promise<boolean> {
  const supabase = await
    createClient()


  // Update the profile to mark the user as not blocked
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    is_blocked: false,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error unblocking user:", error)
    return false
  }

  revalidatePath("/dashboard/admin/users")
  return true
}

/**
 * Check if a user is blocked
 */
export async function isUserBlocked(userId: string): Promise<boolean> {
  const supabase = await
    createClient()


  // Get the profile to check if the user is blocked
  const { data, error } = await supabase.from("profiles").select("is_blocked").eq("id", userId).maybeSingle()

  if (error) {
    console.error("Error checking if user is blocked:", error)
    return false
  }

  return data?.is_blocked || false
}

