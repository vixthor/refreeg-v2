import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database-types";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const limitRes = rateLimit(request);
  if (limitRes?.errorResponse) return limitRes.errorResponse;

  const authRes = await validateApiKey(request);
  if (authRes.errorResponse) return authRes.errorResponse;

  const { data: campaign, error } = await supabaseAdmin.from("api_campaigns")
    .update({ status: "paused" })
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
