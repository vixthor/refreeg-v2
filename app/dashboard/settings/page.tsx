"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useKyc } from "@/hooks/use-kyc";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryState } from "nuqs";
import { useSearchParams } from "next/navigation";
import { ProfileForm } from "./profile-form";
import { BankDetailsForm } from "./bank-details-form";
import CryptoDetailsForm from "./crypto-details-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { KycTab } from "./kyc-tab";
import { useEffect, useState } from "react";
import { getVerificationStatus } from "@/actions/kyc-actions";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfile(user?.id);
  const { isVerified, isLoading: isKycLoading } = useKyc(user?.id);
  const [hasKyc, setHasKyc] = useState<boolean | null>(null);

  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "profile",
    parse: (value) => value,
    serialize: (value) => value,
  });

  useEffect(() => {
    async function checkKyc() {
      if (user?.id) {
        const { status } = await getVerificationStatus(user.id);
        setHasKyc(!!status);
      }
    }
    checkKyc();
  }, [user?.id]);

  // Show skeleton while either auth or profile is loading
  if (profileLoading || isKycLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and payment details.
          </p>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and payment details.
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {profileError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show KYC alert only if user has never submitted KYC
  const showKycAlert = hasKyc === false || searchParams.get("error") === "kyc_required";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and payment details.
        </p>
      </div>

      {showKycAlert && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>KYC Verification Required</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {searchParams.get("error") === "kyc_required"
                ? "You need to complete KYC verification to list causes."
                : "Complete your KYC verification to list causes and access all features."}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/settings/kyc-setup")}
            >
              Set up KYC
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        defaultValue={activeTab}
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="bank">Bank Details</TabsTrigger>
          <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          {profile && user && <ProfileForm profile={profile} user={user} />}
        </TabsContent>

        <TabsContent value="bank">
          {profile && user && <BankDetailsForm profile={profile} user={user} />}
        </TabsContent>

        <TabsContent value="kyc">
          {profile && user && <KycTab profile={profile} user={user} />}
        </TabsContent>

        <TabsContent value="notifications">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Notification settings will be available soon.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
