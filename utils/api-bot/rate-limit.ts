import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiting map for MVP. 
// Note: In a multi-instance edge deployment, this will be per-instance.
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

export const RateLimitResponse = () => 
  NextResponse.json({ 
    status: "error", 
    error: { code: "rate_limited", message: "Too many requests. Please slow down." } 
  }, { status: 429 });

/**
 * Checks if the request should be rate limited.
 * Returns { errorResponse } if limited, otherwise returns null.
 */
export function rateLimit(request: NextRequest, limit: number = 100, windowMs: number = 60000) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
  const now = Date.now();
  
  const record = rateLimitMap.get(ip);
  if (!record) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return null; // OK
  }
  
  if (now - record.timestamp > windowMs) {
    // Window expired, reset
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return null; // OK
  }
  
  if (record.count >= limit) {
    return { errorResponse: RateLimitResponse() };
  }
  
  record.count += 1;
  return null; // OK
}
