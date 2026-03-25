import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { logApiRequest } from "@/utils/api-bot/request-logger";
import { 
  successResponse, 
  errorResponse, 
  ApiErrorCode 
} from "@/utils/api-bot/response-utils";

const UpdateWebhookSchema = z.object({
  url: z.string().url().startsWith("https://").optional(),
  events: z.array(z.enum(["campaign.created", "donation.success", "campaign.completed", "campaign.updated", "campaign.reported"])).min(1).optional(),
  is_active: z.boolean().optional(),
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startedAt = Date.now();
  const limitRes = rateLimit(req);
  if (limitRes?.errorResponse) {
    await logApiRequest({ request: req, statusCode: 429, errorCode: ApiErrorCode.RATE_LIMIT_EXCEEDED, startedAt });
    return limitRes.errorResponse;
  }

  const auth = await validateApiKey(req);
  if (auth.errorResponse) {
    await logApiRequest({ request: req, statusCode: 401, errorCode: ApiErrorCode.UNAUTHORIZED, startedAt });
    return auth.errorResponse;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("api_webhooks")
    .delete()
    .eq("id", params.id)
    .eq("user_id", auth.userId!); // Ensure ownership

  if (error) {
    const response = errorResponse("Failed to delete webhook", ApiErrorCode.DATABASE_ERROR, 500);
    await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: ApiErrorCode.DATABASE_ERROR, startedAt });
    return response;
  }

  const response = successResponse({ message: "Webhook deleted" });
  await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, startedAt });
  return response;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startedAt = Date.now();
  const limitRes = rateLimit(req);
  if (limitRes?.errorResponse) {
    await logApiRequest({ request: req, statusCode: 429, errorCode: ApiErrorCode.RATE_LIMIT_EXCEEDED, startedAt });
    return limitRes.errorResponse;
  }

  const auth = await validateApiKey(req);
  if (auth.errorResponse) {
    await logApiRequest({ request: req, statusCode: 401, errorCode: ApiErrorCode.UNAUTHORIZED, startedAt });
    return auth.errorResponse;
  }

  try {
    const body = await req.json();
    const validated = UpdateWebhookSchema.parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("api_webhooks")
      .update(validated)
      .eq("id", params.id)
      .eq("user_id", auth.userId!)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        const response = errorResponse("Webhook not found", ApiErrorCode.NOT_FOUND, 404);
        await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: ApiErrorCode.NOT_FOUND, startedAt });
        return response;
      }
      const response = errorResponse("Failed to update webhook", ApiErrorCode.DATABASE_ERROR, 500);
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: ApiErrorCode.DATABASE_ERROR, startedAt });
      return response;
    }

    const response = successResponse(data);

    await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, startedAt });
    return response;

  } catch (err) {
    if (err instanceof z.ZodError) {
      const response = errorResponse("Invalid request", ApiErrorCode.VALIDATION_ERROR, 400, err.format());
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: ApiErrorCode.VALIDATION_ERROR, startedAt });
      return response;
    }
    const response = errorResponse("Internal server error", ApiErrorCode.INTERNAL_ERROR, 500);
    await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: ApiErrorCode.INTERNAL_ERROR, startedAt });
    return response;
  }
}
