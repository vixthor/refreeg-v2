"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button as HeroButton,
} from "@heroui/react";

export function Header() {
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth(); // assume signOut exists
  const { isAdminOrManager } = useAdmin(user?.id);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navItems = [
    { title: "Causes", href: "/causes", icon: Megaphone },
    { title: "Petitions", href: "/petitions", icon: FileText },
    { title: "How It Works", href: "/how-it-works", icon: Info },
  ];

  const aboutUsItems = [
    { title: "Our Mission", href: "/about-us/OurMission" },
    {
      title: 'Our Story (The "Why" Behind RefreeG)',
      href: "/about-us/OurStory",
    },
    { title: "Our Impact", href: "/about-us/OurImpact" },
    { title: "What We Do", href: "/about-us/WhatWeDo" },
  ];

  // Scroll behavior for navbar + auto-close mobile menu
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // scrolling down
        setShowNavbar(false);
        setIsMenuOpen(false); // auto-close mobile menu
      } else {
        // scrolling up
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* Spacer so content isn’t hidden */}
      <div className="h-16 md:h-20" />

      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Navbar
          isBordered
          className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 md:p-4"
          maxWidth="xl"
        >
          {/* Brand */}
          <NavbarBrand>
            <Logo />
          </NavbarBrand>

          {/* Desktop Navigation */}
          <NavbarContent className="hidden md:flex gap-4" justify="start">
            {navItems.map((item) => (
              <NavbarItem key={item.href} isActive={pathname === item.href}>
                <Link
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-secondary ${
                    pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.title}
                </Link>
              </NavbarItem>
            ))}

            <NavbarItem>
              <Dropdown>
                <DropdownTrigger>
                  <HeroButton
                    variant="light"
                    className="text-sm font-medium text-muted-foreground hover:text-secondary"
                    endContent={<ChevronDown className="text-small" />}
                  >
                    About Us
                  </HeroButton>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="About Us"
                  className="bg-white shadow-xl rounded-md"
                >
                  {aboutUsItems.map((item) => (
                    <DropdownItem key={item.href} as={Link} href={item.href}>
                      {item.title}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </NavbarContent>

          {/* Right Side */}
          <NavbarContent justify="end">
            {/* Desktop buttons */}
            <NavbarItem className="hidden md:flex">
              <Link href="/dashboard/causes/create">
                <Button variant="outline" size="sm">
                  List a Cause
                </Button>
              </Link>
            </NavbarItem>
            <NavbarItem className="hidden md:flex">
              <Link href="/dashboard/petitions/create">
                <Button variant="outline" size="sm">
                  Create a Petition
                </Button>
              </Link>
            </NavbarItem>

            {!isLoading && user && (
              <NavbarItem className="hidden md:flex">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              </NavbarItem>
            )}

            {!isLoading && !user ? (
              <NavbarItem>
                <Link href="/auth/signin">
                  <Button size="sm" variant="default">
                    Sign In
                  </Button>
                </Link>
              </NavbarItem>
            ) : (
              <NavbarItem>
                <UserNav />
              </NavbarItem>
            )}

            {/* Mobile Toggle */}
            <NavbarItem className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-foreground hover:bg-gray-100 rounded-md transition-colors"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </NavbarItem>
          </NavbarContent>
        </Navbar>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-full left-0 right-0 
          bg-background/70 
          backdrop-blur-md 
          supports-[backdrop-filter]:bg-background/60 
          border-b shadow-lg z-40 transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-4 invisible"
          }`}
        >
          <div className="container py-6 space-y-4">
            {/* Main Nav */}
            <div className="space-y-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
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
                    <Icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </div>

            {/* About Us Collapsible */}
            <div className="border-t pt-4">
              <button
                className="w-full flex justify-between items-center py-3 px-2 text-foreground font-medium hover:bg-blue-600/5 rounded-md transition-colors"
                onClick={() => setAboutOpen(!aboutOpen)}
              >
                About Us
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    aboutOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  aboutOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="ml-4 mt-2 space-y-1">
                  {aboutUsItems.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={`block py-2 px-3 text-sm hover:text-blue-600 hover:bg-blue-600/5 rounded-md transition-all duration-200 ${
                        pathname === subItem.href
                          ? "text-blue-600 font-medium bg-blue-600/10"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setAboutOpen(false);
                      }}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-4 space-y-2">
              <Link
                href="/dashboard/causes/create"
                className="flex items-center py-3 px-2 text-foreground hover:text-blue-600 rounded-md transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Megaphone className="mr-2 h-4 w-4" />
                List a Cause
              </Link>

              <Link
                href="/dashboard/petitions/create"
                className="flex items-center py-3 px-2 text-foreground hover:text-blue-600 rounded-md transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Create a Petition
              </Link>

              {!isLoading && user && (
                <Link
                  href="/dashboard"
                  className="flex items-center py-3 px-2 text-foreground hover:text-blue-600 rounded-md transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              )}

              {!isLoading && user && (
                <button
                  onClick={() => {
                    signOut?.();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full py-3 px-2 text-foreground hover:text-red-600 rounded-md transition-colors font-medium"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
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
                    { href: "/dashboard/admin/causes", title: "Manage Causes" },
                    {
                      href: "/dashboard/admin/petitions",
                      title: "Manage Petitions",
                    },
                    { href: "/dashboard/admin/users", title: "Manage Users" },
                    { href: "/dashboard/admin/analytics", title: "Analytics" },
                    { href: "/dashboard/admin/logs", title: "Logs" },
                  ].map((adminItem) => (
                    <Link
                      key={adminItem.href}
                      href={adminItem.href}
                      className="block py-2 px-2 text-sm text-foreground hover:text-blue-600 hover:bg-blue-600/5 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {adminItem.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
