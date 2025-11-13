"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/logo";
import { useAdmin } from "@/hooks/use-admin";
import {
  LayoutDashboard,
  ChevronDown,
  Menu,
  X,
  Megaphone,
  FileText,
  Info,
  LogOut,
  HeartHandshake,
  Users,
  Globe,
  BookOpen,
  Lightbulb,
  Target,
  CircleDollarSign,
  TargetIcon,
  Heart,
  BarChart3,
  Shield,
  Book,
  Star,
  Rocket,
  HelpCircle,
  Calendar,
  MapPin,
  Users2,
  Globe2,
  LightbulbIcon,
  Search,
  Sparkles,
  PlayCircle,
  HandHeart,
} from "lucide-react";
import {
  Navbar,
  NavbarBrand,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Button as HeroButton,
} from "@heroui/react";

// Define types for navigation items
interface NavLink {
  title: string;
  type: "link";
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}

const SAMPLE_PROFILE_DATA: Profile = {
  name: "Eugene An",
  email: "eugene@kokonutui.com",
  avatar:
    "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/profile-mjss82WnWBRO86MHHGxvJ2TVZuyrDv.jpeg",
  subscription: "PRO",
  model: "Gemini 2.0 Flash",
};

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: Profile;
  showTopbar?: boolean;
  onSignOut?: () => void;
  menuItems?: MenuItem[];
}

