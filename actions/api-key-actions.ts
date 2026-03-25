"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateApiKey, hashApiKey } from "@/utils/api-bot/api-keys";

export async function createApiKey(name: string, mode: "live" | "test") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .single();

  if (profile?.account_type !== "developer") {
    throw new Error("Only developers can create API keys");
  }

  const { fullKey, displayPrefix } = generateApiKey(mode);
  const keyHash = hashApiKey(fullKey);

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      user_id: user.id,
      name,
      key_prefix: displayPrefix,
      key_hash: keyHash,
      mode,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create API key: ${error.message}`);
  }

  revalidatePath("/dashboard/developer/api-keys");

  // Return the full key ONLY ONCE so the UI can show it
  // We explicitly return rawKey alongside the DB object
  return { ...data, rawKey: fullKey };
}

export async function getApiKeys() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch API keys");
  }

  return data;
}

export async function revokeApiKey(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id); // Ensure user owns the key

  if (error) throw new Error("Failed to revoke key");

  revalidatePath("/dashboard/developer/api-keys");
  return true;
}
