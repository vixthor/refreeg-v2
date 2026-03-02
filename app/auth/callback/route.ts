import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import { hasCompletedOnboarding } from "@/actions/profile-actions";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL("/auth/signin?error=Invalid link", request.url),
      );
    }

    if (type === "recovery") {
      return NextResponse.redirect(
        new URL("/auth/update-password", request.url),
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      try {
        await supabase.functions.invoke("process-referral-v1", {
          body: {
            action: "complete",
            referee_email: (user.email || "").toLowerCase(),
            referee_id: user.id,
          },
        });
      } catch (error) {
        console.error("Error updating referral v1 after verification:", error);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }

      const completedOnboarding = await hasCompletedOnboarding(user.id);

      if (!completedOnboarding) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
