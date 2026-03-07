import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // Allow only POST or GET (Supabase scheduled functions send a POST)
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const today = new Date().toISOString().split("T")[0]; // e.g. "2026-03-07"

    const { data: pledges, error } = await supabase
      .from("pledges")
      .select("*, causes(title, id)")
      .eq("reminder_date", today)
      .eq("status", "pending");

    if (error) {
      console.error("Error fetching pledges:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const appUrl = Deno.env.get("APP_URL") || "https://www.refreeg.com";

    let sent = 0;
    let failed = 0;

    for (const pledge of pledges ?? []) {
      try {
        const res = await fetch(`${appUrl}/api/mail/pledge-reminder`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pledge }),
        });

        if (res.ok) {
          sent++;
        } else {
          console.error(`Failed to send reminder for pledge ${pledge.id}:`, await res.text());
          failed++;
        }
      } catch (err) {
        console.error(`Error sending reminder for pledge ${pledge.id}:`, err);
        failed++;
      }
    }

    // --- Expiry Reminders for Followers (48h mark) ---
    // We notify people if a campaign has exactly 2 days left
    const { data: expiringCampaigns, error: expiryError } = await supabase
      .from("causes")
      .select("id, title, raised, goal, created_at, days_active")
      .eq("status", "verified"); // Only notify on verified active campaigns

    if (!expiryError && expiringCampaigns) {
      for (const cause of expiringCampaigns) {
        if (!cause.days_active || !cause.created_at) continue;

        const createdAt = new Date(cause.created_at);
        const expiryDate = new Date(createdAt);
        expiryDate.setDate(createdAt.getDate() + cause.days_active);

        const diffTime = expiryDate.getTime() - new Date().getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // If exactly 2 days left (48 hours), notify followers
        if (diffDays === 2) {
          const { data: followers } = await supabase
            .from("campaign_follows")
            .select("email")
            .eq("cause_id", cause.id);

          if (followers && followers.length > 0) {
            const followerEmails = followers.map((f) => f.email);
            const amountRaised = Number(cause.raised);
            const goalAmount = Number(cause.goal);
            const percent = goalAmount > 0 ? Math.round((amountRaised / goalAmount) * 100) : 0;

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

    return new Response(
      JSON.stringify({ today, total: pledges?.length ?? 0, sent, failed }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
