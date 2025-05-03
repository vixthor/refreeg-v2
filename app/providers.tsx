'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { NuqsAdapter } from 'nuqs/adapters/next/app'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 60 * 1000, //30 minutes
        }
    }
})
export function Providers({ children }: { children: React.ReactNode }) {

    return (
        <QueryClientProvider client={queryClient}>
            <NuqsAdapter>
                <ThemeProvider attribute="class" defaultTheme="light"  disableTransitionOnChange>
                    {children}
                </ThemeProvider>
            </NuqsAdapter>
        </QueryClientProvider>
    )
} 