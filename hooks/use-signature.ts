"use client"

import { useState } from "react"
import { createSignature } from "@/actions/signature-actions"
import type { SignatureFormData } from "@/types"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function useSignature() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()

  const createUserSignature = async (petitionId: string, userId: string | null, signatureData: SignatureFormData) => {
    setIsLoading(true)

    try {
      await createSignature(petitionId, userId, signatureData)

      toast({
        title: "Thank you for your signature!",
        description: "Your contribution will make a difference.",
      })

      // Refresh the page to show the new donation
      router.refresh()
      return true
    } catch (error: any) {
      toast({
        title: "Error processing donation",
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
    createUserSignature: createUserSignature,
  }
}

