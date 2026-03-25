import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, rateLimit } from "@/utils/api-bot/api-auth";
import { InitiateDonationSchema } from "@/utils/api-bot/schemas";
import { createClient } from "@/lib/supabase/server";
import Paystack from "@/services/paystack";
import { TransactionData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const isLimited = await rateLimit(req.headers.get("x-api-key") || "anonymous");
    if (isLimited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const auth = await validateApiKey(req);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Invalid API Key" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = InitiateDonationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const supabase = await createClient();
    const { data: campaign, error: campaignError } = await supabase
      .from("api_campaigns")
      .select("id, sub_account_code, status, developer_id")
      .eq("id", data.campaign_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.developer_id !== auth.userId) {
      return NextResponse.json({ error: "Unauthorized access to campaign" }, { status: 403 });
    }

    if (campaign.status !== "active") {
      return NextResponse.json({ error: "Campaign is not active" }, { status: 400 });
    }

    if (!campaign.sub_account_code) {
      return NextResponse.json({ error: "Campaign has no sub-account for payouts" }, { status: 400 });
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

    return NextResponse.json({
      success: true,
      data: paystackResponse,
    });
  } catch (error: any) {
    console.error("Donation initialization error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
