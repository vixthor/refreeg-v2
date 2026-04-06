import { NextResponse } from "next/server";

/**
 * Common CORS headers for the public API
 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // Allow all origins for the bot API
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

/**
 * Handles OPTIONS preflight requests for API routes
 */
export function handleOptions() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

/**
 * Wraps a response with CORS headers
 */
export function withCors(response: NextResponse) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
