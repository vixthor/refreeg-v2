"use server";

import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export interface AnalyticsData {
  totalDonations: {
    current: string;
    trend: number; // % growth from last month
  };
  totalUsers: {
    current: number;
    newThisMonth: number;
  };
  activeCauses: {
    active: number;
    total: number;
  };
  pendingApprovals: {
    current: number;
  };
}

export interface DonationTrend {
  month: string;
  regular: number;
  crypto: number;
  total: number;
  count: number;
}

export interface UserGrowth {
  month: string;
  users: number; // New users
  active: number; // Proxy: users updated/created
}

export interface CauseCategory {
  category: string;
  approved: number;
  pending: number;
  completed: number; // or rejected/other
  total: number;
}

export async function getAdminAnalytics(): Promise<AnalyticsData> {
  const supabase = await createClient();

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  try {
    const [
      donationsResult,
      cryptoDonationsResult,
      totalUsersResult,
      newUsersResult,
      activeCausesResult,
      totalCausesResult,
      pendingCausesResult,
    ] = await Promise.all([
      // Donations (All time)
      supabase
        .from("donations")
        .select("amount, created_at")
        .eq("status", "completed"),
      supabase
        .from("crypto_donations")
        .select("amount_in_naira, created_at")
        .eq("status", "completed"),

      // Users
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", currentMonthStart.toISOString()),

      // Causes
      supabase
        .from("causes")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved"),
      supabase.from("causes").select("id", { count: "exact", head: true }),
      supabase
        .from("causes")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

    // Calculate Donation Trends
    const currentDonations = donationsResult.data || [];
    const cryptoDonations = cryptoDonationsResult.data || [];

    const totalRegular = currentDonations.reduce((sum, d) => sum + d.amount, 0);
    const totalCrypto = cryptoDonations.reduce(
      (sum, d) => sum + (d.amount_in_naira || 0),
      0,
    );
    const totalDonations = totalRegular + totalCrypto;

    // Calculate last month's donations for trend
    const lastMonthDonations = currentDonations
      .filter(
        (d) =>
          new Date(d.created_at) >= lastMonthStart &&
          new Date(d.created_at) <= lastMonthEnd,
      )
      .reduce((sum, d) => sum + d.amount, 0);

    const lastMonthCrypto = cryptoDonations
      .filter(
        (d) =>
          new Date(d.created_at) >= lastMonthStart &&
          new Date(d.created_at) <= lastMonthEnd,
      )
      .reduce((sum, d) => sum + (d.amount_in_naira || 0), 0);

    const totalLastMonth = lastMonthDonations + lastMonthCrypto;

    let trend = 0;
    if (totalLastMonth > 0) {
      trend = ((totalDonations - totalLastMonth) / totalLastMonth) * 100; // This calculation is actually wrong for "trend" if comparing total vs monthly.
      // Usually trend is "This month vs Last month".
      // Let's change it: Compare THIS month vs LAST month.
    }

    // Re-calculate "Current Month" vs "Last Month"
    const thisMonthRegular = currentDonations
      .filter((d) => new Date(d.created_at) >= currentMonthStart)
      .reduce((sum, d) => sum + d.amount, 0);
    const thisMonthCrypto = cryptoDonations
      .filter((d) => new Date(d.created_at) >= currentMonthStart)
      .reduce((sum, d) => sum + (d.amount_in_naira || 0), 0);
    const totalThisMonth = thisMonthRegular + thisMonthCrypto;

    if (totalLastMonth > 0) {
      trend = ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;
    } else if (totalThisMonth > 0) {
      trend = 100;
    }

    return {
      totalDonations: {
        current: formatCurrency(totalDonations),
        trend: Math.round(trend),
      },
      totalUsers: {
        current: totalUsersResult.count || 0,
        newThisMonth: newUsersResult.count || 0,
      },
      activeCauses: {
        active: activeCausesResult.count || 0,
        total: totalCausesResult.count || 0,
      },
      pendingApprovals: {
        current: pendingCausesResult.count || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    throw error;
  }
}

export async function getDonationTrends(): Promise<DonationTrend[]> {
  const supabase = await createClient();

  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11); // Go back 11 months to include current
    twelveMonthsAgo.setDate(1); // Start of that month

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

    const monthlyData: Record<
      string,
      { regular: number; crypto: number; count: number }
    > = {};

    // Initialize last 12 months
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[monthKey] = { regular: 0, crypto: 0, count: 0 };
    }

    regularDonations.data?.forEach((donation) => {
      const date = new Date(donation.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].regular += donation.amount;
        monthlyData[monthKey].count += 1;
      }
    });

    cryptoDonations.data?.forEach((donation) => {
      const date = new Date(donation.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].crypto += donation.amount_in_naira || 0;
        monthlyData[monthKey].count += 1;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        regular: data.regular,
        crypto: data.crypto,
        total: data.regular + data.crypto,
        count: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    console.error("Error fetching donation trends:", error);
    throw error;
  }
}

export async function getUserGrowth(): Promise<UserGrowth[]> {
  const supabase = await createClient();

  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);

    const { data: users, error } = await supabase
      .from("profiles")
      .select("created_at, updated_at")
      .gte("created_at", twelveMonthsAgo.toISOString());

    if (error) throw error;

    const monthlyData: Record<string, { new: number; active: number }> = {};
    // Initialize last 12 months
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[monthKey] = { new: 0, active: 0 };
    }

    users?.forEach((user) => {
      const createdDate = new Date(user.created_at);
      const createdMonthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, "0")}`;

      if (monthlyData[createdMonthKey]) {
        monthlyData[createdMonthKey].new += 1;
      }

      // Heuristic for active: updated_at in that month
      // Note: This is imperfect as updated_at might not change often.
      // But it's a proxy.
      const updatedDate = new Date(user.updated_at);
      const updatedMonthKey = `${updatedDate.getFullYear()}-${String(updatedDate.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[updatedMonthKey]) {
        monthlyData[updatedMonthKey].active += 1;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        users: data.new,
        active: data.active,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    console.error("Error fetching user growth:", error);
    throw error;
  }
}

export async function getCauseCategories(): Promise<CauseCategory[]> {
  const supabase = await createClient();

  try {
    const { data: causes, error } = await supabase
      .from("causes")
      .select("category, status");

    if (error) throw error;

    const categories: Record<
      string,
      { approved: number; pending: number; completed: number; total: number }
    > = {};

    causes?.forEach((cause) => {
      if (!categories[cause.category]) {
        categories[cause.category] = {
          approved: 0,
          pending: 0,
          completed: 0,
          total: 0,
        };
      }

      categories[cause.category].total += 1;

      if (cause.status === "approved") categories[cause.category].approved += 1;
      else if (cause.status === "pending")
        categories[cause.category].pending += 1;
      // assuming 'rejected' or others count towards total but not specific buckets unless we add them
      // If we have 'completed' status, we should check. Common types say: "pending" | "approved" | "rejected"
      // So 'completed' might not exist in status enum.
      // Checking CauseStatus type: "pending" | "approved" | "rejected".
      // So I will just track these.
    });

    return Object.entries(categories)
      .map(([category, counts]) => ({
        category,
        ...counts,
      }))
      .sort((a, b) => b.total - a.total);
  } catch (error) {
    console.error("Error fetching cause categories:", error);
    throw error;
  }
}
