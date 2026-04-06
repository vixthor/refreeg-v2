import { createDonation } from "@/actions/donation-actions";
import { createAdminClient } from "@/lib/supabase/admin";
import Paystack from "@/services/paystack";
import { sendPledgeConfirmationEmail } from "@/services/mail";
import { PLEDGE_VERIFICATION_AMOUNT_NGN } from "@/lib/pledge-constants";
import { calculateServiceFee } from "@/lib/utils";

export { PLEDGE_VERIFICATION_AMOUNT_NGN } from "@/lib/pledge-constants";

export async function processPledgeAuthorizationSuccess(reference: string) {
  const full = (await Paystack.verifyTransactionFull(reference)) as {
    status?: string;
    metadata?: Record<string, string | number | boolean | undefined>;
    authorization?: {
      authorization_code?: string;
      reusable?: boolean;
    };
    customer?: { email?: string };
  };

  if (full.status !== "success") {
    return { ok: false as const, reason: "not_success" };
  }

  const meta = full.metadata;
  if (!meta || String(meta.pledge_flow) !== "authorization" || !meta.pledge_id) {
    return { ok: false as const, reason: "not_pledge_auth" };
  }

  const auth = full.authorization;
  if (!auth?.authorization_code) {
    console.error("Pledge authorization webhook: missing authorization_code", {
      reference,
      pledgeId: meta.pledge_id,
    });
    return { ok: false as const, reason: "no_auth_code" };
  }

  const admin = createAdminClient();
  const pledgeId = String(meta.pledge_id);

  const { data: existing } = await admin
    .from("pledges")
    .select("id, first_transaction_reference")
    .eq("id", pledgeId)
    .maybeSingle();

  if (!existing) {
    return { ok: false as const, reason: "pledge_not_found" };
  }
  if (existing.first_transaction_reference) {
    return { ok: true as const, reason: "already_processed" };
  }

  const authEmail =
    full.customer?.email || String(meta.email || "");

  await admin
    .from("pledges")
    .update({
      paystack_authorization_code: auth.authorization_code,
      authorization_email: authEmail,
      first_transaction_reference: reference,
      paystack_payment_status: "authorized",
      ...(auth.reusable === false
        ? { last_charge_error: "Card marked non-reusable; charge on date may fail." }
        : {}),
    })
    .eq("id", pledgeId);

  const causeId = String(meta.cause_id);
  const { data: cause } = await admin
    .from("causes")
    .select("title")
    .eq("id", causeId)
    .maybeSingle();

  const futureAmount = Number(meta.future_pledge_amount ?? meta.amount);
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.refreeg.com";

  await sendPledgeConfirmationEmail({
    to: String(meta.email),
    userName: String(meta.customer_name || "Supporter"),
    causeTitle: cause?.title || "this campaign",
    amount: futureAmount,
    reminderDate: String(meta.reminder_date || ""),
    donateUrl: `${baseUrl}/causes/${causeId}`,
  });

  return { ok: true as const, reason: "stored" };
}

