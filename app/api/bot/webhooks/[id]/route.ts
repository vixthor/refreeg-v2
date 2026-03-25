import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateWebhookSchema = z.object({
  url: z.string().url().startsWith("https://").optional(),
  events: z.array(z.enum(["campaign.created", "donation.success", "campaign.completed", "campaign.updated"])).min(1).optional(),
  is_active: z.boolean().optional(),
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const limitRes = rateLimit(req);
  if (limitRes?.errorResponse) return limitRes.errorResponse;

  const auth = await validateApiKey(req);
  if (auth.errorResponse) return auth.errorResponse;

  const supabase = await createClient();
  const { error } = await supabase
    .from("api_webhooks")
    .delete()
    .eq("id", params.id)
    .eq("user_id", auth.userId!); // Ensure ownership

  if (error) {
    return NextResponse.json({ error: "Failed to delete webhook", code: "DATABASE_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Webhook deleted" });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const limitRes = rateLimit(req);
  if (limitRes?.errorResponse) return limitRes.errorResponse;

  const auth = await validateApiKey(req);
  if (auth.errorResponse) return auth.errorResponse;

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
        return NextResponse.json({ error: "Webhook not found", code: "NOT_FOUND" }, { status: 404 });
      }
      return NextResponse.json({ error: "Failed to update webhook", code: "DATABASE_ERROR" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message, code: "INVALID_REQUEST" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
