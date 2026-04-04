import type React from "react";
import { redirect } from "next/navigation";
import { getCachedUser } from "@/lib/supabase/cached-user";
import { hasCompletedOnboarding } from "@/actions/profile-actions";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authResult, completedOnboarding] = await Promise.all([
    getCachedUser(),
    (async () => {
      const { user } = await getCachedUser();
      return user ? hasCompletedOnboarding(user.id) : true; // default true if not yet authenticated
    })()
  ]);

  const { user, error: authError } = authResult;

  if (!user || authError) {
    redirect("/auth/signin");
  }

  if (!completedOnboarding) {
    redirect("/onboarding");
  }

  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>;
}
