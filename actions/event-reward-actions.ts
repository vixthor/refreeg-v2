"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { REWARD_AMOUNTS } from "@/lib/reward-constants";
import type { RewardEvent } from "@/types";

/**
 * Record an event and calculate rewards
 */
export async function recordEvent(event: RewardEvent) {
  const supabase = await createClient();

  try {
    // Insert event into events table
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .insert({
        user_id: event.userId,
        event_type: event.type,
        metadata: event.metadata || {},
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (eventError) {
      console.error("Error recording event:", eventError);
      throw eventError;
    }

    // Calculate rewards based on event type
    let rewardAmount = 0;
    switch (event.type) {
      case "comment":
        rewardAmount = REWARD_AMOUNTS.comment;
        break;
      case "share":
        rewardAmount = REWARD_AMOUNTS.share;
        break;
      case "donation":
        rewardAmount = event.amount ? REWARD_AMOUNTS.donation(event.amount) : 0;
        break;
      case "login":
        rewardAmount = REWARD_AMOUNTS.login;
        break;
      case "weekly_streak":
        rewardAmount = REWARD_AMOUNTS.weekly_streak;
        break;
      case "monthly_active":
        rewardAmount = REWARD_AMOUNTS.monthly_active;
        break;
    }

    if (rewardAmount > 0) {
      await addRewards(event.userId, rewardAmount, event.type, eventData.id);
    }

    return eventData;
  } catch (error) {
    console.error("Error in recordEvent:", error);
    throw error;
  }
}

/**
 * Add rewards to user's wallet
 */
export async function addRewards(
  userId: string,
  amount: number,
  eventType: string,
  eventId: string
) {
  const supabase = await createClient();

  try {
    // Insert reward transaction
    const { data: rewardData, error: rewardError } = await supabase
      .from("reward_transactions")
      .insert({
        user_id: userId,
        amount,
        transaction_type: eventType,
        event_id: eventId,
        status: "completed",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (rewardError) {
      console.error("Error adding rewards:", rewardError);
      throw rewardError;
    }

    // Update user's wallet balance
    const { data: walletData, error: walletError } = await supabase
      .from("user_wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (walletError && walletError.code !== "PGRST116") {
      console.error("Error fetching wallet:", walletError);
      throw walletError;
    }

    const currentBalance = walletData?.balance || 0;
    const newBalance = currentBalance + amount;

    const { error: updateError } = await supabase
      .from("user_wallets")
      .upsert({
        user_id: userId,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      console.error("Error updating wallet balance:", updateError);
      throw updateError;
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/wallet`);

    return rewardData;
  } catch (error) {
    console.error("Error in addRewards:", error);
    throw error;
  }
}

/**
 * Get user's wallet balance and recent transactions
 */
export async function getUserWallet(userId: string) {
  const supabase = await createClient();

  try {
    const [walletData, transactionsData] = await Promise.all([
      supabase.from("user_wallets").select("*").eq("user_id", userId).single(),
      supabase
        .from("reward_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    return {
      wallet: walletData.data,
      transactions: transactionsData.data || [],
      walletError: walletData.error,
      transactionsError: transactionsData.error,
    };
  } catch (error) {
    console.error("Error fetching user wallet:", error);
    throw error;
  }
}

/**
 * Update user streaks (weekly and monthly active)
 */
export async function updateUserStreaks(userId: string) {
  const supabase = await createClient();

  try {
    // Get current streak data
    const { data: streakData, error: streakError } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (streakError && streakError.code !== "PGRST116") {
      console.error("Error fetching streak data:", streakError);
      throw streakError;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = streakData?.last_active_date
      ? new Date(streakData.last_active_date)
      : null;
    lastActive?.setHours(0, 0, 0, 0);

    let weeklyStreak = streakData?.weekly_streak || 0;
    let isMonthlyActive = streakData?.is_monthly_active || false;

    // Check if this is a new day
    if (!lastActive || lastActive.getTime() !== today.getTime()) {
      // Check if streak continues (yesterday)
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActive && lastActive.getTime() === yesterday.getTime()) {
        weeklyStreak += 1;
      } else {
        weeklyStreak = 1;
      }
    }

    // Check if it's a new month
    const month = today.getMonth();
    const year = today.getFullYear();
    const streakMonth = lastActive ? lastActive.getMonth() : -1;
    const streakYear = lastActive ? lastActive.getFullYear() : -1;

    if (month !== streakMonth || year !== streakYear) {
      isMonthlyActive = true;
    }

    // Update streak data
    const { data: updatedStreak, error: updateError } = await supabase
      .from("user_streaks")
      .upsert({
        user_id: userId,
        weekly_streak: weeklyStreak,
        is_monthly_active: isMonthlyActive,
        last_active_date: today.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (updateError) {
      console.error("Error updating streak:", updateError);
      throw updateError;
    }

    // Award rewards if milestones reached
    const hasWeeklyMilestone =
      weeklyStreak > 0 && weeklyStreak % 7 === 0 && streakData?.weekly_streak !== weeklyStreak;
    const hasMonthlyMilestone =
      isMonthlyActive && !streakData?.is_monthly_active;

    if (hasWeeklyMilestone) {
      await recordEvent({
        type: "weekly_streak",
        userId,
        metadata: { streak: weeklyStreak },
      });
    }

    if (hasMonthlyMilestone) {
      await recordEvent({
        type: "monthly_active",
        userId,
        metadata: { month: today.getMonth() + 1, year },
      });
    }

    revalidatePath("/dashboard");

    return updatedStreak;
  } catch (error) {
    console.error("Error in updateUserStreaks:", error);
    throw error;
  }
}

/**
 * Get user's streak and activity stats
 */
export async function getUserStats(userId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user stats:", error);
      throw error;
    }

    return data || {
      user_id: userId,
      weekly_streak: 0,
      is_monthly_active: false,
      last_active_date: null,
    };
  } catch (error) {
    console.error("Error in getUserStats:", error);
    throw error;
  }
}
