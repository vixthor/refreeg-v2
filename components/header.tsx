"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Settings, CreditCard, FileText, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Profile {
  name: string;
  email: string;
  avatar: string;
  subscription?: string;
  model?: string;
}

interface MenuItem {
  label: string;
  value?: string;
  href: string;
}

interface NavDropdown {
  icon: React.ComponentType<any>;
  header: string;
  title: string;
  type: "dropdown";
  items: Array<{
    title: string;
    description: string;
    href: string;
    icon: React.ComponentType<any>;
  }>;
}

type NavItem = NavLink | NavDropdown;

export function Header() {
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth();
  const { isAdminOrManager } = useAdmin(user?.id);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const navItems: NavItem[] = [
    {
      title: "Explore Causes",
      href: "/causes",
      type: "link",
    },
    {
      title: "What can I crowdfund?",
      header: "Curious about what you crowdfund for? Here are some ideas:",
      icon: HandHeart,
      type: "dropdown",
      items: [
        {
          title: "🌍 Refreeg for Businesses",
          description:
            "Empower your brand with purpose. Launch CSR campaigns, support community-driven causes, and connect with customers who care about impact.",
          href: "/businesses",
          icon: CircleDollarSign,
        },
        {
          title: "🤝 RefreeG for Nonprofits",
          description:
            "Raise more, reach more. Build trust with transparent fundraising tools designed to help nonprofits thrive and grow their donor communities.",
          href: "/non-profits",
          icon: Target,
        },
        {
          title: "🌪️ RefreeG for Disaster Relief",
          description:
            "Rally urgent support for communities hit by disasters and get aid to those who need it; quickly and securely.",
          href: "/disaster-relief",
          icon: FileText,
        },
        {
          title: "🎨 RefreeG for Creators",
          description:
            "Turn your influence into impact. Get your unique tag, share your story, and receive donations directly from your fans in fiat or crypto.",
          href: "/creators",
          icon: FileText,
        },
        {
          title: "🏥 RefreeG for Healthcare",
          description:
            "Give hope a platform. Raise funds for medical bills, healthcare projects, or critical treatments — with transparency and community support.",
          href: "/healthcare",
          icon: FileText,
        },
      ],
    },
    {
      title: "How RefreeG works",
      header: "How can you crowdfund on RefreeG?",
      icon: Lightbulb,
      type: "dropdown",
      items: [
        {
          title: "⭐ How to start a cause",
          description:
            "Starting causes is easy, and fast because of the intuitive user experience Refreeg is built on. Set up causes in less than 3 minutes!",
          href: "/dashboard/causes/create",
          icon: Star,
        },
        // {
        //   title: "🚀 Crowdfunding tips",
        //   description:
        //     "Raise more, reach more. Build trust with transparent fundraising tools.",
        //   href: "/crowdfund/education",
        //   icon: Rocket,
        // },
        // {
        //   title: "📢 For Supporters",
        //   description:
        //     "See how to discover causes, donate securely in fiat or crypto, and follow progress transparently.",
        //   href: "/crowdfund/community",
        //   icon: Users,
        // },
        // {
        //   title: "💸 Fees & Payouts",
        //   description:
        //     "Clear explanation of transaction fees, payout timelines, and how creators/nonprofits access their funds.",
        //   href: "/crowdfund/fees",
        //   icon: CircleDollarSign,
        // },
        // {
        //   title: "🛡️ Trust & Safety",
        //   description:
        //     "Read about our fraud checks, KYC verification, and commitment to protecting both donors and cause.",
        //   href: "/crowdfund/trust",
        //   icon: Shield,
        // },
        {
          title: "📣 FAQ",
          description:
            "Get answers to the most common questions about crowdfunding on RefreeG.",
          href: "/#faq",
          icon: HelpCircle,
        },
      ],
    },
    {
      label: "Subscription",
      value: data.subscription,
      href: "#",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      label: "Settings",
      href: "#",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: "Terms & Policies",
      href: "#",
      icon: <FileText className="w-4 h-4" />,
      external: true,
    },
  ];

  return (
    <>
      <div className="sticky top-0 left-0 right-0 z-50">
        <Navbar
          isBordered
          className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 md:p-4"
        >
          <div className="flex items-center justify-between w-full">
            {/* Left: Logo + Desktop Nav */}
            <div className="flex items-center gap-4">
              <NavbarBrand>
                <Logo />
              </NavbarBrand>

              {/* Desktop Navigation */}
              <div className="hidden md:flex gap-0 items-center">
                {navItems.map((item) => {
                  if (item.type === "link") {
                    return (
                      <NavbarItem
                        key={item.href}
                        isActive={pathname === item.href}
                      >
                        <Link
                          href={item.href}
                          className={`text-sm font-medium transition-colors hover:text-secondary px-3 py-2 rounded-md ${
                            pathname === item.href
                              ? "text-foreground bg-primary/10"
                              : "text-muted-foreground hover:bg-gray-100"
                          }`}
                        >
                          {item.title}
                        </Link>
                      </NavbarItem>
                    );
                  } else {
                    return (
                      <NavbarItem key={item.title}>
                        <Dropdown>
                          <DropdownTrigger>
                            <HeroButton
                              variant="light"
                              className="text-sm items-center font-medium text-muted-foreground hover:text-secondary hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200 group"
                              endContent={
                                <ChevronDown className="text-small transition-transform duration-200 group-hover:rotate-180" />
                              }
                            >
                              {item.title}
                            </HeroButton>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label={item.title}
                            className="bg-white shadow-xl rounded-lg w-3/5 border border-gray-100"
                          >
                            <DropdownSection
                              title={item.header as string}
                              classNames={{
                                heading:
                                  "font-semibold text-sm text-foreground px-4 py-3 flex items-center gap-2",
                              }}
                              showDivider
                            >
                              {item.items.map((dropdownItem) => {
                                const DropdownIcon = dropdownItem.icon;
                                return (
                                  <DropdownItem
                                    key={dropdownItem.href}
                                    className="py-3 px-4 transition-all duration-200 hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500 cursor-pointer"
                                    textValue={dropdownItem.title}
                                  >
                                    <Link
                                      href={dropdownItem.href}
                                      className="flex items-start gap-3 w-full group"
                                    >
                                      {/* <DropdownIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0 group-hover:text-blue-600 transition-colors" /> */}
                                      <div className="flex-1">
                                        <p className="font-medium text-sm group-hover:text-blue-700 transition-colors">
                                          {dropdownItem.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1 group-hover:text-gray-600 transition-colors">
                                          {dropdownItem.description}
                                        </p>
                                      </div>
                                      <ChevronDown className="h-4 w-4 text-transparent group-hover:text-blue-400 -rotate-90 transition-all" />
                                    </Link>
                                  </DropdownItem>
                                );
                              })}
                            </DropdownSection>
                          </DropdownMenu>
                        </Dropdown>
                      </NavbarItem>
                    );
                  }
                })}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {(() => {
                // Define color themes per page
                const pathname = usePathname();

                const themeMap: Record<
                  string,
                  {
                    border: string;
                    text: string;
                    hoverBg: string;
                    bg: string;
                    hoverText: string;
                  }
                > = {
                  "/non-profits": {
                    border: "border-[#7D568A]",
                    text: "text-[#7D568A]",
                    hoverBg: "hover:bg-[#7D568A]",
                    hoverText: "hover:text-white",
                    bg: "bg-[#7D568A]",
                  },
                  "/businesses": {
                    border: "border-[#008B73]",
                    text: "text-[#008B73]",
                    hoverBg: "hover:bg-[#008B73]",
                    hoverText: "hover:text-white",
                    bg: "bg-[#008B73]",
                  },
                  "/healthcare": {
                    border: "border-[#C03744]",
                    text: "text-[#C03744]",
                    hoverBg: "hover:bg-[#C03744]",
                    hoverText: "hover:text-white",
                    bg: "bg-[#C03744]",
                  },
                  "/disaster-relief": {
                    border: "border-[#151314]",
                    text: "text-[#151314]",
                    hoverBg: "hover:bg-[#151314]",
                    hoverText: "hover:text-white",
                    bg: "bg-[#151314]",
                  },
                  "/creators": {
                    border: "border-[#0070E0]",
                    text: "text-[#0070E0]",
                    hoverBg: "hover:bg-[#0070E0]",
                    hoverText: "hover:text-white",
                    bg: "bg-[#0070E0]",
                  },
                };

                // Pick active theme or fallback to neutral
                const theme = themeMap[pathname] || {
                  border: "border-secondary",
                  text: "text-secondary",
                  hoverBg: "hover:bg-secondary",
                  hoverText: "hover:text-white",
                  bg: "bg-primary",
                };

                return (
                  <>
                    <Link href="/dashboard/causes/create">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`flex items-center gap-2 border-2 ${theme.border} ${theme.text} ${theme.hoverBg} ${theme.hoverText} transition-colors`}
                      >
                        List a Cause
                      </Button>
                    </Link>

                    {/* Auth */}
                    {!isLoading && !user ? (
                      <Link href="/auth/signin">
                        <Button size="sm" variant="default" className={``}>
                          Sign In
                        </Button>
                      </Link>
                    ) : (
                      <UserNav />
                    )}
                  </>
                );
              })()}

              {/* Mobile Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-foreground hover:bg-gray-100 rounded-md transition-colors md:hidden"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <DropdownMenuContent
            align="end"
            sideOffset={4}
            className="w-48 p-1 bg-white/95 backdrop-blur-sm border border-zinc-300 rounded-lg shadow-lg shadow-zinc-900/5 
                    data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-top-right"
          >
            <div className="space-y-1">
              {menuItems.map((item) => (
                <DropdownMenuItem key={item.label} asChild>
                  <Link
                    href={item.href}
                    className="flex items-center p-2 hover:bg-zinc-100/80 rounded-md transition-all duration-200 cursor-pointer group hover:shadow-sm border border-transparent hover:border-zinc-200/50"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {item.icon}
                      <span className="text-sm font-medium text-zinc-900 tracking-tight leading-tight whitespace-nowrap group-hover:text-white transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex-shrink-0 ml-auto">
                      {item.value && (
                        <span
                          className={cn(
                            "text-xs font-medium rounded-md py-1 px-2 tracking-tight",
                            item.label === "Model"
                              ? "text-blue-600 bg-blue-50 border border-blue-500/10"
                              : "text-purple-600 bg-purple-50 border border-purple-500/10"
                          )}
                        >
                          {item.value}
                        </span>
                      )}
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
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
                    setIsSigningOut(true);
                    await signOut?.();
                    setIsSigningOut(false);
                    setIsMenuOpen(false);
                  }}
                  disabled={isSigningOut}
                  className="flex items-center gap-3 w-full py-3 px-2 text-foreground hover:text-red-600 rounded-md transition-colors font-medium disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {isSigningOut ? "Signing out..." : "Sign Out"}
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
      </DropdownMenu>
    </div>
  );
}
