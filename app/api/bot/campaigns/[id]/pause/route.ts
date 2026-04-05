import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, rateLimit, handlePreflight } from "@/utils/api-bot/api-auth";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database-types";
import { logApiRequest } from "@/utils/api-bot/request-logger";
import { 
  successResponse, 
  errorResponse, 
  ApiErrorCode 
} from "@/utils/api-bot/response-utils";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const startedAt = Date.now();
  const limitRes = rateLimit(request);
  if (limitRes?.errorResponse) {
    await logApiRequest({ request, statusCode: 429, errorCode: ApiErrorCode.RATE_LIMIT_EXCEEDED, startedAt });
    return limitRes.errorResponse;
  }

  const authRes = await validateApiKey(request);
  if (authRes.errorResponse) {
    await logApiRequest({ request, statusCode: 401, errorCode: ApiErrorCode.UNAUTHORIZED, startedAt });
    return authRes.errorResponse;
  }

  const { data: campaign, error } = await supabaseAdmin.from("api_campaigns")
    .update({ status: "paused" })
    .eq("id", params.id)
    .eq("developer_id", authRes.userId)
    .eq("mode", authRes.mode)
    .select()
    .single();

  if (error || !campaign) {
    const response = errorResponse("Campaign not found or access denied", ApiErrorCode.NOT_FOUND, 404);

    await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, errorCode: ApiErrorCode.NOT_FOUND, startedAt });
    return response;
  }

  const response = successResponse({ id: campaign.id, status: campaign.status });

  await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, startedAt });
  return response;
}

export async function OPTIONS() {
  return handlePreflight();
}
