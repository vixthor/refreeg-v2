"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Donation, DonationWithCause, DonationFormData } from "@/types";
import { recordEvent } from "@/actions/event-reward-actions";

export async function createDonation(
  causeId: string,
  userId: string | null,
  donationData: DonationFormData,
  tipAmount: number = 0
): Promise<Donation> {
  const supabase = await createClient();

  const donationAmount =
    typeof donationData.amount === "string"
      ? Number.parseFloat(donationData.amount)
      : donationData.amount;

  const finalTipAmount =
    tipAmount > 0 ? tipAmount : donationData.tip_amount || 0;

  const { data, error } = await supabase
    .from("donations")
    .insert({
      cause_id: causeId,
      ...(userId ? { user_id: userId } : {}),
      amount: donationAmount,
      tip_amount: finalTipAmount,
      name:
        String(donationData.isAnonymous).toLocaleLowerCase() === "true"
          ? "Anonymous"
          : donationData.name,
      email: donationData.email,
      message: donationData.message || null,
      is_anonymous: donationData.isAnonymous,
      status: "completed",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating donation:", error);
    throw error;
  }

  // Record event for reward tracking (only if user is logged in)
  if (userId) {
    try {
      await recordEvent({
        type: "donation",
        userId,
        amount: donationAmount,
        metadata: {
          cause_id: causeId,
          donation_id: data.id,
          is_anonymous: donationData.isAnonymous,
        },
      });
    } catch (eventError) {
      console.error("Error recording donation event:", eventError);
      // Don't throw - event tracking shouldn't break the main action
    }
  }

  // Auto-fulfill any pending pledge from the same donor for this cause
  if (donationData.email) {
    try {
      await supabase
        .from("pledges")
        .update({ status: "fulfilled" })
        .eq("cause_id", causeId)
        .eq("email", donationData.email)
        .eq("status", "pending");
    } catch (pledgeError) {
      console.error("Error fulfilling pledge:", pledgeError);
      // Non-fatal — don't break the donation flow
    }
  }

  // Milestone notifications for followers (50% and 100%)
  try {
    const { data: cause, error: causeError } = await supabase
      .from("causes")
      .select("title, raised, goal")
      .eq("id", causeId)
      .single();

    if (cause && !causeError) {
      const raisedAfter = Number(cause.raised);
      const raisedBefore = raisedAfter - donationAmount;
      const goal = Number(cause.goal);

      if (goal > 0) {
        const percentBefore = (raisedBefore / goal) * 100;
        const percentAfter = (raisedAfter / goal) * 100;

        let milestoneReached: 50 | 100 | null = null;
        if (percentBefore < 50 && percentAfter >= 50 && percentAfter < 100) {
          milestoneReached = 50;
        } else if (percentBefore < 100 && percentAfter >= 100) {
          milestoneReached = 100;
        }

        if (milestoneReached) {
          // Fetch followers
          const { data: followers } = await supabase
            .from("campaign_follows")
            .select("email")
            .eq("cause_id", causeId);

          if (followers && followers.length > 0) {
            const followerEmails = followers.map((f) => f.email);
            const appUrl =
              process.env.NEXT_PUBLIC_APP_URL || "https://www.refreeg.com";

            // Call the follower-update API bridge (fire and forget)
            fetch(`${appUrl}/api/mail/follower-update`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "milestone",
                data: {
                  followers: followerEmails,
                  causeTitle: cause.title,
                  causeUrl: `${appUrl}/causes/${causeId}`,
                  milestone: milestoneReached,
                },
              }),
            }).catch((err) =>
              console.error("Error calling follower-update API:", err)
            );
          }
        }
      }
    }
  } catch (milestoneError) {
    console.error("Error in milestone detection:", milestoneError);
  }

  revalidatePath(`/causes/${causeId}`);
  revalidatePath("/causes");
  revalidatePath("/");
  if (userId) {
    revalidatePath("/dashboard/donations");
  }

  return data as Donation;
}


export async function listDonationsForCause(
  causeId: string
): Promise<Donation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .eq("cause_id", causeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error listing donations:", error);
    throw error;
  }

  return data as Donation[];
}

export async function listUserDonations(
  userId: string,
  timeframe: "all" | "recent" = "all"
): Promise<DonationWithCause[]> {
  const supabase = await createClient();

  let query = supabase
    .from("donations")
    .select(
      `
      *,
      causes:cause_id (
        title,
        category
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (timeframe === "recent") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query = query.gte("created_at", thirtyDaysAgo.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listing user donations:", error);
    throw error;
  }

  return data.map((item) => ({
    ...item,
    cause: {
      title: item.causes?.title || "Unknown Cause",
      category: item.causes?.category || "Unknown",
    },
  })) as DonationWithCause[];
}
