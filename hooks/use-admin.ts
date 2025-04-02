"use client"

import { useState, useEffect } from "react"
import { isAdmin, isManager, getUserRole, listUsersWithRoles } from "@/actions/role-actions"
import { blockUser, unblockUser } from "@/actions/user-actions"
import { updateCauseStatus } from "@/actions/cause-actions"
import { toast } from "@/components/ui/use-toast"
import type { UserRole, UserWithRole } from "@/types"

export function useAdmin(userId: string | undefined) {
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false)
  const [isManagerUser, setIsManagerUser] = useState<boolean>(false)
  const [userRole, setUserRole] = useState<UserRole>("user")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkRoles = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        const [adminStatus, managerStatus, role] = await Promise.all([
          isAdmin(userId),
          isManager(userId),
          getUserRole(userId),
        ])

        setIsAdminUser(adminStatus)
        setIsManagerUser(managerStatus)
        setUserRole(role)
      } catch (err: any) {
        console.error("Error checking admin status:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    checkRoles()
  }, [userId])

  const appointManager = async (targetUserId: string): Promise<boolean> => {
    if (!isAdminUser) {
      toast({
        title: "Permission denied",
        description: "Only admins can appoint managers",
        variant: "destructive",
      })
      return false
    }

    try {
      const success = await setUserRole(targetUserId, "manager")

      if (success) {
        toast({
          title: "Manager appointed",
          description: "User has been appointed as a manager",
        })
      }

      return success
    } catch (error: any) {
      toast({
        title: "Error appointing manager",
        description: error.message,
        variant: "destructive",
      })
      return false
    }
  }

  const removeManager = async (targetUserId: string): Promise<boolean> => {
    if (!isAdminUser) {
      toast({
        title: "Permission denied",
        description: "Only admins can remove managers",
        variant: "destructive",
      })
      return false
    }

    try {
      const success = await setUserRole(targetUserId, "user")

      if (success) {
        toast({
          title: "Manager removed",
          description: "User's manager role has been removed",
        })
      }

      return success
    } catch (error: any) {
      toast({
        title: "Error removing manager",
        description: error.message,
        variant: "destructive",
      })
      return false
    }
  }

  const blockUserAccount = async (targetUserId: string): Promise<boolean> => {
    if (!isAdminUser && !isManagerUser) {
      toast({
        title: "Permission denied",
        description: "Only admins and managers can block users",
        variant: "destructive",
      })
      return false
    }

    try {
      const success = await blockUser(targetUserId)

      if (success) {
        toast({
          title: "User blocked",
          description: "User has been blocked successfully",
        })
      }

      return success
    } catch (error: any) {
      toast({
        title: "Error blocking user",
        description: error.message,
        variant: "destructive",
      })
      return false
    }
  }

  const unblockUserAccount = async (targetUserId: string): Promise<boolean> => {
    if (!isAdminUser && !isManagerUser) {
      toast({
        title: "Permission denied",
        description: "Only admins and managers can unblock users",
        variant: "destructive",
      })
      return false
    }

    try {
      const success = await unblockUser(targetUserId)

      if (success) {
        toast({
          title: "User unblocked",
          description: "User has been unblocked successfully",
        })
      }

      return success
    } catch (error: any) {
      toast({
        title: "Error unblocking user",
        description: error.message,
        variant: "destructive",
      })
      return false
    }
  }

  const approveCause = async (causeId: string): Promise<boolean> => {
    if (!isAdminUser && !isManagerUser) {
      toast({
        title: "Permission denied",
        description: "Only admins and managers can approve causes",
        variant: "destructive",
      })
      return false
    }

    try {
      await updateCauseStatus(causeId, "approved")

      toast({
        title: "Cause approved",
        description: "The cause has been approved successfully",
      })

      return true
    } catch (error: any) {
      toast({
        title: "Error approving cause",
        description: error.message,
        variant: "destructive",
      })
      return false
    }
  }

  const rejectCause = async (causeId: string, reason: string): Promise<boolean> => {
    if (!isAdminUser && !isManagerUser) {
      toast({
        title: "Permission denied",
        description: "Only admins and managers can reject causes",
        variant: "destructive",
      })
      return false
    }

    try {
      await updateCauseStatus(causeId, "rejected", reason)

      toast({
        title: "Cause rejected",
        description: "The cause has been rejected",
      })

      return true
    } catch (error: any) {
      toast({
        title: "Error rejecting cause",
        description: error.message,
        variant: "destructive",
      })
      return false
    }
  }

  const fetchUsers = async (): Promise<UserWithRole[]> => {
    if (!isAdminUser && !isManagerUser) {
      toast({
        title: "Permission denied",
        description: "Only admins and managers can view user list",
        variant: "destructive",
      })
      return []
    }

    try {
      return await listUsersWithRoles()
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      })
      return []
    }
  }

  return {
    isAdmin: isAdminUser,
    isManager: isManagerUser,
    isAdminOrManager: isAdminUser || isManagerUser,
    userRole,
    isLoading,
    error,
    appointManager,
    removeManager,
    blockUser: blockUserAccount,
    unblockUser: unblockUserAccount,
    approveCause,
    rejectCause,
    fetchUsers,
  }
}

