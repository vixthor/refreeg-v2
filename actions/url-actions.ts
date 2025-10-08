"use server";

import { createClient } from "@/lib/supabase/server";
import { getBaseURL } from "@/lib/utils";

/**
 * Generate a random short code (6 characters)
 */
function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a shortened URL for a cause or petition
 */
export async function createShortUrl(
  entityId: string,
  entityType: "cause" | "petition",
  originalUrl: string
): Promise<string> {
  const supabase = await createClient();
  const baseUrl = getBaseURL();

  // Check if a short URL already exists for this entity
  const { data: existing } = await supabase
    .from("short_urls")
    .select("short_code")
    .eq("entity_id", entityId)
    .eq("entity_type", entityType)
    .single();

  if (existing) {
    return `${baseUrl}/s/${existing.short_code}`;
  }

  // Generate a unique short code
  let shortCode = generateShortCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const { data: collision } = await supabase
      .from("short_urls")
      .select("short_code")
      .eq("short_code", shortCode)
      .single();

    if (!collision) {
      break;
    }

    shortCode = generateShortCode();
    attempts++;
  }

  if (attempts === maxAttempts) {
    throw new Error("Failed to generate unique short code");
  }

  // Insert the short URL
  const { error } = await supabase.from("short_urls").insert({
    short_code: shortCode,
    entity_id: entityId,
    entity_type: entityType,
    original_url: originalUrl,
    clicks: 0,
  });

  if (error) {
    console.error("Error creating short URL:", error);
    throw error;
  }

  return `${baseUrl}/s/${shortCode}`;
}

/**
 * Get the original URL from a short code and increment click count
 */
export async function getOriginalUrl(shortCode: string): Promise<string | null> {
  const supabase = await createClient();

  // Get the short URL record
  const { data, error } = await supabase
    .from("short_urls")
    .select("*")
    .eq("short_code", shortCode)
    .single();

  if (error || !data) {
    return null;
  }

  // Increment click count
  await supabase
    .from("short_urls")
    .update({ clicks: data.clicks + 1 })
    .eq("short_code", shortCode);

  return data.original_url;
}

/**
 * Get analytics for a shortened URL
 */
export async function getShortUrlAnalytics(
  entityId: string,
  entityType: "cause" | "petition"
): Promise<{ clicks: number; shortUrl: string } | null> {
  const supabase = await createClient();
  const baseUrl = getBaseURL();

  const { data, error } = await supabase
    .from("short_urls")
    .select("short_code, clicks")
    .eq("entity_id", entityId)
    .eq("entity_type", entityType)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    clicks: data.clicks,
    shortUrl: `${baseUrl}/s/${data.short_code}`,
  };
}