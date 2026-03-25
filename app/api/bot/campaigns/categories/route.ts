import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";

// Static categories based on TDD specification
const CATEGORIES = [
  { id: "education", display_name: "Education" },
  { id: "health", display_name: "Healthcare" },
  { id: "environment", display_name: "Environment" },
  { id: "community", display_name: "Community" },
  { id: "disaster", display_name: "Disaster Relief" },
  { id: "animals", display_name: "Animal Welfare" },
  { id: "creative", display_name: "Creative" },
  { id: "business", display_name: "Business" },
];

export async function GET(request: NextRequest) {
  const limitRes = rateLimit(request);
  if (limitRes?.errorResponse) return limitRes.errorResponse;

  const authRes = await validateApiKey(request);
  if (authRes.errorResponse) return authRes.errorResponse;

  return NextResponse.json({
    status: "success",
    data: CATEGORIES
  });
}
