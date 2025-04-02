"use client"

import { useState } from "react"
import { createCause, updateCause } from "@/actions/cause-actions"
import type { CauseFormData } from "@/types"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function useCause() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const createUserCause = async (userId: string, causeData: CauseFormData) => {
    setIsLoading(true)

    try {
      await createCause(userId, causeData)

      toast({
        title: "Cause created successfully",
        description: "Your cause has been submitted for approval.",
      })

      router.push("/dashboard/causes")
      return true
    } catch (error: any) {
      toast({
        title: "Error creating cause",
        description: error.message,
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserCause = async (causeId: string, userId: string, causeData: Partial<CauseFormData>) => {
    setIsLoading(true)

    try {
      await updateCause(causeId, userId, causeData)

      toast({
        title: "Cause updated successfully",
        description: "Your cause has been updated.",
      })

      return true
    } catch (error: any) {
      toast({
        title: "Error updating cause",
        description: error.message,
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    createCause: createUserCause,
    updateCause: updateUserCause,
  }
}

