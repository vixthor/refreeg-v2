"use client";

import { ReactNode } from "react";

interface SettingsShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsShell({
  title,
  description,
  children,
}: SettingsShellProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-base">{description}</p>
        )}
      </div>
      <div className="space-y-8">{children}</div>
    </div>
  );
}
