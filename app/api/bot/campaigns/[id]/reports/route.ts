import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database-types";
import { validateApiKey, rateLimit, handlePreflight } from "@/utils/api-bot/api-auth";
import { ReportCampaignSchema } from "@/utils/api-bot/schemas";
import { dispatchWebhook } from "@/utils/api-bot/webhook-utils";
import { 
  successResponse, 
  errorResponse, 
  ApiErrorCode 
} from "@/utils/api-bot/response-utils";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const limitRes = rateLimit(request, 30, 60000);
    if (limitRes?.errorResponse) return limitRes.errorResponse;

    const authRes = await validateApiKey(request);
    if (authRes?.errorResponse) return authRes.errorResponse;
    const developerId = authRes.userId;

    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from("api_campaigns")
      .select("id")
      .eq("id", params.id)
      .eq("developer_id", developerId)
      .single();

    if (campaignError || !campaign) {
      return errorResponse("Campaign not found or unauthorized to view its reports", ApiErrorCode.NOT_FOUND, 404);
    }

    const { data: reports, error: reportsError } = await supabaseAdmin
      .from("api_campaign_reports")
      .select("*")
      .eq("api_campaign_id", params.id)
      .order("created_at", { ascending: false });

    if (reportsError) {
      console.error("Error fetching reports:", reportsError);
      return errorResponse("Failed to fetch reports", ApiErrorCode.INTERNAL_ERROR, 500);
    }

    return successResponse({ reports });
  } catch (error) {
    console.error("Fetch reports error:", error);
    return errorResponse("Internal server error", ApiErrorCode.INTERNAL_ERROR, 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const limitRes = rateLimit(request, 10, 60000);
    if (limitRes?.errorResponse) return limitRes.errorResponse;

    const authRes = await validateApiKey(request);
    if (authRes?.errorResponse) return authRes.errorResponse;

    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from("api_campaigns")
      .select("id, developer_id")
      .eq("id", params.id)
      .single();

    if (campaignError || !campaign) {
      return errorResponse("Campaign not found", ApiErrorCode.NOT_FOUND, 404);
    }

    const body = await request.json();
    const result = ReportCampaignSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("Validation failed", ApiErrorCode.VALIDATION_ERROR, 400, result.error.format());
    }

    const { reason, message } = result.data;

    const { data: report, error: insertError } = await supabaseAdmin
      .from("api_campaign_reports")
      .insert({
        api_campaign_id: campaign.id,
        developer_id: campaign.developer_id,
        api_key_id: authRes.apiKeyId,
        reason,
        message,
        status: "pending",
      })
      .select()
      .single();

    if (insertError || !report) {
      console.error("Error inserting report:", insertError);
      return errorResponse("Failed to submit report", ApiErrorCode.INTERNAL_ERROR, 500);
    }

    // Notify the developer whose campaign was reported via webhook
    await dispatchWebhook(
      campaign.developer_id,
      "campaign.reported",
      {
        campaign_id: campaign.id,
        report_id: report.id,
        reason: report.reason,
        status: report.status,
        message: report.message,
        created_at: report.created_at
      }
    );

    return successResponse({ message: "Report submitted successfully", report }, 201);
  } catch (error) {
    console.error("Report error:", error);
    return errorResponse("Internal server error", ApiErrorCode.INTERNAL_ERROR, 500);
  }
}

export async function OPTIONS() {
  return handlePreflight();
}
