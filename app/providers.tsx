"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { NotificationProvider } from "@/components/notification-provider";
import { AuthProvider } from "@/components/auth-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <NotificationProvider>
            <AuthProvider>{children}</AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}
