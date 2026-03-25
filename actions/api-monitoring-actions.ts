"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole } from "@/actions/role-actions";
import { logAdminActivity } from "@/actions/database-actions";
import { formatCurrency } from "@/lib/utils";

type AdminRole = "admin" | "manager";

export interface ApiMonitoringSummary {
  activeKeys: number;
  totalKeys: number;
  apiCampaigns: number;
  activeCampaigns: number;
  pendingReports: number;
  totalRequestVolume: number;
  requestErrorRate: number;
  donationVolume: string;
  platformFeeRevenue: string;
}

export interface AdminApiCampaignRow {
  id: string;
  title: string;
  status: string;
  mode: string;
  payoutMode: string;
  currency: string;
  goalAmount: number;
  raisedAmount: number;
  developerId: string;
  developerName: string;
  developerEmail: string;
  apiKeyName: string | null;
  createdAt: string;
  updatedAt: string;
  reportsCount: number;
}

export interface AdminApiDonationRow {
  id: string;
  campaignId: string;
  campaignTitle: string;
  developerId: string;
  developerName: string;
  developerEmail: string;
  amount: number;
  tipAmount: number;
  feeRevenue: number;
  donorName: string;
  donorEmail: string;
  status: string;
  createdAt: string;
  paystackReference: string;
}

export interface CampaignReportRow {
  id: string;
  campaignId: string;
  campaignTitle: string;
  campaignStatus: string;
  developerId: string;
  developerName: string;
  developerEmail: string;
  reportReason: string;
  reportMessage: string;
  reportStatus: string;
  apiKeyName: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNotes: string | null;
}

export interface ApiUsageAnalytics {
  requestVolume: number;
  activeKeys: number;
  errorRate: number;
  topEndpoints: Array<{ endpoint: string; count: number; errorRate: number }>;
  recentErrors: Array<{
    id: string;
    endpoint: string;
    statusCode: number;
    errorCode: string | null;
    createdAt: string;
    apiKeyPrefix: string | null;
  }>;
}

async function requireAdminAccess(): Promise<{ userId: string; role: AdminRole }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const role = await getUserRole(user.id);
  if (role !== "admin" && role !== "manager") {
    throw new Error("Access denied");
  }

  return { userId: user.id, role };
}

function mapProfiles<T extends { developer_id?: string | null; user_id?: string | null }>(
  rows: T[],
  profiles: Array<{ id: string; full_name: string | null; email?: string | null }>,
) {
  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      {
        name: profile.full_name ?? "Unknown developer",
        email: profile.email ?? "Unknown email",
      },
    ]),
  );

  return rows.map((row) => {
    const profile = profileMap.get(row.developer_id ?? row.user_id ?? "") ?? {
      name: "Unknown developer",
      email: "Unknown email",
    };

    return { ...row, developer_name: profile.name, developer_email: profile.email };
  });
}

