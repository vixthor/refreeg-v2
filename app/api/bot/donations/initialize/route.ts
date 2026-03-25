import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";
import { InitiateDonationSchema } from "@/utils/api-bot/schemas";
import { createClient } from "@/lib/supabase/server";
import Paystack from "@/services/paystack";
import { TransactionData } from "@/types";
import { logApiRequest } from "@/utils/api-bot/request-logger";
import { 
  successResponse, 
  errorResponse, 
  ApiErrorCode 
} from "@/utils/api-bot/response-utils";

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
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

    const body = await req.json();
    const parsed = InitiateDonationSchema.safeParse(body);
    if (!parsed.success) {
      const response = errorResponse("Validation failed", ApiErrorCode.VALIDATION_ERROR, 400, parsed.error.format());
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: ApiErrorCode.VALIDATION_ERROR, startedAt });
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
      const response = errorResponse("Campaign not found", ApiErrorCode.NOT_FOUND, 404);
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: ApiErrorCode.NOT_FOUND, startedAt });
      return response;
    }

    if (campaign.developer_id !== auth.userId) {
      const response = errorResponse("Unauthorized access to campaign", ApiErrorCode.FORBIDDEN, 403);
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: ApiErrorCode.FORBIDDEN, startedAt });
      return response;
    }

    if (campaign.status !== "active") {
      const response = errorResponse("Campaign is not active", ApiErrorCode.BAD_REQUEST, 400);
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: ApiErrorCode.BAD_REQUEST, startedAt });
      return response;
    }

    if (!campaign.sub_account_code) {
      const response = errorResponse("Campaign has no sub-account for payouts", ApiErrorCode.BAD_REQUEST, 400);
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: ApiErrorCode.BAD_REQUEST, startedAt });
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

    const response = successResponse(paystackResponse);
    await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, startedAt });
    return response;
  } catch (error: any) {
    console.error("Donation initialization error:", error);
    const response = errorResponse(error.message || "Internal server error", ApiErrorCode.INTERNAL_ERROR, 500);
    await logApiRequest({ request: req, statusCode: response.status, errorCode: ApiErrorCode.INTERNAL_ERROR, startedAt });
    return response;
  }
}
