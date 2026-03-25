import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";
import { UpdateCampaignSchema } from "@/utils/api-bot/schemas";
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

  const { data: campaign, error } = await supabaseAdmin
    .from("api_campaigns")
    .select("*")
    .eq("id", params.id)
    .eq("developer_id", authRes.userId)
    .eq("mode", authRes.mode)
    .single();

  if (error || !campaign) {
    const response = errorResponse("Campaign not found or access denied", ApiErrorCode.NOT_FOUND, 404);

    await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, errorCode: ApiErrorCode.NOT_FOUND, startedAt });
    return response;
  }

  const response = successResponse(campaign);

  await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, startedAt });
  return response;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

  try {
    const body = await request.json();
    const result = UpdateCampaignSchema.safeParse(body);
    
    if (!result.success) {
      const response = errorResponse("Invalid updates", ApiErrorCode.VALIDATION_ERROR, 400, result.error.format());

      await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, errorCode: ApiErrorCode.VALIDATION_ERROR, startedAt });
      return response;
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
      const response = errorResponse("Campaign not found or access denied", ApiErrorCode.NOT_FOUND, 404);

      await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, errorCode: ApiErrorCode.NOT_FOUND, startedAt });
      return response;
    }

    const response = successResponse(campaign);

    await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, startedAt });
    return response;

  } catch (err) {
    const response = errorResponse("Invalid JSON format", ApiErrorCode.BAD_REQUEST, 400);

    await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, errorCode: ApiErrorCode.BAD_REQUEST, startedAt });
    return response;
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

  // We do not physically delete campaigns, just set status = 'cancelled'
  const { data: campaign, error } = await supabaseAdmin.from("api_campaigns")
    .update({ status: "cancelled" })
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
