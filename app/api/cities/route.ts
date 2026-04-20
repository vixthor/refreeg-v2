import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateName = searchParams.get("stateName")?.trim();

    if (!stateName) {
      return NextResponse.json(
        { error: "State name is required" },
        { status: 400 }
      );
    }

    // 1. Find the state first
    const state = await prisma.state.findFirst({
      where: {
        name: stateName,
      },
      select: {
        id: true,
      },
    });

    if (!state) {
      return NextResponse.json(
        { error: "State not found" },
        { status: 404 }
      );
    }

    // 2. Fetch cities using stateId
    const cities: { name: string }[] = await prisma.city.findMany({
      where: {
        stateId: state.id,
      },
      select: {
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(cities.map((c) => c.name));
  } catch (error) {
    console.error("Cities API error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}