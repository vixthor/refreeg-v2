"use server";

import { createClient } from "@/lib/supabase/server";

type CreatePledgeInput = {
  causeId: string;
  amount: number;
  reminderDate: string;
  name: string;
  email: string;
  note?: string | null;
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

  return { data, error: null };
}
