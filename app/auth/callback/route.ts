import { auth } from "@/lib/auth/auth";
import { type NextRequest, NextResponse } from "next/server";
import { hasCompletedOnboarding } from "@/actions/profile-actions";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  const completedOnboarding =
    session.user.onboardingCompleted ??
    (await hasCompletedOnboarding(session.user.id));

  if (!completedOnboarding) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
