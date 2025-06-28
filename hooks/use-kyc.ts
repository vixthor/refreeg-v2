"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { hasKycVerification, updateKycStatus } from "@/actions/profile-actions"
import { toast } from "@/components/ui/use-toast"

export function useKyc(userId: string | undefined) {
  const queryClient = useQueryClient()

  const { data: isVerified, isLoading, error } = useQuery({
    queryKey: ["kyc", userId],
    queryFn: () => hasKycVerification(userId!),
    enabled: !!userId,
  })

  const updateKycMutation = useMutation({
    mutationFn: (status: boolean) => updateKycStatus(userId!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc", userId] })
      queryClient.invalidateQueries({ queryKey: ["profile", userId] })
      toast({
        title: "KYC status updated",
        description: "Your KYC verification status has been updated successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error updating KYC status",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return {
    isVerified: isVerified ?? false,
    isLoading,
    error: error as string | null,
    updateKycStatus: updateKycMutation.mutate,
  }
} 