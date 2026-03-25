import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";

export async function GET(request: NextRequest) {
  // 1. Rate limiting check (100 req / minute by default)
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult?.errorResponse) return rateLimitResult.errorResponse;

  // 2. Auth check
  const authResult = await validateApiKey(request);
  if (authResult.errorResponse) return authResult.errorResponse;

  // 3. Success
  return NextResponse.json({
    status: "success",
    data: {
      message: "pong",
      mode: authResult.mode,
      user_id: authResult.userId,
      timestamp: new Date().toISOString(),
    },
  });
}
