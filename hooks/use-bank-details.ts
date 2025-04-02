"use client"

import { useState, useEffect } from "react"
import { hasBankDetails } from "@/actions/profile-actions"

export function useBankDetails(userId: string | undefined) {
  const [hasBankDetailsState, setHasBankDetailsState] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkDetails = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        const result = await hasBankDetails(userId)
        setHasBankDetailsState(result)
      } catch (error: any) {
        console.error("Error checking bank details:", error)
        setError("Error checking bank details. Please try again later.")
        setHasBankDetailsState(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkDetails()
  }, [userId])

  return {
    hasBankDetails: hasBankDetailsState,
    isLoading,
    error,
  }
}

