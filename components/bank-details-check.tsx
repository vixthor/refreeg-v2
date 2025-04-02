"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useBankDetails } from "@/hooks/use-bank-details"

export function BankDetailsCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useAuth()
  const { hasBankDetails, isLoading, error } = useBankDetails(user?.id)

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Database Error</AlertTitle>
        <AlertDescription>
          {error} Please go to the settings page to see database setup instructions.
          <div className="mt-4">
            <Button onClick={() => router.push("/dashboard/settings")}>Go to Settings</Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (hasBankDetails === false) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            <CardTitle>Bank Details Required</CardTitle>
          </div>
          <CardDescription className="text-yellow-700 dark:text-yellow-400">
            You need to add your bank details before creating a cause.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            To receive donations, you must first set up your bank account information in your profile settings. This
            ensures that funds can be automatically transferred to your account when people donate to your causes.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/dashboard/settings?tab=bank")}>Add Bank Details</Button>
        </CardFooter>
      </Card>
    )
  }

  return <>{children}</>
}

