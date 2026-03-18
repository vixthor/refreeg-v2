"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateSubscriptionData {
  user_id?: string;
  cause_id: string;
  paystack_subscription_code: string;
  paystack_email_token?: string;
  amount: number;
  interval: string;
  status?: string;
}

export async function createSubscription(data: CreateSubscriptionData) {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .insert([
      {
        user_id: data.user_id || null,
        cause_id: data.cause_id,
        paystack_subscription_code: data.paystack_subscription_code,
        paystack_email_token: data.paystack_email_token,
        amount: data.amount,
        interval: data.interval,
        status: data.status || "active",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating subscription:", error);
    throw new Error("Failed to create subscription record");
  }

  revalidatePath("/dashboard/subscriptions");
  return subscription;
}

export async function updateSubscriptionStatus(
  subscriptionCode: string,
  status: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("subscriptions")
    .update({ status })
    .eq("paystack_subscription_code", subscriptionCode);

  if (error) {
    console.error("Error updating subscription status:", error);
    throw new Error("Failed to update subscription status");
  }

  revalidatePath("/dashboard/subscriptions");
}
