"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth-actions";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function getWebhooks() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("api_webhooks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createWebhook(url: string, events: string[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createClient();
  
  // Generate secret
  const secret = `wh_sec_${crypto.randomBytes(24).toString("hex")}`;

  const { data, error } = await supabase
    .from("api_webhooks")
    .insert({
      user_id: user.id,
      url,
      events,
      secret,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath("/dashboard/developer/webhooks");
  return data;
}

export async function deleteWebhook(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createClient();
  const { error } = await supabase
    .from("api_webhooks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  
  revalidatePath("/dashboard/developer/webhooks");
}

export async function getWebhookLogs(webhookId?: string, limit = 50) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createClient();
  let query = supabase
    .from("api_webhook_logs")
    .select(`
      *,
      api_webhooks!inner(url, user_id)
    `)
    .eq("api_webhooks.user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (webhookId) {
    query = query.eq("webhook_id", webhookId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}
