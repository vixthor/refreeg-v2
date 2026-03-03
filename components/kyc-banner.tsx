"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { hasKycVerification } from "@/actions/profile-actions";

export function KYCBanner() {
  const { user } = useAuth();
  const [shouldShowBanner, setShouldShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("kyc_banner_dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    const checkIfBannerShouldShow = async () => {
      if (!user?.id || isDismissed) {
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
  }, [user, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("kyc_banner_dismissed", "true");
  };

  if (!shouldShowBanner || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-50 w-full border-b border-amber-200 bg-amber-50 shadow-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 pr-8 sm:pr-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <span className="text-sm font-bold text-amber-700">!</span>
            </div>
            <p className="text-sm font-medium text-amber-800 leading-tight">
              Complete KYC verification to unlock fundraising features and
              premium rewards.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <Button
              asChild
              size="sm"
              variant="default"
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm shrink-0"
            >
              <Link
                href="/dashboard/settings/kyc"
                className="flex items-center gap-1.5"
              >
                <CheckCircle className="h-4 w-4" />
                Verify Now
              </Link>
            </Button>

            <button
              onClick={handleDismiss}
              className="absolute right-0 top-0 sm:relative sm:ml-2 p-1 text-amber-400 hover:text-amber-600 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
