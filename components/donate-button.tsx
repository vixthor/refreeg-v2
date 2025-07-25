"use client";

import { Button } from "@/components/ui/button";

export function DonateButton() {
  return (
    <Button
      className="w-full bg-white hover:text-white border border-blue-900 text-blue-900"
      variant="default"
      size="lg"
    >
      Donate
    </Button>
  );
}
