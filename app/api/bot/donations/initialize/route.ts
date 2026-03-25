import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, rateLimit } from "@/utils/api-bot/api-auth";
import { InitiateDonationSchema } from "@/utils/api-bot/schemas";
import { createClient } from "@/lib/supabase/server";
import Paystack from "@/services/paystack";
import { TransactionData } from "@/types";
import { logApiRequest } from "@/utils/api-bot/request-logger";

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const isLimited = await rateLimit(req.headers.get("x-api-key") || "anonymous");
    if (isLimited) {
      const response = NextResponse.json({ error: "Too many requests" }, { status: 429 });
      await logApiRequest({ request: req, statusCode: response.status, errorCode: "rate_limited", startedAt });
      return response;
    }

    const auth = await validateApiKey(req);
    if (!auth || !auth.userId) {
      const response = NextResponse.json({ error: "Unauthorized: Invalid API Key" }, { status: 401 });
      await logApiRequest({ request: req, statusCode: response.status, errorCode: "unauthorized", startedAt });
      return response;
    }

    const body = await req.json();
    const parsed = InitiateDonationSchema.safeParse(body);
    if (!parsed.success) {
      const response = NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: "validation_error", startedAt });
      return response;
    }
    const data = parsed.data;

    const supabase = await createClient();
    const { data: campaign, error: campaignError } = await supabase
      .from("api_campaigns")
      .select("id, sub_account_code, status, developer_id")
      .eq("id", data.campaign_id)
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

    if (campaign.status !== "active") {
      const response = NextResponse.json({ error: "Campaign is not active" }, { status: 400 });
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: "campaign_not_active", startedAt });
      return response;
    }

    if (!campaign.sub_account_code) {
      const response = NextResponse.json({ error: "Campaign has no sub-account for payouts" }, { status: 400 });
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: "payment_setup_failed", startedAt });
      return response;
    }

    // Platform fee exactly 2% of the amount
    const serviceFee = data.amount * 0.02;

    const transactionData: TransactionData = {
      id: auth.userId,
      amount: data.amount,
      serviceFee,
      tipAmount: data.tip_amount,
      causeId: data.campaign_id,
      email: data.email,
      full_name: data.name,
      message: data.message || "",
      isAnonymous: data.is_anonymous,
      callbackUrl: data.callback_url,
      subaccounts: [
        {
          subaccount: campaign.sub_account_code,
          share: data.amount,
        },
      ],
    };

    const paystackResponse = await Paystack.initializeTransaction(transactionData);

    const response = NextResponse.json({
      success: true,
      data: paystackResponse,
    });
    await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, startedAt });
    return response;
  } catch (error: any) {
    console.error("Donation initialization error:", error);
    const response = NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
    await logApiRequest({ request: req, statusCode: response.status, errorCode: "internal_error", startedAt });
    return response;
  }
}
