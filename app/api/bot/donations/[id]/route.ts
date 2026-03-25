import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, rateLimit } from "@/utils/api-bot/api-auth";
import { createClient } from "@/lib/supabase/server";
import { logApiRequest } from "@/utils/api-bot/request-logger";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startedAt = Date.now();
  try {
    const donationId = params.id;

    if (!donationId) {
      const response = NextResponse.json({ error: "Missing donation ID" }, { status: 400 });
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

    const supabase = await createClient();

    // Fetch donation and join with campaign to verify ownership
    const { data: donation, error } = await supabase
      .from("api_donations")
      .select(`
        *,
        api_campaigns:api_campaign_id (
          developer_id
        )
      `)
      .eq("id", donationId)
      .single();

    if (error || !donation) {
      const response = NextResponse.json({ error: "Donation not found" }, { status: 404 });
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: "not_found", startedAt });
      return response;
    }

    // Verify developer ownership
    // @ts-ignore - Supabase join structure
    if (donation.api_campaigns.developer_id !== auth.userId) {
      const response = NextResponse.json({ error: "Unauthorized access to donation" }, { status: 403 });
      await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, errorCode: "forbidden", startedAt });
      return response;
    }

    // Return donation details
    const response = NextResponse.json({
      success: true,
      data: {
        id: donation.id,
        amount: donation.amount,
        tip_amount: donation.tip_amount,
        donor_name: donation.donor_name,
        donor_email: donation.donor_email,
        message: donation.message,
        is_anonymous: donation.is_anonymous,
        status: donation.status,
        reference: donation.paystack_reference,
        created_at: donation.created_at,
        campaign_id: donation.api_campaign_id
      }
    });
    await logApiRequest({ request: req, statusCode: response.status, apiKeyId: auth.apiKeyId, userId: auth.userId, mode: auth.mode, startedAt });
    return response;

  } catch (error: any) {
    console.error("Donation fetch error:", error);
    const response = NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
    await logApiRequest({ request: req, statusCode: response.status, errorCode: "internal_error", startedAt });
    return response;
  }
}
