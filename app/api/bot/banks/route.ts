import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, rateLimit, handlePreflight } from "@/utils/api-bot/api-auth";
import { CreateBankSchema } from "@/utils/api-bot/schemas";
import Paystack from "@/services/paystack";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database-types";
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
  if (limitRes?.errorResponse) return limitRes.errorResponse;

  const authRes = await validateApiKey(request);
  if (authRes.errorResponse) return authRes.errorResponse;

  try {
    const body = await request.json();
    const result = CreateBankSchema.safeParse(body);
    
    if (!result.success) {
      return errorResponse("Invalid bank details", ApiErrorCode.VALIDATION_ERROR, 400, result.error.format());
    }
    
    const data = result.data;

    // Optional: Verify with Paystack by creating a test subaccount or just verifying the account
    let subAccountCode: string | null = null;
    try {
      const subAccount = await Paystack.createSubaccount({
        business_name: `Dev Bank Verification ${Date.now()}`,
        bank_code: data.bank_code,
        account_number: data.bank_account_number,
        percentage_charge: 2
      });
      subAccountCode = subAccount.subaccount_code;
    } catch (err: any) {
      return errorResponse("Could not verify bank details with provider", ApiErrorCode.PAYMENT_SETUP_FAILED, 400);
    }

    const { data: bankAccount, error } = await supabaseAdmin.from("api_bank_accounts").insert({
      developer_id: authRes.userId,
      bank_account_number: data.bank_account_number,
      bank_code: data.bank_code,
      bank_account_name: data.bank_account_name,
      sub_account_code: subAccountCode,
      mode: authRes.mode
    }).select().single();

    if (error) {
      return errorResponse("Failed to save bank account", ApiErrorCode.INTERNAL_ERROR, 500);
    }

    await logApiRequest({ request, statusCode: 201, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, startedAt });
    return successResponse(bankAccount, 201);

  } catch (err: any) {
    return errorResponse("Invalid JSON", ApiErrorCode.BAD_REQUEST, 400);
  }
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const limitRes = rateLimit(request);
  if (limitRes?.errorResponse) return limitRes.errorResponse;

  const authRes = await validateApiKey(request);
  if (authRes.errorResponse) return authRes.errorResponse;

  const { data: accounts, error } = await supabaseAdmin
    .from("api_bank_accounts")
    .select("*")
    .eq("developer_id", authRes.userId)
    .eq("mode", authRes.mode)
    .order("created_at", { ascending: false });

  if (error) {
    return errorResponse("Failed to fetch bank accounts", ApiErrorCode.INTERNAL_ERROR, 500);
  }

  await logApiRequest({ request, statusCode: 200, apiKeyId: authRes.apiKeyId, userId: authRes.userId, mode: authRes.mode, startedAt });
  return successResponse(accounts);
}

export async function OPTIONS() {
  return handlePreflight();
}
