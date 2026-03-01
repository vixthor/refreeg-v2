"use server";

import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export interface AnalyticsData {
  totalDonations: {
    current: string;
    trend: number;
    previous: string;
  };
  totalUsers: {
    current: number;
    newInPeriod: number;
    trend: number;
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
  period: string;
  regular: number;
  crypto: number;
  total: number;
  count: number;
}

export interface UserGrowth {
  period: string;
  users: number;
  active: number;
}

export interface CauseCategory {
  category: string;
  approved: number;
  pending: number;
  completed: number;
  total: number;
}

export interface KycAnalytics {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  approvalRate: number;
  avgProcessingTimeHours: number;
}

export interface PaymentAnalytics {
  total: number;
  failed: number;
  successRate: number;
  failureRate: number;
  failedAmount: number;
}

export interface CauseLifecycle {
  avgApprovalTimeHours: number;
  avgCompletionTimeDays: number;
  funnel: {
    created: number;
    pending: number;
    approved: number;
    completed: number;
  };
}

export interface Alert {
  id: string;
  type: "warning" | "critical" | "info";
  message: string;
  metric: string;
  value: string;
  threshold: string;
}

function getPreviousPeriod(from: Date, to: Date): { from: Date; to: Date } {
  const duration = to.getTime() - from.getTime();
  return {
    from: new Date(from.getTime() - duration),
    to: new Date(to.getTime() - duration),
  };
}

export async function getAdminAnalytics(
  from?: string,
  to?: string,
): Promise<AnalyticsData> {
  const supabase = await createClient();

  const endDate = to ? new Date(to) : new Date();
  const startDate = from
    ? new Date(from)
    : new Date(new Date().setMonth(endDate.getMonth() - 1));

  // Ensure end date includes the full day
  endDate.setHours(23, 59, 59, 999);

  const { from: prevFrom, to: prevTo } = getPreviousPeriod(startDate, endDate);

  try {
    const [
      donationsInPeriod,
      cryptoInPeriod,
      donationsPrev,
      cryptoPrev,
      totalUsersResult,
      newUsersResult,
      newUsersPrev,
      activeCausesResult,
      totalCausesResult,
      pendingCausesResult,
    ] = await Promise.all([
      // Donations in Period
      supabase
        .from("donations")
        .select("amount")
        .eq("status", "completed")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString()),
      supabase
        .from("crypto_donations")
        .select("amount_in_naira")
        .eq("status", "completed")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString()),

      // Donations Previous Period
      supabase
        .from("donations")
        .select("amount")
        .eq("status", "completed")
        .gte("created_at", prevFrom.toISOString())
        .lte("created_at", prevTo.toISOString()),
      supabase
        .from("crypto_donations")
        .select("amount_in_naira")
        .eq("status", "completed")
        .gte("created_at", prevFrom.toISOString())
        .lte("created_at", prevTo.toISOString()),

      // Users Total (As of End Date)
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .lte("created_at", endDate.toISOString()),

      // Users New in Period
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString()),

      // Users New in Previous Period
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", prevFrom.toISOString())
        .lte("created_at", prevTo.toISOString()),

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

    // Calculate Donations
    const totalRegular =
      donationsInPeriod.data?.reduce((sum, d) => sum + d.amount, 0) || 0;
    const totalCrypto =
      cryptoInPeriod.data?.reduce(
        (sum, d) => sum + (d.amount_in_naira || 0),
        0,
      ) || 0;
    const totalDonations = totalRegular + totalCrypto;

    const prevRegular =
      donationsPrev.data?.reduce((sum, d) => sum + d.amount, 0) || 0;
    const prevCrypto =
      cryptoPrev.data?.reduce((sum, d) => sum + (d.amount_in_naira || 0), 0) ||
      0;
    const prevTotalDonations = prevRegular + prevCrypto;

    let donationTrend = 0;
    if (prevTotalDonations > 0) {
      donationTrend =
        ((totalDonations - prevTotalDonations) / prevTotalDonations) * 100;
    } else if (totalDonations > 0) {
      donationTrend = 100;
    }

    // Calculate Users
    const newUsers = newUsersResult.count || 0;
    const prevNewUsers = newUsersPrev.count || 0;
    let userTrend = 0;
    if (prevNewUsers > 0) {
      userTrend = ((newUsers - prevNewUsers) / prevNewUsers) * 100;
    } else if (newUsers > 0) {
      userTrend = 100;
    }

    return {
      totalDonations: {
        current: formatCurrency(totalDonations),
        trend: Math.round(donationTrend),
        previous: formatCurrency(prevTotalDonations),
      },
      totalUsers: {
        current: totalUsersResult.count || 0,
        newInPeriod: newUsers,
        trend: Math.round(userTrend),
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

export async function getDonationTrends(
  from?: string,
  to?: string,
): Promise<DonationTrend[]> {
  const supabase = await createClient();
  const endDate = to ? new Date(to) : new Date();
  const startDate = from
    ? new Date(from)
    : new Date(new Date().setMonth(endDate.getMonth() - 11));
  endDate.setHours(23, 59, 59, 999);

  try {
    const [regularDonations, cryptoDonations] = await Promise.all([
      supabase
        .from("donations")
        .select("amount, created_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .eq("status", "completed"),

      supabase
        .from("crypto_donations")
        .select("amount_in_naira, created_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .eq("status", "completed"),
    ]);

    // Grouping by appropriate interval based on duration
    // For simplicity, we stick to Monthly if duration > 2 months, else Daily
    const durationDays =
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    const isDaily = durationDays <= 62;

    const dataMap: Record<
      string,
      { regular: number; crypto: number; count: number }
    > = {};

    const getKey = (dateStr: string) => {
      const d = new Date(dateStr);
      if (isDaily) return d.toISOString().split("T")[0]; // YYYY-MM-DD
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
    };

    regularDonations.data?.forEach((d) => {
      const key = getKey(d.created_at);
      if (!dataMap[key]) dataMap[key] = { regular: 0, crypto: 0, count: 0 };
      dataMap[key].regular += d.amount;
      dataMap[key].count += 1;
    });

    cryptoDonations.data?.forEach((d) => {
      const key = getKey(d.created_at);
      if (!dataMap[key]) dataMap[key] = { regular: 0, crypto: 0, count: 0 };
      dataMap[key].crypto += d.amount_in_naira || 0;
      dataMap[key].count += 1;
    });

    return Object.entries(dataMap)
      .map(([period, data]) => ({
        period,
        regular: data.regular,
        crypto: data.crypto,
        total: data.regular + data.crypto,
        count: data.count,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  } catch (error) {
    console.error("Error fetching donation trends:", error);
    throw error;
  }
}

export async function getUserGrowth(
  from?: string,
  to?: string,
): Promise<UserGrowth[]> {
  const supabase = await createClient();
  const endDate = to ? new Date(to) : new Date();
  const startDate = from
    ? new Date(from)
    : new Date(new Date().setMonth(endDate.getMonth() - 11));
  endDate.setHours(23, 59, 59, 999);

  try {
    const { data: users, error } = await supabase
      .from("profiles")
      .select("created_at, updated_at")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (error) throw error;

    const durationDays =
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    const isDaily = durationDays <= 62;
    const getKey = (dateStr: string) => {
      const d = new Date(dateStr);
      if (isDaily) return d.toISOString().split("T")[0];
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    };

    const dataMap: Record<string, { new: number; active: number }> = {};

    users?.forEach((user) => {
      const createdKey = getKey(user.created_at);
      if (!dataMap[createdKey]) dataMap[createdKey] = { new: 0, active: 0 };
      dataMap[createdKey].new += 1;

      const updatedKey = getKey(user.updated_at);
      if (!dataMap[updatedKey]) dataMap[updatedKey] = { new: 0, active: 0 };
      dataMap[updatedKey].active += 1;
    });

    return Object.entries(dataMap)
      .map(([period, data]) => ({
        period,
        users: data.new,
        active: data.active,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  } catch (error) {
    console.error("Error fetching user growth:", error);
    throw error;
  }
}

export async function getCauseCategories(): Promise<CauseCategory[]> {
  // Categories are usually a snapshot of current state, not time-series dependent
  // But we could filter "Causes created in period".
  // For now, let's keep it global as it's a breakdown of the platform.
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

export async function getKycAnalytics(
  from?: string,
  to?: string,
): Promise<KycAnalytics> {
  const supabase = await createClient();
  const endDate = to ? new Date(to) : new Date();
  const startDate = from
    ? new Date(from)
    : new Date(new Date().setMonth(endDate.getMonth() - 1));
  endDate.setHours(23, 59, 59, 999);

  try {
    const { data: verifications } = await supabase
      .from("kyc_verifications")
      .select("status, created_at, updated_at")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    const total = verifications?.length || 0;
    const approved =
      verifications?.filter((v) => v.status === "approved").length || 0;
    const rejected =
      verifications?.filter((v) => v.status === "rejected").length || 0;
    const pending =
      verifications?.filter((v) => v.status === "pending").length || 0;

    let totalProcessingTime = 0;
    let processedCount = 0;

    verifications?.forEach((v) => {
      if (v.status !== "pending" && v.updated_at && v.created_at) {
        const start = new Date(v.created_at).getTime();
        const end = new Date(v.updated_at).getTime();
        totalProcessingTime += end - start;
        processedCount++;
      }
    });

    return {
      total,
      approved,
      rejected,
      pending,
      approvalRate: total > 0 ? (approved / total) * 100 : 0,
      avgProcessingTimeHours:
        processedCount > 0
          ? totalProcessingTime / processedCount / (1000 * 60 * 60)
          : 0,
    };
  } catch (error) {
    console.error("Error fetching KYC analytics:", error);
    return {
      total: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
      approvalRate: 0,
      avgProcessingTimeHours: 0,
    };
  }
}

export async function getPaymentAnalytics(
  from?: string,
  to?: string,
): Promise<PaymentAnalytics> {
  const supabase = await createClient();
  const endDate = to ? new Date(to) : new Date();
  const startDate = from
    ? new Date(from)
    : new Date(new Date().setMonth(endDate.getMonth() - 1));
  endDate.setHours(23, 59, 59, 999);

  try {
    const { data: donations } = await supabase
      .from("donations")
      .select("status, amount")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    const total = donations?.length || 0;
    const failed = donations?.filter((d) => d.status === "failed").length || 0;
    const completed =
      donations?.filter((d) => d.status === "completed").length || 0;
    const failedAmount =
      donations
        ?.filter((d) => d.status === "failed")
        .reduce((sum, d) => sum + d.amount, 0) || 0;

    return {
      total,
      failed,
      successRate: total > 0 ? (completed / total) * 100 : 0,
      failureRate: total > 0 ? (failed / total) * 100 : 0,
      failedAmount,
    };
  } catch (error) {
    console.error("Error fetching payment analytics:", error);
    return {
      total: 0,
      failed: 0,
      successRate: 0,
      failureRate: 0,
      failedAmount: 0,
    };
  }
}

export async function getCauseLifecycleAnalytics(
  from?: string,
  to?: string,
): Promise<CauseLifecycle> {
  const supabase = await createClient();
  const endDate = to ? new Date(to) : new Date();
  const startDate = from
    ? new Date(from)
    : new Date(new Date().setMonth(endDate.getMonth() - 6)); // Default 6 months for lifecycle
  endDate.setHours(23, 59, 59, 999);

  try {
    const { data: causes } = await supabase
      .from("causes")
      .select("created_at, updated_at, status")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    const total = causes?.length || 0;
    const pending = causes?.filter((c) => c.status === "pending").length || 0;
    const approved = causes?.filter((c) => c.status === "approved").length || 0;
    const completed =
      causes?.filter((c) => c.status === "completed" || c.status === "rejected")
        .length || 0; // Assuming rejected is terminal too

    let totalApprovalTime = 0;
    let approvedCount = 0;

    causes?.forEach((c) => {
      if (c.status === "approved" && c.updated_at) {
        const start = new Date(c.created_at).getTime();
        const end = new Date(c.updated_at).getTime();
        totalApprovalTime += end - start;
        approvedCount++;
      }
    });

    return {
      avgApprovalTimeHours:
        approvedCount > 0
          ? totalApprovalTime / approvedCount / (1000 * 60 * 60)
          : 0,
      avgCompletionTimeDays: 0, // Need 'completed_at' which doesn't exist yet
      funnel: {
        created: total,
        pending,
        approved,
        completed,
      },
    };
  } catch (error) {
    return {
      avgApprovalTimeHours: 0,
      avgCompletionTimeDays: 0,
      funnel: { created: 0, pending: 0, approved: 0, completed: 0 },
    };
  }
}

export async function getAlerts(): Promise<Alert[]> {
  const kyc = await getKycAnalytics();
  const payment = await getPaymentAnalytics();

  const alerts: Alert[] = [];

  if (kyc.approvalRate < 50 && kyc.total > 5) {
    alerts.push({
      id: "kyc-rate",
      type: "warning",
      message: "KYC Approval Rate is low",
      metric: "Approval Rate",
      value: `${kyc.approvalRate.toFixed(1)}%`,
      threshold: "< 50%",
    });
  }

  if (payment.failureRate > 5) {
    alerts.push({
      id: "payment-fail",
      type: "critical",
      message: "High Payment Failure Rate",
      metric: "Failure Rate",
      value: `${payment.failureRate.toFixed(1)}%`,
      threshold: "> 5%",
    });
  }

  return alerts;
}
