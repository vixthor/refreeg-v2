"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createCause, updateCause } from "@/actions/cause-actions"
import type { CauseFormData } from "@/types"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function useCause() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: ({ userId, causeData }: { userId: string; causeData: CauseFormData }) =>
      createCause(userId, causeData),
    onSuccess: () => {
      toast({
        title: "Cause created successfully",
        description: "Your cause has been submitted for approval.",
      })
      queryClient.invalidateQueries({ queryKey: ["causes"] })
      router.push("/dashboard/causes")
    },
    onError: (error: any) => {
      toast({
        title: "Error creating cause",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ causeId, userId, causeData }: { causeId: string; userId: string; causeData: Partial<CauseFormData> }) =>
      updateCause(causeId, userId, causeData),
    onSuccess: () => {
      toast({
        title: "Cause updated successfully",
        description: "Your cause has been updated.",
      })
      queryClient.invalidateQueries({ queryKey: ["causes"] })
      router.push(`/dashboard/causes`)
    },
    onError: (error: any) => {
      toast({
        title: "Error updating cause",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const createUserCause = async (userId: string, causeData: CauseFormData) => {
    return createMutation.mutateAsync({ userId, causeData })
  }

  const updateUserCause = async (causeId: string, userId: string, causeData: Partial<CauseFormData>) => {
    return updateMutation.mutateAsync({ causeId, userId, causeData })
  }

  return {
    isLoading: createMutation.isPending || updateMutation.isPending,
    createCause: createUserCause,
    updateCause: updateUserCause,
  }
}

