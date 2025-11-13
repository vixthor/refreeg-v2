"use client";

import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import NavigationLoader from "@/components/NavigationLoader";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Define routes where you DON'T want Header and Footer
  const noLayoutRoutes = ["/auth/signin", "/auth/signup", "/onboarding"];

  // Check if current path matches one of them
  const hideLayout = noLayoutRoutes.some((route) => pathname.startsWith(route));

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {!hideLayout && <Header />}
          <div className="flex min-h-screen flex-col">
            <NavigationLoader />
            <main className="flex-1">{children}</main>
          </div>
          {!hideLayout && <Footer />}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
