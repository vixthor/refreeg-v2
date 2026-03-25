import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function logApiRequest({
  request,
  statusCode,
  apiKeyId,
  userId,
  mode,
  errorCode,
  startedAt,
}: {
  request: NextRequest;
  statusCode: number;
  apiKeyId?: string | null;
  userId?: string | null;
  mode?: string | null;
  errorCode?: string | null;
  startedAt?: number;
}) {
  try {
    const adminClient = createAdminClient();
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    await adminClient.from("api_request_logs").insert({
      api_key_id: apiKeyId ?? null,
      user_id: userId ?? null,
      endpoint: request.nextUrl.pathname,
      method: request.method,
      mode: mode ?? null,
      status_code: statusCode,
      error_code: errorCode ?? null,
      ip_address: ipAddress,
      response_time_ms: startedAt ? Date.now() - startedAt : null,
    });
  } catch (error) {
    console.error("Failed to log API request", error);
  }
}