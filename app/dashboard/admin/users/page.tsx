"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Icons } from "@/components/icons"
import { useAuth } from "@/hooks/use-auth"
import { useAdmin } from "@/hooks/use-admin"
import { format } from "date-fns"
import { Shield, UserCheck, UserX, MoreHorizontal, Search, UserCog, User } from "lucide-react"
import type { UserWithRole } from "@/types"

export default function AdminUsersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const {
    isAdmin,
    isAdminOrManager,
    isLoading: adminLoading,
    fetchUsers,
    appointManager,
    removeManager,
    blockUser,
    unblockUser,
  } = useAdmin(user?.id)

  const [users, setUsers] = useState<UserWithRole[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    action: () => Promise<void>
  }>({
    open: false,
    title: "",
    description: "",
    action: async () => {},
  })

  useEffect(() => {
    const loadUsers = async () => {
      if (!user?.id || !isAdminOrManager) {
        router.push("/dashboard")
        return
      }

      setIsLoading(true)
      const usersList = await fetchUsers()
      setUsers(usersList)
      setFilteredUsers(usersList)
      setIsLoading(false)
    }

    if (!adminLoading && isAdminOrManager) {
      loadUsers()
    }
  }, [user?.id, adminLoading, isAdminOrManager, fetchUsers, router])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter(
          (user) =>
            user.email.toLowerCase().includes(query) ||
            (user.full_name && user.full_name.toLowerCase().includes(query)),
        ),
      )
    }
  }, [searchQuery, users])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleAppointManager = (userId: string, email: string) => {
    setConfirmDialog({
      open: true,
      title: "Appoint Manager",
      description: `Are you sure you want to appoint ${email} as a manager? They will be able to approve/reject causes and block users.`,
      action: async () => {
        const success = await appointManager(userId)
        if (success) {
          // Update the local state
          setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, role: "manager" } : user)))
        }
        setConfirmDialog((prev) => ({ ...prev, open: false }))
      },
    })
  }

  const handleRemoveManager = (userId: string, email: string) => {
    setConfirmDialog({
      open: true,
      title: "Remove Manager",
      description: `Are you sure you want to remove ${email} as a manager? They will no longer be able to perform administrative actions.`,
      action: async () => {
        const success = await removeManager(userId)
        if (success) {
          // Update the local state
          setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, role: "user" } : user)))
        }
        setConfirmDialog((prev) => ({ ...prev, open: false }))
      },
    })
  }

  const handleBlockUser = (userId: string, email: string) => {
    setConfirmDialog({
      open: true,
      title: "Block User",
      description: `Are you sure you want to block ${email}? They will no longer be able to log in or use the platform.`,
      action: async () => {
        const success = await blockUser(userId)
        if (success) {
          // Update the local state
          setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, is_blocked: true } : user)))
        }
        setConfirmDialog((prev) => ({ ...prev, open: false }))
      },
    })
  }

  const handleUnblockUser = (userId: string, email: string) => {
    setConfirmDialog({
      open: true,
      title: "Unblock User",
      description: `Are you sure you want to unblock ${email}? They will be able to log in and use the platform again.`,
      action: async () => {
        const success = await unblockUser(userId)
        if (success) {
          // Update the local state
          setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, is_blocked: false } : user)))
        }
        setConfirmDialog((prev) => ({ ...prev, open: false }))
      },
    })
  }

  if (adminLoading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  if (!isAdminOrManager) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You do not have permission to access this page.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground">View and manage user accounts and permissions.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Users</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-8" value={searchQuery} onChange={handleSearch} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{userItem.full_name || "Unnamed User"}</span>
                            <span className="text-sm text-muted-foreground">{userItem.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {userItem.role === "admin" ? (
                            <Badge variant="default" className="bg-red-500">
                              <Shield className="mr-1 h-3 w-3" />
                              Admin
                            </Badge>
                          ) : userItem.role === "manager" ? (
                            <Badge variant="default" className="bg-blue-500">
                              <UserCog className="mr-1 h-3 w-3" />
                              Manager
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <User className="mr-1 h-3 w-3" />
                              User
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {userItem.is_blocked ? (
                            <Badge variant="destructive">Blocked</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{format(new Date(userItem.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>

                              {/* Admin-only actions */}
                              {isAdmin && userItem.role !== "admin" && (
                                <>
                                  {userItem.role === "manager" ? (
                                    <DropdownMenuItem onClick={() => handleRemoveManager(userItem.id, userItem.email)}>
                                      <User className="mr-2 h-4 w-4" />
                                      Remove Manager Role
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleAppointManager(userItem.id, userItem.email)}>
                                      <UserCog className="mr-2 h-4 w-4" />
                                      Appoint as Manager
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                </>
                              )}

                              {/* Admin and Manager actions */}
                              {userItem.role !== "admin" && (
                                <>
                                  {userItem.is_blocked ? (
                                    <DropdownMenuItem onClick={() => handleUnblockUser(userItem.id, userItem.email)}>
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      Unblock User
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleBlockUser(userItem.id, userItem.email)}>
                                      <UserX className="mr-2 h-4 w-4" />
                                      Block User
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}>
              Cancel
            </Button>
            <Button onClick={() => confirmDialog.action()}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

