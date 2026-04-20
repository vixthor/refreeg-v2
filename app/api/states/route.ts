import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryName = searchParams.get("countryName")?.trim();

    if (!countryName) {
      return NextResponse.json(
        { error: "Country name is required" },
        { status: 400 }
      );
    }

    // 1. Find country first
    const country = await prisma.country.findFirst({
      where: {
        name: countryName,
      },
      select: {
        id: true,
      },
    });

    if (!country) {
      return NextResponse.json(
        { error: "Country not found" },
        { status: 404 }
      );
    }

    // 2. Fetch states using countryId
    const states: { name: string }[] = await prisma.state.findMany({
      where: {
        countryId: country.id,
      },
      select: {
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(states.map((s) => s.name));
  } catch (error) {
    console.error("States API error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}