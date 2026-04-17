import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ALL_COUNTRIES } from "@/utils/countryUtils";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: countries, error } = await supabase
      .from("countries")
      .select("name")
      .order("name");

    if (error || !countries || countries.length === 0) {
      console.warn("Countries table not available or empty, using static list");
      return NextResponse.json(ALL_COUNTRIES);
    }

    return NextResponse.json(countries.map((country) => country.name));
  } catch (error) {
    console.warn("Countries API error, using static list:", error);
    return NextResponse.json(ALL_COUNTRIES);
  }
}
