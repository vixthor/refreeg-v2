"use client";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { ArrowLeft } from "lucide-react";

interface OnboardingNavProps {
  currentStep: number;
  onBack?: () => void;
  showUserNav?: boolean;
}

export default function OnboardingNav({
  currentStep,
  onBack,
  showUserNav = false,
}: OnboardingNavProps) {
  return (
    <nav
      className="
        sticky top-0 z-50
        bg-white/30
        backdrop-blur-md
        backdrop-saturate-150
        supports-[backdrop-filter]:bg-white/40
        py-2 px-4
        shadow-sm
      "
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Right side */}
        <div className="flex items-center">
          {showUserNav ? (
            <UserNav />
          ) : (
            currentStep > 1 &&
            currentStep <= 3 &&
            onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go back
              </Button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
