"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { dispatchWebhook } from "@/utils/api-bot/webhook-utils";
import { Database } from "@/types/database-types";
import { isAdminOrManager } from "@/actions/role-actions";

// For admin actions, we often need the service role to bypass RLS, depending on the setup.
const supabaseAdmin = createAdminClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** ADMIN: Get all reports across the platform */
export async function getApiCampaignReports() {
  const supabase = await createClient(); // Need session to check auth
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify the user is an admin or manager
  const hasPermission = await isAdminOrManager(user.id);
  if (!hasPermission) {
    throw new Error("Unauthorized: Admin or Manager role required");
  }
  
  const { data: reports, error } = await supabaseAdmin
    .from("api_campaign_reports")
    .select(`
      *,
      api_campaigns (
        id,
        title,
        user_id
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reports:", error);
    throw new Error("Failed to fetch reports");
  }

  return reports;
}

/** DEVELOPER: Get all reports for their own campaigns */
export async function getDeveloperCampaignReports() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // First fetch the developer's campaigns
  const { data: campaigns } = await supabase
    .from("api_campaigns")
    .select("id")
    .eq("user_id", user.id);

  if (!campaigns || campaigns.length === 0) {
    return [];
  }

  const campaignIds = campaigns.map((c: any) => c.id);

  // Use admin client safely here since we restrict by campaignIds
  // (Alternatively, if RLS is set up for devs to read their own reports, we could use regular client)
  const { data: reports, error } = await supabaseAdmin
    .from("api_campaign_reports")
    .select(`
      *,
      api_campaigns (
        id,
        title
      )
    `)
    .in("api_campaign_id", campaignIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching developer reports:", error);
    throw new Error("Failed to fetch your reports");
  }

  return reports;
}

/** ADMIN: Change status of a report (e.g. pending -> investigating -> resolved) */
export async function updateReportStatus(reportId: string, newStatus: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify the user is an admin or manager
  const hasPermission = await isAdminOrManager(user.id);
  if (!hasPermission) {
    throw new Error("Unauthorized: Admin or Manager role required");
  }

  const { error } = await supabaseAdmin
    .from("api_campaign_reports")
    .update({ status: newStatus })
    .eq("id", reportId);

  if (error) {
    console.error("Error updating report status:", error);
    throw new Error("Failed to update status");
  }

  revalidatePath("/dashboard/admin/api-reports");
  return { success: true };
}

/** ADMIN: Takedown a campaign (set status to cancelled) and resolve reports */
export async function takedownApiCampaign(campaignId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify the user is an admin or manager
  const hasPermission = await isAdminOrManager(user.id);
  if (!hasPermission) {
    throw new Error("Unauthorized: Admin or Manager role required");
  }

  // 1. Update Campaign Status
  const { data: campaign, error: campaignError } = await supabaseAdmin
    .from("api_campaigns")
    .update({ status: "cancelled" })
    .eq("id", campaignId)
    .select("id, user_id")
    .single();

  if (campaignError || !campaign) {
    console.error("Error cancelling campaign:", campaignError);
    throw new Error("Failed to takedown campaign");
  }

  // 2. Resolve all pending reports for this campaign
  await supabaseAdmin
    .from("api_campaign_reports")
    .update({ status: "resolved" })
    .eq("api_campaign_id", campaignId);

  // 3. Trigger Webhook
  await dispatchWebhook(
    campaign.user_id,
    "campaign.taken_down",
    {
      campaign_id: campaign.id,
      reason: "Campaign cancelled by RefreeG moderation team following reports.",
      cancelled_at: new Date().toISOString()
    }
  );

  revalidatePath("/dashboard/admin/api-reports");
  revalidatePath("/dashboard/developer/reports");
  
  return { success: true };
}