export async function processPledgeScheduledChargeSuccess(reference: string) {
  const full = (await Paystack.verifyTransactionFull(reference)) as {
    status?: string;
    metadata?: Record<string, string | number | boolean | undefined>;
  };

  if (full.status !== "success") {
    return { ok: false as const, reason: "not_success" };
  }

  const metadata = full.metadata || {};
  if (String(metadata.pledge_flow) !== "scheduled_charge") {
    return { ok: false as const, reason: "not_scheduled" };
  }

  const pledgeId = metadata.pledge_id ? String(metadata.pledge_id) : "";
  const causeId = metadata.cause_id ? String(metadata.cause_id) : "";
  if (!pledgeId || !causeId) {
    return { ok: false as const, reason: "missing_ids" };
  }

  const admin = createAdminClient();
  const { data: pledge } = await admin
    .from("pledges")
    .select("id, status, user_id, paystack_payment_status")
    .eq("id", pledgeId)
    .maybeSingle();

  if (!pledge) {
    return { ok: false as const, reason: "pledge_not_found" };
  }
  if (pledge.status === "fulfilled" || pledge.paystack_payment_status === "charged") {
    return { ok: true as const, reason: "already_fulfilled" };
  }

  const amount = Number(metadata.amount);
  await createDonation(
    causeId,
    pledge.user_id ?? null,
    {
      amount,
      name: String(metadata.customer_name || "Supporter"),
      email: String(metadata.email),
      message: "Pledge fulfilled (scheduled charge)",
      isAnonymous: false,
      tip_amount: 0,
    },
    0,
  );

  await admin
    .from("pledges")
    .update({
      status: "fulfilled",
      paystack_payment_status: "charged",
      scheduled_charge_reference: reference,
      last_charge_error: null,
    })
    .eq("id", pledgeId);

  return { ok: true as const, reason: "donation_created" };
}

export async function chargeDuePledgesForToday() {
  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: pledges, error } = await admin
    .from("pledges")
    .select(
      `
      id,
      cause_id,
      user_id,
      amount,
      name,
      email,
      note,
      reminder_date,
      paystack_authorization_code,
      authorization_email,
      paystack_payment_status,
      status,
      scheduled_charge_reference
    `,
    )
    .eq("reminder_date", today)
    .eq("status", "pending")
    .eq("paystack_payment_status", "authorized");

  if (error) {
    throw new Error(error.message);
  }

  const results: { pledgeId: string; ok: boolean; error?: string }[] = [];

  for (const pledge of pledges ?? []) {
    if (!pledge.paystack_authorization_code || !pledge.authorization_email) {
      results.push({
        pledgeId: pledge.id,
        ok: false,
        error: "missing_authorization",
      });
      continue;
    }

    const { data: causeRow } = await admin
      .from("causes")
      .select("user_id")
      .eq("id", pledge.cause_id)
      .maybeSingle();

    if (!causeRow?.user_id) {
      results.push({
        pledgeId: pledge.id,
        ok: false,
        error: "cause_missing",
      });
      continue;
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("sub_account_code")
      .eq("id", causeRow.user_id)
      .maybeSingle();

    const subaccount = profile?.sub_account_code?.trim() || undefined;
    const pledgeAmount = Number(pledge.amount);
    const serviceFee = calculateServiceFee(pledgeAmount);
    // Deterministic per pledge + day so retries do not double-charge (Paystack rejects duplicate reference).
    const reference = `pledgech_${pledge.id.replace(/-/g, "")}_${today.replace(/-/g, "")}`;

    try {
      await Paystack.chargeAuthorization({
        authorizationCode: pledge.paystack_authorization_code,
        email: pledge.authorization_email,
        amountNgn: pledgeAmount,
        serviceFeeNgn: serviceFee,
        reference,
        causeId: pledge.cause_id,
        subaccount,
        metadata: {
          pledge_flow: "scheduled_charge",
          pledge_id: pledge.id,
          cause_id: pledge.cause_id,
          amount: pledgeAmount,
          customer_name: pledge.name,
          email: pledge.email,
          message: pledge.note || "",
          is_anonymous: false,
          tip_amount: 0,
          ...(pledge.user_id ? { user_id: pledge.user_id } : {}),
        },
      });

      await admin
        .from("pledges")
        .update({
          charge_attempted_at: new Date().toISOString(),
        })
        .eq("id", pledge.id);

      results.push({ pledgeId: pledge.id, ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await admin
        .from("pledges")
        .update({
          last_charge_error: msg.slice(0, 500),
          charge_attempted_at: new Date().toISOString(),
          paystack_payment_status: "charge_failed",
        })
        .eq("id", pledge.id);

      results.push({ pledgeId: pledge.id, ok: false, error: msg });
    }
  }

  return { today, processed: results.length, results };
}
