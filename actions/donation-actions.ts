"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Donation, DonationWithCause, DonationFormData } from "@/types";
import { recordEvent } from "@/actions/event-reward-actions";

export async function createDonation(
  causeId: string,
  userId: string | null,
  donationData: DonationFormData
): Promise<Donation> {
  const supabase = await createClient();

  const donationAmount =
    typeof donationData.amount === "string"
      ? Number.parseFloat(donationData.amount)
      : donationData.amount;

  const { data, error } = await supabase
    .from("donations")
    .insert({
      cause_id: causeId,
      ...(userId ? { user_id: userId } : {}),
      amount: donationAmount,
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
