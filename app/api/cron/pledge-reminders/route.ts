import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertCronAuthorized } from "@/lib/cron-auth";

/**
 * Daily job (Next.js): email reminders for pledges due today that are NOT
 * card-authorized (legacy / reminder-only). Authorized pledges are charged via
 * POST /api/cron/pledge-charges.
 *
 * Also sends follower “campaign expiring in ~2 days” emails (same as former Edge Function).
 */
async function runPledgeReminders() {
  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: pledges, error } = await admin
    .from("pledges")
    .select("*, causes(title, id)")
    .eq("reminder_date", today)
    .eq("status", "pending")
    .neq("paystack_payment_status", "authorized");

  if (error) {
    throw new Error(error.message);
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://www.refreeg.com";

  let sent = 0;
  let failed = 0;

  for (const pledge of pledges ?? []) {
    try {
      const res = await fetch(`${appUrl}/api/mail/pledge-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pledge }),
      });
      if (res.ok) {
        sent++;
      } else {
        console.error(
          `Failed to send reminder for pledge ${pledge.id}:`,
          await res.text(),
        );
        failed++;
      }
    } catch (err) {
      console.error(`Error sending reminder for pledge ${pledge.id}:`, err);
      failed++;
    }
  }

  const { data: expiringCampaigns, error: expiryError } = await admin
    .from("causes")
    .select("id, title, raised, goal, created_at, days_active")
    .eq("status", "verified");

  if (!expiryError && expiringCampaigns) {
    for (const cause of expiringCampaigns) {
      if (!cause.days_active || !cause.created_at) continue;

      const createdAt = new Date(cause.created_at);
      const expiryDate = new Date(createdAt);
      expiryDate.setDate(createdAt.getDate() + cause.days_active);

      const diffTime = expiryDate.getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 2) {
        const { data: followers } = await admin
          .from("campaign_follows")
          .select("email")
          .eq("cause_id", cause.id);

        if (followers && followers.length > 0) {
          const followerEmails = followers.map((f) => f.email);
          const amountRaised = Number(cause.raised);
          const goalAmount = Number(cause.goal);
          const percent =
            goalAmount > 0
              ? Math.round((amountRaised / goalAmount) * 100)
              : 0;

          await fetch(`${appUrl}/api/mail/follower-update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "expiring",
              data: {
                followers: followerEmails,
                causeTitle: cause.title,
                causeUrl: `${appUrl}/causes/${cause.id}`,
                amountRaised,
                goalAmount,
                percent,
              },
            }),
          });
        }
      }
    }
  }

  return {
    today,
    pledgeReminders: { total: pledges?.length ?? 0, sent, failed },
  };
}

export async function POST(request: NextRequest) {
  const denied = assertCronAuthorized(request);
  if (denied) return denied;

  try {
    const result = await runPledgeReminders();
    return NextResponse.json(result);
  } catch (e) {
    console.error("pledge-reminders cron error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 },
    );
  }
}

/** Some schedulers use GET; treat like POST. */
export async function GET(request: NextRequest) {
  return POST(request);
}
