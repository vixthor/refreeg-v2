"use server";

import { createClient } from "@/lib/supabase/server";
import { sendPledgeConfirmationEmail } from "@/services/mail";

type CreatePledgeInput = {
  causeId: string;
  amount: number;
  reminderDate: string;
  name: string;
  email: string;
  note?: string | null;
  causeTitle?: string;
};

export async function createPledge(input: CreatePledgeInput) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return { data: null, error: authError.message };
  }

  const { data, error } = await supabase
    .from("pledges")
    .insert({
      cause_id: input.causeId,
      user_id: user?.id ?? null,
      amount: input.amount,
      reminder_date: input.reminderDate,
      name: input.name,
      email: input.email,
      note: input.note ?? null,
      currency: "NGN",
      status: "pending",
      token: user?.id ? null : crypto.randomUUID(), // Generate token for guests
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  // Fire-and-forget confirmation email — works for guests and logged-in users
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.refreeg.com";
  sendPledgeConfirmationEmail({
    to: input.email,
    userName: input.name,
    causeTitle: input.causeTitle || "this campaign",
    amount: input.amount,
    reminderDate: input.reminderDate,
    donateUrl: `${baseUrl}/causes/${input.causeId}`,
  }).catch((err) =>
    console.error("Background pledge confirmation email error:", err),
  );

  return { data, error: null };
}

