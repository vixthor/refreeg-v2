import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";
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

  // Verify campaign ownership
  const { data: campaign, error: campaignError } = await supabaseAdmin
    .from("api_campaigns")
    .select("id")
    .eq("id", params.id)
    .eq("developer_id", authRes.userId)
    .eq("mode", authRes.mode)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({
      status: "error",
      error: { code: "not_found", message: "Campaign not found or access denied" }
    }, { status: 404 });
  }

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const { data: donations, error, count } = await supabaseAdmin
    .from("donations")
    .select("*", { count: "exact" })
    .eq("cause_id", params.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({
      status: "error",
      error: { code: "internal_error", message: "Failed to fetch donations" }
    }, { status: 500 });
  }

  return NextResponse.json({
    status: "success",
    data: donations,
    meta: {
      total: count,
      limit,
      offset
    }
  });
}
