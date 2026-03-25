import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";
import { CreateCampaignSchema } from "@/utils/api-bot/schemas";
import { logApiRequest } from "@/utils/api-bot/request-logger";

export async function POST(request: NextRequest) {
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
    const result = CreateCampaignSchema.safeParse(body);

    if (!result.success) {
      const response = NextResponse.json({
        status: "error",
        error: { 
          code: "validation_error", 
          message: "Validation failed", 
          details: result.error.format() 
        }
      }, { status: 400 });

      await logApiRequest({
        request,
        statusCode: response.status,
        apiKeyId: authRes.apiKeyId,
        userId: authRes.userId,
        mode: authRes.mode,
        errorCode: "validation_error",
        startedAt,
      });

      return response;
    }

    const response = NextResponse.json({
      status: "success",
      data: { valid: true, message: "Campaign data is valid" }
    });

    await logApiRequest({
      request,
      statusCode: response.status,
      apiKeyId: authRes.apiKeyId,
      userId: authRes.userId,
      mode: authRes.mode,
      startedAt,
    });

    return response;
  } catch (err) {
    const response = NextResponse.json({
      status: "error",
      error: { code: "bad_request", message: "Invalid JSON format" }
    }, { status: 400 });

    await logApiRequest({
      request,
      statusCode: response.status,
      apiKeyId: authRes.apiKeyId,
      userId: authRes.userId,
      mode: authRes.mode,
      errorCode: "bad_request",
      startedAt,
    });

    return response;
  }
}
