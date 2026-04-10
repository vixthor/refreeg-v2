import { NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron-auth";
import { chargeDuePledgesForToday } from "@/lib/pledge-paystack";

/**
 * Daily job: charge pledges whose reminder_date is today and card was authorized.
 *
 * Vercel Cron invokes routes with GET — export GET as well as POST.
 * Set CRON_SECRET in the Vercel project; Vercel sends Authorization: Bearer <CRON_SECRET>.
 */
async function handle(request: NextRequest) {
  const denied = assertCronAuthorized(request);
  if (denied) return denied;

  try {
    const result = await chargeDuePledgesForToday();
    return NextResponse.json(result);
  } catch (e) {
    console.error("pledge-charges cron error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return handle(request);
}

/** Vercel Cron (and some schedulers) call GET. */
export async function GET(request: NextRequest) {
  return handle(request);
}
