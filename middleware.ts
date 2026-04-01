import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  isProfileComplete,
  hasCompletedOnboarding,
} from "@/actions/profile-actions";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip middleware for static assets, favicons, etc.
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // 2. Update session and get user once. 
  // updateSession already calls getUser() internally.
  const response = await updateSession(request);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return response;
  }

  // 3. User is logged in. 
  // Skip expensive onboarding checks for public landing pages and non-dashboard routes
  // to reduce landing page latency and database load.
  const isPublicLanding = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isAuth = pathname.startsWith("/auth");

  // Only run onboarding check on dashboard routes
  if (isDashboard && !isOnboarding && !isAuth) {
    const hasCompleted = await hasCompletedOnboarding(user.id);
    if (!hasCompleted) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  // 4. Restricted dashboard routes (Create Cause/Petition)
  if (pathname.startsWith("/dashboard/causes/create") || pathname.startsWith("/dashboard/petitions/create")) {
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
        new URL(`/dashboard/settings/kyc?error=kyc_${kycVerification.status}`, request.url)
      );
    }

    const { isComplete } = await isProfileComplete(user.id);
    if (!isComplete) {
      return NextResponse.redirect(
        new URL("/dashboard/settings/profile?error=profile_incomplete", request.url)
      );
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
