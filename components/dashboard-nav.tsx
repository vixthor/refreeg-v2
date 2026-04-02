"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  BarChart3,
  FileText,
  Home,
  Settings,
  Users,
  Shield,
  UserCog,
  ClipboardCheckIcon,
  Wallet,
  Share2,
  Flag,
  Activity,
  Terminal,
} from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";

const userNavItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "My Causes",
    href: "/dashboard/causes",
    icon: FileText,
  },
  {
    title: "My Petitions",
    href: "/dashboard/petitions",
    icon: FileText,
  },
  {
    title: "My Donations",
    href: "/dashboard/donations",
    icon: Users,
  },
  {
    title: "Crypto Wallet",
    href: "/dashboard/crypto",
    icon: Wallet,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Referrals",
    href: "/referrals",
    icon: Share2,
  },
];

const adminNavItems = [
  {
    title: "Manage Causes",
    href: "/dashboard/admin/causes",
    icon: FileText,
  },
  {
    title: "Manage Petitions",
    href: "/dashboard/admin/petitions",
    icon: FileText,
  },
  {
    title: "Manage Users",
    href: "/dashboard/admin/users",
    icon: UserCog,
  },
  {
    title: "Analytics",
    href: "/dashboard/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "API Monitoring",
    href: "/dashboard/admin/api-monitoring",
    icon: Activity,
  },
  {
    title: "Logs",
    href: "/dashboard/admin/logs",
    icon: ClipboardCheckIcon,
  },
  {
    title: "API Reports",
    href: "/dashboard/admin/api-reports",
    icon: Flag,
  },
];

const developerNavItems = [
  {
    title: "Developer Tools",
    href: "/dashboard/developer",
    icon: Terminal,
  },
  {
    title: "API Reports",
    href: "/dashboard/developer/reports",
    icon: Flag,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isAdminOrManager, isLoading: adminLoading } = useAdmin(user?.id);
  const { profile, isLoading: profileLoading } = useProfile(user?.id);

  const isLoading = adminLoading || profileLoading;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    // We only show skeletons for the admin part to prevent hydration mismatch
    // The user nav items are static and should always render
  }

  return (
    <nav className="grid items-start gap-2 py-4">
      {userNavItems.map((item, index) => (
        <Link key={index} href={item.href}>
          <Button
            variant={
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? "secondary"
                : "ghost"
            }
            className={cn(
              "w-full justify-start",
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? "bg-secondary hover:bg-secondary"
                : "",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Button>
        </Link>
      ))}

      {mounted && isLoading ? (
        <div className="my-2">
          {adminNavItems.map((_, index) => (
            <Skeleton key={index} className="h-10 w-full mb-2" />
          ))}
        </div>
      ) : mounted && isAdminOrManager ? (
        <>
          <div className="my-2 grid items-start gap-2">
            <div className="mb-2 px-2 text-xs font-semibold tracking-tight flex items-center">
              <Shield className="mr-1 h-3 w-3" />
              Admin
            </div>
            {adminNavItems.map((item, index) => (
              <Link key={index} href={item.href}>
                <Button
                  variant={
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)
                      ? "secondary"
                      : "ghost"
                  }
                  className={cn(
                    "w-full justify-start",
                    pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)
                      ? "bg-secondary hover:bg-secondary"
                      : "",
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </>
      ) : null}

      {mounted && profile?.account_type === "developer" && (
        <div className="my-2 grid items-start gap-2 border-t pt-4">
          <div className="mb-2 px-2 text-xs font-semibold tracking-tight flex items-center text-blue-600">
            <Terminal className="mr-1 h-3 w-3" />
            Developer
          </div>
          {developerNavItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <Button
                variant={
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "secondary"
                    : "ghost"
                }
                className={cn(
                  "w-full justify-start",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-secondary hover:bg-secondary text-blue-700"
                    : "",
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
