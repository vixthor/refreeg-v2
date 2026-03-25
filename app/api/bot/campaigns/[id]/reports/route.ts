import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database-types";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";
import { ReportCampaignSchema } from "@/utils/api-bot/schemas";
import { dispatchWebhook } from "@/utils/api-bot/webhook-utils";

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
      .eq("user_id", developerId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { status: "error", error: { code: "not_found", message: "Campaign not found or unauthorized to view its reports" } },
        { status: 404 }
      );
    }

    const { data: reports, error: reportsError } = await supabaseAdmin
      .from("api_campaign_reports")
      .select("*")
      .eq("api_campaign_id", params.id)
      .order("created_at", { ascending: false });

    if (reportsError) {
      console.error("Error fetching reports:", reportsError);
      return NextResponse.json(
        { status: "error", error: { code: "internal_error", message: "Failed to fetch reports" } },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "success", data: { reports } }, { status: 200 });
  } catch (error) {
    console.error("Fetch reports error:", error);
    return NextResponse.json(
      { status: "error", error: { code: "internal_error", message: "Internal server error" } },
      { status: 500 }
    );
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
      .select("id, user_id")
      .eq("id", params.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { status: "error", error: { code: "not_found", message: "Campaign not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = ReportCampaignSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { status: "error", error: { code: "validation_failed", details: result.error.format() } },
        { status: 400 }
      );
    }

    const { reason, message } = result.data;

    const { data: report, error: insertError } = await supabaseAdmin
      .from("api_campaign_reports")
      .insert({
        api_campaign_id: campaign.id,
        reason,
        message,
        status: "pending",
      })
      .select()
      .single();

    if (insertError || !report) {
      console.error("Error inserting report:", insertError);
      return NextResponse.json(
        { status: "error", error: { code: "internal_error", message: "Failed to submit report" } },
        { status: 500 }
      );
    }

    // Notify the developer whose campaign was reported via webhook
    await dispatchWebhook(
      campaign.user_id,
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

    return NextResponse.json(
      { status: "success", data: { message: "Report submitted successfully", report } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { status: "error", error: { code: "internal_error", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
