import { NextRequest, NextResponse } from "next/server";
import Paystack from "@/services/paystack";

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Transaction reference is required" },
        { status: 400 }
      );
    }

    // Verify transaction using server-side service
    const isSuccessful = await Paystack.verifyTransaction(reference);

    return NextResponse.json({
      success: true,
      verified: isSuccessful,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to verify payment",
        success: false,
      },
      { status: 500 }
    );
  }
}
