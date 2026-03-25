import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";
import { createClient } from "@supabase/supabase-js";
import { logApiRequest } from "@/utils/api-bot/request-logger";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const startedAt = Date.now();
  const limitRes = rateLimit(request);
  if (limitRes?.errorResponse) {
    await logApiRequest({ request, statusCode: 429, errorCode: "rate_limited", startedAt });
    return limitRes.errorResponse;
  }

  const authRes = await validateApiKey(request);
  if (authRes.errorResponse) {
    await logApiRequest({ request, statusCode: 401, errorCode: "unauthorized", startedAt });
    return authRes.errorResponse;
  }

  try {
    const body = await request.json();
    const { reason, message } = body;

    if (!reason || !message) {
      const response = NextResponse.json({
        status: "error",
        error: { code: "validation_error", message: "Reason and message are required" }
      }, { status: 400 });

      await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, errorCode: "validation_error", startedAt });
      return response;
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
      const response = NextResponse.json({
        status: "error",
        error: { code: "internal_error", message: "Failed to submit report" }
      }, { status: 500 });

      await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, errorCode: "internal_error", startedAt });
      return response;
    }

    const response = NextResponse.json({
      status: "success",
      data: { message: "Report submitted. RefreeG will review this campaign." }
    });

    await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, startedAt });
    return response;
  } catch (err) {
    const response = NextResponse.json({
      status: "error",
      error: { code: "bad_request", message: "Invalid JSON format" }
    }, { status: 400 });

    await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, errorCode: "bad_request", startedAt });
    return response;
  }
}
