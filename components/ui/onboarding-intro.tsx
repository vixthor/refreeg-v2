"use client";

import { useState } from "react";
import { IntroDisclosure } from "@/components/ui/intro-disclosure";

const steps = [
  {
    title: "Welcome",
    short_description: "Quick overview",
    full_description: "Welcome to our platform!",
    media: {
      type: "image",
      src: "/feature-1.png",
      alt: "Welcome screen",
    },
  },
  {
    title: "Features",
    short_description: "Key capabilities",
    full_description: "Discover our main features",
    media: {
      type: "image",
      src: "/feature-2.png",
      alt: "Features overview",
    },
    action: {
      label: "Try Now",
      onClick: () => {},
    },
  },
] as const;

export function OnboardingIntro() {
  const [open, setOpen] = useState(true);

  return (
    <IntroDisclosure
      steps={steps}
      open={open}
      setOpen={setOpen}
      featureId="onboarding-intro"
      onComplete={() => {}}
      onSkip={() => {}}
    />
  );
}
