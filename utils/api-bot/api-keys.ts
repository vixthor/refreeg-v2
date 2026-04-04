import crypto from "crypto";

export function generateApiKey(mode: "live" | "test") {
  const entropy = crypto.randomBytes(32).toString("hex");
  const prefix = mode === "live" ? "rg_live_" : "rg_test_";
  const fullKey = `${prefix}sk_${entropy}`;
  
  // Display prefix shows distinguishing parts plus a snippet of entropy
  const displayPrefix = fullKey.substring(0, 16); 

  return { fullKey, displayPrefix };
}

export function hashApiKey(fullKey: string) {
  return crypto.createHash("sha256").update(fullKey).digest("hex");
}
