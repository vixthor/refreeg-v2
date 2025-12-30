"use server";

import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export interface AnalyticsData {
  totalDonations: {
    current: string;
  };
  totalUsers: {
    current: number;
  };
  activeCauses: {
    current: number;
  };
  pendingApprovals: {
    current: number;
  };
}

export interface DonationTrend {
  month: string;
  amount: number;
}

export interface UserGrowth {
  month: string;
  users: number;
}

export interface CauseCategory {
  category: string;
  count: number;
}

/**
 * Get admin analytics data with current and previous period comparisons
 */
export async function getAdminAnalytics(): Promise<AnalyticsData> {
  const supabase = await createClient();

  // Get current date for current month range (for users)
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    // Fetch current data
    const [
      currentDonationsResult,
      currentCryptoDonationsResult,
      currentUsersResult,
      currentCausesResult,
      currentPendingResult,
    ] = await Promise.all([
      // All regular donations (not just current month)
      supabase.from("donations").select("amount").eq("status", "completed"),

      // All crypto donations (not just current month)
      supabase
        .from("crypto_donations")
        .select("amount_in_naira")
        .eq("status", "completed"),

      // Current month users
      supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .gte("created_at", currentMonthStart.toISOString()),

      // All active causes (all approved causes) - select all to ensure data is returned
      supabase.from("causes").select("id, status").eq("status", "approved"),

      // All pending approvals (all pending causes) - select all to ensure data is returned
      supabase.from("causes").select("id, status").eq("status", "pending"),
    ]);

    // Log errors and data if any
    if (currentDonationsResult.error) {
      console.error("Error fetching donations:", currentDonationsResult.error);
    }
    if (currentCryptoDonationsResult.error) {
      console.error(
        "Error fetching crypto donations:",
        currentCryptoDonationsResult.error
      );
    }
    if (currentCausesResult.error) {
      console.error("Error fetching active causes:", currentCausesResult.error);
    } else {
      console.log(
        "Active causes result:",
        currentCausesResult.data?.length || 0,
        "causes",
        currentCausesResult.data
      );
    }
    if (currentPendingResult.error) {
      console.error(
        "Error fetching pending causes:",
        currentPendingResult.error
      );
    } else {
      console.log(
        "Pending causes result:",
        currentPendingResult.data?.length || 0,
        "causes",
        currentPendingResult.data
      );
    }

    // Calculate total donations (regular + crypto)
    const currentRegularTotal =
      currentDonationsResult.data?.reduce((sum, d) => sum + d.amount, 0) || 0;
    const currentCryptoTotal =
      currentCryptoDonationsResult.data?.reduce(
        (sum, d) => sum + (d.amount_in_naira || 0),
        0
      ) || 0;
    const currentTotalDonations = currentRegularTotal + currentCryptoTotal;

    return {
      totalDonations: {
        current: formatCurrency(currentTotalDonations),
      },
      totalUsers: {
        current: currentUsersResult.count || 0,
      },
      activeCauses: {
        current: currentCausesResult.data?.length || 0,
      },
      pendingApprovals: {
        current: currentPendingResult.data?.length || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    throw error;
  }
}

/**
 * Get donation trends over the last 12 months
 */
export async function getDonationTrends(): Promise<DonationTrend[]> {
  const supabase = await createClient();

  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const [regularDonations, cryptoDonations] = await Promise.all([
      supabase
        .from("donations")
        .select("amount, created_at")
        .gte("created_at", twelveMonthsAgo.toISOString())
        .eq("status", "completed"),

      supabase
        .from("crypto_donations")
        .select("amount_in_naira, created_at")
        .gte("created_at", twelveMonthsAgo.toISOString())
        .eq("status", "completed"),
    ]);

    // Combine and group by month
    const monthlyData: Record<string, number> = {};

    // Process regular donations
    regularDonations.data?.forEach((donation) => {
      const date = new Date(donation.created_at);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + donation.amount;
    });

    // Process crypto donations
    cryptoDonations.data?.forEach((donation) => {
      const date = new Date(donation.created_at);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      monthlyData[monthKey] =
        (monthlyData[monthKey] || 0) + (donation.amount_in_naira || 0);
    });

    // Convert to array and sort
    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    console.error("Error fetching donation trends:", error);
    throw error;
  }
}

/**
 * Get user growth trends over the last 12 months
 */
export async function getUserGrowth(): Promise<UserGrowth[]> {
  const supabase = await createClient();

  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const { data: users, error } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", twelveMonthsAgo.toISOString());

    if (error) throw error;

    // Group by month
    const monthlyGrowth: Record<string, number> = {};

    users?.forEach((user) => {
      const date = new Date(user.created_at);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      monthlyGrowth[monthKey] = (monthlyGrowth[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyGrowth)
      .map(([month, users]) => ({ month, users }))
      .sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    console.error("Error fetching user growth:", error);
    throw error;
  }
}

/**
 * Get cause categories distribution
 */
export async function getCauseCategories(): Promise<CauseCategory[]> {
  const supabase = await createClient();

  try {
    const { data: causes, error } = await supabase
      .from("causes")
      .select("category")
      .eq("status", "approved");

    if (error) throw error;

    // Group by category
    const categoryCount: Record<string, number> = {};

    causes?.forEach((cause) => {
      categoryCount[cause.category] = (categoryCount[cause.category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("Error fetching cause categories:", error);
    throw error;
  }
}
