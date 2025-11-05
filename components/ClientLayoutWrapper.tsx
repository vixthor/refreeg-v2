"use client";

import { usePathname } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetOverlay } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNav = pathname.startsWith("/dashboard/settings/kyc-setup");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Close the mobile drawer after route changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      {hideNav ? (
        <div className="flex-1 flex flex-col w-full">
          <main className="flex w-full flex-col overflow-hidden py-6">
            {children}
          </main>
        </div>
      ) : (
        <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
            <DashboardNav />
          </aside>
          <main className="flex w-full flex-col overflow-hidden py-6">
            {children}
          </main>
          {/* Mobile/Tablet floating hamburger + sheet drawer */}
          {isDashboardRoute && (
            <>
              {/* Floating handle */}
              <div className="md:hidden">
                <Button
                  type="button"
                  aria-label="Open dashboard menu"
                  className="fixed left-2 top-16 z-40 rounded-full shadow-md bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 border"
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsMobileNavOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>

              {/* Sheet Drawer */}
              <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                <SheetOverlay />
                <SheetContent side="left" className="p-0 w-[85%] sm:max-w-sm">
                  <nav className="h-full overflow-y-auto p-4">
                    <DashboardNav showMobileToggle={false} />
                  </nav>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      )}
    </div>
  );
}
