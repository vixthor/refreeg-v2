"use client"

import { useState, useEffect } from "react"
import { getUserRoleInfo, setUserRole, listUsersWithRoles } from "@/actions/role-actions"
import { blockUser, unblockUser } from "@/actions/user-actions"
import { updateCauseStatus } from "@/actions/cause-actions"
import { toast } from "@/components/ui/use-toast"
import type { UserRole, UserWithRole } from "@/types"

// Cache to store role information
const roleCache = new Map<string, {
  isAdmin: boolean;
  isManager: boolean;
  role: UserRole;
}>()

export function useAdmin(userId: string | undefined) {
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false)
  const [isManagerUser, setIsManagerUser] = useState<boolean>(false)
  const [userRole, setUserRoleState] = useState<UserRole>("user")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;

    const checkRoles = async () => {
      if (!userId) {
        if (isMounted) {
          setIsLoading(false);
          setIsAdminUser(false);
          setIsManagerUser(false);
          setUserRoleState("user");
        }
        return;
      }

      // Check cache first
      const cachedRole = roleCache.get(userId);
      if (cachedRole) {
        if (isMounted) {
          setIsAdminUser(cachedRole.isAdmin);
          setIsManagerUser(cachedRole.isManager);
          setUserRoleState(cachedRole.role);
          setIsLoading(false);
        }
        return;
      }

      try {
        const roleInfo = await getUserRoleInfo(userId);

        // Update cache
        roleCache.set(userId, roleInfo);

        if (isMounted) {
          setIsAdminUser(roleInfo.isAdmin);
          setIsManagerUser(roleInfo.isManager);
          setUserRoleState(roleInfo.role);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error checking admin status:", err);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkRoles();

    return () => {
      isMounted = false;
    }
  }, [userId]);

  // Clear cache when role is updated
  const clearRoleCache = (userId: string) => {
    roleCache.delete(userId);
  };

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
        clearRoleCache(targetUserId);
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
        clearRoleCache(targetUserId);
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

