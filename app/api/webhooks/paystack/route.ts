import { NextResponse } from "next/server";
import { createDonation } from "@/actions";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

interface PaystackWebhookData {
  event: string;
  data: {
    reference: string;
    metadata: {
      user_id: string;
      cause_id: string;
      amount: number;
      customer_name: string;
      email: string;
      message: string;
      is_anonymous: boolean;
    };
  };
}

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    if (!payload) {
      return new NextResponse(
        JSON.stringify({
          error: "Empty payload received",
        }),
        { status: 400 },
      );
    }

    const signature = request.headers.get("x-paystack-signature");
    if (!signature) {
      return new NextResponse(
        JSON.stringify({
          error: "Missing webhook signature",
        }),
        { status: 400 },
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY not found in environment variables");
      return new NextResponse(
        JSON.stringify({
          error: "Server configuration error",
        }),
        { status: 500 },
      );
    }

    const hash = crypto
      .createHmac("sha512", secretKey)
      .update(payload)
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid webhook signature");
      return new NextResponse(
        JSON.stringify({
          error: "Invalid webhook signature",
        }),
        { status: 400 },
      );
    }

    const webhookData = JSON.parse(payload) as PaystackWebhookData;

    if (
      !webhookData?.event ||
      !webhookData?.data?.metadata ||
      !webhookData?.data?.reference
    ) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid webhook data structure",
        }),
        { status: 400 },
      );
    }

    const { event, data } = webhookData;
    const { metadata, reference } = data;

    if (!metadata?.cause_id || !metadata?.amount || !metadata?.customer_name) {
      return new NextResponse(
        JSON.stringify({
          error: "Missing required metadata fields",
        }),
        { status: 400 },
      );
    }

    const amount = Number(metadata.amount);

    switch (event) {
      case "charge.success":
        await createDonation(metadata.cause_id, metadata.user_id, {
          amount: amount,
          email: metadata.email,
          message: metadata.message,
          isAnonymous: metadata.is_anonymous,
          name: metadata.customer_name,
        });
        return new NextResponse(
          JSON.stringify({
            message: "Webhook received and processed successfully",
          }),
          { status: 201 },
        );
      default:
        return new NextResponse(
          JSON.stringify({
            message: "Webhook event not supported yet",
          }),
          { status: 200 },
        );
    }
  } catch (e) {
    console.error("Webhook processing error:", e);
    return new NextResponse(
      JSON.stringify({
        error: e instanceof Error ? e.message : "An unknown error occurred",
        message: `An error occurred: ${e}`,
      }),
      { status: 500 },
    );
  }
}
