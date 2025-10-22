"use client";

import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
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
    <Navbar
      position="sticky"
      isBordered
      className="
        bg-white/30 
        backdrop-blur-md 
        backdrop-saturate-150 
        supports-[backdrop-filter]:bg-white/40
        py-2 
        px-2 
        shadow-sm
      "
    >
      <NavbarBrand>
        <Logo />
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
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
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
