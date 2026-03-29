import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Public API route prefixes that do NOT require a Supabase user session.
 * These routes either use their own auth (API keys) or are intentionally public.
 */
const PUBLIC_API_PREFIXES = [
  "/api/bot",       // Developer API — authenticated via API keys
  "/api/webhooks",  // Incoming webhooks (Paystack, etc.)
  "/api/cities",    // Public lookup data
  "/api/countries", // Public lookup data
  "/api/states",    // Public lookup data
  "/api/mail",      // Donor-facing email endpoints (no auth required)
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Refresh session & get user (single getUser() call) ─────────
  const { response, user } = await updateSession(request);

  // ── 2. Protect API routes ─────────────────────────────────────────
  // Return 401 for authenticated API routes when no session exists.
  // Public API routes (bot, webhooks, lookups, mail) are excluded.
  if (pathname.startsWith("/api")) {
    const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (!isPublicApi && !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Authenticated or public — let the request through.
    return response;
  }

  // ── 3. Redirect unauthenticated users away from protected pages ───
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");

  if (isProtectedRoute && !user) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
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
