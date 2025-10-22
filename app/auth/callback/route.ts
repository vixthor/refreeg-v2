import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL("/auth/signin?error=Invalid link", request.url)
      );
    }

    // If this is a password recovery, redirect to update password page
    if (type === "recovery") {
      return NextResponse.redirect(
        new URL("/auth/update-password", request.url)
      );
    }

    // Check if user is new (OAuth sign-up) and redirect to onboarding
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // Check if user has a profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // If no profile exists, this is a new OAuth user - redirect to onboarding
      if (!profile) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
