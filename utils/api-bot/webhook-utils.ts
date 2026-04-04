import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { Database } from "@/types/database-types";

// Note: Using service role client for background dispatching to ensure reliability
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type WebhookEvent = "campaign.created" | "donation.success" | "campaign.completed" | "campaign.updated" | "campaign.reported" | "campaign.taken_down";

/**
 * Dispatches a webhook notification to all active endpoints subscribed to the given event.
 */
export async function dispatchWebhook(
  userId: string,
  event: WebhookEvent,
  payload: any
) {
  // 1. Fetch active webhooks for the user subscribed to this event
  const { data: webhooks, error } = await supabaseAdmin
    .from("api_webhooks")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .contains("events", [event]);

  if (error) {
    console.error(`[Webhook] Error fetching webhooks for user ${userId}:`, error);
    return;
  }

  if (!webhooks || webhooks.length === 0) {
    return;
  }

  // 2. Dispatch to each endpoint
  const promises = webhooks.map(async (webhook) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({
      event,
      created_at: new Date().toISOString(),
      payload,
    });

    // Generate HMAC-SHA256 signature
    // Signature = hmac_sha256(webhook_secret, timestamp + "." + body)
    const signaturePayload = `${timestamp}.${body}`;
    const hmac = crypto.createHmac("sha256", webhook.secret);
    const signature = hmac.update(signaturePayload).digest("hex");

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RefreeG-Signature": `t=${timestamp},v1=${signature}`,
          "User-Agent": "RefreeG-Webhook-Dispatcher/1.0",
        },
        body,
      });

      const responseText = await response.text();

      // Log the delivery attempt
      await supabaseAdmin.from("api_webhook_logs").insert({
        webhook_id: webhook.id,
        event_type: event,
        payload,
        status_code: response.status,
        response_body: responseText.slice(0, 1000), // Truncate long responses
        attempts: 1,
      });

    } catch (dispatchError: any) {
      console.error(`[Webhook] Dispatch failed for ${webhook.url}:`, dispatchError);
      
      // Log the failed attempt
      await supabaseAdmin.from("api_webhook_logs").insert({
        webhook_id: webhook.id,
        event_type: event,
        payload,
        status_code: null,
        response_body: dispatchError.message || "Failed to connect",
        attempts: 1,
      });
    }
  });

  // We don't necessarily want to await all of them if we're in a critical path,
  // but for now we'll let them run. Best to use a queue in production.
  await Promise.allSettled(promises);
}
