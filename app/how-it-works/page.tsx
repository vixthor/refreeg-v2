import { Metadata } from "next";

import HowItWorks from "@/components/HowItWorks";

export const metadata: Metadata = {
  title: "How It Works | Refreeg",
  description:
    "Learn how Refreeg connects donors with cause creators through our secure donation platform.",
};

export default function HowItWorksPage() {
  return <HowItWorks />;
}
