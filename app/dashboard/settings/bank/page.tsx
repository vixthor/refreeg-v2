"use client";

import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { BankDetailsForm } from "../bank-details-form";
import { SettingsShell } from "../components/settings-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function BankSettingsPage() {
  const { user } = useAuth();
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfile(user?.id);

  if (profileLoading) {
    return (
      <SettingsShell
        title="Bank Details"
        description="Manage your bank account for receiving donations."
      >
        <Skeleton className="h-[400px] w-full" />
      </SettingsShell>
    );
  }

  if (profileError) {
    return (
      <SettingsShell
        title="Bank Details"
        description="Manage your bank account for receiving donations."
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{profileError}</AlertDescription>
        </Alert>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell
      title="Bank Details"
      description="Add your bank account details for receiving donations."
    >
      {profile && user && <BankDetailsForm profile={profile} user={user} />}
    </SettingsShell>
  );
}
