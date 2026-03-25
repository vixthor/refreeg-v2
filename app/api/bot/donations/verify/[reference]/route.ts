import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, rateLimit } from "@/utils/api-bot/api-auth";
import { createClient } from "@/lib/supabase/server";
import Paystack from "@/services/paystack";

export async function GET(
  req: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    const reference = params.reference;

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
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

    // Verify with Paystack
    const transaction = await Paystack.verifyTransactionFull(reference);
    if (!transaction || transaction.status !== "success") {
      return NextResponse.json({ 
        error: "Transaction not successful", 
        status: transaction?.status || "unknown" 
      }, { status: 400 });
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
      return NextResponse.json({ 
        message: "Donation already processed",
        donation_id: existingDonation.id 
      }, { status: 200 });
    }

    // Fetch campaign and verify ownership
    const { data: campaign, error: campaignError } = await supabase
      .from("api_campaigns")
      .select("id, title, developer_id, raised_amount")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.developer_id !== auth.userId) {
      return NextResponse.json({ error: "Unauthorized access to campaign" }, { status: 403 });
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
      return NextResponse.json({ error: "Failed to record donation" }, { status: 500 });
    }

    // Update campaign raised_amount
    const newRaisedAmount = Number(campaign.raised_amount) + amount;
    await supabase
      .from("api_campaigns")
      .update({ raised_amount: newRaisedAmount })
      .eq("id", campaignId);

    return NextResponse.json({
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

  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
