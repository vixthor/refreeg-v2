"use client";

import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteAccountButton } from "../delete-account-button";
import { SettingsShell } from "../components/settings-shell";

export default function AccountSettingsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <SettingsShell
        title="Account Management"
        description="Manage your account settings."
      >
        <Skeleton className="h-[400px] w-full" />
      </SettingsShell>
    );
  }

  return (
    <SettingsShell
      title="Account Management"
      description="Delete your account and manage account settings."
    >
      {user && <DeleteAccountButton userId={user.id} />}
    </SettingsShell>
  );
}
