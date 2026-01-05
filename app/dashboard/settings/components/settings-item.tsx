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
        "border border-gray-200",
        "bg-white",
        "transition-all duration-200 ease-out",

        "hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm",

        "active:scale-[0.98] active:bg-gray-100",

        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-0 h-full w-1 rounded-l-lg",
          "bg-transparent",
          "transition-colors duration-200",
          "group-hover:bg-blue-500"
        )}
      />

      <div
        className={cn(
          "flex items-center gap-4 flex-1 min-w-0",
          "transition-transform duration-200 ease-out",
          "group-hover:translate-x-1"
        )}
      >
        {icon && (
          <div
            className={cn(
              "text-gray-400",
              "transition-colors duration-200",
              "group-hover:text-blue-600"
            )}
          >
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-medium text-base text-gray-900",
              "transition-colors duration-200"
            )}
          >
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-600">
            {description}
          </p>
        </div>
      </div>

      <ChevronRight
        className={cn(
          "h-5 w-5 ml-4 text-gray-400",
          "transition-all duration-200",
          "group-hover:text-blue-600 group-hover:translate-x-1"
        )}
      />
    </Link>
  );
}
