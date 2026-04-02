"use server";

import { createClient } from "@/lib/supabase/server";
import { recordEvent, updateUserStreaks } from "@/actions/event-reward-actions";
import { cache } from "react";
import { getCachedUser } from "@/lib/supabase/cached-user";

/**
 * Get the current user
 * Cached to prevent multiple fetch calls during a single request/render.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();

  const { user, error } = await getCachedUser();

  if (error) {
    return null;
  }

  return user;
});

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
    });

    // Update user streaks
    await updateUserStreaks(userId);
  } catch (error) {
    console.error("Error tracking login:", error);
    // Don't throw - login tracking shouldn't break authentication
  }
}
/**
 * Initialize wallet for new user with signup bonus
 */
export async function initializeUserWallet(
  userId: string,
  signupBonus: number = 0,
) {
  const supabase = await createClient();

  try {
    // Check if wallet already exists
    const { data: existingWallet, error: fetchError } = await supabase
      .from("user_wallets")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingWallet) {
      // Wallet already exists, don't initialize again
      return existingWallet;
    }

    // Create wallet (signup bonus handled separately)
    const { data, error } = await supabase
      .from("user_wallets")
      .insert({
        user_id: userId,
        balance: signupBonus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error initializing user wallet:", error);
      throw error;
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
      .single();

    return data;
  } catch (error) {
    console.error("Error in initializeUserWallet:", error);
    // Don't throw - wallet initialization shouldn't break signup
  }
}

/**
 * Record a one-time signup reward transaction
 */
export async function recordSignupReward(userId: string, amount: number = 1) {
  const supabase = await createClient();

  try {
    const { data: existingReward, error: existingError } = await supabase
      .from("reward_transactions")
      .select("id")
      .eq("user_id", userId)
      .eq("transaction_type", "signup")
      .limit(1)
      .single();

    if (existingReward) {
      return existingReward;
    }

    if (existingError && existingError.code !== "PGRST116") {
      console.error("Error checking signup reward:", existingError);
      throw existingError;
    }

    const { data, error } = await supabase
      .from("reward_transactions")
      .insert({
        user_id: userId,
        amount,
        transaction_type: "signup",
        status: "completed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error recording signup reward:", error);
      throw error;
    }

    // Update user's wallet balance
    const { data: walletData, error: walletError } = await supabase
      .from("user_wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (walletError && walletError.code !== "PGRST116") {
      console.error("Error fetching wallet for signup reward:", walletError);
      throw walletError;
    }

    const currentBalance = walletData?.balance || 0;
    const newBalance = currentBalance + amount;

    const { error: updateError } = await supabase.from("user_wallets").upsert(
      {
        user_id: userId,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (updateError) {
      console.error("Error updating wallet for signup reward:", updateError);
      throw updateError;
    }

    return data;
  } catch (error) {
    console.error("Error in recordSignupReward:", error);
  }
}
