import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const limitRes = rateLimit(request);
  if (limitRes?.errorResponse) return limitRes.errorResponse;

  const authRes = await validateApiKey(request);
  if (authRes.errorResponse) return authRes.errorResponse;

  try {
    const body = await request.json();
    const { reason, message } = body;

    if (!reason || !message) {
      return NextResponse.json({
        status: "error",
        error: { code: "validation_error", message: "Reason and message are required" }
      }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("campaign_reports").insert({
      campaign_id: params.id,
      developer_id: authRes.userId,
      api_key_id: authRes.apiKeyId,
      reason,
      message,
      status: "pending"
    });

    if (error) {
      console.error("Failed to insert report:", error);
      return NextResponse.json({
        status: "error",
        error: { code: "internal_error", message: "Failed to submit report" }
      }, { status: 500 });
    }

    return NextResponse.json({
      status: "success",
      data: { message: "Report submitted. RefreeG will review this campaign." }
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      error: { code: "bad_request", message: "Invalid JSON format" }
    }, { status: 400 });
  }
}
