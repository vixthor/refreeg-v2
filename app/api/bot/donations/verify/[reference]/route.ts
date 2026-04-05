import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, rateLimit, handlePreflight } from "@/utils/api-bot/api-auth";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database-types";
import Paystack from "@/services/paystack";
import { dispatchWebhook } from "@/utils/api-bot/webhook-utils";
import { logApiRequest } from "@/utils/api-bot/request-logger";
import { 
  successResponse, 
  errorResponse, 
  ApiErrorCode 
} from "@/utils/api-bot/response-utils";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: { reference: string } }
) {
  const startedAt = Date.now();
  try {
    const reference = params.reference;

    if (!reference) {
      const response = errorResponse("Missing reference", ApiErrorCode.BAD_REQUEST, 400);
      await logApiRequest({ request: req, statusCode: 400, errorCode: ApiErrorCode.BAD_REQUEST, startedAt });
      return response;
    }

    const limitRes = rateLimit(req);
    if (limitRes?.errorResponse) {
      await logApiRequest({ request: req, statusCode: 429, errorCode: ApiErrorCode.RATE_LIMIT_EXCEEDED, startedAt });
      return limitRes.errorResponse;
    }

    const auth = await validateApiKey(req);
    if (auth.errorResponse) {
      await logApiRequest({ request: req, statusCode: 401, errorCode: ApiErrorCode.UNAUTHORIZED, startedAt });
      return auth.errorResponse;
    }

    // ── TEST MODE: Return pre-recorded test donation ──
    if (reference.startsWith("test_ref_")) {
      const { data: testDonation, error: testErr } = await supabaseAdmin
        .from("api_donations")
        .select(`
          *,
          api_campaigns:api_campaign_id (
            developer_id
          )
        `)
        .eq("paystack_reference", reference)
        .single();

      if (testErr || !testDonation) {
        const response = errorResponse("Test donation not found", ApiErrorCode.NOT_FOUND, 404);
        await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: ApiErrorCode.NOT_FOUND, startedAt });
        return response;
      }

      // @ts-ignore - Supabase join structure
      if (testDonation.api_campaigns?.developer_id !== auth.userId) {
        const response = errorResponse("Unauthorized access to donation", ApiErrorCode.FORBIDDEN, 403);
        await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: ApiErrorCode.FORBIDDEN, startedAt });
        return response;
      }

      const response = successResponse({
        id: testDonation.id,
        amount: testDonation.amount,
        currency: "NGN",
        status: testDonation.status,
        reference: testDonation.paystack_reference,
        mode: "test",
        created_at: testDonation.created_at,
      });
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, startedAt });
      return response;
    }

    // ── LIVE MODE: Verify with Paystack ──
    const transaction = await Paystack.verifyTransactionFull(reference);
    if (!transaction || transaction.status !== "success") {
      const response = errorResponse("Transaction not successful", ApiErrorCode.BAD_REQUEST, 400, { status: transaction?.status || "unknown" });
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: ApiErrorCode.BAD_REQUEST, startedAt });
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

    // Check if donation already recorded
    const { data: existingDonation } = await supabaseAdmin
      .from("api_donations")
      .select("id")
      .eq("paystack_reference", reference)
      .single();

    if (existingDonation) {
      const response = successResponse({ 
        message: "Donation already processed",
        donation_id: existingDonation.id 
      });
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, startedAt });
      return response;
    }

    // Fetch campaign and verify ownership
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from("api_campaigns")
      .select("id, title, developer_id, raised_amount")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      const response = errorResponse("Campaign not found", ApiErrorCode.NOT_FOUND, 404);
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: ApiErrorCode.NOT_FOUND, startedAt });
      return response;
    }

    if (campaign.developer_id !== auth.userId) {
      const response = errorResponse("Unauthorized access to campaign", ApiErrorCode.FORBIDDEN, 403);
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: ApiErrorCode.FORBIDDEN, startedAt });
      return response;
    }

    // Record donation and update campaign total
    const { data: donation, error: donationError } = await supabaseAdmin
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
        paystack_reference: reference,
        mode: "live",
      })
      .select()
      .single();

    if (donationError) {
      console.error("Failed to record donation:", donationError);
      const response = errorResponse("Failed to record donation", ApiErrorCode.DATABASE_ERROR, 500);
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: ApiErrorCode.DATABASE_ERROR, startedAt });
      return response;
    }

    // Update campaign raised_amount
    const newRaisedAmount = Number(campaign.raised_amount) + amount;
    await supabaseAdmin
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

    const response = successResponse({
      id: donation.id,
      amount: donation.amount,
      currency: "NGN",
      status: donation.status,
      reference: donation.paystack_reference,
      created_at: donation.created_at
    });
    await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, startedAt });
    return response;

  } catch (error: any) {
    console.error("Verification error:", error);
    const response = errorResponse(error.message || "Internal server error", ApiErrorCode.INTERNAL_ERROR, 500);
    await logApiRequest({ request: req, statusCode: response.status, errorCode: ApiErrorCode.INTERNAL_ERROR, startedAt });
    return response;
  }
}

export async function OPTIONS() {
  return handlePreflight();
}
