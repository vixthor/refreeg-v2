"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/hooks/use-auth"
import { Logo } from "@/components/logo"
// Import the useAdmin hook
import { useAdmin } from "@/hooks/use-admin"
import { LayoutDashboard, ShieldAlert } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  // Add the useAdmin hook to check for admin/manager access
  const { isAdminOrManager, isLoading: adminLoading } = useAdmin(user?.id)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Logo />
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/causes"
              className={`text-sm font-medium transition-colors hover:text-secondary ${
                pathname === "/causes" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Causes
            </Link>
            <Link
              href="/how-it-works"
              className={`text-sm font-medium transition-colors hover:text-secondary ${
                pathname === "/how-it-works" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              How It Works
            </Link>
            {/* {!isLoading && user && (
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-secondary flex items-center ${
                  pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/admin")
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <LayoutDashboard className="mr-1 h-4 w-4" />
                Dashboard
              </Link>
            )} */}
            {/* Add Admin Dashboard link if user has admin/manager access */}
            {!isLoading && !adminLoading && user && isAdminOrManager && (
              <Link
                href="/dashboard/admin/causes"
                className={`text-sm font-medium transition-colors hover:text-secondary flex items-center ${
                  pathname.startsWith("/dashboard/admin") ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <ShieldAlert className="mr-1 h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isLoading && !user ? (
            <div className="flex items-center gap-2">
              <Link href="/auth/signin">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          ) : (
            <UserNav />
          )}
        </div>
      </div>
    </header>
  )
}

