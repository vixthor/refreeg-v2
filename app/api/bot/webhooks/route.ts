import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import crypto from "crypto";

const RegisterWebhookSchema = z.object({
  url: z.string().url("A valid HTTPS URL is required").startsWith("https://", "Webhooks must use HTTPS for security"),
  events: z.array(z.enum(["campaign.created", "donation.success", "campaign.completed", "campaign.updated"])).min(1, "At least one event must be selected"),
});

export async function POST(req: NextRequest) {
  const limitRes = rateLimit(req);
  if (limitRes?.errorResponse) return limitRes.errorResponse;

  const auth = await validateApiKey(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const validated = RegisterWebhookSchema.parse(body);

    const supabase = await createClient();
    
    // Generate a secure secret for signing
    const secret = `wh_sec_${crypto.randomBytes(24).toString("hex")}`;

    const { data, error } = await supabase
      .from("api_webhooks")
      .insert({
        user_id: auth.userId!,
        url: validated.url,
        events: validated.events,
        secret,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error("Error registering webhook:", error);
      return NextResponse.json({ error: "Failed to register webhook", code: "DATABASE_ERROR" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        url: data.url,
        events: data.events,
        secret: data.secret, // Return once during registration
        created_at: data.created_at
      }
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message, code: "INVALID_REQUEST" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const limitRes = rateLimit(req);
  if (limitRes?.errorResponse) return limitRes.errorResponse;

  const auth = await validateApiKey(req);
  if (auth.errorResponse) return auth.errorResponse;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("api_webhooks")
    .select("id, url, events, is_active, created_at")
    .eq("user_id", auth.userId!);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch webhooks", code: "DATABASE_ERROR" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data
  });
}
