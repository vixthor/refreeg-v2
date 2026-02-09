"use server"

import { createClient } from "@/lib/supabase/server"
import { recordEvent, updateUserStreaks } from "@/actions/event-reward-actions"

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    return null
  }

  return user
}

/**
 * Track user login and update streaks
 */
export async function trackLogin(userId: string) {
  try {
    // Record login event for rewards
    await recordEvent({
      type: "login",
      userId,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    })

    // Update user streaks
    await updateUserStreaks(userId)
  } catch (error) {
    console.error("Error tracking login:", error)
    // Don't throw - login tracking shouldn't break authentication
  }
}
/**
 * Initialize wallet for new user with signup bonus
 */
export async function initializeUserWallet(userId: string, signupBonus: number = 1) {
  const supabase = await createClient()

  try {
    // Check if wallet already exists
    const { data: existingWallet, error: fetchError } = await supabase
      .from("user_wallets")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (existingWallet) {
      // Wallet already exists, don't initialize again
      return existingWallet
    }

    // Create wallet with signup bonus
    const { data, error } = await supabase
      .from("user_wallets")
      .insert({
        user_id: userId,
        balance: signupBonus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error initializing user wallet:", error)
      throw error
    }

    // Initialize user streaks
    await supabase
      .from("user_streaks")
      .insert({
        user_id: userId,
        weekly_streak: 0,
        is_monthly_active: false,
        last_active_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    return data
  } catch (error) {
    console.error("Error in initializeUserWallet:", error)
    // Don't throw - wallet initialization shouldn't break signup
  }
}