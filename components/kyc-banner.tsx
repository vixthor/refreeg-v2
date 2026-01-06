"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { hasKycVerification } from "@/actions/profile-actions";

export function KYCBanner() {
  const { user } = useAuth();
  const [shouldShowBanner, setShouldShowBanner] = useState(false);

  useEffect(() => {
    const checkIfBannerShouldShow = async () => {
      if (!user?.id) {
        setShouldShowBanner(false);
        return;
      }

      try {
        const kycData = await hasKycVerification(user.id);

        const hasApprovedKyc = kycData?.status === "approved";
        setShouldShowBanner(user && !hasApprovedKyc);
      } catch (error) {
        console.error("Error checking KYC status:", error);
        setShouldShowBanner(false);
      }
    };

    checkIfBannerShouldShow();

    const interval = setInterval(checkIfBannerShouldShow, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (!shouldShowBanner) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-50 w-full border-b border-amber-200 bg-amber-50 shadow-md">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
              <span className="text-sm font-bold text-amber-700">!</span>
            </div>
            <p className="text-sm font-medium text-amber-800">
              Complete KYC verification to unlock fundraising features
            </p>
          </div>
          <Button
            asChild
            size="sm"
            variant="default"
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Link
              href="/dashboard/settings/kyc"
              className="flex items-center gap-1.5"
            >
              <CheckCircle className="h-4 w-4" />
              Verify Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
