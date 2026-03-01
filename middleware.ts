import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  isProfileComplete,
  hasCompletedOnboarding,
} from "@/actions/profile-actions";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  if (
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/onboarding") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return response;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const hasCompleted = await hasCompletedOnboarding(user.id);
    if (!hasCompleted) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  if (
    request.nextUrl.pathname.startsWith("/dashboard/causes/create") ||
    request.nextUrl.pathname.startsWith("/dashboard/petitions/create")
  ) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: kycVerification } = await supabase
        .from("kyc_verifications")
        .select("status")
        .eq("user_id", user.id)
        .single();

      if (!kycVerification) {
        return NextResponse.redirect(
          new URL("/dashboard/settings/kyc?error=kyc_required", request.url)
        );
      }

      if (kycVerification.status !== "approved") {
        return NextResponse.redirect(
          new URL(
            `/dashboard/settings/kyc?error=kyc_${kycVerification.status}`,
            request.url
          )
        );
      }

      const { isComplete } = await isProfileComplete(user.id);
      if (!isComplete) {
        return NextResponse.redirect(
          new URL(
            "/dashboard/settings/profile?error=profile_incomplete",
            request.url
          )
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