export async function getApiMonitoringSummary(): Promise<ApiMonitoringSummary> {
  await requireAdminAccess();
  const adminClient = createAdminClient();

  const [keysRes, campaignsRes, reportsRes, donationsRes, requestLogsRes] = await Promise.all([
    adminClient.from("api_keys").select("id, revoked_at, last_used_at", { count: "exact" }),
    adminClient.from("api_campaigns").select("id, status", { count: "exact" }),
    adminClient
      .from("api_campaign_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    adminClient.from("api_donations").select("amount, status"),
    adminClient.from("api_request_logs").select("status_code"),
  ]);

  const activeKeys =
    keysRes.data?.filter((key) => !key.revoked_at && !!key.last_used_at).length ?? 0;
  const totalKeys = keysRes.count ?? keysRes.data?.length ?? 0;
  const totalCampaigns = campaignsRes.count ?? campaignsRes.data?.length ?? 0;
  const activeCampaigns =
    campaignsRes.data?.filter((campaign) => campaign.status === "active").length ?? 0;
  const pendingReports = reportsRes.count ?? 0;
  const successfulDonations =
    donationsRes.data?.filter((donation) => donation.status === "success") ?? [];
  const donationVolume = successfulDonations.reduce(
    (sum, donation) => sum + Number(donation.amount ?? 0),
    0,
  );
  const totalRequestVolume = requestLogsRes.data?.length ?? 0;
  const totalErrors =
    requestLogsRes.data?.filter((log) => Number(log.status_code) >= 400).length ?? 0;
  const requestErrorRate =
    totalRequestVolume > 0 ? Number(((totalErrors / totalRequestVolume) * 100).toFixed(1)) : 0;

  return {
    activeKeys,
    totalKeys,
    apiCampaigns: totalCampaigns,
    activeCampaigns,
    pendingReports,
    totalRequestVolume,
    requestErrorRate,
    donationVolume: formatCurrency(donationVolume),
    platformFeeRevenue: formatCurrency(donationVolume * 0.02),
  };
}

export async function listAdminApiCampaigns(): Promise<AdminApiCampaignRow[]> {
  await requireAdminAccess();
  const adminClient = createAdminClient();

  const { data: campaigns, error } = await adminClient
    .from("api_campaigns")
    .select("id, title, status, mode, payout_mode, currency, goal_amount, raised_amount, developer_id, api_key_id, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch API campaigns: ${error.message}`);
  }

  const developerIds = [...new Set((campaigns ?? []).map((campaign) => campaign.developer_id))];
  const apiKeyIds = [
    ...new Set((campaigns ?? []).map((campaign) => campaign.api_key_id).filter(Boolean)),
  ] as string[];

  const [{ data: profiles }, { data: apiKeys }, { data: reports }] = await Promise.all([
    developerIds.length
      ? adminClient.from("profiles").select("id, full_name, email").in("id", developerIds)
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null; email?: string | null }> }),
    apiKeyIds.length
      ? adminClient.from("api_keys").select("id, name").in("id", apiKeyIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
    campaigns?.length
      ? adminClient.from("api_campaign_reports").select("api_campaign_id, status").in("api_campaign_id", campaigns.map((campaign) => campaign.id))
      : Promise.resolve({ data: [] as Array<{ api_campaign_id: string; status: string }> }),
  ]);

  const keyMap = new Map((apiKeys ?? []).map((key) => [key.id, key.name]));
  const reportCountMap = new Map<string, number>();
  (reports ?? []).forEach((report) => {
    reportCountMap.set(report.api_campaign_id, (reportCountMap.get(report.api_campaign_id) ?? 0) + 1);
  });

  const campaignsWithProfiles = mapProfiles(campaigns ?? [], profiles ?? []);

  return campaignsWithProfiles.map((campaign) => ({
    id: campaign.id,
    title: campaign.title,
    status: campaign.status,
    mode: campaign.mode,
    payoutMode: campaign.payout_mode,
    currency: campaign.currency,
    goalAmount: Number(campaign.goal_amount ?? 0),
    raisedAmount: Number(campaign.raised_amount ?? 0),
    developerId: campaign.developer_id,
    developerName: campaign.developer_name,
    developerEmail: campaign.developer_email,
    apiKeyName: campaign.api_key_id ? keyMap.get(campaign.api_key_id) ?? null : null,
    createdAt: campaign.created_at,
    updatedAt: campaign.updated_at,
    reportsCount: reportCountMap.get(campaign.id) ?? 0,
  }));
}

