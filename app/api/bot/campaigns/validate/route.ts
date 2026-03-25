import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";
import { CreateCampaignSchema } from "@/utils/api-bot/schemas";

export async function POST(request: NextRequest) {
  const limitRes = rateLimit(request);
  if (limitRes?.errorResponse) return limitRes.errorResponse;

  const authRes = await validateApiKey(request);
  if (authRes.errorResponse) return authRes.errorResponse;

  try {
    const body = await request.json();
    const result = CreateCampaignSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        status: "error",
        error: { 
          code: "validation_error", 
          message: "Validation failed", 
          details: result.error.format() 
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      status: "success",
      data: { valid: true, message: "Campaign data is valid" }
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      error: { code: "bad_request", message: "Invalid JSON format" }
    }, { status: 400 });
  }
}
