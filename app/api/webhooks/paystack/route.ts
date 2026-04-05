import { NextResponse } from "next/server";
import { createDonation, createSubscription } from "@/actions";
import crypto from "crypto";

interface PaystackWebhookData {
  event: string;
  data: {
    reference?: string;
    subscription_code?: string;
    email_token?: string;
    amount: number;
    plan?: {
      interval: string;
    };
    metadata: {
      user_id?: string;
      cause_id: string;
      amount: number;
      tip_amount?: number;
      customer_name: string;
      email: string;
      message: string;
      is_anonymous: boolean;
      plan?: string;
    };
  };
}

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    if (!payload) {
      return new NextResponse(
        JSON.stringify({ error: "Empty payload received" }),
        { status: 400 }
      );
    }

    const signature = request.headers.get("x-paystack-signature");
    if (!signature) {
      return new NextResponse(
        JSON.stringify({ error: "Missing webhook signature" }),
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return new NextResponse(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500 }
      );
    }

    const hash = crypto
      .createHmac("sha512", secretKey)
      .update(payload)
      .digest("hex");

    if (hash !== signature) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid webhook signature" }),
        { status: 400 }
      );
    }

    const webhookData = JSON.parse(payload) as PaystackWebhookData;
    if (!webhookData?.event || !webhookData?.data?.metadata) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid webhook data structure" }),
        { status: 400 }
      );
    }

    const { event, data } = webhookData;
    const { metadata } = data;

    if (!metadata?.cause_id) {
      return new NextResponse(
        JSON.stringify({ message: "Metadata missing cause_id, skipping" }),
        { status: 200 }
      );
    }

    switch (event) {
      case "charge.success": {
        const baseAmount = Number(metadata.amount);
        const tipAmount = Number(metadata.tip_amount || 0);

        await createDonation(metadata.cause_id, metadata.user_id || null, {
          amount: baseAmount,
          name: metadata.customer_name,
          email: metadata.email,
          message: metadata.message,
          isAnonymous: metadata.is_anonymous,
          tip_amount: tipAmount,
        });

        return new NextResponse(
          JSON.stringify({ message: "Donation processed successfully" }),
          { status: 201 }
        );
      }

      case "subscription.create":
        await createSubscription({
          user_id: metadata.user_id || undefined,
          cause_id: metadata.cause_id,
          paystack_subscription_code: data.subscription_code!,
          paystack_email_token: data.email_token,
          amount: Number(metadata.amount),
          interval: data.plan?.interval || "monthly",
          status: "active",
        });
        
        return new NextResponse(
          JSON.stringify({ message: "Subscription created successfully" }),
          { status: 201 }
        );

      default:
        console.log("Unhandled Paystack event:", event);
        return new NextResponse(
          JSON.stringify({ message: "Webhook event not supported yet" }),
          { status: 200 }
        );
    }
  } catch (e) {
    console.error("Webhook processing error:", e);
    return new NextResponse(
      JSON.stringify({ 
        error: e instanceof Error ? e.message : "Internal Error" 
      }),
      { status: 500 }
    );
  }
}
