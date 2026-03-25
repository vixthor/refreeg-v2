import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/utils/api-bot/api-auth";
import { rateLimit } from "@/utils/api-bot/rate-limit";
import { CreateCampaignSchema } from "@/utils/api-bot/schemas";
import Paystack from "@/services/paystack";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database-types";
import { dispatchWebhook } from "@/utils/api-bot/webhook-utils";
import { logApiRequest } from "@/utils/api-bot/request-logger";
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse, 
  ApiErrorCode 
} from "@/utils/api-bot/response-utils";


const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const limitRes = rateLimit(request);
  if (limitRes?.errorResponse) {
    await logApiRequest({ request, statusCode: 429, errorCode: "rate_limited", startedAt });
    return limitRes.errorResponse;
  }

  const authRes = await validateApiKey(request);
  if (authRes.errorResponse) {
    await logApiRequest({ request, statusCode: 401, errorCode: "unauthorized", startedAt });
    return authRes.errorResponse;
  }

  try {
    const body = await request.json();
    const result = CreateCampaignSchema.safeParse(body);
    
    if (!result.success) {
      const response = errorResponse("Invalid request payload", ApiErrorCode.VALIDATION_ERROR, 400, result.error.format());

      await logApiRequest({ 
        request, 
        statusCode: response.status, 
        apiKeyId: authRes.apiKeyId, 
        userId: authRes.userId, 
        mode: authRes.mode, 
        errorCode: ApiErrorCode.VALIDATION_ERROR, 
        startedAt 
      });
      return response;
    }
    
    const data = result.data;

    let subAccountCode: string | null = null;
    try {
      // Auto-create Paystack sub-account from developer-provided bank_account
      const subAccount = await Paystack.createSubaccount({
        business_name: data.title,
        bank_code: data.bank_code,
        account_number: data.bank_account_number,
        percentage_charge: 2 // 2% platform fee
      });
      subAccountCode = subAccount.subaccount_code;
    } catch (err: any) {
      const response = errorResponse(
        "Failed to verify bank details with payment provider. Please ensure the account number and bank code are correct.", 
        ApiErrorCode.PAYMENT_SETUP_FAILED, 
        400
      );

      await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, errorCode: ApiErrorCode.PAYMENT_SETUP_FAILED, startedAt });
      return response;
    }

    const { data: campaign, error } = await supabaseAdmin.from("api_campaigns").insert({
      developer_id: authRes.userId,
      api_key_id: authRes.apiKeyId,
      title: data.title,
      description: data.description,
      goal_amount: data.goal_amount,
      payout_mode: data.payout_mode,
      deadline: data.deadline || null,
      bank_account_number: data.bank_account_number,
      bank_code: data.bank_code,
      bank_account_name: data.bank_account_name,
      sub_account_code: subAccountCode,
      mode: authRes.mode,
      status: "active",
      currency: "NGN",
      raised_amount: 0
    }).select().single();

    if (error) {
      const response = errorResponse("Failed to create campaign", ApiErrorCode.INTERNAL_ERROR, 500);

      await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, errorCode: ApiErrorCode.INTERNAL_ERROR, startedAt });
      return response;
    }

    // Trigger webhook
    dispatchWebhook(authRes.userId!, "campaign.created", campaign).catch(console.error);

    const response = successResponse(campaign, 201);

    await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, startedAt });
    return response;

  } catch (err: any) {
    const response = errorResponse("Invalid JSON format", ApiErrorCode.BAD_REQUEST, 400);

    await logApiRequest({ request, statusCode: response.status, errorCode: ApiErrorCode.BAD_REQUEST, startedAt });
    return response;
  }
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const limitRes = rateLimit(request);
  if (limitRes?.errorResponse) {
    await logApiRequest({ request, statusCode: 429, errorCode: "rate_limited", startedAt });
    return limitRes.errorResponse;
  }

  const authRes = await validateApiKey(request);
  if (authRes.errorResponse) {
    await logApiRequest({ request, statusCode: 401, errorCode: "unauthorized", startedAt });
    return authRes.errorResponse;
  }

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  
  const { data: campaigns, error, count } = await supabaseAdmin
    .from("api_campaigns")
    .select("*", { count: 'exact' })
    .eq("developer_id", authRes.userId)
    .eq("mode", authRes.mode)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    const response = errorResponse("Failed to fetch campaigns", ApiErrorCode.INTERNAL_ERROR, 500);

    await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, errorCode: ApiErrorCode.INTERNAL_ERROR, startedAt });
    return response;
  }

  const response = paginatedResponse(campaigns, count || 0, limit, offset);

  await logApiRequest({ request, statusCode: response.status, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, startedAt });
  return response;
}
