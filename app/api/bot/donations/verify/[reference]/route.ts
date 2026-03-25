import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, rateLimit } from "@/utils/api-bot/api-auth";
import { createClient } from "@/lib/supabase/server";
import Paystack from "@/services/paystack";
import { dispatchWebhook } from "@/utils/api-bot/webhook-utils";
import { logApiRequest } from "@/utils/api-bot/request-logger";

export async function GET(
  req: NextRequest,
  { params }: { params: { reference: string } }
) {
  const startedAt = Date.now();
  try {
    const reference = params.reference;

    if (!reference) {
      const response = NextResponse.json({ error: "Missing reference" }, { status: 400 });
      await logApiRequest({ request: req, statusCode: response.status, errorCode: "bad_request", startedAt });
      return response;
    }

    // Rate limiting
    const isLimited = await rateLimit(req.headers.get("Authorization") || "anonymous");
    if (isLimited) {
      const response = NextResponse.json({ error: "Too many requests" }, { status: 429 });
      await logApiRequest({ request: req, statusCode: response.status, errorCode: "rate_limited", startedAt });
      return response;
    }

    // Auth
    const auth = await validateApiKey(req);
    if (!auth || !auth.userId) {
      const response = auth.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      await logApiRequest({ request: req, statusCode: response.status, errorCode: "unauthorized", startedAt });
      return response;
    }

    // Verify with Paystack
    const transaction = await Paystack.verifyTransactionFull(reference);
    if (!transaction || transaction.status !== "success") {
      const response = NextResponse.json({ 
        error: "Transaction not successful", 
        status: transaction?.status || "unknown" 
      }, { status: 400 });
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: "payment_failed", startedAt });
      return response;
    }

    const metadata = transaction.metadata;
    const amount = Number(metadata.amount); // The base amount for the campaign
    const tipAmount = Number(metadata.tip_amount || 0);
    const campaignId = metadata.cause_id;
    const donorEmail = metadata.email;
    const donorName = metadata.customer_name;
    const isAnonymous = metadata.is_anonymous;
    const message = metadata.message;

    const supabase = await createClient();

    // Check if donation already recorded
    const { data: existingDonation } = await supabase
      .from("api_donations")
      .select("id")
      .eq("paystack_reference", reference)
      .single();

    if (existingDonation) {
      const response = NextResponse.json({ 
        message: "Donation already processed",
        donation_id: existingDonation.id 
      }, { status: 200 });
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, startedAt });
      return response;
    }

    // Fetch campaign and verify ownership
    const { data: campaign, error: campaignError } = await supabase
      .from("api_campaigns")
      .select("id, title, developer_id, raised_amount")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      const response = NextResponse.json({ error: "Campaign not found" }, { status: 404 });
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: "not_found", startedAt });
      return response;
    }

    if (campaign.developer_id !== auth.userId) {
      const response = NextResponse.json({ error: "Unauthorized access to campaign" }, { status: 403 });
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: "forbidden", startedAt });
      return response;
    }

    // Record donation and update campaign total
    // We use a sequential approach here; for highly concurrent sites, a database function or transaction would be better
    const { data: donation, error: donationError } = await supabase
      .from("api_donations")
      .insert({
        api_campaign_id: campaignId,
        amount,
        tip_amount: tipAmount,
        donor_name: donorName,
        donor_email: donorEmail,
        message,
        is_anonymous: isAnonymous,
        status: "success",
        paystack_reference: reference
      })
      .select()
      .single();

    if (donationError) {
      console.error("Failed to record donation:", donationError);
      const response = NextResponse.json({ error: "Failed to record donation" }, { status: 500 });
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: "internal_error", startedAt });
      return response;
    }

    // Update campaign raised_amount
    const newRaisedAmount = Number(campaign.raised_amount) + amount;
    await supabase
      .from("api_campaigns")
      .update({ raised_amount: newRaisedAmount })
      .eq("id", campaignId);

    // Trigger webhook
    dispatchWebhook(campaign.developer_id, "donation.success", {
      id: donation.id,
      campaign_id: campaignId,
      amount: amount,
      tip_amount: tipAmount,
      total_amount: amount + tipAmount,
      donor_name: donorName,
      donor_email: donorEmail,
      status: "success",
      reference: reference,
      metadata: metadata || {}
    }).catch(console.error);

    const response = NextResponse.json({
      success: true,
      data: {
        id: donation.id,
        amount: donation.amount,
        currency: "NGN",
        status: donation.status,
        reference: donation.paystack_reference,
        created_at: donation.created_at
      }
    });
    await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, startedAt });
    return response;

  } catch (error: any) {
    console.error("Verification error:", error);
    const response = NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
    await logApiRequest({ request: req, statusCode: response.status, errorCode: "internal_error", startedAt });
    return response;
  }
}
