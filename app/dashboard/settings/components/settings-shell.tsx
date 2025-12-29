"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface SettingsShellProps {
  children: ReactNode;
}

export function SettingsShell({ children }: SettingsShellProps) {
  const router = useRouter();
  return (
    <div className="space-y-8">
      <Button
        variant="outline"
        className=" w-fit flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <div className="space-y-8">{children}</div>
    </div>
  );
}