export async function listAdminApiDonations(): Promise<AdminApiDonationRow[]> {
  await requireAdminAccess();
  const adminClient = createAdminClient();

  const { data: donations, error } = await adminClient
    .from("api_donations")
    .select("id, api_campaign_id, amount, tip_amount, donor_name, donor_email, status, created_at, paystack_reference")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch API donations: ${error.message}`);
  }

  const campaignIds = [...new Set((donations ?? []).map((donation) => donation.api_campaign_id))];
  const { data: campaigns } = campaignIds.length
    ? await adminClient
        .from("api_campaigns")
        .select("id, title, developer_id")
        .in("id", campaignIds)
    : { data: [] as Array<{ id: string; title: string; developer_id: string }> };

  const developerIds = [...new Set((campaigns ?? []).map((campaign) => campaign.developer_id))];
  const { data: profiles } = developerIds.length
    ? await adminClient.from("profiles").select("id, full_name, email").in("id", developerIds)
    : { data: [] as Array<{ id: string; full_name: string | null; email?: string | null }> };

  const campaignMap = new Map((campaigns ?? []).map((campaign) => [campaign.id, campaign]));
  const profileMap = new Map(
    (profiles ?? []).map((profile) => [
      profile.id,
      {
        name: profile.full_name ?? "Unknown developer",
        email: profile.email ?? "Unknown email",
      },
    ]),
  );

  return (donations ?? []).map((donation) => {
    const campaign = campaignMap.get(donation.api_campaign_id);
    const profile = campaign ? profileMap.get(campaign.developer_id) : undefined;

    return {
      id: donation.id,
      campaignId: donation.api_campaign_id,
      campaignTitle: campaign?.title ?? "Unknown campaign",
      developerId: campaign?.developer_id ?? "",
      developerName: profile?.name ?? "Unknown developer",
      developerEmail: profile?.email ?? "Unknown email",
      amount: Number(donation.amount ?? 0),
      tipAmount: Number(donation.tip_amount ?? 0),
      feeRevenue: Number(donation.amount ?? 0) * 0.02,
      donorName: donation.donor_name,
      donorEmail: donation.donor_email,
      status: donation.status,
      createdAt: donation.created_at,
      paystackReference: donation.paystack_reference,
    };
  });
}

export async function listCampaignReports(): Promise<CampaignReportRow[]> {
  await requireAdminAccess();
  const adminClient = createAdminClient();

  const { data: reports, error } = await adminClient
    .from("api_campaign_reports")
    .select("id, api_campaign_id, developer_id, api_key_id, reason, message, status, created_at, resolved_at, resolution_notes")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch campaign reports: ${error.message}`);
  }

  const campaignIds = [...new Set((reports ?? []).map((report) => report.api_campaign_id))];
  const developerIds = [...new Set((reports ?? []).map((report) => report.developer_id))];
  const apiKeyIds = [
    ...new Set((reports ?? []).map((report) => report.api_key_id).filter(Boolean)),
  ] as string[];

  const [{ data: campaigns }, { data: profiles }, { data: apiKeys }] = await Promise.all([
    campaignIds.length
      ? adminClient.from("api_campaigns").select("id, title, status").in("id", campaignIds)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string; status: string }> }),
    developerIds.length
      ? adminClient.from("profiles").select("id, full_name, email").in("id", developerIds)
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null; email?: string | null }> }),
    apiKeyIds.length
      ? adminClient.from("api_keys").select("id, name").in("id", apiKeyIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
  ]);

  const campaignMap = new Map((campaigns ?? []).map((campaign) => [campaign.id, campaign]));
  const profileMap = new Map(
    (profiles ?? []).map((profile) => [
      profile.id,
      {
        name: profile.full_name ?? "Unknown developer",
        email: profile.email ?? "Unknown email",
      },
    ]),
  );
  const apiKeyMap = new Map((apiKeys ?? []).map((apiKey) => [apiKey.id, apiKey.name]));

  return (reports ?? []).map((report) => ({
    id: report.id,
    campaignId: report.api_campaign_id,
    campaignTitle: campaignMap.get(report.api_campaign_id)?.title ?? "Unknown campaign",
    campaignStatus: campaignMap.get(report.api_campaign_id)?.status ?? "unknown",
    developerId: report.developer_id,
    developerName: profileMap.get(report.developer_id)?.name ?? "Unknown developer",
    developerEmail: profileMap.get(report.developer_id)?.email ?? "Unknown email",
    reportReason: report.reason,
    reportMessage: report.message,
    reportStatus: report.status,
    apiKeyName: report.api_key_id ? apiKeyMap.get(report.api_key_id) ?? null : null,
    createdAt: report.created_at,
    resolvedAt: report.resolved_at,
    resolutionNotes: report.resolution_notes,
  }));
}

