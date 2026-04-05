"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import NavigationLoader from "@/components/NavigationLoader";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  const noLayoutRoutes = ["/auth/signin", "/auth/signup", "/onboarding", "/docs/api"];
  const hideLayout = noLayoutRoutes.some((route) => pathname.startsWith(route));

  return (
    <>
      {!hideLayout && <Header />}
      <div className="flex min-h-screen flex-col">
        <NavigationLoader />
        <main className="flex-1">{children}</main>
      </div>
      {!hideLayout && <Footer />}
    </>
  );
}
