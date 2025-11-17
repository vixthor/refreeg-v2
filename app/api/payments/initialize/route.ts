import { NextRequest, NextResponse } from "next/server";
import Paystack from "@/services/paystack";
import { TransactionData } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const data: TransactionData = await request.json();

    // Validate required fields
    if (!data.amount || !data.email || !data.causeId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Initialize transaction using server-side service
    const response = await Paystack.initializeTransaction(data);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to initialize payment",
        success: false,
      },
      { status: 500 }
    );
  }
}