export async function getApiUsageAnalytics(): Promise<ApiUsageAnalytics> {
  await requireAdminAccess();
  const adminClient = createAdminClient();

  const { data: logs, error } = await adminClient
    .from("api_request_logs")
    .select("id, endpoint, status_code, error_code, created_at, api_key_id")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    throw new Error(`Failed to fetch API request logs: ${error.message}`);
  }

  const apiKeyIds = [...new Set((logs ?? []).map((log) => log.api_key_id).filter(Boolean))] as string[];
  const { data: apiKeys } = apiKeyIds.length
    ? await adminClient.from("api_keys").select("id, key_prefix").in("id", apiKeyIds)
    : { data: [] as Array<{ id: string; key_prefix: string }> };

  const keyMap = new Map((apiKeys ?? []).map((apiKey) => [apiKey.id, apiKey.key_prefix]));
  const endpointCounts = new Map<string, { count: number; errors: number }>();
  let errors = 0;

  (logs ?? []).forEach((log) => {
    const endpoint = log.endpoint || "unknown";
    const entry = endpointCounts.get(endpoint) ?? { count: 0, errors: 0 };
    entry.count += 1;

    if (Number(log.status_code) >= 400) {
      entry.errors += 1;
      errors += 1;
    }

    endpointCounts.set(endpoint, entry);
  });

  const topEndpoints = [...endpointCounts.entries()]
    .sort((left, right) => right[1].count - left[1].count)
    .slice(0, 10)
    .map(([endpoint, stats]) => ({
      endpoint,
      count: stats.count,
      errorRate: stats.count > 0 ? Number(((stats.errors / stats.count) * 100).toFixed(1)) : 0,
    }));

  return {
    requestVolume: logs?.length ?? 0,
    activeKeys: new Set((logs ?? []).map((log) => log.api_key_id).filter(Boolean)).size,
    errorRate: (logs?.length ?? 0) > 0 ? Number(((errors / (logs?.length ?? 0)) * 100).toFixed(1)) : 0,
    topEndpoints,
    recentErrors: (logs ?? [])
      .filter((log) => Number(log.status_code) >= 400)
      .slice(0, 20)
      .map((log) => ({
        id: log.id,
        endpoint: log.endpoint,
        statusCode: Number(log.status_code),
        errorCode: log.error_code,
        createdAt: log.created_at,
        apiKeyPrefix: log.api_key_id ? keyMap.get(log.api_key_id) ?? null : null,
      })),
  };
}

export async function takeDownApiCampaign(formData: FormData) {
  const { userId } = await requireAdminAccess();
  const adminClient = createAdminClient();

  const campaignId = String(formData.get("campaignId") ?? "");
  const reportId = String(formData.get("reportId") ?? "");
  const notes = String(formData.get("notes") ?? "Taken down from admin dashboard");

  if (!campaignId) {
    throw new Error("Campaign ID is required");
  }

  const { error: campaignError } = await adminClient
    .from("api_campaigns")
    .update({ status: "cancelled" })
    .eq("id", campaignId);

  if (campaignError) {
    throw new Error(`Failed to take down campaign: ${campaignError.message}`);
  }

  if (reportId) {
    const { error: reportError } = await adminClient
      .from("api_campaign_reports")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
        resolution_notes: notes,
      })
      .eq("id", reportId);

    if (reportError) {
      throw new Error(`Failed to update report: ${reportError.message}`);
    }
  }

  await logAdminActivity("reject-cause", userId);

  revalidatePath("/dashboard/admin/api-monitoring");
  revalidatePath("/dashboard/admin/api-monitoring/campaigns");
  revalidatePath("/dashboard/admin/api-monitoring/reports");
}