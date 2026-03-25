import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";
import { UpdateCampaignSchema } from "@/utils/api-bot/schemas";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database-types";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const limitRes = rateLimit(request);
  if (limitRes?.errorResponse) return limitRes.errorResponse;

  const authRes = await validateApiKey(request);
  if (authRes.errorResponse) return authRes.errorResponse;

  const { data: campaign, error } = await supabaseAdmin
    .from("api_campaigns")
    .select("*")
    .eq("id", params.id)
    .eq("developer_id", authRes.userId)
    .eq("mode", authRes.mode)
    .single();

  if (error || !campaign) {
    return NextResponse.json({
      status: "error",
      error: { code: "not_found", message: "Campaign not found or access denied" }
    }, { status: 404 });
  }

  return NextResponse.json({
    status: "success",
    data: campaign
  });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const limitRes = rateLimit(request);
  if (limitRes?.errorResponse) return limitRes.errorResponse;

  const authRes = await validateApiKey(request);
  if (authRes.errorResponse) return authRes.errorResponse;

  try {
    const body = await request.json();
    const result = UpdateCampaignSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({
        status: "error",
        error: { code: "validation_error", message: "Invalid updates", details: result.error.format() }
      }, { status: 400 });
    }

    // Update in DB
    const { data: campaign, error } = await supabaseAdmin.from("api_campaigns")
      .update(result.data)
      .eq("id", params.id)
      .eq("developer_id", authRes.userId)
      .eq("mode", authRes.mode)
      .select()
      .single();

    if (error || !campaign) {
      return NextResponse.json({
        status: "error",
        error: { code: "not_found", message: "Campaign not found or access denied" }
      }, { status: 404 });
    }

    return NextResponse.json({
      status: "success",
      data: campaign
    });

  } catch (err) {
    return NextResponse.json({
      status: "error",
      error: { code: "bad_request", message: "Invalid JSON format" }
    }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const limitRes = rateLimit(request);
  if (limitRes?.errorResponse) return limitRes.errorResponse;

  const authRes = await validateApiKey(request);
  if (authRes.errorResponse) return authRes.errorResponse;

  // We do not physically delete campaigns, just set status = 'cancelled'
  const { data: campaign, error } = await supabaseAdmin.from("api_campaigns")
    .update({ status: "cancelled" })
    .eq("id", params.id)
    .eq("developer_id", authRes.userId)
    .eq("mode", authRes.mode)
    .select()
    .single();

  if (error || !campaign) {
    return NextResponse.json({
      status: "error",
      error: { code: "not_found", message: "Campaign not found or access denied" }
    }, { status: 404 });
  }

  return NextResponse.json({
    status: "success",
    data: { id: campaign.id, status: campaign.status }
  });
}
