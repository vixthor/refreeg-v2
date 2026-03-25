import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, rateLimit } from "@/utils/api-bot/api-auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const donationId = params.id;

    if (!donationId) {
      return NextResponse.json({ error: "Missing donation ID" }, { status: 400 });
    }

    // Rate limiting
    const isLimited = await rateLimit(req.headers.get("Authorization") || "anonymous");
    if (isLimited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Auth
    const auth = await validateApiKey(req);
    if (!auth || !auth.userId) {
      return auth.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // Verify developer ownership
    // @ts-ignore - Supabase join structure
    if (donation.api_campaigns.developer_id !== auth.userId) {
      return NextResponse.json({ error: "Unauthorized access to donation" }, { status: 403 });
    }

    // Return donation details
    return NextResponse.json({
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

  } catch (error: any) {
    console.error("Donation fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
