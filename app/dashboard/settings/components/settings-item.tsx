"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsItemProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
}

export function SettingsItem({
  title,
  description,
  href,
  icon,
}: SettingsItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center justify-between rounded-lg",
        "py-4 px-4",
        "border",
        "transition-colors duration-300",
        "hover:border-gray-400 hover:shadow-sm"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-4 flex-1 min-w-0",
          "transition-transform duration-300 ease-out",
          "group-hover:translate-x-1"
        )}
      >
        {icon && (
          <div className="text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-base group-hover:text-foreground transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>

      <ChevronRight
        className={cn(
          "h-5 w-5 ml-4 text-muted-foreground",
          "transition-all duration-300",
          "group-hover:text-foreground group-hover:translate-x-1"
        )}
      />
    </Link>
  );
}
