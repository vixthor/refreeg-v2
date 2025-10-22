import { IntroDisclosure } from "./intro-disclosure";

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
      onClick: () => console.log("Action clicked"),
    },
  },
] as const;

export function OnboardingIntro() {
  return (
    <IntroDisclosure
      steps={steps}
      featureId="onboarding-intro"
      onComplete={() => console.log("Completed")}
      onSkip={() => console.log("Skipped")}
    />
  );
}
