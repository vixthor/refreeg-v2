import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database-types";
import { logApiRequest } from "@/utils/api-bot/request-logger";
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse,
  ApiErrorCode 
} from "@/utils/api-bot/response-utils";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

  // Verify campaign ownership
  const { data: campaign, error: campaignError } = await supabaseAdmin
    .from("api_campaigns")
    .select("id")
    .eq("id", params.id)
    .eq("developer_id", authRes.userId)
    .eq("mode", authRes.mode)
    .single();

  if (campaignError || !campaign) {
    const response = errorResponse("Campaign not found or access denied", ApiErrorCode.NOT_FOUND, 404);

    await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, errorCode: ApiErrorCode.NOT_FOUND, startedAt });
    return response;
  }

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const { data: donations, error, count } = await supabaseAdmin
    .from("api_donations")
    .select("*", { count: "exact" })
    .eq("api_campaign_id", params.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    const response = errorResponse("Failed to fetch donations", ApiErrorCode.INTERNAL_ERROR, 500);

    await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, errorCode: ApiErrorCode.INTERNAL_ERROR, startedAt });
    return response;
  }

  const response = paginatedResponse(donations || [], count || 0, limit, offset);

  await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, startedAt });
  return response;
}
