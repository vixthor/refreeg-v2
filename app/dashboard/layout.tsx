import type React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth-actions";
import { hasCompletedOnboarding } from "@/actions/profile-actions";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Onboarding gate — moved here from middleware to avoid DB queries
  // on every single request. Layouts are cached per-render and only
  // run when the route segment changes.
  const completedOnboarding = await hasCompletedOnboarding(user.id);
  if (!completedOnboarding) {
    redirect("/onboarding");
  }

  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>;
}
