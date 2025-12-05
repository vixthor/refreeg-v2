import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ALL_COUNTRIES } from "@/app/utils/countryUtils";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: countries, error } = await supabase
      .from("countries")
      .select("name")
      .order("name");

    // If database query fails or returns no data, use static list
    if (error || !countries || countries.length === 0) {
      console.warn("Countries table not available or empty, using static list");
      return NextResponse.json(ALL_COUNTRIES);
    }

    return NextResponse.json(countries.map((country) => country.name));
  } catch (error) {
    // On any error, return the static list as fallback
    console.warn("Countries API error, using static list:", error);
    return NextResponse.json(ALL_COUNTRIES);
  }
}