export default function ProfileDropdown({
  data = SAMPLE_PROFILE_DATA,
  className,
  onSignOut,
  menuItems: customMenuItems,
  ...props
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Use custom menu items if provided, otherwise use default
  const menuItems: MenuItem[] = customMenuItems || [
    {
      label: "Profile",
      href: "#",
      icon: <User className="w-4 h-4" />,
    },
    {
      title: "About RefreeG",
      header: "About RefreeG?",
      icon: Lightbulb,
      type: "dropdown",
      items: [
        {
          title: "💼Our Mission",
          description: "Find out what our mission here at RefreeG.",
          href: "/about-us/OurMission",
          icon: TargetIcon,
        },
        {
          title: "📢Our Story",
          description:
            "Raise more, reach more. Build trust with transparent fundraising tools.",
          href: "/about-us/OurStory",
          icon: Book,
        },
        {
          title: "🔨Our Impact",
          description:
            "See how to discover causes, donate securely in fiat or crypto, and follow progress transparently.",
          href: "/about-us/OurImpact",
          icon: BarChart3,
        },
        {
          title: "🧑‍🤝‍🧑Who Are We Made By",
          description:
            "Clear explanation of transaction fees, payout timelines, and how creators/nonprofits access their funds.",
          href: "/about-us/OurTeam",
          icon: Users2,
        },
        {
          title: "💡 What We Do",
          description:
            "Read about our fraud checks, KYC verification, and commitment to protecting both donors and cause.",
          href: "/about-us/WhatWeDo",
          icon: LightbulbIcon,
        },
        {
          title: "📣FAQ",
          description:
            "Get answers to the most common questions about crowdfunding on RefreeG.",
          href: "/about-us/faq",
          icon: Heart,
        },
      ],
    },
  ];

  const toggleDropdown = (title: string) => {
    setOpenDropdown(openDropdown === title ? null : title);
  };

  return (
    <div className={cn("relative", className)} {...props}>
      <DropdownMenu onOpenChange={setIsOpen}>
        <div className="group relative">
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 p-2 rounded-lg bg-white border border-zinc-300 hover:border-zinc-500 hover:bg-zinc-50/80 hover:shadow-sm transition-all duration-200 focus:outline-none"
            >
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-zinc-900 tracking-tight leading-tight">
                  {data.name}
                </div>
                <div className="text-xs text-zinc-500 tracking-tight leading-tight">
                  {data.email}
                </div>
              </div>
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-blue-500 to-blue-400 p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <Image
                      src={data.avatar}
                      alt={data.name}
                      width={28}
                      height={28}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>

          {/* Bending line indicator on the right */}
          <div
            className={cn(
              "absolute -right-2 top-1/2 -translate-y-1/2 transition-all duration-200",
              isOpen ? "opacity-100" : "opacity-60 group-hover:opacity-100"
            )}
          >
            <svg
              width="8"
              height="16"
              viewBox="0 0 8 16"
              fill="none"
              className={cn(
                "transition-all duration-200",
                isOpen
                  ? "text-blue-500 scale-110"
                  : "text-zinc-400 group-hover:text-zinc-600"
              )}
              aria-hidden="true"
            >
              <path
                d="M1 3C4 6 4 10 1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </Navbar>

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed top-[64px] left-0 right-0 bottom-0
    bg-background/70 
    backdrop-blur-md 
    supports-[backdrop-filter]:bg-background/60 
    border-b shadow-lg z-40 transition-all duration-300 ease-in-out
    ${
      isMenuOpen
        ? "opacity-100 translate-y-0 visible"
        : "opacity-0 -translate-y-4 invisible"
    }
  `}
        >
          <div className="container py-6 space-y-4 max-h-[calc(100vh-64px)] overflow-y-auto">
            {/* Main Nav */}
            <div className="space-y-1">
              {navItems.map((item) => {
                if (item.type === "link") {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center py-3 px-2 text-foreground hover:text-blue-600 hover:bg-blue-600/5 rounded-md transition-all duration-200 ${
                        pathname === item.href
                          ? "text-blue-600 font-medium bg-blue-600/10"
                          : ""
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  );
                } else {
                  return (
                    <div key={item.title} className="border-t pt-4">
                      <button
                        className="w-full flex justify-between items-center py-3 px-2 text-foreground font-medium hover:bg-blue-600/5 rounded-md transition-colors"
                        onClick={() => toggleDropdown(item.title)}
                      >
                        {item.title}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            openDropdown === item.title
                              ? "rotate-180"
                              : "rotate-0"
                          }`}
                        />
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          openDropdown === item.title
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        {/* Mobile Dropdown Header with Icon */}
                        <div className="ml-4 mt-2 mb-3 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md">
                          <item.icon className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            {item.header}
                          </span>
                        </div>

                        <div className="ml-4 space-y-3">
                          {item.items.map((subItem) => {
                            const Icon = subItem.icon;
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className="block py-2 px-3 text-sm hover:text-blue-600 hover:bg-blue-600/5 rounded-md transition-all duration-200"
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  setOpenDropdown(null);
                                }}
                              >
                                <div className="flex items-start gap-2">
                                  <Icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="font-medium">
                                      {subItem.title}
                                    </p>
                                    <p className="text-muted-foreground text-xs mt-1">
                                      {subItem.description}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>

            {/* Actions */}
            <div className="border-t pt-4 space-y-2">
              <Link
                href="/dashboard/causes/create"
                className="flex items-center gap-3 py-3 px-2 text-foreground hover:text-blue-600 rounded-md transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Megaphone className="h-4 w-4" />
                List a Cause
              </Link>

              <Link
                href="/dashboard/petitions/create"
                className="flex items-center gap-3 py-3 px-2 text-foreground hover:text-blue-600 rounded-md transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="h-4 w-4" />
                Create a Petition
              </Link>

              {!isLoading && user && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 py-3 px-2 text-foreground hover:text-blue-600 rounded-md transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              )}

              {!isLoading && user && (
                <button
                  onClick={async () => {
                    if (isSigningOut) return;

                    try {
                      setIsSigningOut(true);
                      setIsMenuOpen(false); // Close menu immediately
                      if (signOut) {
                        await signOut();
                      }
                    } catch (error) {
                      console.error("Error signing out:", error);
                      setIsSigningOut(false);
                    }
                    // Note: setIsSigningOut(false) is not needed here as signOut will redirect
                  }}
                  disabled={isSigningOut}
                  className="flex items-center gap-3 w-full py-3 px-2 text-foreground hover:text-red-600 rounded-md transition-colors font-medium disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {isSigningOut ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Signing out...
                    </span>
                  ) : (
                    "Sign Out"
                  )}
                </button>
              )}
            </div>

            {/* Admin Links */}
            {isAdminOrManager && (
              <div className="border-t pt-4">
                <div className="py-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Admin
                </div>
                <div className="space-y-1">
                  {[
                    {
                      href: "/dashboard/admin/causes",
                      title: "Manage Causes",
                      icon: Megaphone,
                    },
                    {
                      href: "/dashboard/admin/petitions",
                      title: "Manage Petitions",
                      icon: FileText,
                    },
                    {
                      href: "/dashboard/admin/users",
                      title: "Manage Users",
                      icon: Users,
                    },
                    {
                      href: "/dashboard/admin/analytics",
                      title: "Analytics",
                      icon: BarChart3,
                    },
                    {
                      href: "/dashboard/admin/logs",
                      title: "Logs",
                      icon: Book,
                    },
                  ].map((adminItem) => {
                    const AdminIcon = adminItem.icon;
                    return (
                      <Link
                        key={adminItem.href}
                        href={adminItem.href}
                        className="flex items-center gap-3 py-2 px-2 text-sm text-foreground hover:text-blue-600 hover:bg-blue-600/5 rounded-md transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <AdminIcon className="h-4 w-4" />
                        {adminItem.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
