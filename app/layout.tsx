"use client";

import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import NavigationLoader from "@/components/NavigationLoader";
import { KYCBanner } from "@/components/kyc-banner"; // Add this import

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const noLayoutRoutes = ["/auth/signin", "/auth/signup", "/onboarding"];

  const hideLayout = noLayoutRoutes.some((route) => pathname.startsWith(route));

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {!hideLayout && <Header />}
          {/* Add KYC Banner here - will show on all pages for unverified users */}
          {!hideLayout && <KYCBanner />}
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
