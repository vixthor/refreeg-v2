import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashApiKey } from "@/utils/api-bot/api-keys";
import type { Database } from "@/types/database-types";

// Helper to standardise early returns in API routes
export const UnauthorizedResponse = () =>
  NextResponse.json(
    {
      status: "error",
      error: { code: "unauthorized", message: "Invalid or missing API key" },
    },
    { status: 401 },
  );

/**
 * Validates an API key from the Authorization header.
 * Use this at the top of your `app/api/v1/*` route handlers.
 *
 * @returns { user_id, mode } if valid, otherwise returns a NextResponse that should be yielded.
 */
export async function validateApiKey(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { errorResponse: UnauthorizedResponse() };
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return { errorResponse: UnauthorizedResponse() };
  }

  const keyHash = hashApiKey(token);

  // We must use the service role key because API requests don't have user session cookies,
  // so RLS would block us from reading the api_keys table.
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: apiKey, error } = await supabaseAdmin
    .from("api_keys")
    .select("id, user_id, mode")
    .eq("key_hash", keyHash)
    .is("revoked_at", null)
    .single();

  if (error || !apiKey) {
    return { errorResponse: UnauthorizedResponse() };
  }

  // Asynchronously update last_used_at (fire-and-forget for performance)
  supabaseAdmin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key_hash", keyHash)
    // catch any errors so it doesn't crash the request
    .then(({ error }) => {
      if (error) console.error("Failed to update last_used_at", error);
    });

  return {
    apiKeyId: apiKey.id,
    userId: apiKey.user_id,
    mode: apiKey.mode as "live" | "test",
  };
}
